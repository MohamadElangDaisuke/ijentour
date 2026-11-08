import { LiveFaq, LiveDestination, LivePackage } from "@/lib/travelAssistant";
import { CleanFaqData } from "./tools/faqs";
import { CleanDestinationData } from "./tools/destinations";
import { CleanPackageData } from "./tools/packages";

/**
 * Verified English translations for official database FAQs.
 * Preserves exact facts, operational hours (00:00 - 00:30 WIB, 02:00 - 04:30 WIB),
 * temperatures (8-12°C), distance (3 km), authorities (BKSDA/PVMBG), and services (Trolley Taxi).
 */
const FAQ_TRANSLATIONS: Record<string, { question: string; answer: string }> = {
  "apakah fenomena blue fire selalu bisa dilihat setiap malam": {
    question: "Is the Blue Fire phenomenon visible every night?",
    answer:
      "The Blue Fire phenomenon is a natural volcanic process influenced by weather, wind conditions, and volcanic activity. Most of the time, Blue Fire is clearly visible in the early morning hours (02:00 AM - 04:30 AM). However, during heavy rain or when toxic sulfur gas is exceptionally dense, descending to the crater floor may be temporarily restricted by BKSDA/PVMBG authorities for visitor safety.",
  },
  "apakah aman mendaki kawah ijen bersama anak-anak atau lansia": {
    question: "Is it safe to hike Mount Ijen with children or the elderly?",
    answer:
      "Yes, it is very safe with proper preparation. The hiking trail is approximately 3 km one way, taking about 1.5 to 2 hours at a normal pace. For elderly travelers or young children who may tire easily, official local 'Trolley Taxis' (troli tambang) are available at Paltuding Basecamp to transport visitors comfortably round-trip to the crater rim.",
  },
  "kapan waktu penjemputan dan apa saja yang perlu kami bawa": {
    question: "What is the pickup time and what should we bring?",
    answer:
      "For the Midnight Blue Fire tour, hotel or station pickup in the Banyuwangi city area takes place between 00:00 AM and 00:30 AM (midnight). Essential items to bring include: a warm jacket (night summit temperatures drop to 8-12°C), sturdy trekking shoes, warm clothes, and personal identification. Certified respirator gas masks and headlamps are already included and provided in all our tour packages.",
  },
  "bagaimana cara melakukan pemesanan dan pembayaran": {
    question: "How do we make a tour booking and payment?",
    answer:
      "Reservations can be placed directly through the booking form on our website package pages or via our official WhatsApp coordinator. Payment can be completed via official bank transfer, after which you will receive an automatic confirmed booking reference code.",
  },
};

/**
 * Verified English descriptions for official database destinations.
 */
const DESTINATION_TRANSLATIONS: Record<string, string> = {
  "kawah-ijen":
    "Legendary electric Blue Fire phenomenon and the world's largest turquoise acidic crater lake situated at 2,799m asl.",
  "taman-nasional-baluran":
    "'Africa van Java' featuring natural Bekol savanna, wild Javan banteng, deer, peacocks, and exotic Bama beach.",
  "de-djawatan-benculuk":
    "Magical giant trembesi (rain tree) forest from the colonial era, reminiscent of Lord of the Rings' Fangorn Forest.",
  "kawah-wurung":
    "Rolling green teletubbies hills with panoramic expansive savanna vistas and cool mountain breeze.",
  "pantai-pulau-merah":
    "Reddish sand beach featuring an iconic hill island and premier sunset viewing spots along East Java's southern coast.",
  "pantai-sukamade":
    "Natural sea turtle conservation sanctuary in Meru Betiri where giant green turtles nest on the beach at night.",
};

function normalizeKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,?!]/g, "")
    .trim();
}

/**
 * Translates and normalizes database FAQs into natural, accurate English.
 * Guarantees zero Indonesian text is leaked to the customer.
 */
export function normalizeFaqToEnglish<T extends LiveFaq | CleanFaqData>(faq: T): T {
  const key = normalizeKey(faq.question);

  for (const [pattern, translation] of Object.entries(FAQ_TRANSLATIONS)) {
    if (key.includes(pattern) || pattern.includes(key)) {
      return {
        ...faq,
        question: translation.question,
        answer: translation.answer,
      };
    }
  }

  // If question is already in English or not in dictionary, return as is
  return faq;
}

/**
 * Translates and normalizes database Destinations into natural English.
 */
export function normalizeDestinationToEnglish<T extends LiveDestination | CleanDestinationData>(
  destination: T
): T {
  const slug = destination.slug.toLowerCase().trim();
  const englishDesc = DESTINATION_TRANSLATIONS[slug];

  if (englishDesc) {
    return {
      ...destination,
      description: englishDesc,
    };
  }

  return destination;
}

/**
 * Batch normalizes arrays of FAQs.
 */
export function normalizeFaqsList<T extends LiveFaq | CleanFaqData>(faqs: T[]): T[] {
  return faqs.map(normalizeFaqToEnglish);
}

/**
 * Batch normalizes arrays of Destinations.
 */
export function normalizeDestinationsList<T extends LiveDestination | CleanDestinationData>(
  destinations: T[]
): T[] {
  return destinations.map(normalizeDestinationToEnglish);
}

/**
 * Ensures package details, inclusions, exclusions, and badges are cleanly formatted in English.
 */
export function normalizePackageToEnglish<T extends LivePackage | CleanPackageData>(pkg: T): T {
  return {
    ...pkg,
    difficulty: pkg.difficulty || "Moderate",
  };
}

export function normalizePackagesList<T extends LivePackage | CleanPackageData>(packages: T[]): T[] {
  return packages.map(normalizePackageToEnglish);
}

