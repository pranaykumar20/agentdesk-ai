/** Launch market — US-first. India/international channels deferred. */
export const LAUNCH_MARKET = "US" as const;

export const US_TIMEZONES = [
  { value: "America/New_York", label: "Eastern (ET)" },
  { value: "America/Chicago", label: "Central (CT)" },
  { value: "America/Denver", label: "Mountain (MT)" },
  { value: "America/Los_Angeles", label: "Pacific (PT)" },
  { value: "America/Phoenix", label: "Arizona (MST)" },
  { value: "America/Anchorage", label: "Alaska (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii (HST)" },
] as const;

export const US_CHANNELS = [
  { id: "voice", label: "AI voice calls" },
  { id: "sms", label: "SMS follow-up" },
  { id: "email", label: "Email notifications" },
] as const;

export const US_DEFAULT_CHANNELS = ["voice", "sms"] as const;

export const US_MARKETING = {
  tagline: "AI voice agents and SMS follow-up for US businesses",
  heroSub:
    "AI voice agents, TCPA-compliant SMS, and instant callbacks — capture every lead by phone or form in under 30 seconds.",
  heroTags: ["Leads", "Follow-up", "Bookings", "24/7 Calls", "SMS"] as const,
  formSubmitPromise:
    "Submit your details — we'll text you instantly and call within seconds.",
  followUpMessage: "Multi-channel follow-up initiated (SMS + voice call)",
  pricingBlurb: "Self-serve SaaS for US businesses. TCPA-compliant outbound included.",
  managedSetupNote: "Managed setup from $600 — includes audit, build, and 2-week go-live.",
} as const;
