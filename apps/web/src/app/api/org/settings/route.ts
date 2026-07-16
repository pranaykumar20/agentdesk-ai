import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Legacy settings API disabled during AgentDesk migration." },
    { status: 410 },
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: "Legacy settings API disabled during AgentDesk migration." },
    { status: 410 },
  );
}
