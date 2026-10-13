/**
 * Centralized WhatsApp Configuration & Utilities
 * Single source of truth for the entire application.
 * Reads from ADMIN_WHATSAPP_NUMBER or NEXT_PUBLIC_WHATSAPP_NUMBER env variable.
 */

export function getAdminWhatsAppNumber(): string {
  const envNumber =
    process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER ||
    process.env.ADMIN_WHATSAPP_NUMBER ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    "6282268177188";

  // Clean non-digit characters
  return envNumber.replace(/[^0-9]/g, "");
}

/**
 * Format phone number to clean international WhatsApp format
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

/**
 * Generate click-to-chat WhatsApp URL
 */
export function getWhatsAppLink(message?: string, customPhone?: string): string {
  const number = customPhone ? formatPhoneNumber(customPhone) : getAdminWhatsAppNumber();
  const baseUrl = `https://wa.me/${number}`;
  if (!message) return baseUrl;
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}

/**
 * Pre-defined WhatsApp action templates for tourism & bookings
 */
export const WhatsAppTemplates = {
  generalInquiry: (topic: string = "Tour Packages") =>
    `Hello Ijen Tour Admin, I would like to inquire about ${topic}. Could you please share the schedule and availability details?`,

  bookTrip: (tripTitle: string, price?: string, date?: string, pax?: number) => {
    let msg = `Hello Ijen Tour Admin, I would like to book the "${tripTitle}" package`;
    if (price) msg += ` (${price})`;
    if (date) msg += ` for departure date ${date}`;
    if (pax) msg += ` for ${pax} person(s)`;
    msg += `. Please confirm availability and pickup details.`;
    return msg;
  },

  checkBookingStatus: (bookingCode: string) =>
    `Hello Ijen Tour Admin, I would like to confirm my reservation with Booking Code: ${bookingCode}.`,

  customTourRequest: () =>
    `Hello Ijen Tour Team, I would like to inquire about a custom private tour package for a family/corporate group.`,
};

export interface TourBookingInquiryData {
  fullName: string;
  nationality: string;
  email: string;
  whatsapp: string;
  packageName: string;
  tourDate: string;
  participants: number | string;
  pickupLocation: string;
  specialRequests?: string;
}

/**
 * Creates formatted WhatsApp message matching the requested booking form fields
 */
export function createTourBookingWhatsAppMessage(data: TourBookingInquiryData): string {
  const parts = [
    `*BOOK YOUR TOUR - RESERVATION INQUIRY*`,
    `Hello Ijen Tour Banyuwangi Team, I would like to make a tour booking with the following details:`,
    ``,
    `👤 *Full Name*: ${data.fullName.trim()}`,
    `🌍 *Nationality*: ${data.nationality.trim()}`,
    `📧 *Email Address*: ${data.email.trim()}`,
    `📱 *WhatsApp Number*: ${data.whatsapp.trim()}`,
    ``,
    `🗺️ *Tour Package*: ${data.packageName}`,
    `📅 *Tour Date*: ${data.tourDate}`,
    `👥 *Participants*: ${data.participants} Person(s)`,
    `📍 *Pickup Location*: ${data.pickupLocation.trim()}`,
  ];

  if (data.specialRequests && data.specialRequests.trim()) {
    parts.push(
      ``,
      `📝 *Special Requests*:`,
      `${data.specialRequests.trim()}`
    );
  }

  parts.push(
    ``,
    `Please confirm local guide availability, trekking quota, and pickup details. Thank you!`
  );

  return parts.join('\n');
}

