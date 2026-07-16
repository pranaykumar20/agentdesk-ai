import { NextResponse } from "next/server";
import { getCurrentOrgContext, getSessionUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getOrgSubscription, getUsageSnapshot, listInvoices } from "@/modules/billing/data";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });
  if (!can(ctx.role, "read", "billing")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [subscription, usage, invoices] = await Promise.all([
    getOrgSubscription(ctx.organization.id),
    getUsageSnapshot(ctx.organization.id),
    listInvoices(ctx.organization.id),
  ]);

  return NextResponse.json({ subscription, usage, invoices });
}
