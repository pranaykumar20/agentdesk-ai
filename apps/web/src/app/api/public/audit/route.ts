import { NextResponse } from "next/server";
import { prisma } from "@ai-voice-leads/db";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: "Name and email required" }, { status: 400 });
  }

  const auditLead = await prisma.auditRequest.create({
    data: {
      name: body.name.trim(),
      email: body.email.trim(),
      business: body.business?.trim() ?? "",
      message: body.message?.trim() ?? "",
    },
  });

  return NextResponse.json({ ok: true, id: auditLead.id });
}
