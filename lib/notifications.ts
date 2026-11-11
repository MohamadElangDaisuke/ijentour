import { prisma } from "@/lib/prisma";

export const ALLOWED_ADMIN_NOTIFICATION_ROUTES = [
  "/admin/dashboard",
  "/admin/bookings",
  "/admin/contacts",
  "/admin/reviews",
  "/admin/trips",
  "/admin/destinations",
  "/admin/gallery",
  "/admin/blog",
  "/admin/faqs",
  "/admin/staff",
  "/admin/notifications",
  "/admin/users",
  "/admin/email-settings",
  "/admin/settings",
] as const;

/**
 * Strictly sanitizes internal links destined for admin notifications.
 * Rejects external URLs, protocol-relative URLs, javascript/data schemes,
 * backslashes, control characters, and path traversal patterns.
 */
export function sanitizeInternalLink(rawLink?: string | null): string {
  const DEFAULT_SAFE_ROUTE = "/admin/dashboard";
  if (!rawLink || typeof rawLink !== "string") return DEFAULT_SAFE_ROUTE;

  let link = rawLink.trim();

  // 1. Detect and reject control characters (ASCII < 32 or > 126, newlines, null bytes)
  if (/[\x00-\x1F\x7F]/.test(link)) return DEFAULT_SAFE_ROUTE;

  // 2. Decode URL encoding repeatedly to catch double-encoding bypasses (%252e%252e, etc.)
  try {
    let prev = "";
    let iterations = 0;
    while (prev !== link && iterations < 5) {
      prev = link;
      link = decodeURIComponent(link);
      iterations++;
    }
  } catch {
    return DEFAULT_SAFE_ROUTE;
  }

  // 3. Reject colon schemes (javascript:, data:, vbscript:, http:, https:, etc.)
  if (link.includes(":")) return DEFAULT_SAFE_ROUTE;

  // 4. Reject backslashes (Windows path / open redirect bypass)
  if (link.includes("\\")) return DEFAULT_SAFE_ROUTE;

  // 5. Reject protocol-relative "//" and path traversal ".."
  if (link.startsWith("//") || link.includes("..")) return DEFAULT_SAFE_ROUTE;

  // 6. Must start with a single "/"
  if (!link.startsWith("/")) return DEFAULT_SAFE_ROUTE;

  // 7. Whitelist check against permitted admin route prefixes
  const isAllowed = ALLOWED_ADMIN_NOTIFICATION_ROUTES.some(
    (prefix) => link === prefix || link.startsWith(`${prefix}/`) || link.startsWith(`${prefix}?`)
  );

  return isAllowed ? rawLink.trim() : DEFAULT_SAFE_ROUTE;
}

export interface InternalNotificationParams {
  type: "booking" | "contact" | "review" | "system" | "user";
  title: string;
  description: string;
  link?: string;
  referenceId?: string; // Unique event identifier (e.g. bookingCode, contactId, reviewId)
}

/**
 * Internal server-side helper for creating admin notifications safely.
 * Non-blocking: failures will log but will NOT cancel or revert the primary transaction.
 * Deduplication: checks if referenceId was already recorded to prevent duplicate spam.
 */
export async function createInternalNotification(
  params: InternalNotificationParams
): Promise<boolean> {
  try {
    const { type, title, description, link, referenceId } = params;

    // Deduplication check via unique event identifier
    if (referenceId) {
      const existing = await prisma.notification.findFirst({
        where: {
          type,
          description: { contains: referenceId },
        },
      });

      if (existing) {
        return true; // Already recorded, safely skip duplicate creation
      }
    }

    const safeLink = sanitizeInternalLink(link);

    // Sanitize title and description
    const safeTitle = String(title || "").slice(0, 150).trim();
    const safeDesc = String(description || "").slice(0, 500).trim();

    if (!safeTitle || !safeDesc) {
      return false;
    }

    await prisma.notification.create({
      data: {
        type,
        title: safeTitle,
        description: referenceId ? `${safeDesc} [Ref: ${referenceId}]` : safeDesc,
        link: safeLink,
        unread: true,
      },
    });

    return true;
  } catch (error) {
    // Non-blocking catch: log error securely without throwing or leaking secrets
    console.error("Non-fatal: Failed to create internal notification:", error instanceof Error ? error.message : "Unknown error");
    return false;
  }
}

