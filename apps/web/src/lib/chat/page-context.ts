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
    | "settings"
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
      match: /^\/dashboard\/(analytics|revenue)/,
      area: "analytics",
      hint: "Prefer analytics / ROI high-level metrics.",
    },
    {
      match: /^\/dashboard\/settings/,
      area: "settings",
      hint: "Prefer org settings visible in the UI.",
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
