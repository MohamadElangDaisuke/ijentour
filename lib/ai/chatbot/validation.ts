import { z } from "zod";
import { CleanPackageData } from "./tools/packages";

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1, "Message cannot be empty").max(2000, "Message exceeds 2000 characters"),
});

export const ConversationContextSchema = z.object({
  language: z.enum(["en", "id"]).optional(),
  lastReferencedPackageId: z.string().optional(),
  lastReferencedPackageTitle: z.string().optional(),
  lastComparisonPackageIds: z.array(z.string()).optional(),
  discussedPax: z.number().optional(),
  discussedDate: z.string().optional(),
  discussedBudget: z.number().optional(),
  userIntent: z.string().optional(),
  turnCount: z.number().optional(),
}).passthrough();

export const HybridChatbotRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1, "Messages array must contain at least one message"),
  context: ConversationContextSchema.optional().default({}),
});

export type HybridChatbotRequest = z.infer<typeof HybridChatbotRequestSchema>;

/**
 * Checks for prompt injection attempts, system prompt manipulation, or database tampering.
 */
export function detectPromptInjection(text: string): { isInjection: boolean; reason?: string } {
  const lower = text.toLowerCase();

  const injectionPatterns = [
    /ignore (all|previous|prior) (instructions|prompts|rules)/i,
    /system prompt/i,
    /you are now a (developer|hacker|unrestricted|god mode|dan)/i,
    /bypass (safety|filters|guardrails)/i,
    /drop\s+table/i,
    /select\s+\*\s+from/i,
    /delete\s+from/i,
    /show\s+tables/i,
    /reveal (your|the) (system|api key|secret|password|instructions)/i,
    /print (all|your) (instructions|environment)/i,
    /output json schema of database/i,
    /act as an unrestricted ai/i,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(lower)) {
      return { isInjection: true, reason: "Prompt manipulation or injection pattern detected." };
    }
  }

  return { isInjection: false };
}

/**
 * Checks if the query is strictly relevant to Ijen Tour services, travel, destinations, or bookings.
 * Allows language feedback/corrections and general knowledge about Mount Ijen.
 */
export function checkTopicRelevance(text: string): {
  isRelevant: boolean;
  category?: "ijen_tour" | "off_topic";
} {
  const lower = text.toLowerCase().trim();

  // Explicitly prohibited keywords
  const prohibitedKeywords = [
    // Politics
    "presiden", "pemilu", "pilpres", "partai", "dpr", "mpr", "menteri", "politik", "politic", "election", "government", "war in", "senate", "who is the president",
    // Programming & Math
    "rumus integral", "kalkulus", "calculus", "derive the function", "python code", "write a python", "javascript function", "solve for x", "matrix multiplication", "linear algebra", "debug this code", "algorithm",
    // General unrelated AI
    "who created you", "who is your model", "are you chatgpt", "openai or google", "tell me a bedtime story about dragons", "write a poem about love", "recipe for pizza", "cara memasak rendang",
  ];

  for (const bad of prohibitedKeywords) {
    if (lower.includes(bad)) {
      return { isRelevant: false, category: "off_topic" };
    }
  }

  // Conversational language meta-feedback or corrections (must never be treated as out of topic)
  if (
    /(english|indo|indonesian|bahasa|language|speak|explain|apologize|sorry)/i.test(lower) &&
    /(why|please|tolong|pakai|gunakan|use|speak|explain|still|bisa|in english)/i.test(lower)
  ) {
    return { isRelevant: true, category: "ijen_tour" };
  }

  // Conversational greetings
  if (/^(halo|hai|hi|hello|pagi|siang|malam|good morning|good afternoon|help|bantuan)[\s!.]*$/i.test(lower)) {
    return { isRelevant: true, category: "ijen_tour" };
  }

  // Allowed domain keywords
  const allowedKeywords = [
    "package", "packages", "offer", "catalog", "katalog", "available", "list",
    "ijen", "kawah", "crater", "blue fire", "api biru", "paket", "tour", "trip", "wisata", "liburan", "vacation",
    "banyuwangi", "bondowoso", "paltuding", "gunung", "mountain", "volcano", "baluran", "djawatan", "de djawatan",
    "kawah wurung", "sukamade", "red island", "pulau merah", "bromo", "tumpak sewu", "harga", "biaya", "tarif", "cost", "price",
    "budget", "jadwal", "schedule", "date", "tanggal", "durasi", "duration", "hari", "day", "malam", "night",
    "itinerary", "rute", "fasilitas", "facility", "include", "termasuk", "exclude", "tidak termasuk", "masker",
    "gas mask", "respirator", "sepatu", "baju", "jaket", "suhu", "dingin", "cold", "weather", "cuaca", "sehat", "surat sehat",
    "anak", "lansia", "troli", "trolley", "taxi ijen", "safety", "aman", "bahaya", "booking", "pesan", "reservasi",
    "custom", "pax", "orang", "person", "group", "rombongan", "private", "open trip", "sharing", "midnight",
    "sunrise", "penjemputan", "pickup", "hotel", "stasiun", "bandara", "ferry", "bali", "gilimanuk", "ketapang",
    "faq", "kontak", "wa", "whatsapp", "admin", "guide", "pemandu", "rekomendasi", "recommend", "banding", "compare",
    "murah", "cheaper", "expensive", "mahal", "pemula", "beginner", "bawa", "bring", "packing", "pembatalan", "cancel",
    "hrg", "brp", "brpa", "pket", "pkt", "ijn", "rekom",
    // Geographical & General Ijen knowledge terms
    "located", "location", "lokasi", "where is", "what is", "about ijen", "geography", "elevation", "height",
    "second package", "2nd package", "paket kedua", "book this tour", "can i book",
  ];

  const matchesDomain = allowedKeywords.some((kw) => lower.includes(kw));

  if (matchesDomain) {
    return { isRelevant: true, category: "ijen_tour" };
  }

  // General travel words
  const generalTravelWords = ["travel", "tour", "book", "cost", "jalan", "perjalanan", "tiket", "ticket", "guide", "sopir", "driver"];
  if (generalTravelWords.some((w) => lower.includes(w))) {
    return { isRelevant: true, category: "ijen_tour" };
  }

  return { isRelevant: false, category: "off_topic" };
}

