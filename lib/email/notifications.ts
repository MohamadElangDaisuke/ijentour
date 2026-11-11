import { prisma } from "@/lib/prisma";
import { sendEmail } from "./resend";
import {
  createBookingNotificationEmail,
  createCustomTripNotificationEmail,
  createContactNotificationEmail,
  createReviewNotificationEmail,
  createSecurityNotificationEmail,
} from "./templates";
import { safeJsonParse } from "@/lib/utils";

export interface NotificationPrefs {
  booking: boolean;
  customTrip: boolean;
  review: boolean;
  contact: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  booking: true,
  customTrip: true,
  review: true,
  contact: true,
};

function getAdminBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.trim()}`;
  }
  return "https://www.mountijentour.com";
}

/**
 * Resolves list of admin recipient emails eligible for a given notification category.
 * Rules:
 * 1. Super Admin always receives notifications (via ADMIN_NOTIFICATION_EMAIL or Super Admin DB email).
 * 2. Regular Admins only receive notifications if Super Admin has enabled the category in their preferences.
 * 3. Deactivated admin accounts are never notified.
 */
export async function getEligibleAdminRecipients(
  category: "booking" | "customTrip" | "review" | "contact"
): Promise<string[]> {
  const recipients = new Set<string>();

  // 1. Always include the explicit admin notification email from env if set
  const envAdminEmail = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  if (envAdminEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(envAdminEmail)) {
    recipients.add(envAdminEmail.toLowerCase());
  }

  try {
    // 2. Fetch all active administrative accounts from the database
    const adminUsers = await (prisma as any).user.findMany({
      where: {
        role: { in: ["SUPER_ADMIN", "ADMIN"] },
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        notificationPreferences: true,
      },
    });

    for (const user of adminUsers) {
      if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) continue;
      const cleanEmail = user.email.trim().toLowerCase();

      // Super Admin always receives all event notifications
      if (user.role === "SUPER_ADMIN") {
        recipients.add(cleanEmail);
        continue;
      }

      // Regular Admin: inspect preferences configured by Super Admin
      if (user.role === "ADMIN") {
        const prefs = safeJsonParse<NotificationPrefs>(user.notificationPreferences, DEFAULT_PREFS);
        if (prefs && prefs[category] === true) {
          recipients.add(cleanEmail);
        }
      }
    }
  } catch (error) {
    console.warn("[Notifications] Error fetching admin preferences from database:", error);
  }

  return Array.from(recipients);
}

/**
 * Resolves recipients specifically for Super Admin security alerts.
 */
export async function getSuperAdminRecipients(): Promise<string[]> {
  const recipients = new Set<string>();

  const envAdminEmail = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  if (envAdminEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(envAdminEmail)) {
    recipients.add(envAdminEmail.toLowerCase());
  }

  try {
    const superAdmins = await (prisma as any).user.findMany({
      where: { role: "SUPER_ADMIN", isActive: true },
      select: { email: true },
    });
    for (const sa of superAdmins) {
      if (sa.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sa.email)) {
        recipients.add(sa.email.trim().toLowerCase());
      }
    }
  } catch (error) {
    console.warn("[Notifications] Error fetching super admin emails:", error);
  }

  return Array.from(recipients);
}

// =========================================================================
// EVENT-BASED NOTIFICATION DISPATCHERS (100% NON-BLOCKING)
// =========================================================================

/**
 * Dispatch booking email notification to Super Admin and eligible Admins.
 */
export async function sendBookingEmailNotification(booking: {
  bookingCode: string;
  customerName: string;
  customerEmail?: string | null;
  whatsappNumber: string;
  packageName: string;
  numParticipants: number;
  departureDate: string;
  totalPrice: number;
  specialRequests?: string | null;
}): Promise<void> {
  try {
    const recipients = await getEligibleAdminRecipients("booking");
    if (recipients.length === 0) return;

    const template = createBookingNotificationEmail({
      ...booking,
      adminBaseUrl: getAdminBaseUrl(),
    });

    await sendEmail({
      to: recipients,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: [{ name: "category", value: "booking_alert" }],
    });
  } catch (err) {
    console.error("[Notifications] Non-fatal: Failed to dispatch booking email:", err);
  }
}

/**
 * Dispatch Custom Trip inquiry email notification to Super Admin and eligible Admins.
 */
export async function sendCustomTripEmailNotification(params: {
  bookingCode: string;
  customerName: string;
  customerEmail?: string | null;
  whatsappNumber: string;
  destinationsSummary: string;
  numParticipants: number;
  departureDate: string;
  specialRequests?: string | null;
}): Promise<void> {
  try {
    const recipients = await getEligibleAdminRecipients("customTrip");
    if (recipients.length === 0) return;

    const template = createCustomTripNotificationEmail({
      ...params,
      adminBaseUrl: getAdminBaseUrl(),
    });

    await sendEmail({
      to: recipients,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: [{ name: "category", value: "custom_trip_alert" }],
    });
  } catch (err) {
    console.error("[Notifications] Non-fatal: Failed to dispatch custom trip email:", err);
  }
}

/**
 * Dispatch contact inbox message email notification.
 */
export async function sendContactEmailNotification(contact: {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}): Promise<void> {
  try {
    const recipients = await getEligibleAdminRecipients("contact");
    if (recipients.length === 0) return;

    const template = createContactNotificationEmail({
      senderName: contact.name,
      senderEmail: contact.email,
      phone: contact.phone,
      subject: contact.subject,
      message: contact.message,
      adminBaseUrl: getAdminBaseUrl(),
    });

    await sendEmail({
      to: recipients,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: [{ name: "category", value: "contact_alert" }],
    });
  } catch (err) {
    console.error("[Notifications] Non-fatal: Failed to dispatch contact email:", err);
  }
}

/**
 * Dispatch verified customer review email notification.
 */
export async function sendReviewEmailNotification(review: {
  id: string;
  authorName: string;
  authorEmail?: string | null;
  rating: number;
  comment: string;
  isVerifiedCustomer: boolean;
}): Promise<void> {
  try {
    const recipients = await getEligibleAdminRecipients("review");
    if (recipients.length === 0) return;

    const template = createReviewNotificationEmail({
      reviewId: review.id,
      authorName: review.authorName,
      authorEmail: review.authorEmail,
      rating: review.rating,
      comment: review.comment,
      isVerifiedCustomer: review.isVerifiedCustomer,
      adminBaseUrl: getAdminBaseUrl(),
    });

    await sendEmail({
      to: recipients,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: [{ name: "category", value: "review_alert" }],
    });
  } catch (err) {
    console.error("[Notifications] Non-fatal: Failed to dispatch review email:", err);
  }
}

/**
 * Dispatch security alert email to Super Admin.
 */
export async function sendSecurityAlertEmail(params: {
  action: string;
  adminName: string;
  details: Record<string, any>;
  ipAddress?: string | null;
}): Promise<void> {
  try {
    const recipients = await getSuperAdminRecipients();
    if (recipients.length === 0) return;

    const template = createSecurityNotificationEmail({
      ...params,
      adminBaseUrl: getAdminBaseUrl(),
    });

    await sendEmail({
      to: recipients,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: [{ name: "category", value: "security_alert" }],
    });
  } catch (err) {
    console.error("[Notifications] Non-fatal: Failed to dispatch security alert email:", err);
  }
}

