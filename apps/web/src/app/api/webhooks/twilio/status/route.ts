import { NextResponse } from "next/server";
import { prisma } from "@ai-voice-leads/db";

const STATUS_MAP: Record<string, "RINGING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "NO_ANSWER" | "BUSY"> = {
  initiated: "RINGING",
  ringing: "RINGING",
  "in-progress": "IN_PROGRESS",
  answered: "IN_PROGRESS",
  completed: "COMPLETED",
  busy: "BUSY",
  "no-answer": "NO_ANSWER",
  failed: "FAILED",
  canceled: "FAILED",
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const callSid = String(formData.get("CallSid") ?? "");
  const callStatus = String(formData.get("CallStatus") ?? "").toLowerCase();

  if (!callSid) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const mapped = STATUS_MAP[callStatus];
  if (mapped) {
    await prisma.callSession.updateMany({
      where: { twilioCallSid: callSid },
      data: {
        status: mapped,
        ...(mapped === "COMPLETED" ? { endedAt: new Date() } : {}),
      },
    });

    const session = await prisma.callSession.findFirst({
      where: { twilioCallSid: callSid },
      select: { leadId: true },
    });

    if (session?.leadId) {
      const leadStatus =
        mapped === "COMPLETED"
          ? "COMPLETED"
          : mapped === "NO_ANSWER" || mapped === "BUSY" || mapped === "FAILED"
            ? "FAILED"
            : "CALLING";

      await prisma.lead.update({
        where: { id: session.leadId },
        data: { status: leadStatus },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
