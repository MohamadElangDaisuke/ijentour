import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signAdminToken, COOKIE_NAME } from "@/lib/auth";
import * as bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.email || !body.password) {
      return NextResponse.json(
        { success: false, error: "Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const email = String(body.email).trim().toLowerCase();
    const password = String(body.password);

    // Rate-limit safety check / minimal validation
    if (password.length < 4 || password.length > 100) {
      return NextResponse.json(
        { success: false, error: "Email atau kata sandi tidak valid." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash || !user.isActive) {
      return NextResponse.json(
        { success: false, error: "Email atau kata sandi tidak valid." },
        { status: 401 }
      );
    }

    // Role check - only ADMIN accounts are permitted
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Akun ini tidak memiliki hak akses administrator." },
        { status: 403 }
      );
    }

    // Verify hashed password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Email atau kata sandi tidak valid." },
        { status: 401 }
      );
    }

    // Sign JWT token
    const token = await signAdminToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil. Selamat datang kembali!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
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
      { success: false, error: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}
