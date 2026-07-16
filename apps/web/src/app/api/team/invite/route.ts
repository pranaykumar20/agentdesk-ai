import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentOrgContext, getSessionUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { inviteTeamMember } from "@/modules/team/data";
import { USER_ROLES } from "@/lib/permissions";

const bodySchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().email(),
  role: z.enum(USER_ROLES),
  department: z.string().trim().min(1),
});

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });
  if (!can(ctx.role, "invite", "members")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const member = await inviteTeamMember({
    organizationId: ctx.organization.id,
    ...parsed.data,
  });

  // Never return long-lived secrets broadly — invite token shown once for Phase E demo
  return NextResponse.json({
    member: {
      id: member.id,
      email: member.email,
      status: member.status,
      inviteTokenExpiresAt: member.inviteTokenExpiresAt,
    },
    inviteToken: member.inviteToken,
  });
}
