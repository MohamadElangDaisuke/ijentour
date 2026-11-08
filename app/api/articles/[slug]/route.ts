import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { defaultArticles } from "@/app/lib/articlesStorage";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { safeDeleteMediaFile } from "@/lib/storage/mediaCleanup";

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
    } catch { }
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Please login as an administrator." }, { status: 401 });
    }

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

    // Safely cleanup old image if replaced and no longer referenced
    if (image && image !== existing.image) {
      safeDeleteMediaFile(existing.image, { model: "blogPost", id: existing.id }).catch(() => { });
    }

    try {
      revalidatePath("/");
      revalidatePath("/blog");
      revalidatePath(`/blog/${existing.slug}`);
    } catch { }

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
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Please login as an administrator." }, { status: 401 });
    }

    const { slug } = await params;
    const existing = await prisma.blogPost.findFirst({
      where: {
        OR: [{ id: slug }, { slug }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Article not found or already deleted." }, { status: 404 });
    }

    await prisma.blogPost.delete({
      where: { id: existing.id },
    });

    // Safely cleanup media file if unreferenced elsewhere and not static
    if (existing.image) {
      safeDeleteMediaFile(existing.image, { model: "blogPost", id: existing.id }).catch(() => { });
    }

    try {
      revalidatePath("/");
      revalidatePath("/blog");
    } catch { }

    return NextResponse.json({ success: true, message: "Article successfully deleted." });
  } catch (error: any) {
    console.error("DELETE /api/articles/[slug] error:", error);
    return NextResponse.json({ error: "Failed to delete article." }, { status: 500 });
  }
}

