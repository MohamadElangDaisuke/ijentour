import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

// In-memory sliding window rate limiter (10 requests / minute / IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_VERIFY_REQUESTS = 10;

function isVerifyRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Periodically cleanup expired entries
  if (rateLimitMap.size > 2000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetTime) rateLimitMap.delete(key);
    }
  }

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_VERIFY_REQUESTS) {
    return true;
  }

  entry.count += 1;
  return false;
}

const verifyRequestSchema = z.object({
  bookingCode: z.string().trim().min(3, "Booking code is required").max(60),
  identifier: z.string().trim().min(3, "Email or WhatsApp number is required").max(100),
});

/**
 * Mask customer name for privacy (e.g., "Mohamad Elang" -> "Mohamad E****")
 */
function maskCustomerName(fullName?: string | null): string {
  if (!fullName) return "Valued Traveler";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    const single = parts[0];
    if (single.length <= 2) return single + "***";
    return single.slice(0, 2) + "*".repeat(Math.min(5, single.length - 2));
  }
  return parts[0] + " " + parts.slice(1).map((p) => p.charAt(0) + "*".repeat(Math.max(3, p.length - 1))).join(" ");
}

/**
 * Mask phone number for privacy (e.g., "081234567890" -> "0812••••7890")
 */
function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return "Protected";
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length < 7) return "••••" + digits.slice(-3);
  const prefix = digits.slice(0, 4);
  const suffix = digits.slice(-4);
  return `${prefix} •••• ${suffix}`;
}

/**
 * Sanitize customDetails into a safe public DTO, stripping internal notes,
 * prices, raw IDs, or PII.
 */
function sanitizeCustomDetails(rawDetails: any): any {
  if (!rawDetails) return null;
  let parsed: any = rawDetails;
  if (typeof rawDetails === "string") {
    try {
      parsed = JSON.parse(rawDetails);
    } catch {
      return null;
    }
  }

  if (typeof parsed !== "object" || parsed === null) return null;

  return {
    destinations: Array.isArray(parsed.destinations)
      ? parsed.destinations.map((d: any) => ({ name: String(d.name || d.title || "Scenic Spot") }))
      : [],
    durationName: parsed.durationName ? String(parsed.durationName) : null,
    transportName: parsed.transportName ? String(parsed.transportName) : null,
    guideName: parsed.guideName ? String(parsed.guideName) : null,
    addonsList: Array.isArray(parsed.addonsList)
      ? parsed.addonsList.map((a: any) => ({ name: String(a.name || "Add-on") }))
      : [],
  };
}

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Check
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "public-verifier";

    if (isVerifyRateLimited(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many verification attempts. Please wait 1 minute before trying again.",
        },
        { status: 429 }
      );
    }

    // 2. Parse & Validate Body
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const parseResult = verifyRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || "Invalid input parameters.",
        },
        { status: 400 }
      );
    }

    const { bookingCode, identifier } = parseResult.data;

    // 3. Query Booking by Code
    const booking = await prisma.booking.findFirst({
      where: {
        bookingCode: {
          equals: bookingCode.trim(),
          mode: "insensitive",
        },
      },
    });

    // Generic error response to prevent user enumeration
    const GENERIC_ERROR_MESSAGE = "Reservation not found or verification details did not match.";

    if (!booking) {
      return NextResponse.json(
        { success: false, error: GENERIC_ERROR_MESSAGE },
        { status: 404 }
      );
    }

    // 4. Verify Identity (Email or Phone/WhatsApp matching)
    const normalizedInput = identifier.trim().toLowerCase();
    const inputDigitsOnly = identifier.replace(/[^0-9]/g, "");

    const dbEmail = (booking.customerEmail || "").trim().toLowerCase();
    const dbPhoneDigits = (booking.customerPhone || "").replace(/[^0-9]/g, "");
    const dbWhatsAppDigits = (booking.whatsappNumber || "").replace(/[^0-9]/g, "");

    let isIdentityMatched = false;

    // Check email match if input looks like an email
    if (normalizedInput.includes("@")) {
      if (dbEmail && dbEmail === normalizedInput) {
        isIdentityMatched = true;
      }
    }

    // Check phone/whatsapp match
    if (!isIdentityMatched && inputDigitsOnly.length >= 6) {
      if (
        (dbPhoneDigits && dbPhoneDigits.endsWith(inputDigitsOnly)) ||
        (inputDigitsOnly && dbPhoneDigits.endsWith(inputDigitsOnly)) ||
        (dbWhatsAppDigits && dbWhatsAppDigits.endsWith(inputDigitsOnly)) ||
        (inputDigitsOnly && dbWhatsAppDigits.endsWith(inputDigitsOnly))
      ) {
        isIdentityMatched = true;
      }
    }

    if (!isIdentityMatched) {
      return NextResponse.json(
        { success: false, error: GENERIC_ERROR_MESSAGE },
        { status: 404 }
      );
    }

    // 5. Construct Strictly Sanitized Public DTO
    const publicBookingDTO = {
      bookingCode: booking.bookingCode,
      packageName: booking.packageName,
      bookingType: booking.bookingType,
      departureDate: booking.departureDate,
      numParticipants: booking.numParticipants,
      pickupLocation: booking.pickupLocation || "Banyuwangi Area",
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      totalPrice: booking.bookingType === "CUSTOM" ? 0 : booking.totalPrice,
      finalPrice: booking.finalPrice,
      customerName: maskCustomerName(booking.customerName),
      whatsappNumber: maskPhoneNumber(booking.whatsappNumber),
      customDetails: sanitizeCustomDetails(booking.customDetails),
      // adminNotes IS NEVER RETURNED
      // full customerEmail IS NEVER RETURNED
      // full phone numbers ARE NEVER RETURNED
      // internal userId IS NEVER RETURNED
    };

    return NextResponse.json({
      success: true,
      booking: publicBookingDTO,
    });
  } catch (error: any) {
    console.error("POST /api/bookings/verify error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred while verifying reservation." },
      { status: 500 }
    );
  }
}

