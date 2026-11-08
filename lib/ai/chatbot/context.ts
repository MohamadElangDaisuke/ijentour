import { CleanPackageData } from "./tools/packages";

export interface HybridConversationContext {
  language?: "en" | "id";
  lastReferencedPackageId?: string;
  lastReferencedPackageTitle?: string;
  lastComparisonPackageIds?: string[];
  discussedPax?: number;
  discussedDate?: string;
  discussedBudget?: number;
  userIntent?: string;
  turnCount?: number;
  lastIntent?: string;
  lastPackageId?: string;
  [key: string]: any;
}

/**
 * Detect language of query: Indonesian ("id") or English ("en").
 */
export function detectLanguage(text: string, currentLang?: "en" | "id"): "en" | "id" {
  const lower = text.toLowerCase();

  const indonesianIndicators = [
    "halo", "hai", "selamat", "pagi", "siang", "sore", "malam", "apa", "apakah", "berapa", "harga",
    "biaya", "paket", "wisata", "liburan", "kapan", "dimana", "siapa", "mengapa", "kenapa", "bagaimana",
    "bisa", "tolong", "mohon", "saya", "kami", "kita", "kamu", "anda", "mau", "ingin", "pesan",
    "sedia", "ada", "tidak", "bukan", "sudah", "belum", "durasi", "lama", "fasilitas", "termasuk",
    "bawa", "perlengkapan", "murah", "mahal", "rekomendasi", "bandingkan", "anak", "lansia", "naik",
    "kawah", "gunung", "sehat", "surat", "penjemputan", "jadwal", "pax", "orang",
  ];

  const englishIndicators = [
    "hello", "hi", "hey", "good", "morning", "afternoon", "evening", "what", "which", "how", "much",
    "many", "cost", "price", "package", "tour", "trip", "vacation", "holiday", "when", "where", "who",
    "why", "can", "could", "would", "please", "i", "we", "my", "our", "you", "your", "want", "need",
    "book", "available", "duration", "long", "facility", "include", "bring", "gear", "cheap", "expensive",
    "recommend", "compare", "child", "elderly", "hike", "crater", "mountain", "pickup", "schedule", "person",
  ];

  let idScore = 0;
  let enScore = 0;

  const words = lower.split(/[\s,?.!]+/).filter((w) => w.length > 1);
  for (const w of words) {
    if (indonesianIndicators.includes(w)) idScore++;
    if (englishIndicators.includes(w)) enScore++;
  }

  if (idScore > enScore) return "id";
  if (enScore > idScore) return "en";

  return currentLang || "en";
}

/**
 * Resolves pronoun and contextual references in multi-turn conversations.
 * e.g., "Which one is cheaper?", "How long does it take?", "Berapa lama durasinya?"
 */
