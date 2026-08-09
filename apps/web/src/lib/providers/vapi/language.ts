export type VapiLanguageBlocks = {
  language: string;
  voice: Record<string, unknown>;
  transcriber: Record<string, unknown>;
};

/**
 * Map AgentDesk language codes to Vapi voice + STT.
 * Telugu uses Deepgram STT (`te`) + Azure neural TTS (Retell does not support te-IN).
 */
export function buildVapiLanguageConfig(
  language?: string,
  voiceOverride?: string,
): VapiLanguageBlocks {
  const normalized = (language ?? "en-US").trim().toLowerCase();
  const isTelugu =
    normalized === "te" ||
    normalized === "te-in" ||
    normalized.startsWith("te-") ||
    normalized.includes("telugu");

  // Ignore legacy demo labels that are not real Vapi voice IDs.
  const rawVoice = voiceOverride?.trim() || "";
  const isLegacyLabel = /ava natural|11labs-adrian/i.test(rawVoice);
  const voiceId = !rawVoice || isLegacyLabel ? undefined : rawVoice;

  if (isTelugu) {
    return {
      language: "te-IN",
      voice: {
        provider: "azure",
        voiceId: voiceId || "te-IN-ShrutiNeural",
      },
      // Vapi's "google" STT is Gemini now (chirp_2 is rejected). Deepgram
      // supports Telugu via language code `te`.
      transcriber: {
        provider: "deepgram",
        model: "nova-3",
        language: "te",
      },
    };
  }

  return {
    language: "en-US",
    // Use Vapi-native voices so we don't depend on a linked ElevenLabs credential.
    voice: {
      provider: "vapi",
      voiceId: voiceId || "Elliot",
    },
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "en",
    },
  };
}
