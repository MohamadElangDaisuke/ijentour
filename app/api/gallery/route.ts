import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { defaultStories } from "@/app/lib/stories";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: any = {};
    if (category && category !== "all") {
      where.category = category;
    }

    const items = await prisma.galleryItem.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    if (items.length === 0) {
      return NextResponse.json({ success: true, items: defaultStories, gallery: defaultStories });
    }

    return NextResponse.json({ success: true, items, gallery: items });
  } catch (error: any) {
    console.warn("GET /api/gallery fallback used:", error?.message || error);
    return NextResponse.json({ success: true, items: defaultStories, gallery: defaultStories });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Please login as an administrator." }, { status: 401 });
    }

    const { title, image, caption, category = "crater", isFeatured = true } = await request.json();

    if (!title || !image) {
      return NextResponse.json({ error: "Title and image link are required." }, { status: 400 });
    }

    const item = await prisma.galleryItem.create({
      data: {
        title,
        image,
        caption: caption || title,
        category,
        isFeatured: Boolean(isFeatured),
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/gallery");
    } catch {}

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error("POST /api/gallery error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add gallery photo." },
      { status: 500 }
    );
  }
}
