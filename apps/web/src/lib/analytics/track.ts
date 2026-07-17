export type MarketingEventName =
  | "hero_start_trial_clicked"
  | "hero_demo_clicked"
  | "navigation_pricing_clicked"
  | "employee_card_clicked"
  | "industry_card_clicked"
  | "integrations_clicked"
  | "pricing_plan_clicked"
  | "faq_opened"
  | "final_cta_clicked"
  | "demo_form_started"
  | "demo_form_submitted"
  | "signup_started"
  | "announcement_cta_clicked"
  | "marketing_chat_opened"
  | "marketing_chat_message_sent";

export type MarketingEventProps = Record<string, string | number | boolean | undefined>;

type DataLayerWindow = Window & {
  dataLayer?: Array<Record<string, unknown>>;
};

/**
 * Vendor-agnostic marketing analytics.
 * Pushes to `window.dataLayer` when present; always safe as a no-op on the server.
 */
export function track(event: MarketingEventName, props: MarketingEventProps = {}): void {
  if (typeof window === "undefined") return;

  const payload = { event, ...props, ts: Date.now() };

  try {
    const w = window as DataLayerWindow;
    w.dataLayer = w.dataLayer ?? [];
    w.dataLayer.push(payload);
  } catch {
    // ignore analytics failures
  }

  if (process.env.NODE_ENV === "development") {
    // Helpful during local QA; silent in production.
    console.info("[analytics]", event, props);
  }
}
