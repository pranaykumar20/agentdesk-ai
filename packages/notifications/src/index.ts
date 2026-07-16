import type { ExtractedCallData } from "@ai-voice-leads/shared";

export interface NotificationPayload {
  orgName: string;
  direction: "INBOUND" | "OUTBOUND";
  customerName?: string;
  customerPhone?: string;
  summary: string;
  structured: ExtractedCallData;
  transcript?: string;
  callId: string;
  notifyEmail?: string;
  notifyPhone?: string;
}

export function buildEmailSubject(payload: NotificationPayload): string {
  const prefix = payload.direction === "INBOUND" ? "New call" : "Lead callback";
  const who = payload.customerName ?? payload.customerPhone ?? "Unknown caller";
  return `[${payload.orgName}] ${prefix} from ${who}`;
}

export function buildEmailHtml(payload: NotificationPayload): string {
  const structured = JSON.stringify(payload.structured, null, 2);
  return `
    <h2>${payload.direction === "INBOUND" ? "Inbound call summary" : "Outbound callback summary"}</h2>
    <p><strong>Business:</strong> ${escapeHtml(payload.orgName)}</p>
    <p><strong>Customer:</strong> ${escapeHtml(payload.customerName ?? "—")}</p>
    <p><strong>Phone:</strong> ${escapeHtml(payload.customerPhone ?? "—")}</p>
    <p><strong>Summary:</strong> ${escapeHtml(payload.summary)}</p>
    <h3>Structured data</h3>
    <pre style="background:#f4f4f4;padding:12px;border-radius:6px;">${escapeHtml(structured)}</pre>
    ${
      payload.transcript
        ? `<h3>Transcript</h3><pre style="background:#f4f4f4;padding:12px;border-radius:6px;white-space:pre-wrap;">${escapeHtml(payload.transcript)}</pre>`
        : ""
    }
    <p style="color:#666;font-size:12px;">Call ID: ${escapeHtml(payload.callId)}</p>
  `;
}

export function buildSmsBody(payload: NotificationPayload): string {
  const who = payload.customerName ?? payload.customerPhone ?? "Caller";
  return `${payload.orgName}: ${payload.direction} call from ${who}. ${payload.summary}`;
}

export async function sendEmailNotification(payload: NotificationPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.NOTIFICATION_FROM_EMAIL?.trim();
  const to = payload.notifyEmail?.trim();

  if (!apiKey || !from || !to) {
    console.warn("[notifications] Email skipped — missing RESEND_API_KEY, FROM, or notifyEmail");
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: buildEmailSubject(payload),
      html: buildEmailHtml(payload),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("[notifications] Email failed:", response.status, text);
    return false;
  }

  return true;
}

export async function sendSmsNotification(payload: NotificationPayload): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.NOTIFICATION_SMS_FROM?.trim() || process.env.TWILIO_PHONE_NUMBER?.trim();
  const to = payload.notifyPhone?.trim();

  if (!accountSid || !authToken || !from || !to) {
    console.warn("[notifications] SMS skipped — missing Twilio creds or notifyPhone");
    return false;
  }

  const body = new URLSearchParams({
    To: to,
    From: from,
    Body: buildSmsBody(payload),
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  if (!response.ok) {
    const text = await response.text();
    console.error("[notifications] SMS failed:", response.status, text);
    return false;
  }

  return true;
}

export async function notifyOwner(payload: NotificationPayload): Promise<void> {
  await Promise.all([
    sendEmailNotification(payload),
    sendSmsNotification(payload),
  ]);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
