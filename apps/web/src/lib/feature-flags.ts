export type FeatureFlagKey =
  | "ai_employees"
  | "crm"
  | "locations"
  | "onboarding_wizard"
  | "workflows"
  | "voice_flows"
  | "marketplace"
  | "contact_center"
  | "call_queues"
  | "live_monitor"
  | "sms_campaigns"
  | "whatsapp"
  | "training"
  | "website_importer"
  | "roi";

/** Defaults when DB flags are unavailable (local demo / offline). */
export const DEFAULT_FEATURE_FLAGS: Record<FeatureFlagKey, boolean> = {
  ai_employees: true,
  crm: true,
  locations: true,
  onboarding_wizard: true,
  workflows: true,
  voice_flows: true,
  marketplace: true,
  contact_center: true,
  call_queues: true,
  live_monitor: true,
  sms_campaigns: true,
  whatsapp: true,
  training: true,
  website_importer: false,
  roi: true,
};

/**
 * Resolve whether a flag is enabled for an org.
 * Pass `overrides` from `feature_flag_overrides` when available.
 */
export function isFeatureEnabled(
  key: FeatureFlagKey,
  overrides?: Partial<Record<FeatureFlagKey, boolean>>,
): boolean {
  if (overrides && key in overrides && typeof overrides[key] === "boolean") {
    return overrides[key] as boolean;
  }
  return DEFAULT_FEATURE_FLAGS[key];
}

export function resolveFeatureFlags(
  overrides?: Partial<Record<FeatureFlagKey, boolean>>,
): Record<FeatureFlagKey, boolean> {
  const keys = Object.keys(DEFAULT_FEATURE_FLAGS) as FeatureFlagKey[];
  return Object.fromEntries(keys.map((key) => [key, isFeatureEnabled(key, overrides)])) as Record<
    FeatureFlagKey,
    boolean
  >;
}
