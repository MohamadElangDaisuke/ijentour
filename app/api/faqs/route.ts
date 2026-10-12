import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("localhost:5432") || process.env.DATABASE_URL.startsWith("file:")) {
      return NextResponse.json({ success: true, faqs: [] });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: any = { isActive: true };
    if (category && category !== "all") {
      where.category = category;
    }

    const faqs = await prisma.faq.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, faqs });
  } catch {
    return NextResponse.json({ success: true, faqs: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, answer, category = "general", sortOrder = 0 } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Pertanyaan dan jawaban wajib diisi." },
        { status: 400 }
      );
    }

    const faq = await prisma.faq.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        category: category || "general",
        sortOrder: Number(sortOrder) || 0,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, faq });
  } catch (error: any) {
    console.error("POST /api/faqs error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal membuat FAQ." },
      { status: 500 }
    );
  }
}
