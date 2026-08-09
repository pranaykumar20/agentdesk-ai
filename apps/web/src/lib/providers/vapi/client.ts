const VAPI_API = "https://api.vapi.ai";

export function getVapiApiKey(): string {
  const key = process.env.VAPI_API_KEY?.trim();
  if (!key) throw new Error("VAPI_API_KEY is not configured");
  return key;
}

export async function vapiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${VAPI_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getVapiApiKey()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 402 || /payment|card on file|billing/i.test(text)) {
      throw new Error(
        "Vapi requires a payment method before buying phone numbers. Add a card in the Vapi dashboard, then try again.",
      );
    }
    throw new Error(`Vapi ${path} failed (${res.status}): ${text.slice(0, 300)}`);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text().catch(() => "");
  if (!text.trim()) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Vapi ${path} returned non-JSON (${res.status}): ${text.slice(0, 200)}`);
  }
}

export function vapiServerUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  return `${appUrl.replace(/\/$/, "")}/api/webhooks/vapi`;
}
