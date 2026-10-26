import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const defaultReviews = [
  {
    id: "rev-1",
    authorName: "Sarah Jenkins",
    rating: 5,
    comment:
      "Pengalaman paling magis seumur hidup! Melihat api biru Kawah Ijen secara langsung bersama guide lokal Pak Slamet yang sangat ramah dan profesional. Masker respirator sangat nyaman dan safety terjamin.",
    photoUrls: '["/images/the-best-view-of-kawah.webp"]',
    isApproved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rev-2",
    authorName: "Rizky Pratama",
    rating: 5,
    comment:
      "Private tour Ijen & Baluran bersama keluarga sangat berkesan. Driver on time, mobil bersih ber-AC, dan spot foto yang ditunjukkan guide luar biasa bagus!",
    photoUrls: '["/images/pkg-crater.png"]',
    isApproved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rev-3",
    authorName: "David Müller",
    rating: 5,
    comment:
      "Incredible midnight trekking! The sunrise over the turquoise acid lake took my breath away. Best organized tour in East Java. Highly recommend Ijen Tour!",
    photoUrls: '["/images/pkg-bluefire.png"]',
    isApproved: true,
    createdAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("all") === "true";

    let where: any = { isApproved: true };

    if (showAll) {
      // Check admin session before showing unapproved reviews
      const admin = await getAdminSession(request);
      if (admin) {
        where = {}; // Admin can see all reviews
      }
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        tripPackage: {
          select: { id: true, title: true },
        },
      },
    });

    if (reviews.length === 0 && !showAll) {
      return NextResponse.json({
        success: true,
        source: "default",
        reviews: defaultReviews,
      });
    }

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.warn("GET /api/reviews fallback used:", error?.message || error);
    return NextResponse.json({
      success: true,
      source: "fallback",
      reviews: defaultReviews,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminSession(request);
    const body = await request.json();
    const {
      authorName,
      rating = 5,
      comment,
      photoUrls = [],
      tripPackageId,
    } = body;

    if (!authorName || !comment) {
      return NextResponse.json(
        { success: false, error: "Nama dan komentar ulasan wajib diisi." },
        { status: 400 }
      );
    }

    const photos = Array.isArray(photoUrls) ? photoUrls : [photoUrls].filter(Boolean);

    const review = await prisma.review.create({
      data: {
        authorName: String(authorName).trim(),
        rating: Math.max(1, Math.min(5, Number(rating) || 5)),
        comment: String(comment).trim(),
        photoUrls: JSON.stringify(photos),
        isApproved: Boolean(admin), // Auto-approve if created by admin
        tripPackageId: tripPackageId || null,
      },
    });

    // Notify admin if review submitted by customer
    if (!admin) {
      await prisma.notification.create({
        data: {
          type: "system",
          title: "Ulasan Baru Masuk",
          description: `${authorName} memberikan ulasan bintang ${rating}: "${comment.slice(0, 60)}..."`,
          link: "/admin/reviews",
          unread: true,
        },
      });
    }

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Ulasan berhasil dikirim.",
      review,
    });
  } catch (error: any) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengirimkan ulasan." },
      { status: 500 }
    );
  }
}
