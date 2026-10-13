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
      return NextResponse.json({ error: "Gallery photo not found or already deleted." }, { status: 404 });
    }
    await prisma.galleryItem.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Gallery photo successfully deleted." });
  } catch (error: any) {
    console.error("DELETE /api/gallery/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete gallery photo." },
      { status: 500 }
    );
  }
}
