import { describe, expect, it } from "vitest";
import { buildVapiLanguageConfig } from "./language";

describe("buildVapiLanguageConfig", () => {
  it("configures Telugu with Deepgram STT and Azure TTS", () => {
    const cfg = buildVapiLanguageConfig("te-IN");
    expect(cfg.language).toBe("te-IN");
    expect(cfg.transcriber).toMatchObject({ provider: "deepgram", model: "nova-3", language: "te" });
    expect(cfg.voice).toMatchObject({ provider: "azure", voiceId: "te-IN-ShrutiNeural" });
  });

  it("defaults English to Vapi native voice + Deepgram", () => {
    const cfg = buildVapiLanguageConfig("en-US");
    expect(cfg.voice).toMatchObject({ provider: "vapi", voiceId: "Elliot" });
    expect(cfg.transcriber).toMatchObject({ provider: "deepgram" });
  });

  it("ignores legacy demo voice labels", () => {
    const cfg = buildVapiLanguageConfig("English US", "Ava Natural");
    expect(cfg.voice).toMatchObject({ provider: "vapi", voiceId: "Elliot" });
  });
});

