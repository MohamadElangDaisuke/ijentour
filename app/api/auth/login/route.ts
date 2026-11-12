import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signAdminToken, COOKIE_NAME } from "@/lib/auth";
import { loginRateLimiter, getClientIp } from "@/lib/rateLimit";
import { recordAuditLog } from "@/lib/audit";
import * as bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    if (loginRateLimiter.isLimited(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many failed login attempts. Please try again in 15 minutes.",
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.username || !body.password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required." },
        { status: 400 }
      );
    }

    const username = String(body.username).trim().toLowerCase();
    const password = String(body.password);

    if (password.length < 4 || password.length > 100) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // Lookup user by unique username (case-insensitive)
    const user = await (prisma as any).user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (!user || !user.passwordHash || !user.isActive) {
      await recordAuditLog({
        action: "AUTH_FAILURE",
        details: { attemptedUsername: username, reason: "Account not found or inactive" },
        ipAddress: clientIp,
      });
      return NextResponse.json(
        { success: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // Role check - only ADMIN and SUPER_ADMIN are permitted
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      await recordAuditLog({
        userId: user.id,
        adminName: user.name,
        action: "AUTH_FAILURE",
        details: { attemptedUsername: username, role: user.role, reason: "Non-admin role" },
        ipAddress: clientIp,
      });
      return NextResponse.json(
        { success: false, error: "Access denied. This account does not have administrator privileges." },
        { status: 403 }
      );
    }

    // Verify hashed password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      await recordAuditLog({
        userId: user.id,
        adminName: user.name,
        action: "AUTH_FAILURE",
        details: { attemptedUsername: username, reason: "Invalid password match" },
        ipAddress: clientIp,
      });
      return NextResponse.json(
        { success: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // Sign JWT token with username, role, and email verification status
    const isEmailVerified = Boolean(user.emailVerified);
    const token = await signAdminToken({
      id: user.id,
      username: user.username || username,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: isEmailVerified,
    });

    const response = NextResponse.json({
      success: true,
      message: isEmailVerified
        ? "Login successful. Welcome back!"
        : "Login successful. Please complete email OTP verification to activate full access.",
      user: {
        id: user.id,
        username: user.username || username,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: isEmailVerified,
      },
      redirectTo: isEmailVerified ? "/admin/dashboard" : "/admin/verify-email",
    });

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
