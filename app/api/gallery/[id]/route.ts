import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
