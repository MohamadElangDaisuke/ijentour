import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "ijen-tour-secret-key-super-secure-fullstack-2026";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
export const COOKIE_NAME = "admin_token";

export interface AdminJwtPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  [key: string]: any;
}

/**
 * Sign a new JWT session for an admin
 */
export async function signAdminToken(payload: AdminJwtPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verify and decode an admin JWT token
 */
export async function verifyAdminToken(token: string): Promise<AdminJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload || payload.role !== "ADMIN") {
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
 * Route guard helper to enforce admin session.
 * Returns the decoded AdminJwtPayload if valid admin, or null if unauthorized.
 */
export async function requireAdmin(
  request?: Request | NextRequest
): Promise<AdminJwtPayload | null> {
  const session = await getAdminSession(request);
  if (!session || session.role !== "ADMIN") {
    return null;
  }
  return session;
}
