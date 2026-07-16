import { NextResponse } from "next/server";
import { getCurrentOrgContext, getSessionUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { analyticsToCsv, getAnalyticsOverview } from "@/modules/analytics/overview";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });
  if (!can(ctx.role, "read", "analytics")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const range = new URL(request.url).searchParams.get("range") ?? "7d";
  const overview = await getAnalyticsOverview(ctx.organization.id, range);
  const csv = analyticsToCsv(overview);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="analytics-${overview.range}.csv"`,
    },
  });
}
