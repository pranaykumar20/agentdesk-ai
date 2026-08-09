import { afterEach, describe, expect, it } from "vitest";
import {
  decryptIntegrationSecrets,
  encryptIntegrationSecrets,
} from "./integration-secrets";

describe("integration secrets crypto", () => {
  const prev = process.env.INTEGRATION_SECRETS_ENCRYPTION_KEY;

  afterEach(() => {
    if (prev === undefined) delete process.env.INTEGRATION_SECRETS_ENCRYPTION_KEY;
    else process.env.INTEGRATION_SECRETS_ENCRYPTION_KEY = prev;
  });

  it("round-trips secrets", () => {
    process.env.INTEGRATION_SECRETS_ENCRYPTION_KEY = "test-key-at-least-16";
    const payload = encryptIntegrationSecrets({ apiKey: "sk_live_demo", refresh: "r1" });
    expect(payload.startsWith("v1:")).toBe(true);
    expect(decryptIntegrationSecrets(payload)).toEqual({
      apiKey: "sk_live_demo",
      refresh: "r1",
    });
  });
});
