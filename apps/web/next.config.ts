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
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
