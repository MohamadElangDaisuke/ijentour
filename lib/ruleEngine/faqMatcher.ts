import { LiveFaq } from "@/lib/travelAssistant";

export interface FaqMatchResult {
  matchedFaq?: LiveFaq;
  score: number;
}

/**
 * Multi-tier deterministic FAQ matcher against live database FAQs
 */
export function matchLiveFaq(normalizedQuery: string, liveFaqs: LiveFaq[]): FaqMatchResult {
  if (!liveFaqs || liveFaqs.length === 0) {
    return { score: 0 };
  }

  const queryTokens = normalizedQuery
    .split(/\s+/)
    .map((t) => t.replace(/[.,?!]/g, ""))
    .filter((t) => t.length > 2);

  let bestFaq: LiveFaq | undefined;
  let highestScore = 0;

  // Explicit Topic Synonym Rules to map questions deterministically
  const topicRules: Array<{
    keywords: string[];
    synonyms: string[];
    categoryMatch?: string;
  }> = [
    {
      // Blue Fire visibility / timing
      keywords: ["blue fire", "api biru", "fenomena"],
      synonyms: ["selalu ada", "setiap malam", "terlihat", "kapan", "bisa lihat", "visible", "guaranteed", "appear", "jam berapa", "see", "always", "every night"],
      categoryMatch: "general",
    },
    {
      // Safety for children, elderly, beginner, trolley taxi
      keywords: ["aman", "safe", "safety", "anak", "child", "children", "kids", "lansia", "elderly", "tua", "pemula", "beginner", "troli", "trolley"],
      synonyms: ["mendaki", "hike", "hiking", "trekking", "jalan kaki", "kuat", "bisa", "jalur", "trail", "difficulty", "easy", "hard", "can i"],
      categoryMatch: "safety",
    },
    {
      // Preparation, packing list, what to bring, pickup time, gas mask
      keywords: ["bawa", "perlengkapan", "bring", "packing", "persiapan", "prepare", "jaket", "sepatu", "masker", "gas mask", "respirator", "penjemputan", "pickup"],
      synonyms: ["pickup time", "what should", "what to bring", "apa saja", "harus bawa", "apa yang perlu", "waktu penjemputan", "what to wear", "clothes", "gear", "senter", "headlamp", "waktu", "jam", "shoes", "jacket", "need"],
      categoryMatch: "preparation",
    },
    {
      // Booking & payment procedure
      keywords: ["booking", "pesan", "pemesanan", "bayar", "pembayaran", "payment", "order", "reserve", "reservasi"],
      synonyms: ["bagaimana", "cara", "langkah", "how to", "process", "metode", "transfer", "bank", "dp"],
      categoryMatch: "booking",
    },
    {
      // Cancellation & Refund
      keywords: ["batal", "pembatalan", "cancel", "cancellation", "refund", "uang kembali"],
      synonyms: ["bagaimana jika", "kebijakan", "policy", "reschedule", "jadwal ulang", "money back"],
    },
  ];

  // 1. Check Topic Rules first against DB FAQs
  for (const rule of topicRules) {
    const matchedKeywords = rule.keywords.filter((kw) => normalizedQuery.includes(kw));
    const hasKeyword = matchedKeywords.length > 0;
    const hasSynonym = rule.synonyms.some((syn) => normalizedQuery.includes(syn));

    // Match if has both keyword + synonym, OR multiple strong keywords
    if ((hasKeyword && hasSynonym) || matchedKeywords.length >= 2) {
      let matched: LiveFaq | undefined;

      // 1. Prioritize categoryMatch if defined
      if (rule.categoryMatch) {
        matched = liveFaqs.find(
          (f) => f.category.toLowerCase() === rule.categoryMatch!.toLowerCase()
        );
      }

      // 2. Fallback to question / keyword match
      if (!matched) {
        matched = liveFaqs.find((f) => {
          const qText = f.question.toLowerCase();
          return rule.keywords.some((kw) => qText.includes(kw));
        });
      }

      if (matched) {
        return { matchedFaq: matched, score: 0.95 };
      }
    }
  }

  // 2. Token overlap & substring match across each FAQ question in DB
  for (const faq of liveFaqs) {
    const questionLower = faq.question.toLowerCase();
    const answerLower = faq.answer.toLowerCase();

    // Direct substring match
    if (questionLower.includes(normalizedQuery) || normalizedQuery.includes(questionLower)) {
      return { matchedFaq: faq, score: 0.99 };
    }

    // Token match scoring
    const faqTokens = questionLower
      .split(/\s+/)
      .map((t) => t.replace(/[.,?!]/g, ""))
      .filter((t) => t.length > 2);

    let matchCount = 0;
    for (const qTok of queryTokens) {
      if (faqTokens.includes(qTok) || answerLower.includes(qTok)) {
        matchCount++;
      }
    }

    const score = queryTokens.length > 0 ? matchCount / queryTokens.length : 0;
    if (score > highestScore) {
      highestScore = score;
      bestFaq = faq;
    }
  }

  // Threshold: at least 45% token match or 3 tokens
  if (highestScore >= 0.45 && bestFaq) {
    return { matchedFaq: bestFaq, score: highestScore };
  }

  return { score: 0 };
}
