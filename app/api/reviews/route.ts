import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { reviewRateLimiter, getClientIp } from "@/lib/rateLimit";
import { createEmailOtp } from "@/lib/otp";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("all") === "true";

    let where: any = {
      isApproved: true,
      OR: [
        { emailVerified: true },
        { userId: { not: null } },
        { authorEmail: null }, // Legacy reviews approved prior to Phase 3
      ],
    };

    const admin = await getAdminSession(request);
    if (showAll && admin) {
      where = {}; // Admin can inspect all reviews
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

    // Data minimization: redact authorEmail for public anonymous viewers
    const sanitizedReviews = admin
      ? reviews
      : reviews.map((r) => {
          const { authorEmail, ...publicFields } = r;
          return publicFields;
        });

    // Clean, proper empty state when no verified reviews exist (no fabricated fallbacks)
    return NextResponse.json({
      success: true,
      reviews: sanitizedReviews || [],
    });
  } catch (error: any) {
    console.error("GET /api/reviews error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: "Failed to load reviews.", reviews: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminSession(request);

    // Rate-limit public guest reviews
    if (!admin) {
      const clientIp = getClientIp(request);
      if (reviewRateLimiter.isLimited(clientIp)) {
        return NextResponse.json(
          {
            success: false,
            error: "Too many review attempts. Please wait a few minutes before submitting again.",
          },
          { status: 429 }
        );
      }
    }

    const body = await request.json();
    const {
      authorName,
      authorEmail,
      rating = 5,
      comment,
      photoUrls = [],
      tripPackageId,
      phone,
    } = body;

    if (!authorName || !comment) {
      return NextResponse.json(
        { success: false, error: "Customer name and review comment are required." },
        { status: 400 }
      );
    }

    // Public guest reviewers MUST provide their email address for OTP verification
    const cleanEmail = authorEmail ? String(authorEmail).trim().toLowerCase() : "";
    if (!admin && (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required for review verification." },
        { status: 400 }
      );
    }

    const cleanPhone = phone ? String(phone).replace(/\D/g, "") : null;
    let isVerifiedCustomer = false;

    // Verify whether this customer has an actual registered booking with this email or phone
    if (cleanEmail || cleanPhone) {
      try {
        const matchingBooking = await prisma.booking.findFirst({
          where: {
            OR: [
              ...(cleanEmail ? [{ customerEmail: { equals: cleanEmail, mode: "insensitive" as const } }] : []),
              ...(cleanPhone
                ? [{ customerPhone: { contains: cleanPhone } }, { whatsappNumber: { contains: cleanPhone } }]
                : []),
            ],
            // Strictly require CONFIRMED or COMPLETED status (PENDING reservations do not qualify)
            status: { in: ["CONFIRMED", "COMPLETED"] },
          },
          select: { id: true },
        });

        if (matchingBooking) {
          isVerifiedCustomer = true;
        }
      } catch (err) {
        console.warn("[Reviews] Non-fatal: error checking customer booking match:", err);
      }
    }

    const photos = Array.isArray(photoUrls) ? photoUrls : [photoUrls].filter(Boolean);

    // If submitted by an admin, auto-verify and approve
    const isApproved = Boolean(admin);
    const emailVerified = Boolean(admin);

    const review = await prisma.review.create({
      data: {
        authorName: String(authorName).trim(),
        authorEmail: cleanEmail || null,
        rating: Math.max(1, Math.min(5, Number(rating) || 5)),
        comment: String(comment).trim(),
        photoUrls: JSON.stringify(photos),
        isApproved,
        emailVerified,
        isVerifiedCustomer,
        tripPackageId: tripPackageId || null,
        userId: admin ? admin.id : null,
      },
    });

    // If guest review, issue a 6-digit OTP verification code bound to this review ID
    if (!admin && cleanEmail) {
      const otpRes = await createEmailOtp(cleanEmail, "REVIEW_VERIFY", {
        targetId: review.id,
        recipientName: String(authorName).trim(),
        sendEmailDelivery: true,
      });

      return NextResponse.json({
        success: true,
        message: "Your review has been submitted! Please check your email for a 6-digit verification code.",
        reviewId: review.id,
        email: cleanEmail,
        requiresVerification: true,
        expiresAt: otpRes.expiresAt,
        ...(Boolean(process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY) && {
          devCode: otpRes.code,
        }),
      });
    }

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Review successfully created.",
      review,
    });
  } catch (error: any) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit review." },
      { status: 500 }
    );
  }
}
