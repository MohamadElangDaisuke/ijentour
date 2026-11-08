import { NextResponse } from "next/server";
import { prisma, safeJsonParse } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";
import { defaultPackages } from "@/app/lib/packagesStorage";
import { requireAdmin, getAdminSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const includeInactive = searchParams.get("includeInactive") === "true";

    // Build filter
    const where: any = {};

    // Check if admin is requesting to view drafts or inactive packages
    if (!includeInactive) {
      where.isActive = true;
    } else {
      // If requesting inactive, verify admin session
      const admin = await getAdminSession(request);
      if (!admin) {
        where.isActive = true;
      }
    }

    if (category && category !== "all") {
      where.category = category;
    }
    if (featured === "true") {
      where.isFeatured = true;
    }

    const dbPackages = await prisma.tripPackage.findMany({
      where,
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        schedules: true,
        reviews: {
          where: { isApproved: true },
          take: 5,
        },
      },
    });

    if (dbPackages.length === 0) {
      // If admin requested inactive or specific filter and nothing found, return empty list
      if (includeInactive || category || featured) {
        return NextResponse.json({
          success: true,
          source: "database",
          packages: [],
        });
      }

      // For public listing, only fallback if DB is truly empty
      return NextResponse.json({
        success: true,
        source: "fallback",
        packages: defaultPackages,
      });
    }

    // Format & parse all JSON strings into typed objects
    const formatted = dbPackages.map((pkg) => {
      const rawGallery = safeJsonParse<any[]>(pkg.galleryImages, [pkg.coverImage]);
      // Standardize gallery to string array or object array with url
      const gallery = Array.isArray(rawGallery)
        ? rawGallery.map((g) => (typeof g === "string" ? g : g?.url || ""))
        : [pkg.coverImage];

      return {
        ...pkg,
        image: pkg.coverImage,
        gallery,
        galleryImages: rawGallery,
        highlights: safeJsonParse<string[]>(pkg.highlights, []),
        included: safeJsonParse<any[]>(pkg.includedItems, []),
        excluded: safeJsonParse<any[]>(pkg.excludedItems, []),
        packingList: safeJsonParse<any[]>(pkg.packingList, []),
        faqs: safeJsonParse<any[]>(pkg.faqs, []),
        itinerary: safeJsonParse<any[]>(pkg.itineraries, []),
        addons: safeJsonParse<any[]>(pkg.addons, []),
      };
    });

    return NextResponse.json({
      success: true,
      source: "database",
      packages: formatted,
    });
  } catch (error: any) {
    console.error("GET /api/trips error:", error);
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
      return NextResponse.json(
        { error: "Unauthorized. Please login as an administrator." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      slug: customSlug,
      category = "regular",
      packageType = "Open Trip",
      duration = "1 Hari",
      durationDays = 1,
      durationNights = 0,
      price = "Rp 750.000",
      basePrice = 750000,
      currency = "IDR",
      pricingUnit = "per orang",
      discountPrice,
      groupDiscountPercent = 10,
      minParticipants = 1,
      maxParticipants = 15,
      difficulty = "Sedang (Trekking 3 Km)",
      altitude = "2.769 mdpl",
      meetingPoint = "Banyuwangi",
      pickupArea = "Banyuwangi City Area & Surrounds",
      departureTime = "00:00 WIB",
      recommendedAge = "7 - 65 Tahun",
      badge = "Best Seller",
      rating = 5.0,
      savedCount = "1.500K",
      image = "/images/pkg-bluefire.png",
      coverImage,
      gallery = [],
      description = "",
      shortDescription = "",
      safetyInfo = "",
      importantNotes = "",
      priceNotes = "",
      metaTitle = "",
      metaDescription = "",
      ogImage = "",
      highlights = [],
      itinerary = [],
      included = [],
      excluded = [],
      packingList = [],
      faqs = [],
      addons = [],
      isFeatured = true,
      isTrending = true,
      isRecent = true,
      isActive = true,
      sortOrder = 0,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Package title is required." },
        { status: 400 }
      );
    }

    // Determine unique slug
    let finalSlug = (customSlug || createSlug(title)).trim().toLowerCase();
    if (!finalSlug) {
      finalSlug = createSlug(title);
    }

    // Check if slug already exists
    const existingSlug = await prisma.tripPackage.findUnique({
      where: { slug: finalSlug },
    });
    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
    }

    const effectiveCover = coverImage || image || "/images/pkg-bluefire.png";
    const galleryPayload = Array.isArray(gallery) && gallery.length > 0
      ? gallery
      : [effectiveCover];

    const newPackage = await prisma.tripPackage.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        category,
        packageType,
        duration,
        durationDays: Number(durationDays) || 1,
        durationNights: Number(durationNights) || 0,
        price,
        basePrice: Number(basePrice) || 750000,
        currency,
        pricingUnit,
        discountPrice: discountPrice ? Number(discountPrice) : null,
        groupDiscountPercent: Number(groupDiscountPercent) || 0,
        minParticipants: Number(minParticipants) || 1,
        maxParticipants: Number(maxParticipants) || 15,
        difficulty,
        altitude,
        meetingPoint,
        pickupArea,
        departureTime,
        recommendedAge,
        badge,
        rating: Number(rating) || 5.0,
        savedCount: savedCount || "1.5K+",
        coverImage: effectiveCover,
        galleryImages: JSON.stringify(galleryPayload),
        description,
        shortDescription: shortDescription || description.slice(0, 150),
        safetyInfo,
        importantNotes,
        priceNotes,
        metaTitle: metaTitle || `${title} | Ijen Tour Banyuwangi`,
        metaDescription: metaDescription || shortDescription || description.slice(0, 160),
        ogImage: ogImage || effectiveCover,
        highlights: JSON.stringify(highlights),
        includedItems: JSON.stringify(included),
        excludedItems: JSON.stringify(excluded),
        packingList: JSON.stringify(packingList),
        faqs: JSON.stringify(faqs),
        itineraries: JSON.stringify(itinerary),
        addons: JSON.stringify(addons),
        isFeatured: Boolean(isFeatured),
        isTrending: Boolean(isTrending),
        isRecent: Boolean(isRecent),
        isActive: Boolean(isActive),
        sortOrder: Number(sortOrder) || 0,
      },
    });

    // Notify admin in database
    await prisma.notification.create({
      data: {
        type: "system",
        title: "Paket Wisata Baru Dibuat",
        description: `Paket '${newPackage.title}' (${newPackage.slug}) berhasil ditambahkan ke database.`,
        link: `/packages/${newPackage.slug}`,
        unread: true,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/packages");
      revalidatePath(`/packages/${newPackage.id}`);
      revalidatePath(`/packages/${newPackage.slug}`);
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
