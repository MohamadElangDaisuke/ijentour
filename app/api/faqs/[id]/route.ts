import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
    const existing = await prisma.faq.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "FAQ not found or already deleted." }, { status: 404 });
    }
    await prisma.faq.delete({
      where: { id },
    });

    try {
      revalidatePath("/");
      revalidatePath("/about");
      revalidatePath("/contact");
    } catch {}

    return NextResponse.json({ success: true, message: "FAQ successfully deleted." });
  } catch (error: any) {
    console.error("DELETE /api/faqs/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete FAQ." }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Please login as an administrator." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.faq.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "FAQ not found." }, { status: 404 });
    }
    const body = await request.json();
    const { question, answer, category, sortOrder, isActive } = body;

    const dataToUpdate: any = {};
    if (question !== undefined) dataToUpdate.question = question;
    if (answer !== undefined) dataToUpdate.answer = answer;
    if (category !== undefined) dataToUpdate.category = category;
    if (sortOrder !== undefined) dataToUpdate.sortOrder = Number(sortOrder);
    if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);

    const updated = await prisma.faq.update({
      where: { id },
      data: dataToUpdate,
    });

    try {
      revalidatePath("/");
      revalidatePath("/about");
      revalidatePath("/contact");
    } catch {}

    return NextResponse.json({ success: true, faq: updated });
  } catch (error: any) {
    console.error("PUT /api/faqs/[id] error:", error);
    return NextResponse.json({ error: "Failed to update FAQ." }, { status: 500 });
  }
}
