import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rateLimit";
import * as bcrypt from "bcryptjs";
import { createEmailOtp } from "@/lib/otp";
import { sendSecurityAlertEmail } from "@/lib/email/notifications";

export async function GET(request: NextRequest) {
  try {
    const superAdmin = await requireSuperAdmin(request);
    if (!superAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. Administrator account management is only permitted for Super Admins.",
        },
        { status: 403 }
      );
    }

    // Fetch all administrative accounts (ADMIN and SUPER_ADMIN)
    const users = await (prisma as any).user.findMany({
      where: {
        role: { in: ["ADMIN", "SUPER_ADMIN"] },
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        notificationPreferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load administrator list." },
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
          error: "Access denied. Only Super Admins are authorized to create new administrator accounts.",
        },
        { status: 403 }
      );
    }

    const clientIp = getClientIp(request);
    const body = await request.json();
    const { username, name, email, password, phone, role, notificationPreferences } = body;

    if (!username || !name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Username, full name, email, and password are required." },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    // 1. Username format validation (alphanumeric, underscore, length 3-30)
    if (!/^[a-z0-9_]{3,30}$/.test(cleanUsername)) {
      return NextResponse.json(
        {
          success: false,
          error: "Username may only contain lowercase letters, numbers, underscores (_), and must be 3-30 characters long.",
        },
        { status: 400 }
      );
    }

    // 2. Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address format." },
        { status: 400 }
      );
    }

    // 3. Password strength
    if (String(password).length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // 4. Role enforcement: Creation of additional SUPER_ADMIN accounts is NOT permitted via the ordinary Admin form
    if (role === "SUPER_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Creating additional Super Admin accounts is not permitted through the standard admin creation form. Use the secure server bootstrap procedure.",
        },
        { status: 400 }
      );
    }
    const targetRole = "ADMIN";

    // 5. Check if username or email is already taken
    const existing = await (prisma as any).user.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: cleanEmail }],
      },
    });

    if (existing) {
      if (existing.username === cleanUsername) {
        return NextResponse.json(
          { success: false, error: `Username '${cleanUsername}' is already taken. Please choose another username.` },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: `Email '${cleanEmail}' is already registered in the system.` },
        { status: 400 }
      );
    }

    // 6. Hash password with bcrypt
    const passwordHash = await bcrypt.hash(String(password), 10);

    // 7. Create admin user (emailVerified starts as null until verified via OTP)
    const newUser = await (prisma as any).user.create({
      data: {
        username: cleanUsername,
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        phone: phone ? String(phone).trim() : null,
        role: targetRole,
        notificationPreferences: notificationPreferences
          ? typeof notificationPreferences === "string"
            ? notificationPreferences
            : JSON.stringify(notificationPreferences)
          : '{"booking":true,"customTrip":true,"review":true,"contact":true}',
        isActive: true,
        emailVerified: null, // Must complete OTP verification
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        notificationPreferences: true,
        createdAt: true,
      },
    });

    // 8. Audit logging
    await recordAuditLog({
      userId: superAdmin.id,
      adminName: superAdmin.name,
      action: "CREATE_ADMIN",
      targetId: newUser.id,
      details: {
        createdUsername: newUser.username,
        createdEmail: newUser.email,
        assignedRole: newUser.role,
      },
      ipAddress: clientIp,
    });

    // 9. Dispatch onboarding verification OTP to newly created Admin (Non-blocking)
    createEmailOtp(newUser.email, "ADMIN_VERIFY", {
      targetId: newUser.id,
      recipientName: newUser.name,
      sendEmailDelivery: true,
    }).catch((err) => console.error("[Users] Failed to dispatch admin onboarding OTP:", err));

    // 10. Dispatch security alert to Super Admin
    sendSecurityAlertEmail({
      action: "CREATE_ADMIN",
      adminName: superAdmin.name,
      details: {
        createdUsername: newUser.username,
        createdEmail: newUser.email,
        assignedRole: newUser.role,
      },
      ipAddress: clientIp,
    }).catch((err) => console.error("[Users] Failed to dispatch admin creation security alert:", err));

    return NextResponse.json({
      success: true,
      message: `${newUser.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"} account '${newUser.name}' (@${newUser.username}) created successfully.`,
      user: newUser,
    });
  } catch (error: any) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create administrator account." },
      { status: 500 }
    );
  }
}
