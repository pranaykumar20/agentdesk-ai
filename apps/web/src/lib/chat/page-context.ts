export type PageContext = {
  pathname: string;
  area:
    | "home"
    | "calls"
    | "appointments"
    | "crm"
    | "ai-employees"
    | "billing"
    | "team"
    | "integrations"
    | "knowledge"
    | "analytics"
    | "revenue"
    | "settings"
    | "phone-numbers"
    | "locations"
    | "workflows"
    | "voice-flows"
    | "contact-center"
    | "live-monitor"
    | "call-queues"
    | "sms"
    | "whatsapp"
    | "training"
    | "routing"
    | "other";
  hint: string;
};

export function normalizePathname(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/dashboard")) return null;
  if (trimmed.length > 200) return null;
  return trimmed;
}

export function resolvePageContext(pathname: string | null): PageContext | null {
  if (!pathname) return null;

  const rules: Array<{ match: RegExp; area: PageContext["area"]; hint: string }> = [
    {
      match: /^\/dashboard\/?$/,
      area: "home",
      hint: "User is on the main dashboard overview.",
    },
    {
      match: /^\/dashboard\/calls/,
      area: "calls",
      hint: "Prefer call totals, recent calls, and dispositions.",
    },
    {
      match: /^\/dashboard\/appointments/,
      area: "appointments",
      hint: "Prefer appointment metrics and upcoming bookings.",
    },
    {
      match: /^\/dashboard\/crm/,
      area: "crm",
      hint: "Prefer CRM pipeline and lead counts.",
    },
    {
      match: /^\/dashboard\/ai-employees/,
      area: "ai-employees",
      hint: "Prefer AI employee list and lifecycle status.",
    },
    {
      match: /^\/dashboard\/billing/,
      area: "billing",
      hint: "Prefer plan name and minutes usage.",
    },
    {
      match: /^\/dashboard\/team/,
      area: "team",
      hint: "Prefer team roster and roles. Do not include emails unless asked.",
    },
    {
      match: /^\/dashboard\/integrations/,
      area: "integrations",
      hint: "Prefer integration connection status (no secrets).",
    },
    {
      match: /^\/dashboard\/knowledge/,
      area: "knowledge",
      hint: "Prefer knowledge base document counts.",
    },
    {
      match: /^\/dashboard\/revenue/,
      area: "revenue",
      hint: "Prefer Revenue & ROI metrics, sources, and top AI agents.",
    },
    {
      match: /^\/dashboard\/analytics/,
      area: "analytics",
      hint: "Prefer analytics / ROI high-level metrics.",
    },
    {
      match: /^\/dashboard\/settings/,
      area: "settings",
      hint: "Prefer org settings visible in the UI.",
    },
    {
      match: /^\/dashboard\/phone-numbers/,
      area: "phone-numbers",
      hint: "Prefer phone number inventory and assignment.",
    },
    {
      match: /^\/dashboard\/locations/,
      area: "locations",
      hint: "Prefer location counts and status.",
    },
    {
      match: /^\/dashboard\/workflows/,
      area: "workflows",
      hint: "Prefer workflow counts and publish status.",
    },
    {
      match: /^\/dashboard\/voice-flows/,
      area: "voice-flows",
      hint: "Prefer voice flow metrics.",
    },
    {
      match: /^\/dashboard\/contact-center/,
      area: "contact-center",
      hint: "Prefer contact center inbox metrics.",
    },
    {
      match: /^\/dashboard\/live-monitor/,
      area: "live-monitor",
      hint: "Prefer live call monitor metrics.",
    },
    {
      match: /^\/dashboard\/call-queues/,
      area: "call-queues",
      hint: "Prefer call queue summary.",
    },
    {
      match: /^\/dashboard\/sms-campaigns/,
      area: "sms",
      hint: "Prefer SMS campaign summary.",
    },
    {
      match: /^\/dashboard\/whatsapp/,
      area: "whatsapp",
      hint: "Prefer WhatsApp summary.",
    },
    {
      match: /^\/dashboard\/training/,
      area: "training",
      hint: "Prefer training center summary.",
    },
    {
      match: /^\/dashboard\/routing-rules/,
      area: "routing",
      hint: "Prefer routing rules.",
    },
  ];

  for (const rule of rules) {
    if (rule.match.test(pathname)) {
      return { pathname, area: rule.area, hint: rule.hint };
    }
  }

  return {
    pathname,
    area: "other",
    hint: "User is somewhere in the dashboard; answer generally and use tools as needed.",
  };
}
