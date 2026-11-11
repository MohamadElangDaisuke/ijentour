import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const superAdmin = await requireSuperAdmin(request);
    if (!superAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Akses ditolak. Pengaturan keamanan hanya dapat diakses oleh Super Admin.",
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
        sessionDuration: "7 Hari (604,800 detik)",
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
        storagePersistence: "Distributed Persistent (Lolos Lintas Serverless Instance)",
        hashingAlgorithm: "Bcrypt (Hash stored, plain code sent directly to user email)",
        bindingTypes: ["ADMIN_VERIFY", "REVIEW_VERIFY", "PASSWORD_RESET"],
      },
      rateLimiting: {
        architecture: "Defense-in-Depth Hybrid (Database Persistent + Memory Sliding Window)",
        limits: [
          {
            name: "Admin Login Attempts",
            limit: "10 percobaan per 15 menit per IP",
            storage: "In-Memory Sliding Window (Container)",
            actionOnLimit: "HTTP 429 Too Many Requests",
          },
          {
            name: "OTP Verification Brute-Force",
            limit: "Maksimal 5 kali percobaan kode salah",
            storage: "PostgreSQL Database (Global Persistent)",
            actionOnLimit: "Kode OTP dihanguskan (verified=true, wajib minta baru)",
          },
          {
            name: "OTP Resend Cooldown",
            limit: "1 permintaan per 60 detik per email",
            storage: "PostgreSQL Database (Global Persistent)",
            actionOnLimit: "HTTP 400 Cooldown Error",
          },
          {
            name: "Customer Review Submission",
            limit: "5 ulasan per 15 menit per IP",
            storage: "In-Memory Sliding Window (Container)",
            actionOnLimit: "HTTP 429 Too Many Requests",
          },
          {
            name: "Booking Reservations",
            limit: "15 reservasi per 10 menit per IP",
            storage: "In-Memory Sliding Window (Container)",
            actionOnLimit: "HTTP 429 Too Many Requests",
          },
          {
            name: "Contact Inquiries",
            limit: "10 pesan per 10 menit per IP",
            storage: "In-Memory Sliding Window (Container)",
            actionOnLimit: "HTTP 429 Too Many Requests",
          },
        ],
        serverlessNote:
          "Batas percobaan brute-force OTP dan cooldown resend tersimpan permanen di PostgreSQL Supabase sehingga 100% aman lintas kontainer serverless Vercel. Rate limiter IP berbasis in-memory bertindak sebagai filter lapis pertama untuk mencegah banjir lalu lintas berlebihan.",
      },
      dataProtection: {
        customerEmailPrivacy: "Redaksi otomatis pada endpoint ulasan publik (Data Minimization)",
        reviewCustomerBadge: "Hanya aktif untuk reservasi berstatus CONFIRMED atau COMPLETED",
        auditTrail: "Pencatatan otomatis seluruh aksi mutasi administrator di database ('audit_logs')",
        roleHierarchy: "SUPER_ADMIN (Penuh) vs ADMIN (Operasional Tanpa Kelola Akun/Sistem)",
      },
    };

    return NextResponse.json({
      success: true,
      config: securityConfig,
    });
  } catch (error: any) {
    console.error("GET /api/admin/security error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat konfigurasi keamanan." },
      { status: 500 }
    );
  }
}

