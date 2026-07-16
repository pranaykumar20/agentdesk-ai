import { NextResponse } from "next/server";
import { processPendingSequenceSteps } from "@ai-voice-leads/sequences";
import { verifyInternalAuth } from "@/lib/auth";

export async function POST(request: Request) {
  if (!verifyInternalAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const processed = await processPendingSequenceSteps();
  return NextResponse.json({ ok: true, processed });
}

export async function GET(request: Request) {
  return POST(request);
}
