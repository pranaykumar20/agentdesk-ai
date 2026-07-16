import type { User } from "@supabase/supabase-js";
import type { Organization, OrganizationMember, UserRole } from "@/types/database";
import type { OrgContext } from "./org";

/** Enable with LOCAL_DEMO_MODE / NEXT_PUBLIC_LOCAL_DEMO_MODE when Supabase is not configured. */
export function isLocalDemoMode(): boolean {
  const flag =
    process.env.NEXT_PUBLIC_LOCAL_DEMO_MODE ?? process.env.LOCAL_DEMO_MODE ?? "";
  return flag === "true" || flag === "1";
}

export const LOCAL_DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";
export const LOCAL_DEMO_ORG_ID = "11111111-1111-4111-8111-111111111111";
export const LOCAL_DEMO_MEMBER_ID = "22222222-2222-4222-8222-222222222222";

export function getLocalDemoUser(): User {
  const now = new Date().toISOString();
  return {
    id: LOCAL_DEMO_USER_ID,
    app_metadata: { provider: "local-demo" },
    user_metadata: { full_name: "Demo Owner" },
    aud: "authenticated",
    created_at: now,
    email: "demo@agentdesk.local",
    phone: "",
    role: "authenticated",
    updated_at: now,
    identities: [],
    is_anonymous: false,
    factors: [],
  } as User;
}

export function getLocalDemoOrgContext(): OrgContext {
  const now = new Date().toISOString();
  const organization: Organization = {
    id: LOCAL_DEMO_ORG_ID,
    name: "Smile Dental Care",
    slug: "smile-dental-care",
    industry: "healthcare_dental",
    timezone: "America/New_York",
    onboarding_step: 99,
    onboarding_completed_at: now,
    stripe_customer_id: null,
    created_at: now,
    updated_at: now,
    created_by: LOCAL_DEMO_USER_ID,
  };

  const membership: OrganizationMember = {
    id: LOCAL_DEMO_MEMBER_ID,
    organization_id: LOCAL_DEMO_ORG_ID,
    user_id: LOCAL_DEMO_USER_ID,
    role: "OWNER" satisfies UserRole,
    status: "active",
    invited_email: null,
    invited_at: null,
    joined_at: now,
    last_active_at: now,
    created_at: now,
    updated_at: now,
  };

  return { organization, membership, role: "OWNER" };
}
