import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentOrgContext, getSessionUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getSavedGeneralSettings, saveGeneralSettings } from "@/modules/settings/data";

const bodySchema = z.object({
  businessName: z.string().trim().min(2),
  businessEmail: z.string().email(),
  businessPhone: z.string().trim().min(5),
  website: z.string().url().or(z.literal("")),
  industry: z.string().trim().min(2),
  timezone: z.string().trim().min(2),
  currency: z.string().trim().min(3).max(3),
  dateFormat: z.string().trim().min(4),
  language: z.string().trim().min(2),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });
  return NextResponse.json({ settings: getSavedGeneralSettings(ctx.organization.id, ctx.organization) });
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });
  if (!can(ctx.role, "update", "settings")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const settings = saveGeneralSettings(ctx.organization.id, parsed.data);
  return NextResponse.json({ settings });
}
