import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  try {
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
  } catch (error: any) {
    console.warn("GET /api/faqs fallback used:", error?.message || error);
    return NextResponse.json({ success: true, faqs: [] });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Please login as an administrator." }, { status: 401 });
    }

    const body = await request.json();
    const { question, answer, category = "general", sortOrder = 0 } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and answer are required." },
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

    try {
      revalidatePath("/");
      revalidatePath("/about");
      revalidatePath("/contact");
    } catch {}

    return NextResponse.json({ success: true, faq });
  } catch (error: any) {
    console.error("POST /api/faqs error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create FAQ." },
      { status: 500 }
    );
  }
}