export function resolveContextualQuery(
  rawQuery: string,
  context: HybridConversationContext,
  packages: CleanPackageData[],
  history?: Array<{ role: string; content: string }>
): {
  resolvedQuery: string;
  inferredPackage?: CleanPackageData;
  isComparisonQuery: boolean;
} {
  const lower = rawQuery.toLowerCase();
  let resolvedQuery = rawQuery;
  let inferredPackage: CleanPackageData | undefined = undefined;
  let isComparisonQuery = false;

  // Check for follow-up "Why?" / "Kenapa?" with prior conversational turn
  if (/^(why|kenapa|mengapa)[\s?!.]*$/i.test(lower) && history && history.length > 1) {
    const priorUserMsgs = history.filter((m) => m.role === "user");
    const prevMsg = priorUserMsgs.length > 1 ? priorUserMsgs[priorUserMsgs.length - 2] : undefined;
    if (prevMsg?.content) {
      resolvedQuery = `${prevMsg.content} (Follow-up reason: why?)`;
    }
  }

  // Detect ordinal references: "second package", "the second one", "paket kedua"
  if (packages.length > 1 && /(second package|2nd package|second tour|the second one|paket kedua|paket no 2|paket nomor 2)/i.test(lower)) {
    inferredPackage = packages[1];
    resolvedQuery = `${rawQuery} (regarding package: "${inferredPackage.title}")`;
  } else if (packages.length > 0 && /(first package|1st package|first tour|the first one|paket pertama|paket no 1|paket nomor 1)/i.test(lower)) {
    inferredPackage = packages[0];
    resolvedQuery = `${rawQuery} (regarding package: "${inferredPackage.title}")`;
  } else if (packages.length > 2 && /(third package|3rd package|third tour|the third one|paket ketiga|paket no 3|paket nomor 3)/i.test(lower)) {
    inferredPackage = packages[2];
    resolvedQuery = `${rawQuery} (regarding package: "${inferredPackage.title}")`;
  } else if (context.lastReferencedPackageId) {
    // Find last referenced package if exists
    inferredPackage = packages.find((p) => p.id === context.lastReferencedPackageId);
  }

  // Detect comparison questions
  const comparisonKeywords = [
    "which one is cheaper", "which one is better", "difference between", "compare", "banding",
    "yang mana lebih murah", "mana yang lebih murah", "bedanya apa", "perbedaan",
  ];

  if (comparisonKeywords.some((k) => lower.includes(k))) {
    isComparisonQuery = true;
  }

  // Check for follow-up questions referencing duration, price, inclusions without mentioning package name
  const followUpPriceKeywords = ["berapa harganya", "berapa biayanya", "how much is it", "how much does it cost", "what is the price"];
  const followUpDurationKeywords = ["berapa lama", "durasinya", "how long is it", "how long does it take", "what is the duration"];
  const followUpInclusionKeywords = ["apa saja fasilitasnya", "apa yang didapat", "what is included", "what's included", "what do we get"];
  const followUpDifficultyKeywords = ["apakah sulit", "tingkat kesulitannya", "is it difficult", "how hard is it", "is it hard"];

  if (inferredPackage) {
    const isPriceInquiry = followUpPriceKeywords.some((k) => lower.includes(k));
    const isDurationInquiry = followUpDurationKeywords.some((k) => lower.includes(k));
    const isInclusionInquiry = followUpInclusionKeywords.some((k) => lower.includes(k));
    const isDifficultyInquiry = followUpDifficultyKeywords.some((k) => lower.includes(k));

    if (isPriceInquiry) {
      resolvedQuery = `${rawQuery} (regarding package: "${inferredPackage.title}")`;
    } else if (isDurationInquiry) {
      resolvedQuery = `${rawQuery} (regarding package: "${inferredPackage.title}")`;
    } else if (isInclusionInquiry) {
      resolvedQuery = `${rawQuery} (regarding package: "${inferredPackage.title}")`;
    } else if (isDifficultyInquiry) {
      resolvedQuery = `${rawQuery} (regarding package: "${inferredPackage.title}")`;
    }
  }

  return {
    resolvedQuery,
    inferredPackage,
    isComparisonQuery,
  };
}

/**
 * Updates context state after a turn.
 */
export function updateContextWithTurn(
  context: HybridConversationContext,
  data: {
    language: "en" | "id";
    referencedPackage?: CleanPackageData;
    comparisonPackages?: CleanPackageData[];
    intent?: string;
  }
): HybridConversationContext {
  const updated: HybridConversationContext = {
    ...context,
    language: data.language,
    turnCount: (context.turnCount || 0) + 1,
  };

  if (data.referencedPackage) {
    updated.lastReferencedPackageId = data.referencedPackage.id;
    updated.lastReferencedPackageTitle = data.referencedPackage.title;
  }

  if (data.comparisonPackages && data.comparisonPackages.length > 0) {
    updated.lastComparisonPackageIds = data.comparisonPackages.map((p) => p.id);
  }

  if (data.intent) {
    updated.userIntent = data.intent;
  }

  return updated;
}
