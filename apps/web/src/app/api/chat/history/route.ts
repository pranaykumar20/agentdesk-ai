import { NextResponse } from "next/server";
import { getCurrentOrgContext, getSessionUser } from "@/lib/auth";
import {
  clearAvaHistory,
  getAvaHistory,
  loadAvaHistoryFromStore,
} from "@/lib/chat/history";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const messages = await loadAvaHistoryFromStore(user.id, ctx.organization.id);
  return NextResponse.json({
    messages: messages.length > 0 ? messages : getAvaHistory(user.id, ctx.organization.id),
  });
}

export async function DELETE() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  clearAvaHistory(user.id, ctx.organization.id);
  return NextResponse.json({ ok: true });
}
