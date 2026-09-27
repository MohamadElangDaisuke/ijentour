import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    const body = await request.json();

    const dataToUpdate: any = {};
    if (body.role !== undefined) dataToUpdate.role = body.role;
    if (body.isActive !== undefined) dataToUpdate.isActive = Boolean(body.isActive);
    if (body.name !== undefined) dataToUpdate.name = body.name;
    if (body.phone !== undefined) dataToUpdate.phone = body.phone;

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        phone: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data pengguna berhasil diperbarui.",
      user: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui pengguna." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan atau sudah dihapus." }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Pengguna berhasil dihapus." });
  } catch (error: any) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus pengguna." },
      { status: 500 }
    );
  }
}
