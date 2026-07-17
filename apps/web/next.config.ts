import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@ai-voice-leads/db",
    "@ai-voice-leads/shared",
    "@ai-voice-leads/notifications",
    "@ai-voice-leads/sequences",
    "@ai-voice-leads/whatsapp",
    "@ai-voice-leads/integrations",
  ],
  // Cursor SDK ships source maps / native bits that break webpack bundling.
  serverExternalPackages: ["@cursor/sdk"],
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
