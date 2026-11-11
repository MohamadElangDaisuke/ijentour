import { emailLayout } from "./layout";

export interface TemplateResult {
  subject: string;
  html: string;
  text: string;
}

/**
 * 1. OTP Verification Email (For Admin Onboarding or Customer Review Verification)
 */
export function createOtpEmail(params: {
  recipientName: string;
  code: string;
  purpose: "ADMIN" | "REVIEW" | "PASSWORD_RESET";
  expiryMinutes?: number;
}): TemplateResult {
  const { recipientName, code, purpose, expiryMinutes = 10 } = params;

  let title = "Verify Your Account";
  let purposeDesc = "complete your administrator verification on Mount Ijen Tour.";
  let badge = "Security Verification";

  if (purpose === "REVIEW") {
    title = "Verify Your Customer Review";
    purposeDesc = "authenticate your review submission for Mount Ijen Tour.";
    badge = "Review Verification";
  } else if (purpose === "PASSWORD_RESET") {
    title = "Reset Your Password";
    purposeDesc = "reset your administrator password.";
    badge = "Password Security";
  }

  const subject = `[Mount Ijen Tour] Your Verification Code: ${code}`;
  const previewText = `Your 6-digit verification code is ${code}. Valid for ${expiryMinutes} minutes.`;

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0F172A;">${title}</h2>
    <p style="margin: 0 0 20px 0;">Hello <strong>${recipientName || "Traveler"}</strong>,</p>
    <p style="margin: 0 0 24px 0; color: #475569;">
      Please use the single-use 6-digit verification code below to ${purposeDesc}
    </p>

    <div style="background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); border: 2px dashed #F59E0B; border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0;">
      <span style="display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #B45309; text-transform: uppercase; margin-bottom: 8px;">Single-Use OTP Code</span>
      <span style="display: inline-block; font-size: 36px; font-weight: 900; letter-spacing: 0.25em; color: #92400E; font-family: 'Courier New', Courier, monospace;">${code}</span>
      <span style="display: block; font-size: 12px; color: #B45309; margin-top: 8px; font-weight: 500;">Valid for ${expiryMinutes} minutes • Maximum 5 attempts</span>
    </div>

    <div class="info-card">
      <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #0F172A;">Important Security Notice:</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #64748B;">
        <li>Never share this code with anyone, including staff members.</li>
        <li>Mount Ijen Tour will never ask for your verification code outside the official website.</li>
        <li>If you did not request this verification, you can safely ignore this email.</li>
      </ul>
    </div>
  `;

  const text = `
Mount Ijen Tour - ${title}
Hello ${recipientName || "Traveler"},

Your 6-digit verification code is: ${code}
Valid for ${expiryMinutes} minutes (single-use, maximum 5 attempts).

Never share this code with anyone. If you did not request this code, please disregard this email.
Mount Ijen Tour Expedition Management
https://www.mountijentour.com
  `.trim();

  return {
    subject,
    html: emailLayout({ title, previewText, contentHtml, badge, badgeColor: "#D97706" }),
    text,
  };
}

/**
 * 2. Regular Booking Notification Email (To Super Admin and eligible Admins)
 */
export function createBookingNotificationEmail(params: {
  bookingCode: string;
  customerName: string;
  customerEmail?: string | null;
  whatsappNumber: string;
  packageName: string;
  numParticipants: number;
  departureDate: string;
  totalPrice: number;
  specialRequests?: string | null;
  adminBaseUrl: string;
}): TemplateResult {
  const {
    bookingCode,
    customerName,
    customerEmail,
    whatsappNumber,
    packageName,
    numParticipants,
    departureDate,
    totalPrice,
    specialRequests,
    adminBaseUrl,
  } = params;

  const subject = `[New Booking] ${customerName} - ${packageName} (${bookingCode})`;
  const previewText = `New reservation received for ${packageName} on ${departureDate}. Total: Rp ${totalPrice.toLocaleString("id-ID")}`;
  const detailUrl = `${adminBaseUrl.replace(/\/$/, "")}/admin/bookings`;

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0F172A;">New Tour Package Reservation</h2>
    <p style="margin: 0 0 20px 0; color: #475569;">
      A new reservation has been placed on the Mount Ijen Tour website. Please review the details below:
    </p>

    <div class="info-card">
      <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
        <tr>
          <td width="35%" style="color: #64748B; font-weight: 600;">Booking Reference</td>
          <td style="font-weight: 800; color: #D97706; font-family: monospace;">${bookingCode}</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">Tour Package</td>
          <td style="font-weight: 700; color: #0F172A;">${packageName}</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">Customer Name</td>
          <td style="font-weight: 600; color: #0F172A;">${customerName}</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">WhatsApp / Phone</td>
          <td><a href="https://wa.me/${whatsappNumber.replace(/\D/g, "")}" style="color: #059669; font-weight: 700; text-decoration: none;">${whatsappNumber}</a></td>
        </tr>
        ${
          customerEmail
            ? `<tr>
                <td style="color: #64748B; font-weight: 600;">Customer Email</td>
                <td style="color: #0F172A;">${customerEmail}</td>
              </tr>`
            : ""
        }
        <tr>
          <td style="color: #64748B; font-weight: 600;">Departure Date</td>
          <td style="font-weight: 600; color: #0F172A;">${departureDate}</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">Participants</td>
          <td style="font-weight: 600; color: #0F172A;">${numParticipants} Person(s)</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">Calculated Total</td>
          <td style="font-weight: 800; color: #0F172A; font-size: 16px;">Rp ${Number(totalPrice).toLocaleString("id-ID")}</td>
        </tr>
        ${
          specialRequests
            ? `<tr>
                <td style="color: #64748B; font-weight: 600; vertical-align: top;">Special Requests</td>
                <td style="color: #475569; font-style: italic;">&ldquo;${specialRequests}&rdquo;</td>
              </tr>`
            : ""
        }
      </table>
    </div>

    <div style="text-align: center;">
      <a href="${detailUrl}" class="cta-button">Open Bookings Dashboard</a>
    </div>
  `;

  const text = `
Mount Ijen Tour - New Reservation Received
Reference: ${bookingCode}
Package: ${packageName}
Customer: ${customerName}
WhatsApp: ${whatsappNumber}
Email: ${customerEmail || "N/A"}
Date: ${departureDate}
Participants: ${numParticipants} pax
Total Price: Rp ${Number(totalPrice).toLocaleString("id-ID")}
${specialRequests ? `Special Requests: ${specialRequests}\n` : ""}
Review in Admin: ${detailUrl}
  `.trim();

  return {
    subject,
    html: emailLayout({ title: "New Reservation", previewText, contentHtml, badge: "New Reservation", badgeColor: "#059669" }),
    text,
  };
}

