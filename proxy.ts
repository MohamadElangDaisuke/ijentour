import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "ijen-tour-secret-key-super-secure-fullstack-2026";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = "admin_token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  let isValidAdmin = false;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload && payload.role === "ADMIN") {
        isValidAdmin = true;
      }
    } catch {
      isValidAdmin = false;
    }
  }

  // 1. If user is trying to view the login page
  if (pathname === "/admin/login") {
    if (isValidAdmin) {
      // Already authenticated, send to dashboard
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
