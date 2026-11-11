import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "@/lib/email/resend";
import { createOtpEmail } from "@/lib/email/templates";

export type OtpPurpose = "ADMIN_VERIFY" | "REVIEW_VERIFY" | "PASSWORD_RESET";

export interface CreateOtpOptions {
  targetId?: string;
  recipientName?: string;
  sendEmailDelivery?: boolean;
}

export interface GenerateOtpResult {
  success: boolean;
  code?: string;
  expiresAt?: Date;
  cooldownSeconds?: number;
  error?: string;
  emailDeliveryStatus?: {
    sent: boolean;
    mocked?: boolean;
    error?: string;
  };
}

export interface VerifyOtpResult {
  success: boolean;
  error?: string;
}

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds cooldown
const MAX_ATTEMPTS = 5;

/**
 * Generate a cryptographically secure 6-digit numeric OTP,
 * invalidate previous OTPs for this email+type (+targetId), and record hashed OTP in database.
 * Dispatches verification email via Resend without exposing secret codes.
 */
export async function createEmailOtp(
  email: string,
  type: OtpPurpose = "ADMIN_VERIFY",
  options: CreateOtpOptions = {}
): Promise<GenerateOtpResult> {
  const cleanEmail = email.trim().toLowerCase();
  const { targetId, recipientName = "User", sendEmailDelivery = true } = options;

  try {
    // 1. Check cooldown: Has an active OTP been issued within the last 60 seconds?
    const cooldownWhere: any = {
      email: cleanEmail,
      type,
      verified: false,
    };
    if (targetId) {
      cooldownWhere.targetId = targetId;
    }

    const recentOtp = await (prisma as any).emailVerificationOtp.findFirst({
      where: cooldownWhere,
      orderBy: { createdAt: "desc" },
    });

    if (recentOtp) {
      const elapsed = Date.now() - new Date(recentOtp.createdAt).getTime();
      if (elapsed < OTP_RESEND_COOLDOWN_MS) {
        const remaining = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
        return {
          success: false,
          error: `Please wait ${remaining} seconds before requesting a new verification code.`,
          cooldownSeconds: remaining,
        };
      }
    }

    // 2. Invalidate previous unverified OTPs for this exact binding
    const invalidateWhere: any = {
      email: cleanEmail,
      type,
      verified: false,
    };
    if (targetId) {
      invalidateWhere.targetId = targetId;
    }

    await (prisma as any).emailVerificationOtp.updateMany({
      where: invalidateWhere,
      data: {
        verified: true, // mark as invalidated/superseded
      },
    });

    // 3. Generate secure random 6-digit code
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(rawOtp, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    // 4. Save hashed OTP to database
    const createData: any = {
      email: cleanEmail,
      otpHash,
      type,
      expiresAt,
      attempts: 0,
      verified: false,
    };
    if (targetId) {
      createData.targetId = targetId;
    }

    await (prisma as any).emailVerificationOtp.create({
      data: createData,
    });

    let emailDeliveryStatus = { sent: false, mocked: false, error: "" };

    // 5. Send OTP Email via Resend if requested
    if (sendEmailDelivery) {
      const purpose =
        type === "REVIEW_VERIFY"
          ? "REVIEW"
          : type === "PASSWORD_RESET"
          ? "PASSWORD_RESET"
          : "ADMIN";

      const template = createOtpEmail({
        recipientName,
        code: rawOtp,
        purpose,
        expiryMinutes: 10,
      });

      const deliveryRes = await sendEmail({
        to: cleanEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
        tags: [{ name: "category", value: "otp_verification" }],
      });

      emailDeliveryStatus = {
        sent: deliveryRes.success,
        mocked: Boolean(deliveryRes.mocked),
        error: deliveryRes.error || "",
      };
    }

    return {
      success: true,
      code: rawOtp,
      expiresAt,
      emailDeliveryStatus,
    };
  } catch (error: any) {
    console.error("[OTP] Failed to generate email OTP:", error instanceof Error ? error.message : "Unknown error");
    return {
      success: false,
      error: "Failed to generate OTP verification code.",
    };
  }
}

/**
 * Verify a 6-digit OTP against the latest active record.
 * Enforces maximum 5 attempts, expiration time, single-use, email binding, and target ID binding.
 */
export async function verifyEmailOtp(
  email: string,
  candidateCode: string,
  type: OtpPurpose = "ADMIN_VERIFY",
  targetId?: string
): Promise<VerifyOtpResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = candidateCode.trim();

  if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
    return { success: false, error: "Verification code must be exactly 6 digits." };
  }

  try {
    const whereClause: any = {
      email: cleanEmail,
      type,
      verified: false,
    };
    if (targetId) {
      whereClause.targetId = targetId;
    }

    const activeOtp = await (prisma as any).emailVerificationOtp.findFirst({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    if (!activeOtp) {
      return {
        success: false,
        error: "No active verification code found for this request. Please request a new code.",
      };
    }

    // Check expiration
    if (new Date() > new Date(activeOtp.expiresAt)) {
      await (prisma as any).emailVerificationOtp.update({
        where: { id: activeOtp.id },
        data: { verified: true },
      });
      return {
        success: false,
        error: "Verification code has expired. Please request a new code.",
      };
    }

    // Check attempts limit
    if (activeOtp.attempts >= MAX_ATTEMPTS) {
      await (prisma as any).emailVerificationOtp.update({
        where: { id: activeOtp.id },
        data: { verified: true },
      });
      return {
        success: false,
        error: "Maximum verification attempts exceeded (5 attempts). Please request a new code.",
      };
    }

    // Compare bcrypt hash
    const isMatch = await bcrypt.compare(cleanCode, activeOtp.otpHash);

    if (!isMatch) {
      const remainingAttempts = MAX_ATTEMPTS - (activeOtp.attempts + 1);
      await (prisma as any).emailVerificationOtp.update({
        where: { id: activeOtp.id },
        data: { attempts: activeOtp.attempts + 1 },
      });

      return {
        success: false,
        error:
          remainingAttempts > 0
            ? `Incorrect verification code. ${remainingAttempts} attempt(s) remaining.`
            : "Maximum verification attempts exceeded. Please request a new code.",
      };
    }

    // Match verified! Mark OTP as used immediately (single-use enforcement)
    await (prisma as any).emailVerificationOtp.update({
      where: { id: activeOtp.id },
      data: { verified: true },
    });

    return { success: true };
  } catch (error: any) {
    console.error("[OTP] Failed to verify OTP code:", error instanceof Error ? error.message : "Unknown error");
    return {
      success: false,
      error: "Internal error during verification processing.",
    };
  }
}
