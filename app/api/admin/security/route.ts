import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const superAdmin = await requireSuperAdmin(request);
    if (!superAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. Security settings can only be accessed by a Super Admin.",
        },
        { status: 403 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET?.trim() || "";
    const hasSufficientJwtSecret = jwtSecret.length >= 32;

    const resendKey = process.env.RESEND_API_KEY?.trim() || "";
    const hasResend = Boolean(resendKey && resendKey.startsWith("re_"));

    const isProduction = process.env.NODE_ENV === "production";

    const securityConfig = {
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        isProduction,
        serverlessPlatform: "Vercel Serverless / Node.js Runtime",
      },
      authentication: {
        algorithm: "HS256 (HMAC with SHA-256 via jose)",
        sessionDuration: "7 Days (604,800 seconds)",
        tokenType: "HttpOnly Cookie ('admin_token')",
        cookieFlags: {
          httpOnly: true,
          secure: isProduction,
          sameSite: "Lax",
          path: "/",
        },
        passwordHashing: {
          algorithm: "Bcrypt",
          saltRounds: 10,
          costFactor: "2^10 iterations",
        },
        secretStatus: {
          isConfigured: Boolean(jwtSecret),
          hasMinLength: hasSufficientJwtSecret,
          minLengthRequired: 32,
          currentLength: jwtSecret.length,
          status: hasSufficientJwtSecret ? "SECURE" : "WARNING_TOO_SHORT",
        },
      },
      otpSystem: {
        format: "6-Digit Numeric Cryptographic Code",
        ttlMinutes: 10,
        resendCooldownSeconds: 60,
        maxAttemptsPerOtp: 5,
        storage: "PostgreSQL Database ('email_verification_otps')",
        storagePersistence: "Distributed Persistent (Persists Across Serverless Instances)",
        hashingAlgorithm: "Bcrypt (Hash stored, plain code sent directly to user email)",
        bindingTypes: ["ADMIN_VERIFY", "REVIEW_VERIFY", "PASSWORD_RESET"],
      },
      rateLimiting: {
        architecture: "Defense-in-Depth Hybrid (Database Persistent + Memory Sliding Window)",
        limits: [
          {
            name: "Admin Login Attempts",
            limit: "10 attempts per 15 minutes per IP",
            storage: "In-Memory Sliding Window (Container)",
            actionOnLimit: "HTTP 429 Too Many Requests",
          },
          {
            name: "OTP Verification Brute-Force",
            limit: "Maximum 5 failed code attempts",
            storage: "PostgreSQL Database (Global Persistent)",
            actionOnLimit: "OTP code invalidated (verified=true, new request required)",
          },
          {
            name: "OTP Resend Cooldown",
            limit: "1 request per 60 seconds per email",
            storage: "PostgreSQL Database (Global Persistent)",
            actionOnLimit: "HTTP 400 Cooldown Error",
          },
          {
            name: "Customer Review Submission",
            limit: "5 reviews per 15 minutes per IP",
            storage: "In-Memory Sliding Window (Container)",
            actionOnLimit: "HTTP 429 Too Many Requests",
          },
          {
            name: "Booking Reservations",
            limit: "15 reservations per 10 minutes per IP",
            storage: "In-Memory Sliding Window (Container)",
            actionOnLimit: "HTTP 429 Too Many Requests",
          },
          {
            name: "Contact Inquiries",
            limit: "10 messages per 10 minutes per IP",
            storage: "In-Memory Sliding Window (Container)",
            actionOnLimit: "HTTP 429 Too Many Requests",
          },
        ],
        serverlessNote:
          "OTP brute-force attempt limits and resend cooldowns are stored permanently in Supabase PostgreSQL so they remain 100% secure across Vercel serverless containers. The in-memory IP rate limiter acts as a first-layer filter to prevent excessive traffic floods.",
      },
      dataProtection: {
        customerEmailPrivacy: "Automatic redaction on public review endpoints (Data Minimization)",
        reviewCustomerBadge: "Only active for reservations with CONFIRMED or COMPLETED status",
        auditTrail: "Automatic logging of all administrator mutation actions in database ('audit_logs')",
        roleHierarchy: "SUPER_ADMIN (Full Access) vs ADMIN (Operational Without Account/System Management)",
      },
    };

    return NextResponse.json({
      success: true,
      config: securityConfig,
    });
  } catch (error: any) {
    console.error("GET /api/admin/security error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load security configuration." },
      { status: 500 }
    );
  }
}