/**
 * Polite standardized fallback messages when customer asks outside the scope of Ijen Tour.
 * English-only requirement: All customer-facing messages must be in English.
 */
export function getOffTopicResponse(_language?: "en" | "id"): string {
  return "I'm here to help with Mount Ijen tours, destinations, travel information, and Ijen Tour services. Could you ask me something related to your trip?";
}

/**
 * Deterministic grounding: ensures all package recommendations strictly exist in active database records.
 * Strips any hallucinated IDs and updates prices to live verified database values.
 */
export function groundPackageRecommendations(
  candidatePackageIds: string[],
  livePackages: CleanPackageData[]
): CleanPackageData[] {
  if (!candidatePackageIds || candidatePackageIds.length === 0) return [];

  const verified: CleanPackageData[] = [];
  const addedIds = new Set<string>();

  for (const cand of candidatePackageIds) {
    const found = livePackages.find(
      (p) =>
        p.isActive &&
        (p.id.toLowerCase() === cand.toLowerCase() ||
          p.slug.toLowerCase() === cand.toLowerCase() ||
          p.title.toLowerCase().includes(cand.toLowerCase()))
    );

    if (found && !addedIds.has(found.id)) {
      addedIds.add(found.id);
      verified.push(found);
    }
  }

  return verified;
}

/**
 * Standard natural language fallback responses.
 */
export const GREETING_RESPONSE_EN =
  "Hello! How can I help you with your Mount Ijen trip today?";

export const CLARIFICATION_FALLBACK_EN =
  "Sorry, I couldn't quite understand that. Could you tell me a little more about what you'd like to know?";

export const SINGLE_CHAR_FALLBACK_EN =
  "Could you please provide a little more detail so I can help you?";

export const OUT_OF_TOPIC_RESPONSE_EN =
  "I'm here to help with Mount Ijen tours, destinations, travel information, and Ijen Tour services. Could you ask me something related to your trip?";

export const UNAVAILABLE_INFO_RESPONSE_EN =
  "Sorry, I couldn't find that information in our current website data. Would you like to contact our team through WhatsApp for further assistance?";

export const BOOKING_ASSISTANCE_RESPONSE_EN =
  "Would you like to proceed with a booking? Our team can assist you through WhatsApp.";

export const ACKNOWLEDGEMENT_RESPONSE_EN =
  "Great! Is there anything else you would like to know about Mount Ijen or our tour packages? I'm here to help.";

