import { LivePackage, LiveDestination, LiveFaq } from "@/lib/travelAssistant";
import {
  ChatbotClassificationResult,
  ConversationContext,
  ExtractedEntities,
  SupportedLanguage,
} from "./types";
import { matchLiveFaq } from "./faqMatcher";

/**
 * Classify user intent deterministically using rule-based scoring and context
 */
export function classifyIntent(
  normalizedText: string,
  entities: ExtractedEntities,
  context: ConversationContext,
  language: SupportedLanguage,
  livePackages: LivePackage[],
  liveDestinations: LiveDestination[],
  liveFaqs: LiveFaq[]
): ChatbotClassificationResult {
  const text = normalizedText.toLowerCase().trim();

  // 1. Check for OUT OF SCOPE / Unrelated Topics first
  const outOfScopePatterns = [
    /\b(pr|tugas sekolah|homework|matematika|fisika|kimia|koding|coding|python|javascript|html|css|php|react)\b/,
    /\b(politik|pemilu|presiden|menteri|partai|perang|russia|ukraine|israel|gaza|senjata)\b/,
    /\b(resep masakan|cara memasak|resep kue|baking|goreng|nasi goreng|resep masakan)\b/,
    /\b(film|movie|anime|manga|drama korea|drakor|lagu|chord gitar|lirik lagu)\b/,
    /\b(cuaca di (paris|london|tokyo|jakarta|new york|america|australia))\b/,
    /\b(siapa namamu|who made you|siapa penciptamu|openai|chatgpt|deepseek|claude|gemini)\b/,
  ];

  for (const pattern of outOfScopePatterns) {
    if (pattern.test(text)) {
      return {
        intent: "OUT_OF_SCOPE",
        confidence: 0.95,
        language,
        entities,
      };
    }
  }

  // Pure single-word unrelated queries or gibberish check
  const commonUnrelatedWords = [
    "halo siapa kamu", "kamu ai apa", "tes 123", "asdf", "qwerty", "lorem ipsum",
    "bikin puisi", "buatkan cerpen", "tulis artikel tentang kopi", "translate to spanish"
  ];
  if (commonUnrelatedWords.some((w) => text === w || text.startsWith(w))) {
    return {
      intent: "OUT_OF_SCOPE",
      confidence: 0.9,
      language,
      entities,
    };
  }

  // 2. Greeting check (only if text is solely a greeting)
  const greetingWords = ["halo", "hello", "hi", "hai", "selamat pagi", "selamat siang", "selamat sore", "selamat malam", "good morning", "good afternoon", "hey"];
  const isOnlyGreeting = greetingWords.some((g) => text === g || text === g + "!" || text === g + "?");
  if (isOnlyGreeting) {
    return {
      intent: "GREETING",
      confidence: 0.9,
      language,
      entities,
    };
  }

  // 3. Contact Support / Speak to Admin / WhatsApp
  const contactKeywords = [
    "hubungi", "kontak", "nomor wa", "whatsapp", "wa admin", "admin", "customer service",
    "cs", "bicara dengan admin", "bicara dengan orang", "contact", "phone number",
    "call", "speak with agent", "human", "customer support", "telepon", "email"
  ];
  if (contactKeywords.some((kw) => text.includes(kw))) {
    return {
      intent: "CONTACT_SUPPORT",
      confidence: 0.95,
      language,
      entities,
    };
  }

  // 4. Custom Trip Inquiry
  if (
    entities.isCustomTrip ||
    text.includes("custom trip") ||
    text.includes("custom tour") ||
    text.includes("kustom trip") ||
    text.includes("atur perjalanan sendiri") ||
    text.includes("rute sendiri") ||
    text.includes("bisa buat itinerary sendiri") ||
    text.includes("custom package") ||
    text.includes("bikin trip sendiri")
  ) {
    return {
      intent: "CUSTOM_TRIP_INFO",
      confidence: 0.95,
      language,
      entities,
    };
  }

  // 5. Package Comparison
  const comparisonKeywords = ["compare", "bandingkan", "perbandingan", "beda", "bedanya", "perbedaan", "difference between", "which is better", "mana yang lebih"];
  if (
    comparisonKeywords.some((kw) => text.includes(kw)) ||
    (entities.packageIds.length >= 2 && (text.includes("dan") || text.includes("and") || text.includes("vs")))
  ) {
    return {
      intent: "PACKAGE_COMPARISON",
      confidence: 0.9,
      language,
      entities,
    };
  }

  // 6. Booking Procedure
  const bookingKeywords = [
    "cara booking", "cara pesan", "bagaimana booking", "bagaimana pesan", "cara order",
    "cara reservasi", "how to book", "how do i book", "booking procedure", "how to reserve",
    "langkah pemesanan", "pesan paket", "pesan tour", "reservasi paket"
  ];
  if (bookingKeywords.some((kw) => text.includes(kw))) {
    return {
      intent: "BOOKING_PROCEDURE",
      confidence: 0.95,
      language,
      entities,
    };
  }

  // 7. Policies: Payment, Cancellation, Refund
  const policyKeywords = [
    "cara bayar", "metode pembayaran", "payment method", "rekening", "transfer bank",
    "kebijakan pembatalan", "cancellation policy", "refund", "bisa refund", "uang kembali",
    "reschedule", "ganti tanggal", "pembayaran"
  ];
  if (policyKeywords.some((kw) => text.includes(kw))) {
    return {
      intent: "POLICIES_INFO",
      confidence: 0.9,
      language,
      entities,
    };
  }

  // 8. Schedule & Availability
  const scheduleKeywords = [
    "jadwal keberangkatan", "kapan berangkat", "tanggal keberangkatan", "open departure",
    "ketersediaan", "available slot", "slots left", "slot kosong", "ada kuota", "departure date", "schedule"
  ];
  if (scheduleKeywords.some((kw) => text.includes(kw))) {
    return {
      intent: "SCHEDULE_AVAILABILITY",
      confidence: 0.9,
      language,
      entities,
    };
  }

  // 9. Facilities (Inclusions & Exclusions)
  const facilityKeywords = [
    "fasilitas", "termasuk", "tidak termasuk", "include", "included", "exclude", "excluded",
    "inclusions", "exclusions", "dapat apa saja", "fasilitas yang didapat", "dapet apa aja", "what is included"
  ];
  if (facilityKeywords.some((kw) => text.includes(kw))) {
    // If no package mentioned, check context
    if (entities.packageIds.length === 0 && context.lastPackageId) {
      entities.packageIds.push(context.lastPackageId);
    }

    if (entities.packageIds.length === 0) {
      return {
        intent: "AMBIGUOUS_CLARIFICATION",
        confidence: 0.85,
        language,
        entities,
        clarificationPrompt:
          language === "id"
            ? "Paket wisata mana yang ingin Anda ketahui fasilitasnya? Anda dapat menyebutkan nama paketnya agar saya dapat memberikan rincian yang tepat."
            : "Which tour package would you like to know the facilities for? You can mention the package name so I can provide the exact details.",
      };
    }

    return {
      intent: "PACKAGE_FACILITIES",
      confidence: 0.95,
      language,
      entities,
    };
  }

  // 10. Package Itinerary / Rundown
  const itineraryKeywords = [
    "itinerary", "rundown", "jadwal perjalanan", "jadwal trip", "agenda", "rute perjalanan",
    "susunan acara", "timeline", "itinerari", "day 1", "hari ke"
  ];
  if (itineraryKeywords.some((kw) => text.includes(kw))) {
    if (entities.packageIds.length === 0 && context.lastPackageId) {
      entities.packageIds.push(context.lastPackageId);
    }

    if (entities.packageIds.length === 0) {
      return {
        intent: "AMBIGUOUS_CLARIFICATION",
        confidence: 0.85,
        language,
        entities,
        clarificationPrompt:
          language === "id"
            ? "Paket wisata mana yang ingin Anda ketahui jadwal perjalanannya (itinerary)? Anda dapat menyebutkan nama paketnya."
            : "Which tour package would you like to view the itinerary for? You can mention the package name.",
      };
    }

    return {
      intent: "PACKAGE_ITINERARY",
      confidence: 0.95,
      language,
      entities,
    };
  }

  // 11. Package Duration
  const durationKeywords = [
    "durasi", "duration", "berapa lama", "how long", "how long does it take",
    "berapa jam", "berapa hari", "lama perjalanan", "how many days", "how many hours"
  ];
  if (durationKeywords.some((kw) => text.includes(kw))) {
    if (entities.packageIds.length === 0 && context.lastPackageId) {
      entities.packageIds.push(context.lastPackageId);
    }

    if (entities.packageIds.length === 0) {
      return {
        intent: "AMBIGUOUS_CLARIFICATION",
        confidence: 0.85,
        language,
        entities,
        clarificationPrompt:
          language === "id"
            ? "Paket wisata mana yang ingin Anda ketahui durasinya? Anda dapat menyebutkan nama paketnya."
            : "Which tour package would you like to know the duration of? You can mention the package name.",
      };
    }

    return {
      intent: "PACKAGE_DURATION",
      confidence: 0.95,
      language,
      entities,
    };
  }

  // 12. Package Price
  const priceKeywords = [
    "harga", "biaya", "tarif", "price", "pricing", "cost", "how much", "how much is",
    "berapa harganya", "berapa biayanya", "how much does it cost", "rate"
  ];
  const hasPriceKeyword = priceKeywords.some((kw) => text.includes(kw));

  if (hasPriceKeyword) {
    // If user specified a budget or requested a recommendation, prioritize recommendation
    if (entities.maxBudget || text.includes("rekomendasi") || text.includes("recommend") || text.includes("murah") || text.includes("budget")) {
      return {
        intent: "PACKAGE_RECOMMENDATION",
        confidence: 0.9,
        language,
        entities,
      };
    }

    // If package is specified in query
    if (entities.packageIds.length > 0) {
      return {
        intent: "PACKAGE_PRICE",
        confidence: 0.95,
        language,
        entities,
      };
    }

    // If context has lastPackageId
    if (context.lastPackageId) {
      entities.packageIds.push(context.lastPackageId);
      return {
        intent: "PACKAGE_PRICE",
        confidence: 0.9,
        language,
        entities,
      };
    }

    // Ambiguous price query with NO package mentioned and NO context
    // Prompt 9.A: "Misalnya customer hanya menulis “price” ketika ada beberapa paket."
    return {
      intent: "AMBIGUOUS_CLARIFICATION",
      confidence: 0.95,
      language,
      entities,
      clarificationPrompt:
        language === "id"
          ? "Paket wisata mana yang ingin Anda ketahui harganya? Anda dapat menyebutkan nama paketnya agar saya dapat memberikan informasi yang tepat."
          : "Which tour package would you like to know the price of? You can mention the package name so I can provide the correct information.",
    };
  }

  // 13. Package Recommendations by Budget, Duration, or Criteria
  const recommendationKeywords = [
    "rekomendasi", "recommend", "recommendation", "paket murah", "murah", "cheap",
    "budget", "anggaran", "terjangkau", "affordable", "saran", "suggest", "suggestion",
    "paling cocok", "best for", "pemula", "keluarga", "family"
  ];
  if (
    entities.maxBudget !== undefined ||
    recommendationKeywords.some((kw) => text.includes(kw))
  ) {
    return {
      intent: "PACKAGE_RECOMMENDATION",
      confidence: 0.9,
      language,
      entities,
    };
  }

  // 14. List All Packages / Catalog
  const catalogKeywords = [
    "daftar paket", "paket apa saja", "paket wisata", "lihat paket", "semua paket",
    "list packages", "available packages", "show packages", "all tours", "tour catalog",
    "pilihan paket", "apa saja paketnya", "katalog", "paket"
  ];
  if (
    catalogKeywords.some((kw) => text === kw || text.includes(kw)) &&
    entities.packageIds.length === 0
  ) {
    return {
      intent: "LIST_PACKAGES",
      confidence: 0.9,
      language,
      entities,
    };
  }

  // 15. Check FAQ Matching
  const faqMatch = matchLiveFaq(text, liveFaqs);
  if (faqMatch.matchedFaq && faqMatch.score >= 0.45) {
    return {
      intent: "FAQ_QUESTION",
      confidence: faqMatch.score,
      language,
      entities,
      matchedFaq: faqMatch.matchedFaq,
    };
  }

  // 16. Destination Inquiry
  if (entities.destinationSlugs.length > 0) {
    return {
      intent: "DESTINATION_INFO",
      confidence: 0.85,
      language,
      entities,
    };
  }

  // 17. Single Package mention without explicit intent (e.g., "Midnight Expedition Blue Fire")
  if (entities.packageIds.length === 1) {
    return {
      intent: "PACKAGE_PRICE",
      confidence: 0.8,
      language,
      entities,
    };
  }

  // 18. General fallback: if contains tour-related words (ijen, bromo, banyuwangi, trip, tour, gunung, kawah), ask clarification
  const generalTravelKeywords = [
    "ijen", "kawah", "gunung", "banyuwangi", "bromo", "trip", "tour", "travel", "jalan", "liburan", "vacation"
  ];
  if (generalTravelKeywords.some((kw) => text.includes(kw))) {
    return {
      intent: "AMBIGUOUS_CLARIFICATION",
      confidence: 0.7,
      language,
      entities,
      clarificationPrompt:
        language === "id"
          ? "Pertanyaan Anda terkait layanan Ijen Tour belum cukup spesifik. Anda dapat menanyakan tentang daftar paket, harga, jadwal, fasilitas, destinasi, atau rekomendasi sesuai budget."
          : "Your question related to Ijen Tour services is a bit broad. You can ask about our tour package catalog, prices, duration, facilities, destinations, or get recommendations based on your budget.",
    };
  }

  // 19. Out of Scope fallback
  return {
    intent: "OUT_OF_SCOPE",
    confidence: 0.95,
    language,
    entities,
  };
}
