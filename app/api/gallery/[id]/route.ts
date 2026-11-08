import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { safeDeleteMediaFile } from "@/lib/storage/mediaCleanup";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Please login as an administrator." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.galleryItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Gallery photo not found or already deleted." }, { status: 404 });
    }
    await prisma.galleryItem.delete({ where: { id } });

    // Safely cleanup media file if unreferenced elsewhere and not static
    if (existing.image) {
      safeDeleteMediaFile(existing.image, { model: "galleryItem", id: existing.id }).catch(() => {});
    }
    if (existing.thumbnailUrl && existing.thumbnailUrl !== existing.image) {
      safeDeleteMediaFile(existing.thumbnailUrl, { model: "galleryItem", id: existing.id }).catch(() => {});
    }

    try {
      revalidatePath("/");
      revalidatePath("/gallery");
    } catch {}

    return NextResponse.json({ success: true, message: "Gallery photo successfully deleted." });
  } catch (error: any) {
    console.error("DELETE /api/gallery/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete gallery photo." },
      { status: 500 }
    );
  }
}