export const WHY_ISOLATED_RESPONSE_EN =
  "Could you specify what you'd like to know more about? For instance, are you asking about hiking guidelines, safety equipment, or our tour packages?";

// Backwards compatibility alias
export const CLARIFICATION_FALLBACK_ID = CLARIFICATION_FALLBACK_EN;

export type ValidatedIntent =
  | "GREETING"
  | "ACKNOWLEDGEMENT"
  | "FOLLOW_UP"
  | "FOLLOW_UP_ISOLATED"
  | "UNCLEAR"
  | "OUT_OF_TOPIC"
  | "TOUR_INQUIRY"
  | "CORRECTION_LANGUAGE"
  | "GENERAL_KNOWLEDGE"
  | "WEATHER_INQUIRY"
  | "SAFETY_INFO"
  | "BOOKING_INQUIRY";

export interface InputValidationAndIntentResult {
  isValid: boolean;
  intent: ValidatedIntent;
  language: "en" | "id";
  reason?: string;
  responseMessage?: string;
  suggestedPrompts?: string[];
}

/**
 * Validates customer input before sending to Gemini and classifies intent early.
 * Prevents hallucinations, random tool invocations, and wasted API quota on single chars or gibberish.
 * Strictly outputs customer-facing responses in natural, friendly English.
 */
