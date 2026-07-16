import {
  buildExtractionPrompt,
  type ExtractedCallData,
} from "@ai-voice-leads/shared";

export async function extractCallData(
  transcript: string,
  fieldsToCollect: string[],
): Promise<ExtractedCallData> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.LLM_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    return {
      intent: "unknown",
      summary: transcript.slice(0, 500) || "No transcript available.",
    };
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You extract structured data from phone call transcripts. Return valid JSON only.",
        },
        {
          role: "user",
          content: buildExtractionPrompt(transcript, fieldsToCollect),
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM extraction failed: ${response.status} ${text}`);
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = json.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as ExtractedCallData;

  return {
    ...parsed,
    intent: parsed.intent ?? "general",
    summary: parsed.summary ?? "Call completed.",
    dnc_requested: parsed.dnc_requested ?? false,
  };
}
