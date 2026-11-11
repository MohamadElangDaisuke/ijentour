import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";
import { getResendConfigStatus, sendEmail } from "@/lib/email/resend";
import { createTestEmail } from "@/lib/email/templates";
import { safeJsonParse } from "@/lib/utils";
import { getClientIp, contactRateLimiter } from "@/lib/rateLimit";
import { recordAuditLog } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const superAdmin = await requireSuperAdmin(request);
    if (!superAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. Only Super Admin can inspect email configuration.",
        },
        { status: 403 }
      );
    }

    const config = getResendConfigStatus();

    // Fetch administrative accounts and their notification preferences
    const adminAccounts = await (prisma as any).user.findMany({
      where: {
        role: { in: ["SUPER_ADMIN", "ADMIN"] },
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        notificationPreferences: true,
      },
      orderBy: { role: "asc" },
    });

    const formattedAdmins = adminAccounts.map((admin: any) => ({
      id: admin.id,
      name: admin.name,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      emailVerified: Boolean(admin.emailVerified),
      preferences: safeJsonParse(admin.notificationPreferences, {
        booking: true,
        customTrip: true,
        review: true,
        contact: true,
      }),
    }));

    return NextResponse.json({
      success: true,
      config,
      admins: formattedAdmins,
    });
  } catch (error: any) {
    console.error("GET /api/admin/email-settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load email configuration." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const superAdmin = await requireSuperAdmin(request);
    if (!superAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. Only Super Admin can dispatch test emails.",
        },
        { status: 403 }
      );
    }

    const clientIp = getClientIp(request);
    if (contactRateLimiter.isLimited(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many test email requests. Please wait a moment before sending another.",
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { action, recipient } = body;

    if (action === "send_test_email") {
      const targetRecipient = (
        recipient ||
        process.env.ADMIN_NOTIFICATION_EMAIL ||
        superAdmin.email
      ).trim().toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetRecipient)) {
        return NextResponse.json(
          { success: false, error: "Invalid test email recipient address." },
          { status: 400 }
        );
      }

      const config = getResendConfigStatus();
      const template = createTestEmail({
        recipient: targetRecipient,
        sender: `${config.senderName} <${config.senderEmail}>`,
        adminName: superAdmin.name,
      });

      const sendResult = await sendEmail({
        to: targetRecipient,
        subject: template.subject,
        html: template.html,
        text: template.text,
        tags: [{ name: "category", value: "system_test" }],
      });

      if (!sendResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: sendResult.error || "Failed to dispatch test email via Resend.",
          },
          { status: 500 }
        );
      }

      await recordAuditLog({
        userId: superAdmin.id,
        adminName: superAdmin.name,
        action: "UPDATE_ADMIN",
        details: { action: "send_test_email", recipient: targetRecipient, mocked: sendResult.mocked },
        ipAddress: clientIp,
      });

      return NextResponse.json({
        success: true,
        message: sendResult.mocked
          ? `Test email simulated successfully for ${targetRecipient} (RESEND_API_KEY is currently empty in local environment).`
          : `Test email dispatched successfully to ${targetRecipient} via Resend!`,
        mocked: Boolean(sendResult.mocked),
        deliveryId: sendResult.id,
      });
    }

    return NextResponse.json(
      { success: false, error: "Unknown action request." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/email-settings error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process test email request." },
      { status: 500 }
    );
  }
}

