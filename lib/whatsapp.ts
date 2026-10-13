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
  generalInquiry: (topic: string = "Paket Wisata") =>
    `Halo Admin Ijen Tour, saya ingin berkonsultasi mengenai ${topic}. Boleh berikan informasi jadwal dan ketersediaannya?`,

  bookTrip: (tripTitle: string, price?: string, date?: string, pax?: number) => {
    let msg = `Halo Admin Ijen Tour, saya ingin memesan paket "${tripTitle}"`;
    if (price) msg += ` (${price})`;
    if (date) msg += ` untuk tanggal keberangkatan ${date}`;
    if (pax) msg += ` sejumlah ${pax} orang`;
    msg += `. Mohon konfirmasi ketersediaan dan detail penjemputan.`;
    return msg;
  },

  checkBookingStatus: (bookingCode: string) =>
    `Halo Admin Ijen Tour, saya ingin konfirmasi reservasi saya dengan Kode Booking: ${bookingCode}.`,

  customTourRequest: () =>
    `Halo Tim Ijen Expedition, saya ingin menanyakan paket custom private tour untuk rombongan keluarga/perusahaan.`,
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
    `Halo Tim Ijen Tour Banyuwangi, saya ingin melakukan pemesanan tur dengan rincian berikut:`,
    ``,
    `👤 *Full Name*: ${data.fullName.trim()}`,
    `🌍 *Nationality*: ${data.nationality.trim()}`,
    `📧 *Email Address*: ${data.email.trim()}`,
    `📱 *WhatsApp Number*: ${data.whatsapp.trim()}`,
    ``,
    `🗺️ *Tour Package*: ${data.packageName}`,
    `📅 *Tour Date*: ${data.tourDate}`,
    `👥 *Participants*: ${data.participants} Orang`,
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
    `Mohon info ketersediaan slot guide lokal, kuota pendakian, dan konfirmasi penjemputan. Terima kasih!`
  );

  return parts.join('\n');
}

