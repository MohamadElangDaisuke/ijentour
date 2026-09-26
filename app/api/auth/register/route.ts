import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signAuthToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password, phone, nationality, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email ini sudah terdaftar. Silakan login." },
        { status: 400 }
      );
    }

    // Role check: Allow CUSTOMER, CUSTOMER_PRO, MITRA (ADMIN cannot be self-registered)
    const validRoles = ["CUSTOMER", "CUSTOMER_PRO", "MITRA"];
    const assignedRole = validRoles.includes(role) ? role : "CUSTOMER";

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        phone: phone || null,
        nationality: nationality || "Indonesia",
        role: assignedRole,
        isActive: true,
      },
    });

    // Notify admin about new user registration
    await prisma.notification.create({
      data: {
        type: "user",
        title: "Pengguna Baru Terdaftar",
        description: `${newUser.name} mendaftar sebagai ${newUser.role} (${newUser.email})`,
        link: "/admin/users",
        unread: true,
      },
    });

    const token = await signAuthToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as any,
      phone: newUser.phone,
    });

    const response = NextResponse.json({
      success: true,
      message: "Registrasi berhasil!",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pendaftaran akun." },
      { status: 500 }
    );
  }
}
