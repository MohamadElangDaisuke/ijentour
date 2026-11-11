import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEmailOtp } from "@/lib/otp";
import { createInternalNotification } from "@/lib/notifications";
import { sendReviewEmailNotification } from "@/lib/email/notifications";
import { otpRateLimiter, getClientIp } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    if (otpRateLimiter.isLimited(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many verification attempts. Please wait a few moments before trying again.",
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const { reviewId, email, code } = body;

    if (!reviewId || !email || !code) {
      return NextResponse.json(
        { success: false, error: "Review ID, email, and 6-digit OTP code are required." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanCode = String(code).trim();
    const cleanReviewId = String(reviewId).trim();

    // 1. Fetch target review from database
    const review = await prisma.review.findUnique({
      where: { id: cleanReviewId },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review record not found." },
        { status: 404 }
      );
    }

    if (review.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "This review has already been verified and is in the moderation queue.",
      });
    }

    // Verify email binding against the review authorEmail
    if (review.authorEmail && review.authorEmail.toLowerCase() !== cleanEmail) {
      return NextResponse.json(
        { success: false, error: "Email address does not match the review author." },
        { status: 403 }
      );
    }

    // 2. Validate OTP code bound to REVIEW_VERIFY and this exact reviewId
    const verifyRes = await verifyEmailOtp(cleanEmail, cleanCode, "REVIEW_VERIFY", cleanReviewId);

    if (!verifyRes.success) {
      return NextResponse.json(
        { success: false, error: verifyRes.error },
        { status: 400 }
      );
    }

    // 3. Mark review as email-verified
    const updatedReview = await prisma.review.update({
      where: { id: cleanReviewId },
      data: { emailVerified: true },
    });

    // 4. Create internal notification for administrators
    await createInternalNotification({
      type: "review",
      title: "New Verified Review Awaiting Moderation",
      description: `${updatedReview.authorName} (${updatedReview.rating}★) verified email for review. Status: Awaiting admin approval.`,
      link: "/admin/reviews",
      referenceId: updatedReview.id,
    });

    // 5. Send email notification to Super Admin and eligible Admins (Non-blocking)
    sendReviewEmailNotification({
      id: updatedReview.id,
      authorName: updatedReview.authorName,
      authorEmail: updatedReview.authorEmail,
      rating: updatedReview.rating,
      comment: updatedReview.comment,
      isVerifiedCustomer: Boolean(updatedReview.isVerifiedCustomer),
    }).catch((err) =>
      console.error("[Reviews] Failed to dispatch review email notification:", err)
    );

    return NextResponse.json({
      success: true,
      message:
        "Thank you! Your email has been verified successfully. Your review is now in the moderation queue and will be published once approved by an administrator.",
      review: {
        id: updatedReview.id,
        authorName: updatedReview.authorName,
        emailVerified: updatedReview.emailVerified,
        isApproved: updatedReview.isApproved,
        isVerifiedCustomer: updatedReview.isVerifiedCustomer,
      },
    });
  } catch (error: any) {
    console.error("POST /api/reviews/verify error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process review verification." },
      { status: 500 }
    );
  }
}

