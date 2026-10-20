import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const destination = await prisma.destination.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!destination) {
      return NextResponse.json(
        { success: false, error: "Destinasi tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, destination });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memuat destinasi." },
      { status: 500 }
    );
  }
}

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
    const existing = await prisma.destination.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Destinasi tidak ditemukan." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const dataToUpdate: any = {};

    if (body.name !== undefined) dataToUpdate.name = String(body.name).trim();
    if (body.description !== undefined) dataToUpdate.description = String(body.description).trim();
    if (body.image !== undefined) dataToUpdate.image = String(body.image).trim();
    if (body.tag !== undefined) dataToUpdate.tag = String(body.tag).trim();
    if (body.isFeatured !== undefined) dataToUpdate.isFeatured = Boolean(body.isFeatured);
    if (body.sortOrder !== undefined) dataToUpdate.sortOrder = Number(body.sortOrder);

    const updated = await prisma.destination.update({
      where: { id: existing.id },
      data: dataToUpdate,
    });

    try {
      revalidatePath("/");
      revalidatePath("/destinations");
      revalidatePath(`/destinations/${existing.slug}`);
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Destinasi berhasil diperbarui.",
      destination: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/destinations/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui destinasi." },
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
    const existing = await prisma.destination.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Destinasi tidak ditemukan atau sudah dihapus." },
        { status: 404 }
      );
    }

    await prisma.destination.delete({ where: { id: existing.id } });

    try {
      revalidatePath("/");
      revalidatePath("/destinations");
      revalidatePath(`/destinations/${existing.slug}`);
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Destinasi berhasil dihapus.",
    });
  } catch (error: any) {
    console.error("DELETE /api/destinations/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus destinasi." },
      { status: 500 }
    );
  }
}
