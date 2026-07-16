import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Legacy integrations API disabled during AgentDesk migration." },
    { status: 410 },
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Legacy integrations API disabled during AgentDesk migration." },
    { status: 410 },
  );
}
