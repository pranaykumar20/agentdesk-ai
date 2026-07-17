import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoAuditLog, demoFlags, demoHealth, demoTenants } from "./demo-data";

/**
 * Platform admin gate.
 * 1) PLATFORM_ADMIN_EMAILS env (comma-separated) for local/demo
 * 2) Supabase `platform_admins` row when configured
 */
export async function isPlatformAdmin(userId: string, email?: string | null): Promise<boolean> {
  const allowlist = (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (email && allowlist.includes(email.toLowerCase())) {
    return true;
  }

  // Local demo: allow all authenticated users when env unset and Supabase offline.
  if (!getSupabaseEnv().configured && allowlist.length === 0) {
    return true;
  }

  if (!getSupabaseEnv().configured) return false;

  try {
    const supabase = await createClient();
    // Phase 2 tables are not yet in generated Database types.
    const client = supabase as unknown as {
      from: (table: string) => {
        select: (cols: string) => {
          eq: (col: string, val: string) => {
            maybeSingle: () => Promise<{ data: { user_id: string } | null; error: unknown }>;
          };
        };
      };
    };
    const { data, error } = await client
      .from("platform_admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return allowlist.length === 0;
    return Boolean(data);
  } catch {
    return allowlist.length === 0;
  }
}

export async function getPlatformAdminSummary() {
  return {
    tenants: demoTenants(),
    health: demoHealth(),
    flags: demoFlags(),
    audit: demoAuditLog(),
  };
}
