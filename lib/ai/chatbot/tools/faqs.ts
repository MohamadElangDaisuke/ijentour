import { prisma } from "@/lib/prisma";

export interface CleanFaqData {
  id: string;
  question: string;
  answer: string;
  category: string;
}

/**
 * Fetch all active FAQs from database.
 * Strictly queries `isActive: true` so admin updates/deletions take effect immediately.
 */
export async function getAllActiveFaqs(): Promise<CleanFaqData[]> {
  const dbFaqs = await prisma.faq.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      question: true,
      answer: true,
      category: true,
    },
  });

  return dbFaqs;
}

/**
 * Search active FAQs matching query tokens.
 */
export async function searchFaqs(query: string): Promise<CleanFaqData[]> {
  const faqs = await getAllActiveFaqs();
  const lower = query.toLowerCase().trim();
  if (!lower) return faqs;

  const words = lower.split(/\s+/).filter((w) => w.length > 2);

  return faqs
    .map((faq) => {
      const q = faq.question.toLowerCase();
      const a = faq.answer.toLowerCase();
      let score = 0;

      if (q.includes(lower)) score += 10;
      if (a.includes(lower)) score += 5;

      for (const w of words) {
        if (q.includes(w)) score += 3;
        if (a.includes(w)) score += 1;
      }

      return { faq, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.faq);
}
