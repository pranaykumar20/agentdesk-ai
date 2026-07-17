import { describe, expect, it } from "vitest";
import { normalizeChatSurface, sanitizeChatMessages } from "./chat-agent";

describe("sanitizeChatMessages", () => {
  it("keeps only valid user/assistant messages and trims length", () => {
    const messages = sanitizeChatMessages([
      { role: "system", content: "ignore" },
      { role: "user", content: "  Hello  " },
      { role: "assistant", content: "Hi there" },
      { role: "user", content: "" },
      { role: "tool", content: "nope" },
    ]);

    expect(messages).toEqual([
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there" },
    ]);
  });
});

describe("normalizeChatSurface", () => {
  it("accepts app surface and defaults to marketing", () => {
    expect(normalizeChatSurface("app")).toBe("app");
    expect(normalizeChatSurface("marketing")).toBe("marketing");
    expect(normalizeChatSurface("other")).toBe("marketing");
  });
});
