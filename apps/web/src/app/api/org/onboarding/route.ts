import { NextResponse } from "next/server";

/** Legacy VoiceLead onboarding API — replaced by /onboarding + Supabase in Phase A. */
export async function POST() {
  return NextResponse.json(
    { error: "Legacy onboarding API disabled. Use /onboarding." },
    { status: 410 },
  );
}
