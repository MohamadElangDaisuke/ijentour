import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.faq.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: "FAQ berhasil dihapus." });
  } catch (error: any) {
    console.error("DELETE /api/faqs/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus FAQ." }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    return NextResponse.json({ success: true, faq: updated });
  } catch (error: any) {
    console.error("PUT /api/faqs/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui FAQ." }, { status: 500 });
  }
}
