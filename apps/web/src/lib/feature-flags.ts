import { isLocalDemoMode } from "@/lib/auth/local-demo";

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

/** Production / Starter-safe defaults — Phase 2 shells off until real. */
export const MVP_FEATURE_FLAGS: Record<FeatureFlagKey, boolean> = {
  ai_employees: true,
  onboarding_wizard: true,
  crm: false,
  locations: false,
  workflows: false,
  voice_flows: false,
  marketplace: false,
  contact_center: false,
  call_queues: false,
  live_monitor: false,
  sms_campaigns: false,
  whatsapp: false,
  training: false,
  website_importer: false,
  roi: false,
};

/** Local demo defaults — Phase 2 UI shells visible for internal demos. */
export const DEMO_FEATURE_FLAGS: Record<FeatureFlagKey, boolean> = {
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

/** Defaults when DB flags are unavailable. */
export const DEFAULT_FEATURE_FLAGS: Record<FeatureFlagKey, boolean> = MVP_FEATURE_FLAGS;

export function getBaselineFeatureFlags(): Record<FeatureFlagKey, boolean> {
  return isLocalDemoMode() ? { ...DEMO_FEATURE_FLAGS } : { ...MVP_FEATURE_FLAGS };
}

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
  return getBaselineFeatureFlags()[key];
}

export function resolveFeatureFlags(
  overrides?: Partial<Record<FeatureFlagKey, boolean>>,
): Record<FeatureFlagKey, boolean> {
  const baseline = getBaselineFeatureFlags();
  const keys = Object.keys(baseline) as FeatureFlagKey[];
  return Object.fromEntries(keys.map((key) => [key, isFeatureEnabled(key, overrides)])) as Record<
    FeatureFlagKey,
    boolean
  >;
}
