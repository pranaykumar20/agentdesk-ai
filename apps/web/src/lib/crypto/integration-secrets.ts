import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ALGO = "aes-256-gcm";

function keyFromEnv(): Buffer {
  const raw = process.env.INTEGRATION_SECRETS_ENCRYPTION_KEY?.trim();
  if (!raw || raw.length < 16) {
    throw new Error(
      "INTEGRATION_SECRETS_ENCRYPTION_KEY must be set (16+ characters) to encrypt integration secrets",
    );
  }
  // Derive a stable 32-byte key from any passphrase length.
  return createHash("sha256").update(raw).digest();
}

/** Encrypt a JSON-serializable secrets object for storage in `secrets_encrypted`. */
export function encryptIntegrationSecrets(secrets: Record<string, unknown>): string {
  const key = keyFromEnv();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const plaintext = Buffer.from(JSON.stringify(secrets), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

/** Decrypt a payload produced by `encryptIntegrationSecrets`. */
export function decryptIntegrationSecrets(payload: string): Record<string, unknown> {
  const key = keyFromEnv();
  const [version, ivB64, tagB64, dataB64] = payload.split(":");
  if (version !== "v1" || !ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid encrypted secrets payload");
  }
  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  const parsed = JSON.parse(decrypted.toString("utf8")) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Decrypted secrets are not an object");
  }
  return parsed as Record<string, unknown>;
}

export function isIntegrationSecretsEncryptionConfigured(): boolean {
  const raw = process.env.INTEGRATION_SECRETS_ENCRYPTION_KEY?.trim();
  return Boolean(raw && raw.length >= 16 && !raw.startsWith("change-me"));
}
