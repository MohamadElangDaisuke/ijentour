import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, signAdminToken, COOKIE_NAME } from "@/lib/auth";
import { createEmailOtp, verifyEmailOtp } from "@/lib/otp";
import { otpRateLimiter, getClientIp } from "@/lib/rateLimit";
import { recordAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    // Allows unverified admin sessions to access this verification route without deadlock
    const adminSession = await requireAdminSession(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: "Access denied. Please sign in first." },
        { status: 401 }
      );
    }

    const clientIp = getClientIp(request);
    if (otpRateLimiter.isLimited(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many OTP verification requests. Please wait a moment before trying again.",
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.action) {
      return NextResponse.json(
        { success: false, error: "Action 'send' or 'verify' is required." },
        { status: 400 }
      );
    }

    const { action, userId, email, code } = body;

    // 1. Send OTP
    if (action === "send") {
      if (!email) {
        return NextResponse.json(
          { success: false, error: "Email address is required." },
          { status: 400 }
        );
      }

      const targetEmail = String(email).trim().toLowerCase();

      // Binding & Authorization Check:
      // An unverified user can ONLY request OTP for their own registered email.
      // Only an already verified Super Admin can request OTP on behalf of another user.
      const isSelf = adminSession.email.toLowerCase() === targetEmail;
      const isSuperAdminVerified =
        adminSession.role === "SUPER_ADMIN" && adminSession.emailVerified !== false;

      if (!isSelf && !isSuperAdminVerified) {
        return NextResponse.json(
          {
            success: false,
            error: "Access denied. You are only authorized to request an OTP code for your own account email.",
          },
          { status: 403 }
        );
      }

      const otpRes = await createEmailOtp(targetEmail, "ADMIN_VERIFY", {
        targetId: adminSession.id,
        recipientName: adminSession.name || "Administrator",
        sendEmailDelivery: true,
      });

      if (!otpRes.success) {
        return NextResponse.json(
          { success: false, error: otpRes.error, cooldownSeconds: otpRes.cooldownSeconds },
          { status: 400 }
        );
      }

      // Safe logging for developer simulation if Resend API key is not yet set
      if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production") {
        console.log(`[SIMULASI OTP EMAIL] Verification code for ${targetEmail}: ${otpRes.code}`);
      }

      return NextResponse.json({
        success: true,
        message: `A 6-digit verification code has been sent to ${targetEmail}. Valid for 10 minutes.`,
        expiresAt: otpRes.expiresAt,
        ...(Boolean(process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY) && {
          devCode: otpRes.code,
        }),
      });
    }

    // 2. Verify OTP
    if (action === "verify") {
      if (!email || !code || !userId) {
        return NextResponse.json(
          { success: false, error: "User ID, email, and 6-digit OTP code are required." },
          { status: 400 }
        );
      }

      const targetEmail = String(email).trim().toLowerCase();
      const targetUserId = String(userId);

      // Binding & Authorization Check:
      // An unverified user can ONLY verify their own account.
      const isSelf =
        adminSession.id === targetUserId ||
        adminSession.email.toLowerCase() === targetEmail;
      const isSuperAdminVerified =
        adminSession.role === "SUPER_ADMIN" && adminSession.emailVerified !== false;

      if (!isSelf && !isSuperAdminVerified) {
        return NextResponse.json(
          {
            success: false,
            error: "Access denied. You may only verify your own registered account.",
          },
          { status: 403 }
        );
      }

      const verifyRes = await verifyEmailOtp(
        targetEmail,
        String(code),
        "ADMIN_VERIFY",
        targetUserId
      );

      if (!verifyRes.success) {
        return NextResponse.json(
          { success: false, error: verifyRes.error },
          { status: 400 }
        );
      }

      // Verification succeeded: mark emailVerified in database
      const updatedUser = await (prisma as any).user.update({
        where: { id: targetUserId },
        data: { emailVerified: new Date() },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          emailVerified: true,
          role: true,
        },
      });

      // Audit Log
      await recordAuditLog({
        userId: adminSession.id,
        adminName: adminSession.name,
        action: "UPDATE_ADMIN",
        targetId: updatedUser.id,
        details: { verifiedEmail: updatedUser.email, event: "email_verified_via_otp" },
        ipAddress: clientIp,
      });

      const response = NextResponse.json({
        success: true,
        message: `Email '${updatedUser.email}' has been officially verified! Full administrative access is now active.`,
        user: updatedUser,
      });

      // If the user verified their own account, refresh their JWT cookie immediately to grant full access
      if (adminSession.id === updatedUser.id) {
        const refreshedToken = await signAdminToken({
          id: updatedUser.id,
          username: updatedUser.username || adminSession.username || "",
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          emailVerified: true, // Upgraded to verified!
        });

        response.cookies.set({
          name: COOKIE_NAME,
          value: refreshedToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60, // 7 days
        });
      }

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Unknown action." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("POST /api/users/otp error:", error);
    return NextResponse.json(
      { success: false, error: "An internal error occurred while processing the OTP." },
      { status: 500 }
    );
  }
}
