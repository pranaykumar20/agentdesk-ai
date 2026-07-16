export type PlaybookTemplateType =
  | "RESTAURANT"
  | "SERVICE"
  | "GENERAL"
  | "CLINIC"
  | "REAL_ESTATE"
  | "COACH"
  | "LEGAL"
  | "ECOMMERCE";

export interface PlaybookTemplate {
  type: PlaybookTemplateType;
  name: string;
  systemPrompt: string;
  fieldsToCollect: string[];
}

export const PLAYBOOK_TEMPLATES: PlaybookTemplate[] = [
  {
    type: "RESTAURANT",
    name: "Restaurant order taker",
    systemPrompt: `You are the phone assistant for a restaurant.
Your job is to take food orders accurately and efficiently.
- Greet the caller warmly and mention the call may be recorded.
- Ask if the order is for pickup or delivery.
- Take items one at a time; confirm quantity and any modifications.
- Ask about allergies or dietary restrictions.
- Read back the full order before ending.
- Collect customer name and callback phone number.
- Provide an estimated ready time (typically 20-30 minutes for pickup).
- Be concise — callers are often in a hurry.
- If they ask for a human, say you will note their request for a callback.`,
    fieldsToCollect: [
      "customer_name",
      "phone",
      "order_type",
      "items",
      "allergies",
      "pickup_or_delivery_time",
      "special_instructions",
    ],
  },
  {
    type: "SERVICE",
    name: "Service business intake",
    systemPrompt: `You are the phone assistant for a service business (plumber, salon, contractor, etc.).
Your job is to qualify the enquiry and schedule follow-up.
- Greet professionally and mention the call may be recorded.
- Ask what service they need.
- Ask for the service address if on-site work is needed.
- Ask about urgency (emergency, this week, flexible).
- Ask for preferred appointment times.
- Collect name and phone number.
- Summarize what you captured before ending.
- If they ask for a human, say you will arrange a callback.`,
    fieldsToCollect: [
      "customer_name",
      "phone",
      "service_type",
      "address",
      "urgency",
      "preferred_time",
      "notes",
    ],
  },
  {
    type: "GENERAL",
    name: "General enquiry",
    systemPrompt: `You are the phone assistant for a business.
Your job is to understand why the caller is reaching out and capture their details.
- Greet professionally and mention the call may be recorded.
- Ask the reason for their enquiry.
- Ask clarifying questions based on their needs.
- Collect name, phone, and email if offered.
- Ask about budget or timeline if relevant.
- Summarize next steps before ending.
- If they ask for a human, say you will arrange a callback.`,
    fieldsToCollect: [
      "customer_name",
      "phone",
      "email",
      "reason",
      "budget",
      "timeline",
      "notes",
    ],
  },
];

export * from "./marketing.js";
export * from "./market.js";
export * from "./verticals.js";

export const TCPA_CONSENT_TEXT =
  "I agree to receive an automated call from this business about my enquiry. Message and data rates may apply.";

export interface BusinessHours {
  [day: string]: { open: string; close: string } | null;
}

export interface MenuItem {
  name: string;
  price?: number;
  description?: string;
}

export interface CallContext {
  orgId: string;
  orgName: string;
  industry: string;
  greeting: string;
  hours: BusinessHours;
  menuOrServices: MenuItem[];
  playbookPrompt: string;
  fieldsToCollect: string[];
  direction: "INBOUND" | "OUTBOUND";
  leadName?: string;
  leadMessage?: string;
}

export interface ExtractedCallData {
  intent: string;
  customer_name?: string;
  customer_phone?: string;
  email?: string;
  items?: Array<{ name: string; qty?: number; notes?: string }>;
  order_type?: string;
  service_type?: string;
  address?: string;
  urgency?: string;
  pickup_or_delivery_time?: string;
  preferred_time?: string;
  budget?: string;
  timeline?: string;
  notes?: string;
  summary: string;
  dnc_requested?: boolean;
}

export interface LeadSubmission {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  consent: boolean;
  consentText?: string;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (phone.startsWith("+")) return phone;
  return `+${digits}`;
}

export function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

export function buildSystemPrompt(ctx: CallContext): string {
  const hoursText = Object.entries(ctx.hours)
    .map(([day, h]) => (h ? `${day}: ${h.open}-${h.close}` : `${day}: closed`))
    .join("; ");

  const menuText = ctx.menuOrServices
    .map((item) => (item.price ? `${item.name} ($${item.price})` : item.name))
    .join(", ");

  const outboundIntro =
    ctx.direction === "OUTBOUND" && ctx.leadName
      ? `\nThis is an OUTBOUND callback to ${ctx.leadName}${ctx.leadMessage ? ` about: "${ctx.leadMessage}"` : ""}. Introduce yourself and confirm you are speaking with the right person.`
      : "";

  return `${ctx.playbookPrompt}

BUSINESS CONTEXT:
- Business name: ${ctx.orgName}
- Industry: ${ctx.industry}
- Hours: ${hoursText || "Not specified"}
- Menu/Services: ${menuText || "Not specified"}
- Default greeting: ${ctx.greeting}
- Fields to collect: ${ctx.fieldsToCollect.join(", ")}
${outboundIntro}

RULES:
- Keep responses under 3 sentences when possible.
- Always confirm name and phone before ending.
- If caller says "don't call me again" or similar, acknowledge and end politely.
- Never invent menu items or prices not listed above.`;
}

export function buildExtractionPrompt(transcript: string, fieldsToCollect: string[]): string {
  return `Extract structured data from this phone call transcript.

Fields to extract: ${fieldsToCollect.join(", ")}

Return JSON with these keys:
- intent (string): primary purpose of the call
- customer_name (string|null)
- customer_phone (string|null)
- summary (string): 2-3 sentence summary for the business owner
- urgency (string|null): low, medium, high, or emergency
- dnc_requested (boolean): true if caller asked not to be called again
- Plus any relevant fields from: ${fieldsToCollect.join(", ")}

Transcript:
${transcript}`;
}

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export function isWithinBusinessHours(hours: BusinessHours, timezone: string, at = new Date()): boolean {
  if (!hours || Object.keys(hours).length === 0) return true;

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(at);
  const weekday = parts.find((p) => p.type === "weekday")?.value?.toLowerCase().slice(0, 3);
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  const now = `${hour}:${minute}`;

  const dayKey = DAY_KEYS.find((d) => weekday?.startsWith(d.slice(0, 2))) ?? weekday;
  const schedule = dayKey ? hours[dayKey] : null;

  if (!schedule) return false;

  return now >= schedule.open && now <= schedule.close;
}

