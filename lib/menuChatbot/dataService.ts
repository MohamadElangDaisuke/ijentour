/**
 * Data service layer for the Interactive Menu Chatbot
 * Wraps existing DB tools and maps data to menu-safe summary formats
 */

import {
  getAllActivePackages,
  getPackageByIdOrSlug,
  CleanPackageData,
} from "@/lib/ai/chatbot/tools/packages";
import {
  getAllDestinations,
  getDestinationByIdOrSlug,
  CleanDestinationData,
} from "@/lib/ai/chatbot/tools/destinations";
import { getAllActiveFaqs, CleanFaqData } from "@/lib/ai/chatbot/tools/faqs";
import type { PackageSummary, DestinationSummary } from "./types";

// Re-export types so callers can reference them without touching tool files
export type { CleanPackageData, CleanDestinationData, CleanFaqData };

// ─── Packages ─────────────────────────────────────────────────────────────────

/**
 * Fetch all active packages mapped to lightweight summary objects
 * suitable for menu list rendering.
 */
export async function getActivePackageSummaries(): Promise<PackageSummary[]> {
  const packages = await getAllActivePackages();
  return packages.map(mapToPackageSummary);
}

/**
 * Fetch a single package by ID or URL slug, returning the full data shape.
 * Returns null if not found.
 */
export async function getPackageDetail(
  idOrSlug: string
): Promise<CleanPackageData | null> {
  return getPackageByIdOrSlug(idOrSlug);
}

// ─── Destinations ─────────────────────────────────────────────────────────────

/**
 * Fetch all destinations mapped to lightweight summary objects.
 */
export async function getDestinationSummaries(): Promise<DestinationSummary[]> {
  const destinations = await getAllDestinations();
  return destinations.map(mapToDestinationSummary);
}

/**
 * Fetch a single destination by ID or slug.
 * Returns null if not found.
 */
export async function getDestinationDetail(
  idOrSlug: string
): Promise<CleanDestinationData | null> {
  return getDestinationByIdOrSlug(idOrSlug);
}

/**
 * Find active packages related to a destination by searching name in package corpus.
 */
export async function getPackagesForDestination(
  destName: string
): Promise<CleanPackageData[]> {
  const all = await getAllActivePackages();
  const lower = destName.toLowerCase().trim();
  if (!lower) return [];

  return all.filter((pkg) => {
    const corpus = [
      pkg.title,
      pkg.description,
      pkg.highlights.join(" "),
      pkg.meetingPoint ?? "",
      pkg.pickupArea ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return corpus.includes(lower);
  });
}

// ─── FAQs ─────────────────────────────────────────────────────────────────────

/**
 * Fetch FAQs that belong to a given category string (case-insensitive).
 * Falls back to all active FAQs if categoryHint is empty.
 */
export async function getFaqsByCategory(
  categoryHint: string
): Promise<CleanFaqData[]> {
  const all = await getAllActiveFaqs();
  if (!categoryHint.trim()) return all;

  const lower = categoryHint.toLowerCase().trim();
  return all.filter(
    (faq) =>
      faq.category.toLowerCase().includes(lower) ||
      faq.question.toLowerCase().includes(lower)
  );
}

/**
 * Find the top-3 most relevant FAQs for the given topic keywords.
 * Uses a simple scoring algorithm (same approach as the existing searchFaqs tool).
 */
export async function getFaqsByTopics(
  topics: string[]
): Promise<CleanFaqData[]> {
  const all = await getAllActiveFaqs();
  if (!topics || topics.length === 0) return all.slice(0, 3);

  const normalised = topics
    .map((t) => t.toLowerCase().trim())
    .filter((t) => t.length > 1);

  const scored = all
    .map((faq) => {
      const q = faq.question.toLowerCase();
      const a = faq.answer.toLowerCase();
      const cat = faq.category.toLowerCase();
      let score = 0;

      for (const kw of normalised) {
        if (q.includes(kw)) score += 10;
        if (cat.includes(kw)) score += 6;
        if (a.includes(kw)) score += 3;
      }

      return { faq, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((item) => item.faq);
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapToPackageSummary(pkg: CleanPackageData): PackageSummary {
  return {
    id: pkg.id,
    title: pkg.title,
    slug: pkg.slug,
    category: pkg.category,
    price: pkg.price,
    basePrice: pkg.basePrice,
    duration: pkg.duration,
    difficulty: pkg.difficulty,
    badge: pkg.badge,
    coverImage: pkg.coverImage,
    meetingPoint: pkg.meetingPoint,
    rating: pkg.rating,
  };
}

function mapToDestinationSummary(d: CleanDestinationData): DestinationSummary {
  return {
    id: d.id,
    name: d.name,
    slug: d.slug,
    description: d.description,
    image: d.image,
    tag: d.tag,
    isFeatured: d.isFeatured,
  };
}
