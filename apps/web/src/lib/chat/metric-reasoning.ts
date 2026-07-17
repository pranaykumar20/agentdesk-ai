import type { AccountEntity } from "./entity-catalog";

function num(value: string | number | boolean | null | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

function str(value: string | number | boolean | null | undefined): string | null {
  if (value == null || value === "") return null;
  return String(value);
}

export type DiagnosticFocus = "agentsOnline" | "serviceLevel" | "general" | "optimize";

export function detectDiagnosticFocus(question: string): DiagnosticFocus {
  const q = question.toLowerCase();
  if (/\b(improve|reach 100%|get to 100%|action plan|what should)\b/.test(q)) {
    return "optimize";
  }
  if (/\b(service level|sla)\b/.test(q)) return "serviceLevel";
  if (/\b(agent|staff|6\s*(?:out of|\/)\s*8|out of \d+)\b/.test(q)) return "agentsOnline";
  return "general";
}

/**
 * Interpret call-queue (or similar) metrics with real fields only — never invent numbers.
 */
export function reasonAboutEntity(
  entity: AccountEntity,
  focus: DiagnosticFocus,
): string | null {
  if (entity.type === "workflow") {
    const status = str(entity.fields.status);
    const runs = num(entity.fields.runs);
    const description = str(entity.fields.description);
    const steps = str(entity.fields.steps);
    if (focus === "optimize" || focus === "general") {
      return [
        `**${entity.name}** — Workflow`,
        "",
        description ? description : null,
        "",
        status ? `- **Status:** ${status}` : null,
        runs != null ? `- **Runs:** ${runs.toLocaleString()}` : null,
        steps ? `- **Steps:** ${steps}` : null,
        "",
        "**How to improve or extend it:**",
        "- Confirm the trigger still matches the event you care about (missed call, lead, booking).",
        "- Add conditions for after-hours, location, or queue.",
        "- Chain SMS/WhatsApp + CRM update so nothing falls through.",
        "- Watch run history after publish for failures.",
        "",
        `Open **${entity.path}** to edit. Ask me to help build a related workflow anytime.`,
      ]
        .filter((line) => line != null)
        .join("\n");
    }
  }

  if (entity.type !== "call_queue") {
    if (focus === "optimize") {
      return [
        `Here’s how I’d improve **${entity.name}** based on what’s stored:`,
        "",
        `- Review the live record at **${entity.path}**.`,
        "- Confirm status, recent changes, and related routing/workflows.",
        "- If a metric looks off, compare it to peer records on the same page.",
        "",
        `Open **${entity.path}** to make changes (I’ll only apply mutations after you confirm).`,
      ].join("\n");
    }
    return null;
  }

  const online = num(entity.fields.agentsOnline);
  const total = num(entity.fields.agentsTotal);
  const inQueue = num(entity.fields.callsInQueue);
  const avgWait = str(entity.fields.avgWaitLabel ?? entity.fields.avgWait);
  const longest = str(entity.fields.longestWaitLabel ?? entity.fields.longestWait);
  const abandoned = num(entity.fields.abandoned);
  const abandonRate = num(entity.fields.abandonedRate);
  const serviceLevel = num(entity.fields.serviceLevel);
  const status = str(entity.fields.status);
  const queueType = str(entity.fields.queueType);

  const unavailable =
    online != null && total != null ? Math.max(0, total - online) : null;

  if (focus === "agentsOnline" && online != null && total != null) {
    return [
      `**${entity.name}** currently has **${online} of ${total}** assigned agents available/active for the queue.`,
      unavailable != null && unavailable > 0
        ? `That usually means **${unavailable}** assigned agent${unavailable === 1 ? " is" : "s are"} offline, unavailable, paused, or outside their schedule.`
        : "All assigned agents appear available right now.",
      "",
      "**Relevant account data:**",
      inQueue != null ? `- **In queue:** ${inQueue}` : null,
      avgWait ? `- **Avg wait:** ${avgWait}` : null,
      longest ? `- **Longest wait:** ${longest}` : null,
      serviceLevel != null ? `- **Service level:** ${serviceLevel}%` : null,
      status ? `- **Status:** ${status}` : null,
      queueType ? `- **Type:** ${queueType}` : null,
      "",
      "**Interpretation:**",
      inQueue != null && inQueue > 0 && unavailable != null && unavailable > 0
        ? `With **${inQueue}** caller${inQueue === 1 ? "" : "s"} waiting and **${unavailable}** agent${unavailable === 1 ? "" : "s"} unavailable, the queue is handling demand but has capacity pressure.`
        : "Staffing looks aligned with current queue depth, but keep watching wait and abandon trends.",
      "",
      "**Recommended next actions:**",
      unavailable != null && unavailable > 0
        ? `- Bring the **${unavailable}** unavailable agent${unavailable === 1 ? "" : "s"} online if they should be on shift.`
        : "- Confirm schedules match expected coverage.",
      "- Check pause states, wrap-up, and presence in **/dashboard/call-queues**.",
      "- Review overflow routing in **/dashboard/routing-rules** if waits climb.",
      "",
      `Open **${entity.path}** to adjust staffing and queue settings.`,
    ]
      .filter((line) => line != null)
      .join("\n");
  }

  if (focus === "serviceLevel" && serviceLevel != null) {
    const gap = Math.max(0, 100 - serviceLevel);
    return [
      `**${entity.name}** is at **${serviceLevel}%** service level${gap > 0 ? ` — **${gap} points** below a 100% target` : ""}.`,
      gap > 0
        ? "That usually means some calls waited longer than the target answer time or were abandoned."
        : "Service level is at target based on the stored metric.",
      "",
      "**Signals from your account data:**",
      inQueue != null ? `- **Callers in queue:** ${inQueue}` : null,
      longest ? `- **Longest wait:** ${longest}` : null,
      avgWait ? `- **Avg wait:** ${avgWait}` : null,
      abandoned != null
        ? `- **Abandoned:** ${abandoned}${abandonRate != null ? ` (${abandonRate}%)` : ""}`
        : null,
      online != null && total != null ? `- **Agents available:** ${online}/${total}` : null,
      "",
      "**Interpretation:**",
      inQueue != null && inQueue >= 3
        ? "Current queue depth and wait peaks are the main pressure on service level."
        : "Abandons and longest-wait spikes are the main risk to holding 100% SL.",
      "",
      "**Recommended next actions:**",
      online != null && total != null && online < total
        ? `- Bring unavailable agents online (${online}/${total} available).`
        : "- Confirm peak-hour staffing matches inbound volume.",
      "- Add overflow routing when wait exceeds your SLA threshold (**/dashboard/routing-rules**).",
      longest ? `- Investigate why longest wait reached **${longest}**.` : "- Review longest-wait samples.",
      "- Offer callback or voicemail fallback during peaks (**/dashboard/workflows**).",
      "",
      `Open **${entity.path}** to tune the queue, then re-check service level.`,
    ]
      .filter((line) => line != null)
      .join("\n");
  }

  if (focus === "optimize") {
    return [
      `Action plan to push **${entity.name}** toward **100% service level**:`,
      "",
      "**Current data:**",
      serviceLevel != null ? `- Service level: **${serviceLevel}%**` : null,
      online != null && total != null ? `- Agents available: **${online}/${total}**` : null,
      inQueue != null ? `- In queue: **${inQueue}**` : null,
      avgWait ? `- Avg wait: **${avgWait}**` : null,
      longest ? `- Longest wait: **${longest}**` : null,
      abandoned != null
        ? `- Abandoned: **${abandoned}**${abandonRate != null ? ` (${abandonRate}%)` : ""}`
        : null,
      "",
      "**Do this next:**",
      online != null && total != null && online < total
        ? `1. Bring the **${total - online}** unavailable agent${total - online === 1 ? "" : "s"} online if they should be working.`
        : "1. Confirm on-shift staffing matches forecasted volume.",
      "2. Add overflow routing when wait exceeds your SLA threshold (**/dashboard/routing-rules**).",
      longest
        ? `3. Review why the longest wait reached **${longest}** (skills mismatch, pause, or missing coverage).`
        : "3. Sample recent long-wait calls for root cause.",
      "4. Reduce wrap-up / after-call work if agents stay unavailable too long.",
      "5. Add callback or voicemail fallback for peak moments (**/dashboard/workflows**).",
      "6. Monitor the queue in **/dashboard/call-queues** and **/dashboard/live-monitor** after changes.",
      "",
      "I can outline a workflow for abandoned-call recovery next if you want — say the word and I’ll guide the build steps (no changes applied until you confirm).",
    ]
      .filter((line) => line != null)
      .join("\n");
  }

  // General entity interpretation
  return [
    `**${entity.name}** — Call Queue`,
    "",
    online != null && total != null ? `- **Agents:** ${online}/${total}` : null,
    inQueue != null ? `- **In queue:** ${inQueue}` : null,
    avgWait ? `- **Avg wait:** ${avgWait}` : null,
    longest ? `- **Longest wait:** ${longest}` : null,
    serviceLevel != null ? `- **Service level:** ${serviceLevel}%` : null,
    abandoned != null
      ? `- **Abandoned:** ${abandoned}${abandonRate != null ? ` (${abandonRate}%)` : ""}`
      : null,
    status ? `- **Status:** ${status}` : null,
    "",
    "**Interpretation:**",
    serviceLevel != null && serviceLevel < 100
      ? `Service level at **${serviceLevel}%** means some callers wait past target or abandon. Ask me why agents are ${online}/${total} or how to reach 100% for a deeper plan.`
      : "Queue metrics look healthy from the stored snapshot. Ask if you want staffing or SLA deep-dives.",
    "",
    `Open **${entity.path}**.`,
  ]
    .filter((line) => line != null)
    .join("\n");
}
