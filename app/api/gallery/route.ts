import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { defaultStories } from "@/app/lib/stories";

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
  } catch (error) {
    console.error("GET /api/gallery error:", error);
    return NextResponse.json({ success: true, items: defaultStories, gallery: defaultStories });
  }
}

export async function POST(request: Request) {
  try {
    const { title, image, caption, category = "crater", isFeatured = true } = await request.json();

    if (!title || !image) {
      return NextResponse.json({ error: "Judul dan link gambar wajib diisi." }, { status: 400 });
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

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error("POST /api/gallery error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menambahkan foto galeri." },
      { status: 500 }
    );
  }
}
