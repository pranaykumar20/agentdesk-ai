import type { Server, IncomingMessage } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import {
  buildSystemPrompt,
  finalizeCallSession,
  getDeepgramAgentSettings,
  getInitialGreeting,
  loadCallContext,
  saveCallTurn,
  updateCallSession,
} from "./call-context.js";

type TwilioStreamMessage = {
  event: string;
  start?: {
    streamSid: string;
    callSid: string;
    customParameters?: Record<string, string>;
  };
  media?: {
    payload: string;
  };
  stop?: Record<string, unknown>;
};

type AgentJson = {
  type?: string;
  role?: string;
  content?: string;
  transcript?: string;
};

function getDeepgramAgentUrl(): string {
  const region = process.env.DEEPGRAM_REGION?.trim();
  if (region === "eu") {
    return "wss://agent.deepgram.com/v1/agent/converse";
  }
  return "wss://agent.deepgram.com/v1/agent/converse";
}

function parseTwilioMessage(data: Buffer): TwilioStreamMessage | null {
  try {
    return JSON.parse(data.toString("utf8")) as TwilioStreamMessage;
  } catch {
    return null;
  }
}

function parseAgentMessage(data: Buffer): AgentJson | null {
  try {
    return JSON.parse(data.toString("utf8")) as AgentJson;
  } catch {
    return null;
  }
}

export function attachTwilioStreamHandler(server: Server) {
  const wss = new WebSocketServer({ server, path: "/twilio/stream" });

  wss.on("connection", (twilioWs: WebSocket) => {
    let deepgramWs: WebSocket | null = null;
    let streamSid: string | null = null;
    let callSessionId: string | null = null;
    let greetingSent = false;

    const apiKey = process.env.DEEPGRAM_API_KEY?.trim();
    if (!apiKey) {
      console.error("[voice-worker] DEEPGRAM_API_KEY missing");
      twilioWs.close();
      return;
    }

    twilioWs.on("message", async (raw) => {
      const msg = parseTwilioMessage(raw as Buffer);
      if (!msg) return;

      if (msg.event === "start" && msg.start) {
        streamSid = msg.start.streamSid;
        const params = msg.start.customParameters ?? {};
        const orgId = params.orgId;
        const direction = (params.direction ?? "INBOUND") as "INBOUND" | "OUTBOUND";
        const leadId = params.leadId;

        if (!orgId) {
          console.error("[voice-worker] Missing orgId in stream params");
          twilioWs.close();
          return;
        }

        try {
          const { context, callSessionId: sessionId } = await loadCallContext({
            orgId,
            direction,
            leadId,
          });
          callSessionId = sessionId;

          await updateCallSession(sessionId, {
            twilioCallSid: msg.start.callSid,
            status: "IN_PROGRESS",
          });

          const systemPrompt = buildSystemPrompt(context);
          const settings = getDeepgramAgentSettings(systemPrompt);
          settings.agent.greeting = getInitialGreeting(context);

          deepgramWs = new WebSocket(getDeepgramAgentUrl(), {
            headers: { Authorization: `Token ${apiKey}` },
          });

          deepgramWs.on("open", () => {
            deepgramWs?.send(JSON.stringify(settings));
          });

          deepgramWs.on("message", async (dgRaw) => {
            const agentMsg = parseAgentMessage(dgRaw as Buffer);
            if (!agentMsg?.type) return;

            if (agentMsg.type === "Audio" && streamSid && twilioWs.readyState === WebSocket.OPEN) {
              const audioData = (agentMsg as { audio?: string }).audio;
              if (audioData) {
                twilioWs.send(
                  JSON.stringify({
                    event: "media",
                    streamSid,
                    media: { payload: audioData },
                  }),
                );
              }
            }

            if (
              (agentMsg.type === "ConversationText" || agentMsg.type === "AgentAudioDone") &&
              agentMsg.content &&
              callSessionId
            ) {
              const role = agentMsg.role === "user" ? "user" : "assistant";
              if (agentMsg.type === "ConversationText") {
                await saveCallTurn(callSessionId, role, agentMsg.content);
              }
            }

            if (agentMsg.type === "AgentStartedSpeaking" && !greetingSent && streamSid) {
              greetingSent = true;
            }
          });

          deepgramWs.on("error", (err) => {
            console.error("[voice-worker] Deepgram error:", err);
          });

          deepgramWs.on("close", async () => {
            if (callSessionId) {
              await triggerPostCall(callSessionId);
            }
          });
        } catch (err) {
          console.error("[voice-worker] Failed to init call:", err);
          twilioWs.close();
        }
      }

      if (msg.event === "media" && msg.media?.payload && deepgramWs?.readyState === WebSocket.OPEN) {
        deepgramWs.send(
          JSON.stringify({
            type: "Audio",
            audio: msg.media.payload,
          }),
        );
      }

      if (msg.event === "stop") {
        if (deepgramWs?.readyState === WebSocket.OPEN) {
          deepgramWs.close();
        }
        if (callSessionId) {
          await triggerPostCall(callSessionId);
        }
      }
    });

    twilioWs.on("close", async () => {
      if (deepgramWs?.readyState === WebSocket.OPEN) {
        deepgramWs.close();
      }
      if (callSessionId) {
        await triggerPostCall(callSessionId);
      }
    });
  });
}

async function triggerPostCall(callSessionId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.TWILIO_WEBHOOK_BASE_URL ?? "http://localhost:3000";
  const secret = process.env.INTERNAL_API_SECRET ?? "change-me-in-production";

  try {
    await finalizeCallSession(callSessionId);

    await fetch(`${baseUrl}/api/internal/post-call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ callSessionId }),
    });
  } catch (err) {
    console.error("[voice-worker] Post-call trigger failed:", err);
  }
}
