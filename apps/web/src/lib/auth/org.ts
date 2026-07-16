import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Organization, OrganizationMember, UserRole } from "@/types/database";
import { assertCan, can, type Action, type Resource } from "@/lib/permissions";
import { ACTIVE_ORG_COOKIE, AUTH_ROUTES } from "./constants";
import { getLocalDemoOrgContext, isLocalDemoMode, LOCAL_DEMO_USER_ID } from "./local-demo";
import { getSessionUser, requireUser } from "./session";

export type OrgContext = {
  organization: Organization;
  membership: OrganizationMember;
  role: UserRole;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export async function listUserMemberships(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_members")
    .select("id, organization_id, user_id, role, status")
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    throw new Error(`Failed to load memberships: ${error.message}`);
  }

  return data ?? [];
}

export type UserOrganizationOption = {
  id: string;
  name: string;
  role: UserRole;
};

/** Organizations the user can switch into (membership-validated). */
export async function listUserOrganizations(userId: string): Promise<UserOrganizationOption[]> {
  if (!getSupabaseEnv().configured && isLocalDemoMode()) {
    const demo = getLocalDemoOrgContext();
    if (userId !== LOCAL_DEMO_USER_ID) return [];
    return [{ id: demo.organization.id, name: demo.organization.name, role: demo.role }];
  }

  const memberships = await listUserMemberships(userId);
  if (memberships.length === 0) return [];

  const orgIds = memberships.map((m) => m.organization_id);
  const supabase = await createClient();
  const { data: orgs, error } = await supabase
    .from("organizations")
    .select("id, name")
    .in("id", orgIds);

  if (error) {
    throw new Error(`Failed to load organizations: ${error.message}`);
  }

  const nameById = new Map((orgs ?? []).map((o) => [o.id, o.name]));
  return memberships.map((m) => ({
    id: m.organization_id,
    name: nameById.get(m.organization_id) ?? "Organization",
    role: m.role,
  }));
}

export async function switchActiveOrganization(userId: string, organizationId: string): Promise<void> {
  const memberships = await listUserMemberships(userId);
  const allowed = memberships.some((m) => m.organization_id === organizationId);
  if (!allowed) {
    throw new Error("Forbidden: not a member of this organization");
  }
  await setActiveOrgId(organizationId);
}

export async function getActiveOrgId(userId: string): Promise<string | null> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;
  const memberships = await listUserMemberships(userId);

  if (memberships.length === 0) return null;

  if (fromCookie && memberships.some((m) => m.organization_id === fromCookie)) {
    return fromCookie;
  }

  return memberships[0]?.organization_id ?? null;
}

export async function setActiveOrgId(organizationId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function getCurrentOrgContext(): Promise<OrgContext | null> {
  if (!getSupabaseEnv().configured) {
    return isLocalDemoMode() ? getLocalDemoOrgContext() : null;
  }

  const user = await getSessionUser();
  if (!user) return null;

  const orgId = await getActiveOrgId(user.id);
  if (!orgId) return null;

  const supabase = await createClient();
  const { data: membership, error: memberError } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (memberError || !membership) return null;

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .maybeSingle();

  if (orgError || !organization) return null;

  return {
    organization,
    membership,
    role: membership.role,
  };
}

export async function requireOrg(): Promise<OrgContext> {
  const user = await requireUser();
  const ctx = await getCurrentOrgContext();
  if (!ctx) {
    redirect(AUTH_ROUTES.onboarding);
  }

  // Best-effort active-org cookie + last_active (may no-op in RSC)
  try {
    await setActiveOrgId(ctx.organization.id);
  } catch {
    // ignore cookie write failures in Server Components
  }

  try {
    const supabase = await createClient();
    await supabase
      .from("organization_members")
      .update({ last_active_at: new Date().toISOString() })
      .eq("id", ctx.membership.id);
  } catch {
    // ignore
  }

  void user;
  return ctx;
}

export async function requirePermission(action: Action, resource: Resource): Promise<OrgContext> {
  const ctx = await requireOrg();
  assertCan(ctx.role, action, resource);
  return ctx;
}

export function orgCan(ctx: OrgContext, action: Action, resource: Resource): boolean {
  return can(ctx.role, action, resource);
}

export async function createOrganizationForUser(input: {
  userId: string;
  email: string;
  name: string;
  industry?: string;
}): Promise<Organization> {
  const supabase = await createClient();
  const baseSlug = slugify(input.name) || "organization";
  const slug = `${baseSlug}-${input.userId.replace(/-/g, "").slice(0, 8)}`;

  // Ensure profile row exists (auth trigger can race / miss on some signups)
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: input.userId,
      email: input.email,
      full_name: null,
    },
    { onConflict: "id" },
  );
  if (profileError) {
    throw new Error(profileError.message);
  }

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: input.name,
      slug,
      industry: input.industry ?? null,
      created_by: input.userId,
      onboarding_step: 1,
    })
    .select("*")
    .single();

  if (orgError || !organization) {
    throw new Error(orgError?.message ?? "Failed to create organization");
  }

  const { error: memberError } = await supabase.from("organization_members").insert({
    organization_id: organization.id,
    user_id: input.userId,
    role: "OWNER",
    status: "active",
    invited_email: input.email,
    joined_at: new Date().toISOString(),
  });

  if (memberError) {
    throw new Error(memberError.message);
  }

  const { error: settingsError } = await supabase.from("organization_settings").insert({
    organization_id: organization.id,
    business_email: input.email,
  });

  if (settingsError) {
    throw new Error(settingsError.message);
  }

  await setActiveOrgId(organization.id);
  return organization;
}
