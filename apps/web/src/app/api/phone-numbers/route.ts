import { NextResponse } from "next/server";
import { getCurrentOrgContext, getSessionUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listPhoneNumbers, provisionPhoneNumber } from "@/modules/phone-numbers/data";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });
  const numbers = await listPhoneNumbers(ctx.organization.id);
  return NextResponse.json({ numbers });
}

export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });
  if (!can(ctx.role, "create", "phone_numbers")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const number = await provisionPhoneNumber(ctx.organization.id);
  return NextResponse.json({ number });
}
