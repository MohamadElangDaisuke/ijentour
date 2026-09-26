import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    const where: any = {};
    if (role && role !== "ALL") {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        nationality: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { bookings: true },
        },
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Gagal memuat daftar pengguna." }, { status: 500 });
  }
}
