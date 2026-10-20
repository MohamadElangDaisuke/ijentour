import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import * as bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Akses ditolak. Silakan login sebagai administrator." }, { status: 401 });
    }

    // Fetch all admin accounts (or all staff users)
    const users = await prisma.user.findMany({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar admin." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Akses ditolak. Silakan login sebagai administrator." }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Nama, email, dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Kata sandi minimal 6 karakter." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email ini sudah terdaftar di sistem." },
        { status: 400 }
      );
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: cleanEmail,
        passwordHash,
        phone: phone ? String(phone).trim() : null,
        role: "ADMIN",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Akun admin '${newUser.name}' berhasil dibuat.`,
      user: newUser,
    });
  } catch (error: any) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat akun admin." },
      { status: 500 }
    );
  }
}
