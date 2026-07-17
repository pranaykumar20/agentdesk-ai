import { describe, expect, it } from "vitest";
import { sanitizeChatMessages } from "./chat-agent";

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
