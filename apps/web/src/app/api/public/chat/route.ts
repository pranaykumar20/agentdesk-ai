import { NextResponse } from "next/server";
import {
  generateMarketingChatReply,
  sanitizeChatMessages,
} from "@/lib/marketing/chat-agent";

export const runtime = "nodejs";
export const maxDuration = 60;

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) return false;
  entry.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many messages. Please wait a moment and try again." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as { messages?: unknown };
    const messages = sanitizeChatMessages(body.messages);

    if (messages.length === 0) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    if (messages[messages.length - 1]?.role !== "user") {
      return NextResponse.json({ error: "Last message must be from the user." }, { status: 400 });
    }

    const { reply, model } = await generateMarketingChatReply(messages);
    return NextResponse.json({ reply, model });
  } catch (error) {
    console.error("[public/chat]", error);
    return NextResponse.json(
      {
        error:
          "The AI agent is temporarily unavailable. Please try again or book a demo at /audit.",
      },
      { status: 502 },
    );
  }
}
