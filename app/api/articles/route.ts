import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { defaultArticles } from "@/app/lib/articlesStorage";
import { createSlug } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: any = {};
    if (category && category !== "Semua") {
      where.category = category;
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    if (posts.length === 0) {
      return NextResponse.json({ success: true, articles: defaultArticles });
    }

    return NextResponse.json({ success: true, articles: posts });
  } catch (error) {
    console.error("GET /api/articles error:", error);
    return NextResponse.json({ success: true, articles: defaultArticles });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      category = "Panduan",
      excerpt = "",
      content = "",
      image = "/images/pkg-bluefire.png",
      author = "Tim Ekspedisi Ijen",
      readTime = "5 Menit Baca",
      isFeatured = false,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Judul artikel wajib diisi." }, { status: 400 });
    }

    const slug = createSlug(title);
    const date = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        category,
        excerpt,
        content,
        image,
        date,
        readTime,
        author,
        isFeatured: Boolean(isFeatured),
      },
    });

    return NextResponse.json({ success: true, article: post });
  } catch (error: any) {
    console.error("POST /api/articles error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal membuat artikel." },
      { status: 500 }
    );
  }
}
