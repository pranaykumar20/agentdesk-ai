import { describe, expect, it } from "vitest";
import { guardAssistantReply } from "./output-guard";

describe("guardAssistantReply", () => {
  it("redacts secret-looking tokens", () => {
    const result = guardAssistantReply("Here is cus_ABC12345XYZ and a note.");
    expect(result.ok).toBe(true);
    expect(result.reply).toContain("[redacted]");
    expect(result.reply).not.toContain("cus_ABC12345XYZ");
  });

  it("blocks mutation claims", () => {
    const result = guardAssistantReply("I've updated your plan to Business.");
    expect(result.ok).toBe(false);
    expect(result.reply.toLowerCase()).toContain("confirm");
  });
});