/**
 * 3. Custom Trip Inquiry Notification Email
 */
export function createCustomTripNotificationEmail(params: {
  bookingCode: string;
  customerName: string;
  customerEmail?: string | null;
  whatsappNumber: string;
  destinationsSummary: string;
  numParticipants: number;
  departureDate: string;
  specialRequests?: string | null;
  adminBaseUrl: string;
}): TemplateResult {
  const {
    bookingCode,
    customerName,
    customerEmail,
    whatsappNumber,
    destinationsSummary,
    numParticipants,
    departureDate,
    specialRequests,
    adminBaseUrl,
  } = params;

  const subject = `[Custom Trip Request] ${customerName} (${bookingCode})`;
  const previewText = `Custom itinerary request: ${destinationsSummary} (${numParticipants} pax) on ${departureDate}. Requires manual proposal.`;
  const detailUrl = `${adminBaseUrl.replace(/\/$/, "")}/admin/bookings`;

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0F172A;">New Custom Trip Proposal Request</h2>
    <p style="margin: 0 0 20px 0; color: #475569;">
      A traveler requested a tailored itinerary. <strong>Note:</strong> Initial price is <strong>Rp 0</strong> until negotiated and confirmed via WhatsApp.
    </p>

    <div class="info-card">
      <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
        <tr>
          <td width="35%" style="color: #64748B; font-weight: 600;">Request Reference</td>
          <td style="font-weight: 800; color: #D97706; font-family: monospace;">${bookingCode}</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">Customer Name</td>
          <td style="font-weight: 700; color: #0F172A;">${customerName}</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">WhatsApp Contact</td>
          <td><a href="https://wa.me/${whatsappNumber.replace(/\D/g, "")}" style="color: #059669; font-weight: 700; text-decoration: none;">${whatsappNumber}</a></td>
        </tr>
        ${
          customerEmail
            ? `<tr>
                <td style="color: #64748B; font-weight: 600;">Customer Email</td>
                <td style="color: #0F172A;">${customerEmail}</td>
              </tr>`
            : ""
        }
        <tr>
          <td style="color: #64748B; font-weight: 600;">Destinations</td>
          <td style="font-weight: 700; color: #0F172A;">${destinationsSummary}</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">Participants</td>
          <td style="font-weight: 600; color: #0F172A;">${numParticipants} Person(s)</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">Preferred Date</td>
          <td style="font-weight: 600; color: #0F172A;">${departureDate}</td>
        </tr>
        ${
          specialRequests
            ? `<tr>
                <td style="color: #64748B; font-weight: 600; vertical-align: top;">Customer Notes</td>
                <td style="color: #475569; font-style: italic;">&ldquo;${specialRequests}&rdquo;</td>
              </tr>`
            : ""
        }
      </table>
    </div>

    <div style="text-align: center;">
      <a href="${detailUrl}" class="cta-button">Review Proposal in Admin</a>
    </div>
  `;

  const text = `
Mount Ijen Tour - Custom Trip Proposal Request
Reference: ${bookingCode}
Customer: ${customerName}
WhatsApp: ${whatsappNumber}
Email: ${customerEmail || "N/A"}
Destinations: ${destinationsSummary}
Participants: ${numParticipants} pax
Preferred Date: ${departureDate}
${specialRequests ? `Notes: ${specialRequests}\n` : ""}
Initial price: Rp 0 (manual WhatsApp quotation required).
Review in Admin: ${detailUrl}
  `.trim();

  return {
    subject,
    html: emailLayout({ title: "Custom Trip Request", previewText, contentHtml, badge: "Custom Itinerary", badgeColor: "#2563EB" }),
    text,
  };
}

/**
 * 4. Contact Message Notification Email
 */
export function createContactNotificationEmail(params: {
  senderName: string;
  senderEmail: string;
  phone?: string | null;
  subject: string;
  message: string;
  adminBaseUrl: string;
}): TemplateResult {
  const { senderName, senderEmail, phone, subject: msgSubject, message, adminBaseUrl } = params;

  const subject = `[Contact Inquiry] ${senderName}: ${msgSubject}`;
  const previewText = `New contact message from ${senderName} (${senderEmail}): "${message.slice(0, 80)}..."`;
  const inboxUrl = `${adminBaseUrl.replace(/\/$/, "")}/admin/contacts`;

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0F172A;">New Website Contact Message</h2>
    <p style="margin: 0 0 20px 0; color: #475569;">
      A traveler submitted an inquiry through the Mount Ijen Tour contact desk:
    </p>

    <div class="info-card">
      <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
        <tr>
          <td width="30%" style="color: #64748B; font-weight: 600;">Sender Name</td>
          <td style="font-weight: 700; color: #0F172A;">${senderName}</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">Sender Email</td>
          <td><a href="mailto:${senderEmail}" style="color: #D97706; text-decoration: none; font-weight: 600;">${senderEmail}</a></td>
        </tr>
        ${
          phone
            ? `<tr>
                <td style="color: #64748B; font-weight: 600;">Phone / WhatsApp</td>
                <td style="color: #0F172A;">${phone}</td>
              </tr>`
            : ""
        }
        <tr>
          <td style="color: #64748B; font-weight: 600;">Subject</td>
          <td style="font-weight: 600; color: #0F172A;">${msgSubject}</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600; vertical-align: top;">Message</td>
          <td style="color: #334155; line-height: 1.6; white-space: pre-wrap;">${message}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center;">
      <a href="${inboxUrl}" class="cta-button">Open Contact Inbox</a>
    </div>
  `;

  const text = `
Mount Ijen Tour - New Contact Message
From: ${senderName} <${senderEmail}>
${phone ? `Phone: ${phone}\n` : ""}Subject: ${msgSubject}

Message:
${message}

Open Inbox: ${inboxUrl}
  `.trim();

  return {
    subject,
    html: emailLayout({ title: "Contact Message", previewText, contentHtml, badge: "Traveler Inquiry", badgeColor: "#6366F1" }),
    text,
  };
}

