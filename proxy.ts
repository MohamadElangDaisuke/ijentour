import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "admin_token";

function getJwtSecretKey(): Uint8Array | null {
  const secret = process.env.JWT_SECRET;
  if (!secret || typeof secret !== "string" || secret.trim().length < 32) {
    return null;
  }
  return new TextEncoder().encode(secret.trim());
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secretKey = getJwtSecretKey();

  let isValidAdmin = false;
  let isSuperAdmin = false;
  let isEmailVerified = false;
  if (token && secretKey) {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      if (
        payload &&
        (payload.role === "ADMIN" || payload.role === "SUPER_ADMIN")
      ) {
        isValidAdmin = true;
        if (payload.role === "SUPER_ADMIN") {
          isSuperAdmin = true;
        }
        // If explicitly false, email is unverified; undefined/true defaults to verified
        isEmailVerified = payload.emailVerified !== false;
      }
    } catch {
      isValidAdmin = false;
      isSuperAdmin = false;
      isEmailVerified = false;
    }
  }

  // 1. If user is trying to view the login page
  if (pathname === "/admin/login") {
    if (isValidAdmin) {
      if (!isEmailVerified) {
        const verifyUrl = new URL("/admin/verify-email", request.url);
        return NextResponse.redirect(verifyUrl);
      }
      const dashboardUrl = new URL("/admin/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    // Allow unauthenticated admin to access login page
    return NextResponse.next();
  }

  // 2. For all other /admin routes, enforce valid admin token
  if (!isValidAdmin) {
    const loginUrl = new URL("/admin/login", request.url);
    if (pathname !== "/admin") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 3. Email verification gate for unverified accounts
  if (!isEmailVerified) {
    if (pathname === "/admin/verify-email") {
      return NextResponse.next(); // Allow accessing verification screen
    }
    // Unverified admin attempting to access any privileged route -> redirect to verify-email
    const verifyUrl = new URL("/admin/verify-email", request.url);
    return NextResponse.redirect(verifyUrl);
  }

  // 4. If already verified but accessing /admin/verify-email -> redirect to dashboard
  if (pathname === "/admin/verify-email" && isEmailVerified) {
    const dashboardUrl = new URL("/admin/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 5. Super Admin-only routes enforcement: /admin/users, /admin/email-settings, /admin/security, /admin/audit-logs, /admin/settings
  if (
    (pathname.startsWith("/admin/users") ||
      pathname.startsWith("/admin/email-settings") ||
      pathname.startsWith("/admin/security") ||
      pathname.startsWith("/admin/audit-logs") ||
      pathname.startsWith("/admin/settings")) &&
    !isSuperAdmin
  ) {
    // Normal admins cannot access Super Admin pages; redirect to dashboard
    const dashboardUrl = new URL("/admin/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
