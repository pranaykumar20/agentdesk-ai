import type { PlanKey } from "./types";

/**
 * Module-level entitlements by plan.
 * Wired into nav via `planFeature` on dashboard nav items and critical APIs.
 */
export type PlanFeature =
  | "dashboard"
  | "calls"
  | "appointments_basic"
  | "knowledge_basic"
  | "routing_basic"
  | "analytics_basic"
  | "billing"
  | "settings"
  | "ai_employees"
  | "phone_numbers"
  | "leads_basic"
  | "ai_employees_multi"
  | "crm"
  | "contact_center"
  | "call_queues"
  | "sms_followups"
  | "integrations"
  | "marketplace"
  | "training_basic"
  | "analytics_advanced"
  | "analytics_export"
  | "workflows_basic"
  | "voice_flow_templates"
  | "locations_multi"
  | "workflows_advanced"
  | "voice_flows_advanced"
  | "live_monitor"
  | "whatsapp"
  | "sms_campaigns"
  | "roi"
  | "training_advanced"
  | "custom_integrations"
  | "sso_ready"
  | "dedicated_success";

const STARTER_FEATURES = [
  "dashboard",
  "calls",
  "appointments_basic",
  "knowledge_basic",
  "routing_basic",
  "analytics_basic",
  "billing",
  "settings",
  "ai_employees",
  "phone_numbers",
  "leads_basic",
] as const satisfies readonly PlanFeature[];

const PROFESSIONAL_FEATURES = [
  ...STARTER_FEATURES,
  "ai_employees_multi",
  "crm",
  "contact_center",
  "call_queues",
  "sms_followups",
  "integrations",
  "marketplace",
  "training_basic",
  "analytics_advanced",
  "analytics_export",
  "workflows_basic",
  "voice_flow_templates",
] as const satisfies readonly PlanFeature[];

const BUSINESS_FEATURES = [
  ...PROFESSIONAL_FEATURES,
  "locations_multi",
  "workflows_advanced",
  "voice_flows_advanced",
  "live_monitor",
  "whatsapp",
  "sms_campaigns",
  "roi",
  "training_advanced",
  "custom_integrations",
  "sso_ready",
  "dedicated_success",
] as const satisfies readonly PlanFeature[];

export const PLAN_FEATURES: Record<PlanKey, readonly PlanFeature[]> = {
  starter: STARTER_FEATURES,
  professional: PROFESSIONAL_FEATURES,
  business: BUSINESS_FEATURES,
};

export function getPlanFeatures(planKey: PlanKey): readonly PlanFeature[] {
  return PLAN_FEATURES[planKey];
}

export function planHasFeature(planKey: PlanKey, feature: PlanFeature): boolean {
  return PLAN_FEATURES[planKey].includes(feature);
}
