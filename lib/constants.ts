/**
 * Application-wide constants & verified official links for Mount Ijen Tour
 */

import { getAdminWhatsAppNumber, getWhatsAppLink, WhatsAppTemplates } from "./whatsapp";

export const APP_NAME = "Mount Ijen Tour";
export const APP_TAGLINE = "Discover the Mystical Blue Fire & East Java Wonders";
export const APP_DESCRIPTION =
  "Official tour operator for Mount Ijen Crater, Blue Fire expeditions, Baluran National Park, and Mount Bromo adventures in Banyuwangi, East Java.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://mountijentour.vercel.app";

export const OFFICIAL_PHONE = "+62 822-6817-7188";
export const OFFICIAL_EMAIL = "info@mountijentour.com";
export const OFFICIAL_ADDRESS =
  "Jl. Raya Ijen No. 45, Licin, Banyuwangi, Jawa Timur 68454, Indonesia";

/**
 * Verified Official Social Media Links
 */
export const OFFICIAL_SOCIAL_LINKS = {
  whatsapp: getWhatsAppLink(WhatsAppTemplates.generalInquiry()),
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/alyaanvi",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://facebook.com/mountijentour",
  youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://youtube.com/@mountijentour",
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || "https://tiktok.com/@mountijentour",
  email: `mailto:${OFFICIAL_EMAIL}`,
} as const;

export const COMPANY_INFO = {
  name: "Mount Ijen Tour & Expedition",
  address: OFFICIAL_ADDRESS,
  phone: OFFICIAL_PHONE,
  whatsAppNumber: getAdminWhatsAppNumber(),
  email: OFFICIAL_EMAIL,
  operatingHours: "Daily, 06:00 - 22:00 WIB (Emergency 24/7)",
} as const;
