import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentOrgContext, getSessionUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { setIntegrationStatus } from "@/modules/integrations/data";

const bodySchema = z.object({
  status: z.enum(["connected", "disconnected", "needs_attention", "expired", "error"]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Organization required" }, { status: 400 });
  if (!can(ctx.role, "manage", "integrations")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const item = await setIntegrationStatus(ctx.organization.id, id, parsed.data.status);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Secrets never returned to client
  return NextResponse.json({
    integration: {
      id: item.id,
      name: item.name,
      status: item.status,
      lastSync: item.lastSync,
      connectedOn: item.connectedOn,
    },
  });
}
