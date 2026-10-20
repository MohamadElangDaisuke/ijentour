import { NextResponse } from "next/server";
import { prisma, safeJsonParse } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";
import { defaultPackages } from "@/app/lib/packagesStorage";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const where: any = { isActive: true };
    if (category && category !== "all") {
      where.category = category;
    }
    if (featured === "true") {
      where.isFeatured = true;
    }

    const dbPackages = await prisma.tripPackage.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      include: {
        schedules: true,
        reviews: true,
      },
    });

    if (dbPackages.length === 0) {
      // Graceful fallback to default packages
      return NextResponse.json({
        success: true,
        source: "fallback",
        packages: defaultPackages,
      });
    }

    // Format & parse JSON strings into typed objects for frontend
    const formatted = dbPackages.map((pkg) => ({
      ...pkg,
      gallery: safeJsonParse<string[]>(pkg.galleryImages, [pkg.coverImage]),
      highlights: safeJsonParse<string[]>(pkg.highlights, []),
      included: safeJsonParse<string[]>(pkg.includedItems, []),
      excluded: safeJsonParse<string[]>(pkg.excludedItems, []),
      packingList: safeJsonParse<any[]>(pkg.packingList, []),
      faqs: safeJsonParse<any[]>(pkg.faqs, []),
      itinerary: safeJsonParse<any[]>(pkg.itineraries, []),
      image: pkg.coverImage,
    }));

    return NextResponse.json({
      success: true,
      source: "database",
      packages: formatted,
    });
  } catch {
    // Fallback so frontend never crashes
    return NextResponse.json({
      success: true,
      source: "fallback-error",
      packages: defaultPackages,
    });
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
      category = "regular",
      duration = "1 Hari",
      price = "Rp 750.000",
      basePrice = 750000,
      rating = 5.0,
      badge = "Paket Pilihan",
      image = "/images/pkg-bluefire.png",
      description = "",
      highlights = [],
      itinerary = [],
      included = [],
      excluded = [],
      packingList = [],
      faqs = [],
      isFeatured = true,
      isTrending = true,
      isRecent = true,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Trip package title is required." }, { status: 400 });
    }

    const slug = createSlug(title) + "-" + Date.now().toString(36);

    const newPackage = await prisma.tripPackage.create({
      data: {
        title,
        slug,
        category,
        duration,
        price,
        basePrice: Number(basePrice) || 750000,
        rating: Number(rating) || 5.0,
        badge,
        meetingPoint: body.meetingPoint || "Banyuwangi",
        difficulty: body.difficulty || "Sedang (Trekking 3 Km)",
        altitude: body.altitude || "2.769 mdpl",
        shortDescription: body.shortDescription || description.slice(0, 140),
        coverImage: image || "/images/pkg-bluefire.png",
        description,
        galleryImages: JSON.stringify(body.gallery || [image]),
        highlights: JSON.stringify(highlights),
        itineraries: JSON.stringify(itinerary),
        includedItems: JSON.stringify(included),
        excludedItems: JSON.stringify(excluded),
        packingList: JSON.stringify(packingList),
        faqs: JSON.stringify(faqs),
        isFeatured: Boolean(isFeatured),
        isTrending: Boolean(isTrending),
        isRecent: Boolean(isRecent),
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      },
    });

    // Notify admin in database
    await prisma.notification.create({
      data: {
        type: "system",
        title: "Paket Wisata Baru Dibuat",
        description: `Package '${newPackage.title}' successfully added to database.`,
        link: `/packages/${newPackage.id}`,
        unread: true,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/packages");
      revalidatePath(`/packages/${newPackage.id}`);
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Package successfully created.",
      package: newPackage,
    });
  } catch (error: any) {
    console.error("POST /api/trips error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create new trip package." },
      { status: 500 }
    );
  }
}
