import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import {
  DEFAULT_FEATURE_FLAGS,
  resolveFeatureFlags,
  type FeatureFlagKey,
} from "@/lib/feature-flags";

type FlagRow = { key: string; default_enabled: boolean };
type OverrideRow = { flag_key: string; enabled: boolean };

export async function getOrgFeatureFlags(
  organizationId: string,
): Promise<Record<FeatureFlagKey, boolean>> {
  if (!getSupabaseEnv().configured) {
    return resolveFeatureFlags();
  }

  try {
    const supabase = await createClient();
    // Phase 2 tables are not yet in generated Database types.
    const client = supabase as unknown as {
      from: (table: string) => {
        select: (cols: string) => {
          eq: (
            col: string,
            val: string,
          ) => Promise<{ data: OverrideRow[] | null; error: unknown }>;
          then?: unknown;
        } & PromiseLike<{ data: FlagRow[] | null; error: unknown }>;
      };
    };

    const defaultsRes = await client.from("feature_flags").select("key, default_enabled");
    const overridesRes = await client
      .from("feature_flag_overrides")
      .select("flag_key, enabled")
      .eq("organization_id", organizationId);

    const fromDefaults: Partial<Record<FeatureFlagKey, boolean>> = {};
    for (const row of defaultsRes.data ?? []) {
      if (row.key in DEFAULT_FEATURE_FLAGS) {
        fromDefaults[row.key as FeatureFlagKey] = Boolean(row.default_enabled);
      }
    }

    const fromOverrides: Partial<Record<FeatureFlagKey, boolean>> = { ...fromDefaults };
    for (const row of overridesRes.data ?? []) {
      if (row.flag_key in DEFAULT_FEATURE_FLAGS) {
        fromOverrides[row.flag_key as FeatureFlagKey] = Boolean(row.enabled);
      }
    }

    return resolveFeatureFlags(fromOverrides);
  } catch {
    return resolveFeatureFlags();
  }
}