/**
 * 5. Review Notification Email (New verified review awaiting moderation)
 */
export function createReviewNotificationEmail(params: {
  reviewId: string;
  authorName: string;
  authorEmail?: string | null;
  rating: number;
  comment: string;
  isVerifiedCustomer: boolean;
  adminBaseUrl: string;
}): TemplateResult {
  const { reviewId, authorName, authorEmail, rating, comment, isVerifiedCustomer, adminBaseUrl } = params;

  const subject = `[Review Moderation] ${authorName} rated ${rating} Stars`;
  const previewText = `${authorName} submitted a ${rating}-star review. Email is verified and awaiting moderation.`;
  const reviewUrl = `${adminBaseUrl.replace(/\/$/, "")}/admin/reviews`;

  const stars = "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0F172A;">New Customer Review Awaiting Moderation</h2>
    <p style="margin: 0 0 20px 0; color: #475569;">
      A customer has verified their email and submitted a review. This review is <strong>not publicly visible</strong> until approved by an administrator.
    </p>

    <div class="info-card">
      <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
        <tr>
          <td width="30%" style="color: #64748B; font-weight: 600;">Author</td>
          <td style="font-weight: 700; color: #0F172A;">${authorName}</td>
        </tr>
        ${
          authorEmail
            ? `<tr>
                <td style="color: #64748B; font-weight: 600;">Verified Email</td>
                <td style="color: #059669; font-weight: 600;">${authorEmail} (Email Verified)</td>
              </tr>`
            : ""
        }
        <tr>
          <td style="color: #64748B; font-weight: 600;">Verification Status</td>
          <td>
            <span style="display: inline-block; background-color: #ECFDF5; color: #047857; font-weight: 700; font-size: 12px; padding: 2px 8px; border-radius: 4px; border: 1px solid #A7F3D0;">
              ✓ Verified Email
            </span>
            ${
              isVerifiedCustomer
                ? `<span style="display: inline-block; background-color: #EFF6FF; color: #1D4ED8; font-weight: 700; font-size: 12px; padding: 2px 8px; border-radius: 4px; border: 1px solid #BFDBFE; margin-left: 6px;">
                    ✓ Verified Customer (Booking Matched)
                  </span>`
                : ""
            }
          </td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">Rating</td>
          <td style="color: #F59E0B; font-size: 18px; font-weight: 800;">${stars} (${rating}/5)</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600; vertical-align: top;">Comment</td>
          <td style="color: #334155; font-style: italic; line-height: 1.6;">&ldquo;${comment}&rdquo;</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center;">
      <a href="${reviewUrl}" class="cta-button">Moderate Review in Admin</a>
    </div>
  `;

  const text = `
Mount Ijen Tour - Customer Review Awaiting Moderation
Author: ${authorName}
Email: ${authorEmail || "N/A"} (Verified Email)
Status: ${isVerifiedCustomer ? "Verified Customer (Booking Matched)" : "Verified Email Only"}
Rating: ${rating}/5 stars
Comment: "${comment}"

Moderate in Admin: ${reviewUrl}
  `.trim();

  return {
    subject,
    html: emailLayout({ title: "Review Moderation", previewText, contentHtml, badge: "Customer Review", badgeColor: "#EA580C" }),
    text,
  };
}

/**
 * 6. Security and Account Notification Email (To Super Admin)
 */
export function createSecurityNotificationEmail(params: {
  action: string;
  adminName: string;
  details: Record<string, any>;
  ipAddress?: string | null;
  adminBaseUrl: string;
}): TemplateResult {
  const { action, adminName, details, ipAddress, adminBaseUrl } = params;

  const subject = `[Security Alert] Admin Action: ${action}`;
  const previewText = `Security event: ${action} triggered by ${adminName}.`;
  const auditUrl = `${adminBaseUrl.replace(/\/$/, "")}/admin/users`;

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0F172A;">Security & Administrative Event Alert</h2>
    <p style="margin: 0 0 20px 0; color: #475569;">
      A sensitive administrative action was executed on Mount Ijen Tour. As Super Admin, you are receiving this mandatory notification:
    </p>

    <div class="info-card">
      <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
        <tr>
          <td width="30%" style="color: #64748B; font-weight: 600;">Action Type</td>
          <td style="font-weight: 800; color: #DC2626; font-family: monospace;">${action}</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">Triggered By</td>
          <td style="font-weight: 700; color: #0F172A;">${adminName}</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">IP Address</td>
          <td style="font-family: monospace; color: #475569;">${ipAddress || "Unknown IP"}</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">Timestamp</td>
          <td style="color: #475569;">${new Date().toUTCString()}</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600; vertical-align: top;">Event Details</td>
          <td>
            <pre style="background: #FFFFFF; border: 1px solid #E2E8F0; padding: 10px; border-radius: 6px; font-size: 12px; margin: 0; overflow-x: auto;">${JSON.stringify(
              details,
              null,
              2
            )}</pre>
          </td>
        </tr>
      </table>
    </div>

    <div style="text-align: center;">
      <a href="${auditUrl}" class="cta-button" style="background-color: #0F172A;">Manage Admin Accounts</a>
    </div>
  `;

  const text = `
Mount Ijen Tour - Security Event Alert
Action: ${action}
Triggered By: ${adminName}
IP Address: ${ipAddress || "Unknown IP"}
Timestamp: ${new Date().toISOString()}

Details:
${JSON.stringify(details, null, 2)}

Review in Admin: ${auditUrl}
  `.trim();

  return {
    subject,
    html: emailLayout({ title: "Security Alert", previewText, contentHtml, badge: "Security Alert", badgeColor: "#DC2626" }),
    text,
  };
}

