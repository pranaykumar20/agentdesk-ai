import { isLocalDemoMode } from "@/lib/auth/local-demo";

/**
 * When true, modules may serve in-memory Smile Dental / demo seed data.
 * Production and real Supabase tenants must see empty states instead.
 *
 * Vitest sets NODE_ENV=test — keep demo stores available for unit tests.
 */
export function shouldUseDemoData(): boolean {
  if (isLocalDemoMode()) return true;
  if (process.env.NODE_ENV === "test" || process.env.VITEST === "true") return true;
  return false;
}
