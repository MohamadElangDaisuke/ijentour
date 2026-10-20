import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import * as bcrypt from "bcryptjs";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Akses ditolak. Silakan login sebagai administrator." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Akun admin tidak ditemukan." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const dataToUpdate: any = {};

    if (body.name !== undefined) dataToUpdate.name = String(body.name).trim();
    if (body.phone !== undefined) dataToUpdate.phone = String(body.phone).trim();
    if (body.isActive !== undefined) dataToUpdate.isActive = Boolean(body.isActive);

    // If changing password
    if (body.password) {
      if (body.password.length < 6) {
        return NextResponse.json(
          { success: false, error: "Kata sandi minimal 6 karakter." },
          { status: 400 }
        );
      }
      dataToUpdate.passwordHash = await bcrypt.hash(body.password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
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

    return NextResponse.json({
      success: true,
      message: "Akun admin berhasil diperbarui.",
      user: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui akun admin." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Akses ditolak. Silakan login sebagai administrator." }, { status: 401 });
    }

    const { id } = await params;

    // Safety: Cannot delete own account
    if (admin.id === id) {
      return NextResponse.json(
        { success: false, error: "Anda tidak dapat menghapus akun admin Anda sendiri." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Akun admin tidak ditemukan." },
        { status: 404 }
      );
    }

    // Safety: ensure at least one active admin remains
    const totalAdmins = await prisma.user.count({ where: { role: "ADMIN" } });
    if (totalAdmins <= 1) {
      return NextResponse.json(
        { success: false, error: "Tidak dapat menghapus admin terakhir pada sistem." },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Akun admin berhasil dihapus.",
    });
  } catch (error: any) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus akun admin." },
      { status: 500 }
    );
  }
}