/**
 * 7. Test Email Template (For Super Admin Email Connection Verification)
 */
export function createTestEmail(params: {
  recipient: string;
  sender: string;
  adminName: string;
}): TemplateResult {
  const { recipient, sender, adminName } = params;

  const subject = `[Mount Ijen Tour] Test Email Delivery Successful`;
  const previewText = `Your Resend email delivery configuration is operational.`;

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0F172A;">Email System Is Operational!</h2>
    <p style="margin: 0 0 20px 0; color: #475569;">
      Hello <strong>${adminName}</strong>, this test email confirms that your <strong>Resend API integration</strong> is properly configured and successfully dispatching emails from the Mount Ijen Tour production system.
    </p>

    <div class="info-card">
      <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
        <tr>
          <td width="35%" style="color: #64748B; font-weight: 600;">Delivery Provider</td>
          <td style="font-weight: 700; color: #0F172A;">Resend (Official Node SDK)</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">Configured Sender</td>
          <td style="color: #0F172A; font-family: monospace;">${sender}</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">Delivered To</td>
          <td style="color: #0F172A; font-family: monospace;">${recipient}</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">Status</td>
          <td style="color: #059669; font-weight: 800;">✓ Connected & Validated</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">Timestamp</td>
          <td style="color: #475569;">${new Date().toUTCString()}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #64748B; margin-top: 20px;">
      All automated notifications (Bookings, Custom Trips, Contact messages, Customer Reviews, and Admin OTPs) will now be delivered via this verified channel.
    </p>
  `;

  const text = `
Mount Ijen Tour - Email Test Successful
Provider: Resend
Sender: ${sender}
Delivered To: ${recipient}
Status: Verified & Operational
Timestamp: ${new Date().toISOString()}
  `.trim();

  return {
    subject,
    html: emailLayout({ title: "Test Email", previewText, contentHtml, badge: "System Verified", badgeColor: "#059669" }),
    text,
  };
}

