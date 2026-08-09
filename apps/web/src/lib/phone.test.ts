import { describe, expect, it } from "vitest";
import { isValidAreaCode, isValidE164, normalizeToE164Hint } from "./phone";

describe("phone helpers", () => {
  it("validates US area codes", () => {
    expect(isValidAreaCode("513")).toBe(true);
    expect(isValidAreaCode("012")).toBe(false);
    expect(isValidAreaCode("51")).toBe(false);
  });

  it("validates E.164", () => {
    expect(isValidE164("+15135551234")).toBe(true);
    expect(isValidE164("5135551234")).toBe(false);
  });

  it("normalizes 10-digit US numbers", () => {
    expect(normalizeToE164Hint("5135551234")).toBe("+15135551234");
    expect(normalizeToE164Hint("+1 (513) 555-1234")).toBe("+15135551234");
  });
});
