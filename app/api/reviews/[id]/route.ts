import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
    const existing = await prisma.review.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Ulasan tidak ditemukan." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const dataToUpdate: any = {};

    if (body.authorName !== undefined) dataToUpdate.authorName = String(body.authorName).trim();
    if (body.rating !== undefined) dataToUpdate.rating = Math.max(1, Math.min(5, Number(body.rating)));
    if (body.comment !== undefined) dataToUpdate.comment = String(body.comment).trim();
    if (body.isApproved !== undefined) dataToUpdate.isApproved = Boolean(body.isApproved);
    if (body.photoUrls !== undefined) {
      dataToUpdate.photoUrls = JSON.stringify(
        Array.isArray(body.photoUrls) ? body.photoUrls : [body.photoUrls].filter(Boolean)
      );
    }

    const updated = await prisma.review.update({
      where: { id },
      data: dataToUpdate,
    });

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Ulasan berhasil diperbarui.",
      review: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/reviews/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui ulasan." },
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
    const existing = await prisma.review.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Ulasan tidak ditemukan atau sudah dihapus." },
        { status: 404 }
      );
    }

    await prisma.review.delete({ where: { id } });

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Ulasan berhasil dihapus.",
    });
  } catch (error: any) {
    console.error("DELETE /api/reviews/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus ulasan." },
      { status: 500 }
    );
  }
}
