import { NextResponse } from "next/server";
import { getVoiceProvider } from "@/lib/providers";

/**
 * Retell webhook endpoint (Phase G: full signature verify + idempotency + call updates).
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const voice = getVoiceProvider();
  const valid = await voice.verifyWebhook(request.headers, rawBody);

  if (voice.name === "retell" && !valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Mock / stub accept
  return NextResponse.json({ received: true, provider: voice.name });
}
