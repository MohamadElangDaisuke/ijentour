import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";
import { defaultDestinations } from "@/app/lib/destinationsStorage";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const destinations = await prisma.destination.findMany({
      orderBy: { sortOrder: "asc" },
    });

    if (destinations.length === 0) {
      return NextResponse.json({ success: true, destinations: defaultDestinations });
    }

    return NextResponse.json({ success: true, destinations });
  } catch (error: any) {
    console.warn("GET /api/destinations fallback used:", error?.message || error);
    return NextResponse.json({ success: true, destinations: defaultDestinations });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Enforce Admin Authentication
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please login as an administrator." }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, image, tag = "Destination", isFeatured = true, sortOrder = 0 } = body;

    if (!name || !description || !image) {
      return NextResponse.json(
        { success: false, error: "Destination name, description, and image are required." },
        { status: 400 }
      );
    }

    const baseSlug = createSlug(name);
    // Ensure slug uniqueness
    const existing = await prisma.destination.findFirst({ where: { slug: baseSlug } });
    const slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

    const destination = await prisma.destination.create({
      data: {
        name: name.trim(),
        slug,
        description: description.trim(),
        image: image.trim(),
        tag: tag?.trim() || "Destination",
        isFeatured: Boolean(isFeatured),
        sortOrder: Number(sortOrder) || 0,
      },
    });

    // Invalidate public page cache
    try {
      revalidatePath("/");
      revalidatePath("/destinations");
      revalidatePath(`/destinations/${slug}`);
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Destination added successfully.",
      destination,
    });
  } catch (error: any) {
    console.error("POST /api/destinations error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add destination." },
      { status: 500 }
    );
  }
}
