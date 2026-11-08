import { NextResponse } from "next/server";
import { prisma, safeJsonParse } from "@/lib/prisma";
import { defaultPackages, getPackageByIdFromList } from "@/app/lib/packagesStorage";
import { requireAdmin, getAdminSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createSlug } from "@/lib/utils";
import { safeDeleteMediaFile } from "@/lib/storage/mediaCleanup";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const pkg = await prisma.tripPackage.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        schedules: {
          orderBy: { departureDate: "asc" },
        },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!pkg) {
      // Fallback check from memory
      const fallback = getPackageByIdFromList(defaultPackages, id);
      if (fallback) {
        return NextResponse.json({ success: true, package: fallback });
      }
      return NextResponse.json({ error: "Package not found." }, { status: 404 });
    }

    // Check if unpublished/draft package is requested by non-admin
    if (!pkg.isActive) {
      const admin = await getAdminSession(request);
      if (!admin) {
        return NextResponse.json(
          { error: "This package is currently unavailable or in draft mode.", isDraft: true },
          { status: 404 }
        );
      }
    }

    const rawGallery = safeJsonParse<any[]>(pkg.galleryImages, [pkg.coverImage]);
    const gallery = Array.isArray(rawGallery)
      ? rawGallery.map((g) => (typeof g === "string" ? g : g?.url || ""))
      : [pkg.coverImage];

    const formatted = {
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

    return NextResponse.json({ success: true, package: formatted });
  } catch (error) {
    console.error("GET /api/trips/[id] error:", error);
    return NextResponse.json({ error: "Failed to load trip package." }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Please login as an administrator." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const existing = await prisma.tripPackage.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: "Package not found." }, { status: 404 });
    }

    const body = await request.json();
    const dataToUpdate: any = {};

    // General Information
    if (body.title !== undefined) dataToUpdate.title = body.title.trim();
    if (body.category !== undefined) dataToUpdate.category = body.category;
    if (body.packageType !== undefined) dataToUpdate.packageType = body.packageType;
    if (body.duration !== undefined) dataToUpdate.duration = body.duration;
    if (body.durationDays !== undefined) dataToUpdate.durationDays = Number(body.durationDays) || 1;
    if (body.durationNights !== undefined) dataToUpdate.durationNights = Number(body.durationNights) || 0;
    if (body.description !== undefined) dataToUpdate.description = body.description;
    if (body.shortDescription !== undefined) dataToUpdate.shortDescription = body.shortDescription;
    if (body.safetyInfo !== undefined) dataToUpdate.safetyInfo = body.safetyInfo;
    if (body.importantNotes !== undefined) dataToUpdate.importantNotes = body.importantNotes;
    if (body.recommendedAge !== undefined) dataToUpdate.recommendedAge = body.recommendedAge;
    if (body.meetingPoint !== undefined) dataToUpdate.meetingPoint = body.meetingPoint;
    if (body.pickupArea !== undefined) dataToUpdate.pickupArea = body.pickupArea;
    if (body.departureTime !== undefined) dataToUpdate.departureTime = body.departureTime;
    if (body.difficulty !== undefined) dataToUpdate.difficulty = body.difficulty;
    if (body.altitude !== undefined) dataToUpdate.altitude = body.altitude;
    if (body.minParticipants !== undefined) dataToUpdate.minParticipants = Number(body.minParticipants) || 1;
    if (body.maxParticipants !== undefined) dataToUpdate.maxParticipants = Number(body.maxParticipants) || 15;

    // Pricing & Availability
    if (body.price !== undefined) dataToUpdate.price = body.price;
    if (body.basePrice !== undefined) dataToUpdate.basePrice = Number(body.basePrice) || 0;
    if (body.currency !== undefined) dataToUpdate.currency = body.currency;
    if (body.pricingUnit !== undefined) dataToUpdate.pricingUnit = body.pricingUnit;
    if (body.discountPrice !== undefined) {
      dataToUpdate.discountPrice = body.discountPrice ? Number(body.discountPrice) : null;
    }
    if (body.groupDiscountPercent !== undefined) {
      dataToUpdate.groupDiscountPercent = Number(body.groupDiscountPercent) || 0;
    }
    if (body.priceNotes !== undefined) dataToUpdate.priceNotes = body.priceNotes;

    // Slug management with uniqueness validation
    if (body.slug !== undefined && body.slug.trim()) {
      let desiredSlug = createSlug(body.slug.trim());
      if (desiredSlug !== existing.slug) {
        const slugConflict = await prisma.tripPackage.findFirst({
          where: {
            slug: desiredSlug,
            id: { not: existing.id },
          },
        });
        if (slugConflict) {
          desiredSlug = `${desiredSlug}-${Date.now().toString(36)}`;
        }
        dataToUpdate.slug = desiredSlug;
      }
    }

    // Media & Visuals
    if (body.image !== undefined) dataToUpdate.coverImage = body.image;
    if (body.coverImage !== undefined) dataToUpdate.coverImage = body.coverImage;
    if (body.gallery !== undefined) dataToUpdate.galleryImages = JSON.stringify(body.gallery);
    if (body.galleryImages !== undefined) dataToUpdate.galleryImages = JSON.stringify(body.galleryImages);

    // Badges, Status & Metrics
    if (body.badge !== undefined) dataToUpdate.badge = body.badge;
    if (body.rating !== undefined) dataToUpdate.rating = Number(body.rating) || 5.0;
    if (body.savedCount !== undefined) dataToUpdate.savedCount = body.savedCount;
    if (body.isFeatured !== undefined) dataToUpdate.isFeatured = Boolean(body.isFeatured);
    if (body.isTrending !== undefined) dataToUpdate.isTrending = Boolean(body.isTrending);
    if (body.isRecent !== undefined) dataToUpdate.isRecent = Boolean(body.isRecent);
    if (body.isActive !== undefined) dataToUpdate.isActive = Boolean(body.isActive);
    if (body.sortOrder !== undefined) dataToUpdate.sortOrder = Number(body.sortOrder) || 0;

    // Structured lists
    if (body.highlights !== undefined) dataToUpdate.highlights = JSON.stringify(body.highlights);
    if (body.itinerary !== undefined) dataToUpdate.itineraries = JSON.stringify(body.itinerary);
    if (body.included !== undefined) dataToUpdate.includedItems = JSON.stringify(body.included);
    if (body.excluded !== undefined) dataToUpdate.excludedItems = JSON.stringify(body.excluded);
    if (body.packingList !== undefined) dataToUpdate.packingList = JSON.stringify(body.packingList);
    if (body.faqs !== undefined) dataToUpdate.faqs = JSON.stringify(body.faqs);
    if (body.addons !== undefined) dataToUpdate.addons = JSON.stringify(body.addons);

    // SEO
    if (body.metaTitle !== undefined) dataToUpdate.metaTitle = body.metaTitle;
    if (body.metaDescription !== undefined) dataToUpdate.metaDescription = body.metaDescription;
    if (body.ogImage !== undefined) dataToUpdate.ogImage = body.ogImage;

    const updated = await prisma.tripPackage.update({
      where: { id: existing.id },
      data: dataToUpdate,
    });

    // Safely cleanup old cover image if replaced and no longer referenced
    if (dataToUpdate.coverImage && dataToUpdate.coverImage !== existing.coverImage) {
      safeDeleteMediaFile(existing.coverImage, { model: "tripPackage", id: existing.id }).catch(() => {});
    }

    try {
      revalidatePath("/");
      revalidatePath("/packages");
      revalidatePath(`/packages/${existing.id}`);
      revalidatePath(`/packages/${existing.slug}`);
      if (updated.slug !== existing.slug) {
        revalidatePath(`/packages/${updated.slug}`);
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Package successfully updated.",
      package: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/trips/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update trip package." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Please login as an administrator." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const existing = await prisma.tripPackage.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Package not found or already deleted." },
        { status: 404 }
      );
    }

    // Safety rule: If bookings reference this package, perform soft delete (archive)
    if (existing._count.bookings > 0) {
      await prisma.tripPackage.update({
        where: { id: existing.id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        softDeleted: true,
        message: `Paket dinonaktifkan (diarsipkan) karena memiliki ${existing._count.bookings} data pemesanan aktif. Histori reservasi tetap aman.`,
      });
    }

    // If no bookings exist, safe to hard delete
    await prisma.tripPackage.delete({ where: { id: existing.id } });

    // Safely cleanup cover image and gallery images if unreferenced elsewhere and not static
    if (existing.coverImage) {
      safeDeleteMediaFile(existing.coverImage, { model: "tripPackage", id: existing.id }).catch(() => {});
    }
    const oldGallery = safeJsonParse<any[]>(existing.galleryImages, []);
    if (Array.isArray(oldGallery)) {
      for (const item of oldGallery) {
        const url = typeof item === "string" ? item : item?.url;
        if (url) {
          safeDeleteMediaFile(url, { model: "tripPackage", id: existing.id }).catch(() => {});
        }
      }
    }

    try {
      revalidatePath("/");
      revalidatePath("/packages");
      revalidatePath(`/packages/${existing.slug}`);
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Package successfully deleted.",
    });
  } catch (error: any) {
    console.error("DELETE /api/trips/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete package." },
      { status: 500 }
    );
  }
}
