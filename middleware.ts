import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. ADMIN ROUTES PROTECTION
  if (pathname.startsWith("/admin")) {
    // Exclude public admin routes
    if (
      pathname === "/admin/login" ||
      pathname.startsWith("/admin/login/") ||
      pathname.startsWith("/api/")
    ) {
      return NextResponse.next();
    }

    const token =
      request.cookies.get("admin_token")?.value ||
      request.cookies.get("auth_token")?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyAuthToken(token);
    if (!session || session.role !== "ADMIN") {
      const loginUrl = new URL("/admin/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("admin_token");
      return response;
    }
  }

  // 2. CUSTOMER PORTAL PROTECTION
  if (pathname.startsWith("/customer")) {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyAuthToken(token);
    if (!session || (session.role !== "CUSTOMER" && session.role !== "CUSTOMER_PRO" && session.role !== "ADMIN")) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. MITRA / GUIDE PORTAL PROTECTION
  if (pathname.startsWith("/mitra")) {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyAuthToken(token);
    if (!session || (session.role !== "MITRA" && session.role !== "ADMIN")) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/customer/:path*",
    "/mitra/:path*",
  ],
};
