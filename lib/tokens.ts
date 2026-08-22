import { SignJWT, jwtVerify } from "jose";
import { v4 as uuidv4 } from "uuid";
import redisClient from "./redis";

const TOKEN_SECRET = new TextEncoder().encode(
  (process.env.ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef").slice(0, 64)
);

export interface TokenPayload {
  [key: string]: unknown;
  tokenId: string;
  userId: string;
  docType: "aadhaar" | "pan";
  maskedValue: string;
  verifiedAt: string;
  issuedBy: string;
}

export async function generateVerificationToken(
  userId: string,
  docType: "aadhaar" | "pan",
  maskedValue: string,
  expiryMinutes: number
): Promise<{ token: string; tokenId: string }> {
  const tokenId = `vtk_${uuidv4().replace(/-/g, "").slice(0, 16)}`;

  const token = await new SignJWT({
    tokenId,
    userId,
    docType,
    maskedValue,
    verifiedAt: new Date().toISOString(),
    issuedBy: "VaultID",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${expiryMinutes}m`)
    .sign(TOKEN_SECRET);

  return { token, tokenId };
}

export async function verifyToken(token: string): Promise<{
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
}> {
  try {
    const { payload } = await jwtVerify(token, TOKEN_SECRET);
    const data = payload as unknown as TokenPayload;

    // Check revocation
    const isRevoked = await redisClient.sismember("revoked_tokens", data.tokenId);
    if (isRevoked) {
      return { valid: false, error: "Token has been revoked" };
    }

    return { valid: true, payload: data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("expired")) {
      return { valid: false, error: "Token has expired" };
    }
    return { valid: false, error: "Invalid token" };
  }
}

export async function revokeToken(tokenId: string): Promise<void> {
  await redisClient.sadd("revoked_tokens", tokenId);
}
