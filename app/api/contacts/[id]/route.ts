import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login sebagai administrator." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.contact.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Pesan kontak tidak ditemukan atau sudah dihapus." }, { status: 404 });
    }

    await prisma.contact.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Pesan kontak berhasil dihapus." });
  } catch (error: any) {
    console.error("DELETE /api/contacts/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus pesan kontak." }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login sebagai administrator." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.contact.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Pesan kontak tidak ditemukan." }, { status: 404 });
    }

    const body = await request.json();
    const { status } = body;

    const updated = await prisma.contact.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
      },
    });

    return NextResponse.json({ success: true, contact: updated });
  } catch (error: any) {
    console.error("PUT /api/contacts/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui status pesan kontak." }, { status: 500 });
  }
}