export function validateAndClassifyInput(params: {
  rawQuery: string;
  normalizedQuery: string;
  language: "en" | "id";
  context?: {
    turnCount?: number;
    lastReferencedPackageId?: string;
    language?: "en" | "id";
    discussedPax?: number;
    discussedBudget?: number;
    [key: string]: any;
  };
  history?: Array<{ role: string; content: string }>;
}): InputValidationAndIntentResult {
  const { rawQuery, normalizedQuery, context = {}, history = [] } = params;
  const trimmed = rawQuery.trim();
  const lower = trimmed.toLowerCase();

  // Retain input language detection for context awareness
  let detectedInputLang: "en" | "id" = params.language;
  if (lower === "p" || /^(iya|makasih|terima kasih|kenapa|ngga|gak|gamau|mau|mana|brp|hrg|halo|hai)/i.test(lower)) {
    detectedInputLang = "id";
  } else if (/^(hi|hello|hey|why|ok|okay|thanks|thank you|can you|recommend)/i.test(lower)) {
    detectedInputLang = "en";
  } else if (context.language) {
    detectedInputLang = context.language;
  }

  // Common English suggested prompts
  const defaultPrompts = ["View tour packages", "How much is Blue Fire tour?", "Can you recommend a tour?"];

  // 1. Empty message
  if (trimmed.length === 0) {
    return {
      isValid: false,
      intent: "UNCLEAR",
      language: detectedInputLang,
      reason: "Message is empty.",
      responseMessage: CLARIFICATION_FALLBACK_EN,
      suggestedPrompts: defaultPrompts,
    };
  }

  // 2. Single Character inputs (e.g., "p", "h", "a", "1", "?")
  if (trimmed.length === 1) {
    return {
      isValid: false,
      intent: "UNCLEAR",
      language: detectedInputLang,
      reason: "Single character input without clear meaning.",
      responseMessage: SINGLE_CHAR_FALLBACK_EN,
      suggestedPrompts: defaultPrompts,
    };
  }

  // 3. Pure Symbols / Punctuation (e.g., "???", "!?!", "...", "$$$")
  if (!/[a-zA-Z0-9]/.test(trimmed)) {
    return {
      isValid: false,
      intent: "UNCLEAR",
      language: detectedInputLang,
      reason: "Punctuation/symbols only with no alphanumeric content.",
      responseMessage: CLARIFICATION_FALLBACK_EN,
      suggestedPrompts: defaultPrompts,
    };
  }

  // 4. Pure Numbers without context (e.g., "123", "9999")
  const isDigitsOnly = /^\d+$/.test(trimmed);
  if (isDigitsOnly) {
    const lastAssistantMsg = history
      .slice()
      .reverse()
      .find((m) => m.role === "assistant")?.content?.toLowerCase() || "";

    const isContextualNumber =
      lastAssistantMsg.includes("berapa orang") ||
      lastAssistantMsg.includes("how many people") ||
      lastAssistantMsg.includes("budget") ||
      lastAssistantMsg.includes("anggaran") ||
      Boolean(context.discussedPax) ||
      Boolean(context.discussedBudget);

    if (!isContextualNumber) {
      return {
        isValid: false,
        intent: "UNCLEAR",
        language: detectedInputLang,
        reason: "Standalone number with no conversational context.",
        responseMessage: CLARIFICATION_FALLBACK_EN,
        suggestedPrompts: defaultPrompts,
      };
    }
  }

  // 5. Gibberish / Keyboard Smashes (e.g., "asdfgh", "qwerty", "zzzzz", 5+ consecutive consonants)
  const isRepeatedChar = /^(.)\1{3,}$/i.test(trimmed);
  const isKeyboardRow = /^(asdfgh|qwerty|zxcvbn|lkjhgf|poiuyt|mnbvc)/i.test(lower);
  const hasExcessiveConsonants = /[bcdfghjklmnpqrstvwxyz]{5,}/i.test(trimmed);
  const isLongWithoutVowel = trimmed.length >= 4 && !/[aeiouy]/i.test(trimmed);

  if (isRepeatedChar || isKeyboardRow || hasExcessiveConsonants || isLongWithoutVowel) {
    return {
      isValid: false,
      intent: "UNCLEAR",
      language: detectedInputLang,
      reason: "Gibberish or keyboard smash detected.",
      responseMessage: CLARIFICATION_FALLBACK_EN,
      suggestedPrompts: defaultPrompts,
    };
  }

  // 6. Greetings (e.g., "Hi", "Hello", "Halo", "Selamat pagi", "Hey")
  if (/^(hi|hello|hey|halo|hai|selamat pagi|selamat siang|selamat sore|selamat malam|pagi|siang|malam|good morning|good afternoon|good evening)[\s!.]*$/i.test(lower)) {
    return {
      isValid: true,
      intent: "GREETING",
      language: detectedInputLang,
      responseMessage: GREETING_RESPONSE_EN,
      suggestedPrompts: ["View tour packages", "Tour prices", "Can you recommend a tour?"],
    };
  }

  // 7. Acknowledgements / Affirmations (e.g., "OK", "Okay", "Oke", "Baik", "Thanks", "Terima kasih")
  if (/^(ok|okay|oke|sip|baik|siap|noted|thanks|thank you|terima kasih|makasih|thx|ty)[\s!.]*$/i.test(lower)) {
    return {
      isValid: true,
      intent: "ACKNOWLEDGEMENT",
      language: detectedInputLang,
      responseMessage: ACKNOWLEDGEMENT_RESPONSE_EN,
      suggestedPrompts: ["View tour packages", "Tour prices", "Contact WhatsApp support"],
    };
  }

  // 8. Language Correction / Complaint / Instruction (Section 6)
  // e.g. "Why still Indo language?", "Please explain in English", "Speak in English", "In English please"
  const isLanguageCorrection =
    /(why still|why are you|why is it|kenapa masih|kok masih|use|speak|explain|tolong|pakai|ganti).*(indo|indonesian|bahasa indonesia|english|bahasa inggris)/i.test(lower) ||
    /^(please explain in english|in english please|english please|speak english|speak in english|use english|use english please|can you speak english)[\s?!.]*$/i.test(lower) ||
    /^(why still indo language|why still indo|why still indonesian)[\s?!.]*$/i.test(lower) ||
    /^(kenapa masih bahasa indonesia|tolong bahasa inggris|pakai bahasa inggris)[\s?!.]*$/i.test(lower);

  if (isLanguageCorrection) {
    // Inspect previous customer message from history to answer in English
    const priorUserMsgs = history.filter((m) => m.role === "user");
    const lastSubstantiveQuery =
      priorUserMsgs.length > 1
        ? priorUserMsgs[priorUserMsgs.length - 2].content.toLowerCase()
        : "";

    let correctiveResponse = "Sorry about that. I'll provide all responses in English. ";

    if (lastSubstantiveQuery.includes("what is ijen") || lastSubstantiveQuery.includes("apa itu ijen")) {
      correctiveResponse +=
        "Mount Ijen is a volcanic complex in East Java, Indonesia, known for its acidic crater lake and blue fire phenomenon.";
    } else if (lastSubstantiveQuery.includes("blue fire")) {
      correctiveResponse +=
        "Blue Fire is a natural volcanic phenomenon where ignited sulfuric gases create electric blue flames inside Mount Ijen crater.";
    } else if (lastSubstantiveQuery.includes("where is") || lastSubstantiveQuery.includes("dimana")) {
      correctiveResponse +=
        "Mount Ijen is located in East Java, Indonesia, bordering Banyuwangi and Bondowoso regencies.";
    } else {
      correctiveResponse += "How can I help you with your Mount Ijen trip today?";
    }

    return {
      isValid: true,
      intent: "CORRECTION_LANGUAGE",
      language: "en",
      responseMessage: correctiveResponse,
      suggestedPrompts: ["View tour packages", "How much is Blue Fire tour?", "Can you recommend a tour?"],
    };
  }

  // 9. Weather Today Inquiry (Section 4 & 9)
  // Explains limitation honestly since no live weather sensor API is integrated
  const isWeatherInquiry =
    /^(what is the weather|how is the weather|weather today|current weather|cuaca hari ini|perkiraan cuaca|suhu hari ini)[\s?!.]*$/i.test(lower) ||
    ((lower.includes("weather") || lower.includes("cuaca")) &&
      (lower.includes("today") || lower.includes("hari ini") || lower.includes("now") || lower.includes("sekarang")));

  if (isWeatherInquiry) {
    return {
      isValid: true,
      intent: "WEATHER_INQUIRY",
      language: detectedInputLang,
      responseMessage:
        "As an AI travel assistant, I do not have integration with real-time live weather station sensors today. However, typical weather at Mount Ijen features cool night temperatures between 8°C and 12°C, often dropping lower with summit winds. The dry season (April to October) generally offers clear skies, while the rainy season (November to March) can cause slippery trails and heavier fog. For live summit conditions and daily hiking advisories today, we recommend checking local forecasts or reaching out to our Ijen Tour coordinators on WhatsApp.",
      suggestedPrompts: ["What should I bring?", "View tour packages", "Contact WhatsApp support"],
    };
  }

  // 10. General Knowledge: "What is Ijen?" (Section 3 & 4)
  const isWhatIsIjen =
    /^(what is|tell me about|explain|apa itu|apakah itu) (mount ijen|kawah ijen|ijen|gunung ijen)[\s?!.]*$/i.test(lower) ||
    /^(what is ijen|apa itu ijen|what is mount ijen)[\s?!.]*$/i.test(lower);

  if (isWhatIsIjen) {
    return {
      isValid: true,
      intent: "GENERAL_KNOWLEDGE",
      language: detectedInputLang,
      responseMessage:
        "Mount Ijen (Kawah Ijen) is an active stratovolcano complex located in East Java, Indonesia, rising to an elevation of 2,769 meters above sea level. It is world-renowned for its striking turquoise acidic crater lake—the largest highly acidic lake in the world—and the rare, mesmerizing electric Blue Fire phenomenon visible inside the crater at night. Mount Ijen is also famous for its traditional sulfur miners who hand-carry heavy sulfur blocks up the steep crater rim daily.",
      suggestedPrompts: ["Where is Mount Ijen located?", "What is Blue Fire?", "View tour packages"],
    };
  }

  // 11. General Knowledge: "What is Blue Fire?"
  const isWhatIsBlueFire =
    /^(what is|tell me about|explain|apa itu) (the blue fire|blue fire|api biru)[\s?!.]*$/i.test(lower) ||
    /^(what is blue fire|apa itu blue fire)[\s?!.]*$/i.test(lower);

  if (isWhatIsBlueFire) {
    return {
      isValid: true,
      intent: "GENERAL_KNOWLEDGE",
      language: detectedInputLang,
      responseMessage:
        "The electric Blue Fire of Mount Ijen is an extraordinary natural wonder caused by high-pressure sulfuric gases emerging from deep volcanic vents at temperatures up to 600°C. When these concentrated gases come into contact with oxygen in the atmosphere at night, they ignite and burn with an intense, electric-blue flame reaching up to 5 meters high. Visible only in total darkness between 02:00 AM and 04:30 AM, Kawah Ijen is one of only two places on Earth where this phenomenon can be consistently observed.",
      suggestedPrompts: ["How much is the Blue Fire tour?", "Is it safe to hike Ijen?", "View tour packages"],
    };
  }

  // 12. General Knowledge: "Where is Mount Ijen located?"
  const isWhereIsIjen =
    /^(where is|where is located|dimana|lokasi|dimanakah) (mount ijen|kawah ijen|ijen|gunung ijen)[\s\w]*$/i.test(lower) ||
    lower.includes("where is mount ijen") ||
    lower.includes("where is ijen located");

  if (isWhereIsIjen) {
    return {
      isValid: true,
      intent: "GENERAL_KNOWLEDGE",
      language: detectedInputLang,
      responseMessage:
        "Mount Ijen is located in East Java, Indonesia, situated along the geographical border between Banyuwangi Regency and Bondowoso Regency. The standard trekking basecamp and park entrance is Paltuding, situated approximately 1.5 to 2 hours' drive from Banyuwangi city center and the Ketapang Ferry Port (the main crossing point from Bali).",
      suggestedPrompts: ["What packages do you offer?", "How much is the Blue Fire tour?", "What is Ijen?"],
    };
  }

  // 13. Verified Safety Inquiry: "Is it safe to hike Ijen?" (Section 3 & 4)
  const isGeneralSafety =
    /^(is it safe to hike|is ijen safe|is it safe|safety of hiking|apakah aman mendaki ijen)/i.test(lower) &&
    !/(anak|child|children|kids|lansia|elderly|tua|troli|trolley)/i.test(lower);

  if (isGeneralSafety) {
    return {
      isValid: true,
      intent: "SAFETY_INFO",
      language: detectedInputLang,
      responseMessage:
        "Hiking Mount Ijen is a moderate to challenging 3.0 to 3.5 km trek taking approximately 1.5 to 2.5 hours at a steady pace, featuring steep dirt inclines of up to 35 degrees. While safe for individuals with normal physical fitness, it requires essential precautions due to cold night temperatures (8-12°C) and toxic sulfur dioxide (SO2) volcanic gases near the crater rim. Certified respirator gas masks are mandatory. Hikers are officially required to obtain a medical health certificate before climbing, and the trek is not recommended for individuals with severe asthma, heart conditions, respiratory ailments, or pregnant women. For children or elderly travelers, local licensed 'Trolley Taxis' (troli tambang) are available at Paltuding Basecamp.",
      suggestedPrompts: ["What should I bring?", "What packages do you offer?", "Contact WhatsApp support"],
    };
  }

  // 14. Booking Assistance: "Can I book this tour?" / "How can I book?"
  const isDirectBooking =
    /^(can i book|how can i book|can we book|i want to book|mau booking|bisa booking|cara pesan|booking this tour)/i.test(lower) ||
    lower === "can i book this tour?" ||
    lower === "can i book this tour";

  if (isDirectBooking) {
    return {
      isValid: true,
      intent: "BOOKING_INQUIRY",
      language: detectedInputLang,
      responseMessage:
        "Would you like to proceed with a booking? Our team can assist you through WhatsApp. You can also click 'Book This Tour' on any package card to select your departure date and reserve your slots.",
      suggestedPrompts: ["View tour packages", "Contact WhatsApp support", "Tour prices"],
    };
  }

  // 15. Short Questions like "Why?" / "Kenapa?"
  if (/^(why|kenapa|mengapa)[\s?!.]*$/i.test(lower)) {
    const hasPriorTurns = history.length > 1 || (context.turnCount && context.turnCount > 0) || Boolean(context.lastReferencedPackageId);
    if (hasPriorTurns) {
      return {
        isValid: true,
        intent: "FOLLOW_UP",
        language: detectedInputLang,
      };
    } else {
      return {
        isValid: true,
        intent: "FOLLOW_UP_ISOLATED",
        language: detectedInputLang,
        responseMessage: WHY_ISOLATED_RESPONSE_EN,
        suggestedPrompts: ["Ijen hiking preparation", "Why is a gas mask required?", "Can you recommend a tour?"],
      };
    }
  }

  // 16. Topic Boundary Check (Section 9 Out of Topic)
  const topicCheck = checkTopicRelevance(normalizedQuery);
  if (!topicCheck.isRelevant) {
    return {
      isValid: true,
      intent: "OUT_OF_TOPIC",
      language: detectedInputLang,
      responseMessage: OUT_OF_TOPIC_RESPONSE_EN,
      suggestedPrompts: ["Show tour packages", "How much is Blue Fire tour?", "How to book a trip"],
    };
  }

  // 17. Valid Tour Inquiry
  return {
    isValid: true,
    intent: "TOUR_INQUIRY",
    language: detectedInputLang,
  };
}
