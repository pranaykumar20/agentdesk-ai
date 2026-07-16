import { afterEach, describe, expect, it } from "vitest";
import { verifyInternalAuth } from "./internal";

describe("verifyInternalAuth", () => {
  const prev = process.env.INTERNAL_API_SECRET;

  afterEach(() => {
    process.env.INTERNAL_API_SECRET = prev;
  });

  it("accepts matching bearer secret in non-production", () => {
    process.env.INTERNAL_API_SECRET = "dev-secret";
    const req = new Request("http://localhost/api/internal/x", {
      headers: { authorization: "Bearer dev-secret" },
    });
    expect(verifyInternalAuth(req)).toBe(true);
  });

  it("rejects wrong bearer token", () => {
    process.env.INTERNAL_API_SECRET = "dev-secret";
    const req = new Request("http://localhost/api/internal/x", {
      headers: { authorization: "Bearer other" },
    });
    expect(verifyInternalAuth(req)).toBe(false);
  });
});
