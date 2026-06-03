import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

import { getServerEnv } from "@/lib/env";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey() {
  const { INTEGRATION_TOKEN_ENCRYPTION_KEY } = getServerEnv();

  if (!INTEGRATION_TOKEN_ENCRYPTION_KEY) {
    throw new Error("INTEGRATION_TOKEN_ENCRYPTION_KEY is required for OAuth token storage.");
  }

  if (/^[a-f0-9]{64}$/i.test(INTEGRATION_TOKEN_ENCRYPTION_KEY)) {
    return Buffer.from(INTEGRATION_TOKEN_ENCRYPTION_KEY, "hex");
  }

  const base64Key = Buffer.from(INTEGRATION_TOKEN_ENCRYPTION_KEY, "base64");
  if (base64Key.length === 32) {
    return base64Key;
  }

  const rawKey = Buffer.from(INTEGRATION_TOKEN_ENCRYPTION_KEY);
  if (rawKey.length === 32) {
    return rawKey;
  }

  throw new Error("INTEGRATION_TOKEN_ENCRYPTION_KEY must decode to 32 bytes.");
}

export function encryptToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(".");
}

export function decryptToken(payload: string) {
  const [iv, tag, encrypted] = payload.split(".");

  if (!iv || !tag || !encrypted) {
    throw new Error("Invalid encrypted token payload.");
  }

  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64")),
    decipher.final()
  ]).toString("utf8");
}
