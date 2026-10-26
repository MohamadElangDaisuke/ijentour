import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { defaultArticles } from "@/app/lib/articlesStorage";
import { createSlug } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: any = {};
    if (category && category !== "Semua" && category !== "All") {
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
  } catch (error: any) {
    console.warn("GET /api/articles fallback used:", error?.message || error);
    return NextResponse.json({ success: true, articles: defaultArticles });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Please login as an administrator." }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      category = "Guides",
      excerpt = "",
      content = "",
      image = "/images/pkg-bluefire.png",
      author = "Ijen Expedition Team",
      readTime = "5 min read",
      isFeatured = false,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Article title is required." }, { status: 400 });
    }

    const slug = createSlug(title) + "-" + Date.now().toString(36);
    const date = new Date().toLocaleDateString("en-US", {
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

    try {
      revalidatePath("/");
      revalidatePath("/blog");
      revalidatePath(`/blog/${post.slug}`);
    } catch {}

    return NextResponse.json({ success: true, article: post });
  } catch (error: any) {
    console.error("POST /api/articles error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create article." },
      { status: 500 }
    );
  }
}
