import { NextResponse } from "next/server";
import { prisma, safeJsonParse } from "@/lib/prisma";
import { defaultPackages, getPackageByIdFromList } from "@/app/lib/packagesStorage";

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
        schedules: true,
        reviews: true,
      },
    });

    if (!pkg) {
      // Fallback check from memory
      const fallback = getPackageByIdFromList(defaultPackages, id);
      if (fallback) {
        return NextResponse.json({ success: true, package: fallback });
      }
      return NextResponse.json({ error: "Paket tidak ditemukan." }, { status: 404 });
    }

    const formatted = {
      ...pkg,
      gallery: safeJsonParse<string[]>(pkg.galleryImages, [pkg.coverImage]),
      highlights: safeJsonParse<string[]>(pkg.highlights, []),
      included: safeJsonParse<string[]>(pkg.includedItems, []),
      excluded: safeJsonParse<string[]>(pkg.excludedItems, []),
      packingList: safeJsonParse<any[]>(pkg.packingList, []),
      faqs: safeJsonParse<any[]>(pkg.faqs, []),
      itinerary: safeJsonParse<any[]>(pkg.itineraries, []),
      image: pkg.coverImage,
    };

    return NextResponse.json({ success: true, package: formatted });
  } catch (error) {
    console.error("GET /api/trips/[id] error:", error);
    return NextResponse.json({ error: "Gagal memuat paket wisata." }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const dataToUpdate: any = {};
    if (body.title !== undefined) dataToUpdate.title = body.title;
    if (body.category !== undefined) dataToUpdate.category = body.category;
    if (body.duration !== undefined) dataToUpdate.duration = body.duration;
    if (body.price !== undefined) dataToUpdate.price = body.price;
    if (body.basePrice !== undefined) dataToUpdate.basePrice = Number(body.basePrice);
    if (body.badge !== undefined) dataToUpdate.badge = body.badge;
    if (body.rating !== undefined) dataToUpdate.rating = Number(body.rating);
    if (body.description !== undefined) dataToUpdate.description = body.description;
    if (body.image !== undefined) dataToUpdate.coverImage = body.image;
    if (body.isFeatured !== undefined) dataToUpdate.isFeatured = Boolean(body.isFeatured);
    if (body.isTrending !== undefined) dataToUpdate.isTrending = Boolean(body.isTrending);
    if (body.isRecent !== undefined) dataToUpdate.isRecent = Boolean(body.isRecent);
    if (body.isActive !== undefined) dataToUpdate.isActive = Boolean(body.isActive);

    if (body.gallery) dataToUpdate.galleryImages = JSON.stringify(body.gallery);
    if (body.highlights) dataToUpdate.highlights = JSON.stringify(body.highlights);
    if (body.itinerary) dataToUpdate.itineraries = JSON.stringify(body.itinerary);
    if (body.included) dataToUpdate.includedItems = JSON.stringify(body.included);
    if (body.excluded) dataToUpdate.excludedItems = JSON.stringify(body.excluded);

    const updated = await prisma.tripPackage.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: "Paket berhasil diperbarui.",
      package: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/trips/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui paket wisata." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.tripPackage.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Paket berhasil dihapus." });
  } catch (error: any) {
    console.error("DELETE /api/trips/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus paket." },
      { status: 500 }
    );
  }
}
