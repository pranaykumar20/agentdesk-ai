import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentOrgContext, getSessionUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { createAppointment } from "@/modules/appointments/data";

const bodySchema = z.object({
  contactName: z.string().trim().min(2),
  serviceName: z.string().trim().min(2),
  providerName: z.string().trim().min(2),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });
  if (!can(ctx.role, "create", "appointments")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const startsAt = new Date(parsed.data.startsAt).toISOString();
  const endsAt = new Date(parsed.data.endsAt).toISOString();

  const appointment = await createAppointment(ctx.organization.id, {
    ...parsed.data,
    startsAt,
    endsAt,
  });

  return NextResponse.json({ appointment });
}
