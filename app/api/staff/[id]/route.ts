import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff member not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, staff });
  } catch (error: any) {
    console.error("GET /api/staff/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch staff details." }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Please login as an administrator." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const existing = await prisma.staff.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Staff member not found." }, { status: 404 });
    }

    const body = await request.json();
    const dataToUpdate: any = {};

    if (body.name !== undefined) dataToUpdate.name = body.name.trim();
    if (body.role !== undefined) dataToUpdate.role = body.role.trim();
    if (body.specialty !== undefined) dataToUpdate.specialty = body.specialty?.trim() || null;
    if (body.description !== undefined) dataToUpdate.description = body.description?.trim() || null;
    if (body.avatarUrl !== undefined) dataToUpdate.avatarUrl = body.avatarUrl?.trim() || null;
    if (body.experience !== undefined) dataToUpdate.experience = body.experience?.trim() || null;
    if (body.languages !== undefined) dataToUpdate.languages = body.languages?.trim() || null;
    if (body.rating !== undefined) dataToUpdate.rating = Number(body.rating);
    if (body.badge !== undefined) dataToUpdate.badge = body.badge?.trim() || null;
    if (body.phone !== undefined) dataToUpdate.phone = body.phone?.trim() || null;
    if (body.email !== undefined) dataToUpdate.email = body.email?.trim() || null;
    if (body.instagram !== undefined) dataToUpdate.instagram = body.instagram?.trim() || null;
    if (body.isFeatured !== undefined) dataToUpdate.isFeatured = Boolean(body.isFeatured);
    if (body.isActive !== undefined) dataToUpdate.isActive = Boolean(body.isActive);
    if (body.sortOrder !== undefined) dataToUpdate.sortOrder = Number(body.sortOrder);
    if (body.userId !== undefined) dataToUpdate.userId = body.userId || null;

    const updated = await prisma.staff.update({
      where: { id },
      data: dataToUpdate,
    });

    try {
      revalidatePath("/");
      revalidatePath("/about");
    } catch {}

    return NextResponse.json({ success: true, staff: updated });
  } catch (error: any) {
    console.error("PUT /api/staff/[id] error:", error);
    return NextResponse.json({ error: "Failed to update staff member." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Please login as an administrator." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const existing = await prisma.staff.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Staff member not found or already deleted." }, { status: 404 });
    }

    await prisma.staff.delete({
      where: { id },
    });

    try {
      revalidatePath("/");
      revalidatePath("/about");
    } catch {}

    return NextResponse.json({ success: true, message: "Staff member successfully deleted." });
  } catch (error: any) {
    console.error("DELETE /api/staff/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete staff member." }, { status: 500 });
  }
}
