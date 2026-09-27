import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.galleryItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Foto galeri tidak ditemukan atau sudah dihapus." }, { status: 404 });
    }
    await prisma.galleryItem.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Foto galeri berhasil dihapus." });
  } catch (error: any) {
    console.error("DELETE /api/gallery/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus foto galeri." },
      { status: 500 }
    );
  }
}
