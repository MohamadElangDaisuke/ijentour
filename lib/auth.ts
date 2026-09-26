import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ijen-tour-secret-key-super-secure-fullstack-2026"
);

export type UserRole = "CUSTOMER" | "CUSTOMER_PRO" | "MITRA" | "ADMIN";

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
}

/**
 * Sign a new JWT session token (valid for 7 days)
 */
export async function signAuthToken(payload: AuthSession): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verify and decode an existing JWT session token
 */
export async function verifyAuthToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthSession;
  } catch {
    return null;
  }
}
