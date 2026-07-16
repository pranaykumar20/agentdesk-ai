export interface WhatsAppSendParams {
  to: string;
  message: string;
  templateName?: string;
}

export interface WhatsAppSendResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

function getConfig() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() ?? "v21.0";
  return { token, phoneNumberId, apiVersion };
}

export function isWhatsAppConfigured(): boolean {
  const { token, phoneNumberId } = getConfig();
  return Boolean(token && phoneNumberId);
}

export async function sendWhatsAppMessage(params: WhatsAppSendParams): Promise<WhatsAppSendResult> {
  const { token, phoneNumberId, apiVersion } = getConfig();

  if (!token || !phoneNumberId) {
    console.warn("[whatsapp] Not configured — skipping send");
    return { ok: false, error: "WhatsApp not configured" };
  }

  const to = params.to.replace(/\D/g, "");

  const body: Record<string, unknown> = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: params.message },
  };

  if (params.templateName) {
    body.type = "template";
    body.template = {
      name: params.templateName,
      language: { code: "en" },
    };
    delete body.text;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const json = (await response.json()) as {
      messages?: Array<{ id: string }>;
      error?: { message: string };
    };

    if (!response.ok) {
      return { ok: false, error: json.error?.message ?? `HTTP ${response.status}` };
    }

    return { ok: true, messageId: json.messages?.[0]?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export function buildLeadWelcomeMessage(orgName: string, leadName: string): string {
  return `Hi ${leadName}! Thanks for reaching out to ${orgName}. We received your enquiry and our AI assistant will call you shortly. Reply here if you have any questions.`;
}
