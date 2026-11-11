import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

export const COOKIE_NAME = "admin_token";

/**
 * Safely retrieve the JWT secret key at runtime.
 * Enforces server-only execution and a minimum entropy of 32 characters.
 * Fails closed without crashing Next.js module load/build.
 */
export function getJwtSecretKey(): Uint8Array | null {
  const secret = process.env.JWT_SECRET;
  if (!secret || typeof secret !== "string" || secret.trim().length < 32) {
    return null;
  }
  return new TextEncoder().encode(secret.trim());
}

export interface AdminJwtPayload {
  id: string;
  username?: string;
  email: string;
  name: string;
  role: "ADMIN" | "SUPER_ADMIN" | string;
  emailVerified?: boolean;
  [key: string]: any;
}

/**
 * Sign a new JWT session for an admin
 */
export async function signAdminToken(payload: AdminJwtPayload): Promise<string> {
  const secretKey = getJwtSecretKey();
  if (!secretKey) {
    throw new Error(
      "Authentication service unavailable: JWT_SECRET is not configured or below minimum required entropy."
    );
  }
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

/**
 * Verify and decode an admin JWT token
 */
export async function verifyAdminToken(token: string): Promise<AdminJwtPayload | null> {
  const secretKey = getJwtSecretKey();
  if (!secretKey) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (
      !payload ||
      (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN")
    ) {
      return null;
    }
    return payload as unknown as AdminJwtPayload;
  } catch {
    return null;
  }
}

/**
 * Get current admin session from incoming Request, NextRequest, or Next.js cookies()
 */
export async function getAdminSession(
  request?: Request | NextRequest
): Promise<AdminJwtPayload | null> {
  let token: string | undefined;

  if (request) {
    // 1. Check cookies if NextRequest
    if ("cookies" in request && typeof (request as any).cookies?.get === "function") {
      token = (request as NextRequest).cookies.get(COOKIE_NAME)?.value;
    }

    // 2. Fallback to Cookie header
    if (!token && typeof request.headers?.get === "function") {
      const cookieHeader = request.headers.get("cookie");
      if (cookieHeader) {
        const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
        if (match) token = decodeURIComponent(match[1]);
      }
    }

    // 3. Fallback to Authorization: Bearer <token>
    if (!token && typeof request.headers?.get === "function") {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }
  }

  // 4. Server Component or Route Handler via cookies()
  if (!token) {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    } catch {
      token = undefined;
    }
  }

  if (!token) return null;
  return await verifyAdminToken(token);
}

/**
 * Live validation of admin user against database state to revoke stale sessions immediately.
 * Ensures that if an admin is deactivated, deleted, demoted, or has their password reset,
 * any previously issued JWT token is instantly invalidated.
 */
export async function validateAdminSessionAgainstDb(
  session: AdminJwtPayload
): Promise<AdminJwtPayload | null> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        isActive: true,
        role: true,
        emailVerified: true,
        updatedAt: true,
      },
    });

    // 1. Account deleted
    if (!user) {
      return null;
    }

    // 2. Account deactivated
    if (!user.isActive) {
      return null;
    }

    // 3. Role changed / demoted
    if (user.role !== session.role) {
      return null;
    }

    // 4. Session revocation on password reset / security update:
    // If token has an iat (issued-at) and user was updated more than 2 seconds after iat,
    // the previous token is revoked.
    if (session.iat && user.updatedAt) {
      const updatedAtSec = Math.floor(new Date(user.updatedAt).getTime() / 1000);
      if (updatedAtSec > session.iat + 2) {
        return null;
      }
    }

    return {
      ...session,
      emailVerified: Boolean(user.emailVerified),
    };
  } catch (err) {
    console.warn("DB session validation check error:", err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Route guard helper to enforce admin session (ADMIN or SUPER_ADMIN).
 * Requires the account to have completed email verification (emailVerified != false).
 * Enforces live DB validation against deactivation, deletion, role changes, and password resets.
 */
export async function requireAdmin(
  request?: Request | NextRequest
): Promise<AdminJwtPayload | null> {
  const session = await getAdminSession(request);
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    return null;
  }
  // Unverified accounts cannot access privileged admin operational features
  if (session.emailVerified === false) {
    return null;
  }
  return await validateAdminSessionAgainstDb(session);
}

/**
 * Route guard helper to enforce SUPER_ADMIN privileges exclusively.
 * Requires the Super Admin account to have completed email verification (emailVerified != false).
 * Enforces live DB validation against deactivation, deletion, role changes, and password resets.
 */
export async function requireSuperAdmin(
  request?: Request | NextRequest
): Promise<AdminJwtPayload | null> {
  const session = await getAdminSession(request);
  if (!session || session.role !== "SUPER_ADMIN") {
    return null;
  }
  // Unverified Super Admin accounts cannot access administrative management features
  if (session.emailVerified === false) {
    return null;
  }
  return await validateAdminSessionAgainstDb(session);
}

/**
 * Route guard helper for onboarding / verification flow only.
 * Returns the decoded AdminJwtPayload even if email is not yet verified,
 * allowing the user to request and submit OTP without authentication deadlock.
 */
export async function requireAdminSession(
  request?: Request | NextRequest
): Promise<AdminJwtPayload | null> {
  const session = await getAdminSession(request);
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    return null;
  }
  return await validateAdminSessionAgainstDb(session);
}
