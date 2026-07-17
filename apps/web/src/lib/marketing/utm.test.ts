import { describe, expect, it } from "vitest";
import { withUtm } from "./utm";

describe("withUtm", () => {
  it("appends known campaign params", () => {
    const result = withUtm("/signup", "utm_source=google&utm_campaign=spring&foo=1");
    expect(result).toContain("utm_source=google");
    expect(result).toContain("utm_campaign=spring");
    expect(result).not.toContain("foo=");
  });

  it("preserves hash fragments", () => {
    const result = withUtm("/#platform", "utm_source=newsletter");
    expect(result.startsWith("/?utm_source=newsletter")).toBe(true);
    expect(result.endsWith("#platform")).toBe(true);
  });

  it("returns path unchanged without params", () => {
    expect(withUtm("/pricing", "")).toBe("/pricing");
  });
});
