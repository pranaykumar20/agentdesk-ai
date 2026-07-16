import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import { attachTwilioStreamHandler } from "./twilio-stream.js";

const WS_PORT = Number(process.env.VOICE_WORKER_PORT ?? 3001);
const HTTP_PORT = Number(process.env.VOICE_WORKER_HTTP_PORT ?? 3002);

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "voice-worker",
    deepgram: Boolean(process.env.DEEPGRAM_API_KEY),
  });
});

const server = createServer(app);
attachTwilioStreamHandler(server);

server.listen(WS_PORT, () => {
  console.log(`Voice worker WebSocket listening on ws://localhost:${WS_PORT}/twilio/stream`);
});

app.listen(HTTP_PORT, () => {
  console.log(`Voice worker HTTP listening on http://localhost:${HTTP_PORT}`);
});
