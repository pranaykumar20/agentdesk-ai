import type { OrgContext } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listAppointments } from "@/modules/appointments/data";
import { listCalls } from "@/modules/calls/data";
import { getCrmPipelineSummary } from "@/modules/crm/data";
import { listWhatsappConversations } from "@/modules/whatsapp/data";
import type { AvaCitation } from "./citations";
import { mergeCitations } from "./citations";

export type ContactLookupHit = {
  name: string;
  phone: string | null;
  source: "whatsapp" | "appointments" | "calls" | "crm";
  detail?: string;
  path: string;
};

export type ContactLookupAnswer = {
  reply: string;
  citations: AvaCitation[];
  toolsUsed: string[];
  hits: ContactLookupHit[];
};

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/\bwhats\s*app\b/g, "whatsapp");
}

function cleanName(raw: string): string {
  return raw
    .replace(/[?!.]+$/g, "")
    .replace(/^(the|a|an)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Detect person-specific contact lookups, e.g.:
 * - what is the phone number of Noah Patel?
 * - what's Noah Patel's WhatsApp number?
 */
export function extractContactLookup(
  question: string,
): { name: string; preferChannel: "whatsapp" | "sms" | "any" } | null {
  const q = normalize(question);
  const preferChannel = /\bwhatsapp\b/.test(q)
    ? "whatsapp"
    : /\bsms\b/.test(q)
      ? "sms"
      : "any";

  const patterns = [
    /(?:whatsapp\s+)?(?:phone\s+)?(?:number|no\.?)\s+of\s+(.+)$/,
    /what(?:'s| is)\s+the\s+(?:whatsapp\s+)?(?:phone\s+)?(?:number|no\.?)\s+of\s+(.+)$/,
    /what(?:'s| is)\s+(.+?)(?:'s)?\s+(?:whatsapp\s+)?(?:phone\s+)?(?:number|no\.?)\s*$/,
    /(?:phone|whatsapp|sms)\s+(?:for|from)\s+(.+)$/,
    /(?:contact|reach)\s+(.+?)(?:\s+by\s+phone)?\s*$/,
  ];

  for (const pattern of patterns) {
    const match = q.match(pattern);
    if (!match?.[1]) continue;
    const name = cleanName(match[1]);
    // Ignore inventory-style questions without a person name.
    if (!name || name.split(" ").length < 2) continue;
    if (
      /^(phone numbers?|my (phone )?numbers?|the (phone )?numbers?|whatsapp conversations?)$/.test(
        name,
      )
    ) {
      continue;
    }
    return { name, preferChannel };
  }

  return null;
}

function namesMatch(candidate: string, query: string): boolean {
  const a = candidate.toLowerCase().trim();
  const b = query.toLowerCase().trim();
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const aParts = a.split(/\s+/);
  const bParts = b.split(/\s+/);
  // Match first+last when both present
  if (bParts.length >= 2) {
    return bParts.every((part) => aParts.some((p) => p.startsWith(part) || part.startsWith(p)));
  }
  return false;
}

export async function lookupContact(
  ctx: OrgContext,
  question: string,
): Promise<ContactLookupAnswer | null> {
  const extracted = extractContactLookup(question);
  if (!extracted) return null;

  const { name, preferChannel } = extracted;
  const hits: ContactLookupHit[] = [];
  const orgId = ctx.organization.id;

  if (can(ctx.role, "read", "whatsapp") && preferChannel !== "sms") {
    try {
      const conversations = await listWhatsappConversations(orgId);
      for (const c of conversations) {
        if (!namesMatch(c.contactName, name)) continue;
        hits.push({
          name: c.contactName,
          phone: c.phone ?? null,
          source: "whatsapp",
          detail: `${c.interest} · ${c.status}`,
          path: "/dashboard/whatsapp",
        });
      }
    } catch {
      // ignore
    }
  }

  if (can(ctx.role, "read", "appointments")) {
    try {
      const appts = await listAppointments(orgId, { page: 1, pageSize: 50 });
      for (const a of appts.items) {
        if (!namesMatch(a.contactName, name)) continue;
        hits.push({
          name: a.contactName,
          phone: a.contactPhone ?? null,
          source: "appointments",
          detail: `${a.serviceName} · ${a.status}`,
          path: "/dashboard/appointments",
        });
      }
    } catch {
      // ignore
    }
  }

  if (can(ctx.role, "read", "calls") && preferChannel === "any") {
    try {
      const calls = await listCalls(orgId, { page: 1, pageSize: 50, q: name });
      for (const c of calls.items) {
        if (!namesMatch(c.callerName, name)) continue;
        hits.push({
          name: c.callerName,
          phone: c.callerPhone ?? null,
          source: "calls",
          detail: `${c.status}${c.disposition ? ` · ${c.disposition}` : ""}`,
          path: "/dashboard/calls",
        });
      }
    } catch {
      // ignore
    }
  }

  if (can(ctx.role, "read", "crm") && preferChannel === "any") {
    try {
      const crm = await getCrmPipelineSummary(orgId);
      for (const d of crm.deals) {
        if (!namesMatch(d.contactName, name)) continue;
        hits.push({
          name: d.contactName,
          phone: null,
          source: "crm",
          detail: `${d.title} · ${d.stage}`,
          path: "/dashboard/crm",
        });
      }
    } catch {
      // ignore
    }
  }

  // Prefer channel-specific hits when asked (WhatsApp first).
  const ordered =
    preferChannel === "whatsapp"
      ? [
          ...hits.filter((h) => h.source === "whatsapp"),
          ...hits.filter((h) => h.source !== "whatsapp"),
        ]
      : hits;

  const withPhone = ordered.filter((h) => h.phone);
  const citations = mergeCitations(
    ordered.map((h) => ({
      label:
        h.source === "whatsapp"
          ? "WhatsApp"
          : h.source === "appointments"
            ? "Appointments"
            : h.source === "calls"
              ? "Calls"
              : "CRM",
      path: h.path,
      tool: "contact_lookup",
    })),
  );

  if (ordered.length === 0) {
    return {
      toolsUsed: ["contact_lookup"],
      citations,
      hits: [],
      reply: [
        `I couldn’t find a contact named **${cleanName(name)}** in WhatsApp, appointments, calls, or CRM.`,
        "",
        "Try another spelling, or open **/dashboard/whatsapp** / **/dashboard/crm** to search manually.",
      ].join("\n"),
    };
  }

  const primary = withPhone[0] ?? ordered[0];
  const lines = [
    primary.phone
      ? `**${primary.name}**’s ${preferChannel === "whatsapp" ? "WhatsApp " : ""}phone number is **${primary.phone}** (from ${primary.source.replace("_", " ")}).`
      : `I found **${primary.name}** in **${primary.source}**, but no phone number is stored on that record.`,
    "",
  ];

  if (primary.detail) {
    lines.push(`- Context: ${primary.detail}`);
  }

  const extras = ordered.filter((h) => h !== primary).slice(0, 3);
  if (extras.length) {
    lines.push("", "Also found:");
    for (const hit of extras) {
      lines.push(
        `- **${hit.name}** · ${hit.source}${hit.phone ? ` · ${hit.phone}` : " · no phone on file"}${
          hit.detail ? ` · ${hit.detail}` : ""
        }`,
      );
    }
  }

  lines.push("", `Open **${primary.path}** for the full record.`);

  return {
    toolsUsed: ["contact_lookup"],
    citations,
    hits: ordered,
    reply: lines.join("\n"),
  };
}
