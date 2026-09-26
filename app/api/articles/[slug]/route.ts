import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { defaultArticles } from "@/app/lib/articlesStorage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Search in Prisma database first
    const post = await prisma.blogPost.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug },
        ],
      },
    });

    if (post) {
      return NextResponse.json({ success: true, article: post });
    }

    // Fallback to defaultArticles if not yet in DB
    const fallback = defaultArticles.find(
      (a) => a.id === slug || a.title.toLowerCase().includes(slug.replace(/-/g, " ").toLowerCase())
    );

    if (fallback) {
      return NextResponse.json({ success: true, article: fallback });
    }

    return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
  } catch (error) {
    console.error("GET /api/articles/[slug] error:", error);
    return NextResponse.json({ error: "Gagal memuat artikel." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await prisma.blogPost.deleteMany({
      where: {
        OR: [{ id: slug }, { slug }],
      },
    });
    return NextResponse.json({ success: true, message: "Artikel berhasil dihapus." });
  } catch (error: any) {
    console.error("DELETE /api/articles/[slug] error:", error);
    return NextResponse.json({ error: "Gagal menghapus artikel." }, { status: 500 });
  }
}
