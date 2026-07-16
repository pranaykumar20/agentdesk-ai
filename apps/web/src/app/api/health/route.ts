import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "ai-voice-leads-web",
    voiceWorker: process.env.VOICE_WORKER_URL ?? null,
    twilio: Boolean(process.env.TWILIO_ACCOUNT_SID),
    deepgram: Boolean(process.env.DEEPGRAM_API_KEY),
  });
}
