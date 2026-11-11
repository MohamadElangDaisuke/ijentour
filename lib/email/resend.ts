import { Resend } from "resend";

export interface EmailSendOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
  allowSimulation?: boolean; // Defaults to true in dev/test, false in production
}

export interface EmailSendResult {
  success: boolean;
  id?: string;
  error?: string;
  mocked?: boolean;
}

export interface ResendConfigStatus {
  isConfigured: boolean;
  senderEmail: string;
  senderName: string;
  adminNotificationEmail: string;
  hasApiKey: boolean;
  maskedApiKey: string;
}

// Global cached client instance for serverless lifecycle reuse
let cachedResend: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  if (!cachedResend) {
    cachedResend = new Resend(apiKey);
  }
  return cachedResend;
}

/**
 * Returns sanitized configuration status for Super Admin inspection.
 * Never leaks the actual secret key.
 */
export function getResendConfigStatus(): ResendConfigStatus {
  const apiKey = process.env.RESEND_API_KEY?.trim() || "";
  const fromRaw =
    process.env.EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Mount Ijen Tour <noreply@mountijentour.com>";
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || "";

  // Parse sender display name & address
  let senderName = "Mount Ijen Tour";
  let senderEmail = "noreply@mountijentour.com";
  const match = fromRaw.match(/^(.*?)\s*<(.+?)>$/);
  if (match) {
    senderName = match[1].trim();
    senderEmail = match[2].trim();
  } else if (fromRaw.includes("@")) {
    senderEmail = fromRaw;
  }

  // Masked API key (e.g. re_1234...9abc)
  let maskedApiKey = "Not Configured";
  if (apiKey.length > 8) {
    maskedApiKey = `${apiKey.substring(0, 5)}••••••••${apiKey.substring(apiKey.length - 4)}`;
  } else if (apiKey) {
    maskedApiKey = "••••••••";
  }

  return {
    isConfigured: Boolean(apiKey && apiKey.startsWith("re_")),
    senderEmail,
    senderName,
    adminNotificationEmail: adminEmail || "Not Set (Configure in .env)",
    hasApiKey: Boolean(apiKey),
    maskedApiKey,
  };
}

/**
 * Robust, production-ready email dispatcher using Resend.
 * - Validates inputs and environment securely.
 * - Does not throw unhandled exceptions to callers.
 * - Logs delivery failures without leaking secrets or sensitive payloads.
 * - In local dev/test without RESEND_API_KEY, safely logs mock delivery.
 */
export async function sendEmail(options: EmailSendOptions): Promise<EmailSendResult> {
  const { to, subject, html, text, replyTo, tags } = options;

  // 1. Validate recipients
  const recipients = Array.isArray(to) ? to : [to];
  const validRecipients = recipients
    .map((r) => r.trim().toLowerCase())
    .filter((r) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r));

  if (validRecipients.length === 0) {
    console.warn("[EmailService] Aborted: No valid recipient email addresses provided.");
    return { success: false, error: "No valid recipient email address." };
  }

  // 2. Validate sender address
  const sender =
    process.env.EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Mount Ijen Tour <noreply@mountijentour.com>";

  // 3. Check Resend Client
  const client = getResendClient();

  if (!client) {
    // If real email delivery is requested or running in production, missing key is an explicit error
    if (options.allowSimulation === false || process.env.NODE_ENV === "production") {
      console.error("[EmailService] Error: RESEND_API_KEY is not configured. Real email delivery aborted.");
      return {
        success: false,
        error: "RESEND_API_KEY is missing in environment variables. Real email delivery cannot be performed.",
        mocked: false,
      };
    }

    // Development or pre-configuration simulation mode
    console.log(
      `[EmailService:Simulated] To: ${validRecipients.join(", ")} | Subject: "${subject}" (RESEND_API_KEY is not configured yet)`
    );
    return {
      success: true,
      id: `simulated_mock_${Date.now()}`,
      mocked: true,
    };
  }

  try {
    const plainFallback =
      text ||
      html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const response = await client.emails.send({
      from: sender,
      to: validRecipients,
      subject,
      html,
      text: plainFallback,
      replyTo: replyTo || undefined,
      tags: tags || undefined,
    });

    if (response.error) {
      console.error(
        `[EmailService] Resend API Error for [${subject}] to ${validRecipients.join(", ")}:`,
        response.error.message || response.error
      );
      return {
        success: false,
        error: response.error.message || "Email delivery rejected by Resend API.",
      };
    }

    return {
      success: true,
      id: response.data?.id,
    };
  } catch (error: any) {
    console.error(
      `[EmailService] Unexpected failure sending email [${subject}] to ${validRecipients.join(", ")}:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email via Resend.",
    };
  }
}

