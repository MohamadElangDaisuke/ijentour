import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { defaultArticles } from "@/app/lib/articlesStorage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("localhost:5432") || process.env.DATABASE_URL.startsWith("file:")) {
      const fallback = defaultArticles.find(
        (a) => a.id === slug || a.title.toLowerCase().includes(slug.replace(/-/g, " ").toLowerCase())
      );

      if (fallback) {
        return NextResponse.json({ success: true, article: fallback });
      }
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

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

    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  } catch {
    try {
      const { slug } = await params;
      const fallback = defaultArticles.find(
        (a) => a.id === slug || a.title.toLowerCase().includes(slug.replace(/-/g, " ").toLowerCase())
      );
      if (fallback) {
        return NextResponse.json({ success: true, article: fallback });
      }
    } catch {}
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const {
      title,
      category,
      excerpt,
      content,
      image,
      author,
      readTime,
      isFeatured,
    } = body;

    const existing = await prisma.blogPost.findFirst({
      where: {
        OR: [{ id: slug }, { slug }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    const updated = await prisma.blogPost.update({
      where: { id: existing.id },
      data: {
        ...(title ? { title } : {}),
        ...(category ? { category } : {}),
        ...(excerpt !== undefined ? { excerpt } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(image ? { image } : {}),
        ...(author ? { author } : {}),
        ...(readTime ? { readTime } : {}),
        ...(isFeatured !== undefined ? { isFeatured: Boolean(isFeatured) } : {}),
      },
    });

    return NextResponse.json({ success: true, article: updated });
  } catch (error: any) {
    console.error("PUT /api/articles/[slug] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update article." },
      { status: 500 }
    );
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
    return NextResponse.json({ success: true, message: "Article successfully deleted." });
  } catch (error: any) {
    console.error("DELETE /api/articles/[slug] error:", error);
    return NextResponse.json({ error: "Failed to delete article." }, { status: 500 });
  }
}

