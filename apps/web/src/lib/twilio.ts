import twilio from "twilio";
import { getVoiceWorkerWsUrl, getWebhookBaseUrl } from "./auth";

export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();

  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured");
  }

  return twilio(accountSid, authToken);
}

export function buildInboundTwiml(orgId: string): string {
  const streamUrl = getVoiceWorkerWsUrl().replace(/^http/, "ws");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${streamUrl}">
      <Parameter name="orgId" value="${orgId}" />
      <Parameter name="direction" value="INBOUND" />
    </Stream>
  </Connect>
</Response>`;
}

export function buildOutboundTwiml(orgId: string, leadId: string): string {
  const streamUrl = getVoiceWorkerWsUrl().replace(/^http/, "ws");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${streamUrl}">
      <Parameter name="orgId" value="${orgId}" />
      <Parameter name="direction" value="OUTBOUND" />
      <Parameter name="leadId" value="${leadId}" />
    </Stream>
  </Connect>
</Response>`;
}

export async function initiateOutboundCall(params: {
  orgId: string;
  leadId: string;
  to: string;
  from: string;
}) {
  const client = getTwilioClient();
  const baseUrl = getWebhookBaseUrl();

  const call = await client.calls.create({
    to: params.to,
    from: params.from,
    url: `${baseUrl}/api/webhooks/twilio/outbound?orgId=${encodeURIComponent(params.orgId)}&leadId=${encodeURIComponent(params.leadId)}`,
    statusCallback: `${baseUrl}/api/webhooks/twilio/status`,
    statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
    statusCallbackMethod: "POST",
    machineDetection: "Enable",
  });

  return call;
}
