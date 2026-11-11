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
          error: "Akses ditolak. Pengelolaan akun administrator hanya diizinkan untuk Super Admin.",
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
      { success: false, error: "Gagal memuat daftar administrator." },
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
          error: "Akses ditolak. Hanya Super Admin yang berwenang membuat akun administrator baru.",
        },
        { status: 403 }
      );
    }

    const clientIp = getClientIp(request);
    const body = await request.json();
    const { username, name, email, password, phone, role, notificationPreferences } = body;

    if (!username || !name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Username, nama lengkap, email, dan kata sandi wajib diisi." },
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
          error: "Username hanya boleh berisi huruf kecil, angka, garis bawah (_), dan panjang 3-30 karakter.",
        },
        { status: 400 }
      );
    }

    // 2. Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Format alamat email tidak valid." },
        { status: 400 }
      );
    }

    // 3. Password strength
    if (String(password).length < 6) {
      return NextResponse.json(
        { success: false, error: "Kata sandi minimal 6 karakter." },
        { status: 400 }
      );
    }

    // 4. Role enforcement: Creation of additional SUPER_ADMIN accounts is NOT permitted via the ordinary Admin form
    if (role === "SUPER_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Pembuatan akun Super Admin tambahan tidak diizinkan melalui form pendaftaran admin biasa. Gunakan prosedur bootstrap aman di server.",
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
          { success: false, error: `Username '${cleanUsername}' sudah digunakan. Silakan pilih username lain.` },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: `Email '${cleanEmail}' sudah terdaftar di sistem.` },
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
      message: `Akun ${newUser.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"} '${newUser.name}' (@${newUser.username}) berhasil dibuat.`,
      user: newUser,
    });
  } catch (error: any) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat akun administrator." },
      { status: 500 }
    );
  }
}
