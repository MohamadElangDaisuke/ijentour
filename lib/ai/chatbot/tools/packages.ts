import { prisma, safeJsonParse } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export interface CleanPackageData {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  shortDescription?: string | null;
  duration: string;
  durationDays: number;
  durationNights: number;
  price: string;
  basePrice: number;
  groupDiscountPercent: number;
  minParticipants: number;
  maxParticipants: number;
  difficulty: string;
  altitude?: string | null;
  meetingPoint?: string | null;
  departureTime?: string | null;
  pickupArea?: string | null;
  safetyInfo?: string | null;
  importantNotes?: string | null;
  badge?: string | null;
  rating: number;
  isActive: boolean;
  coverImage: string;
  highlights: string[];
  includedItems: string[];
  excludedItems: string[];
  itineraries: Array<{ day?: string; title: string; desc: string }>;
  faqs: Array<{ q: string; a: string }>;
  schedules: Array<{
    id: string;
    departureDate: string;
    availableSlots: number;
    bookedSlots: number;
    status: string;
  }>;
}

function mapPrismaPackage(pkg: any): CleanPackageData {
  return {
    id: pkg.id,
    title: pkg.title,
    slug: pkg.slug,
    category: pkg.category,
    description: pkg.description,
    shortDescription: pkg.shortDescription,
    duration: pkg.duration,
    durationDays: pkg.durationDays,
    durationNights: pkg.durationNights,
    price: pkg.price || formatCurrency(pkg.basePrice),
    basePrice: pkg.basePrice,
    groupDiscountPercent: pkg.groupDiscountPercent,
    minParticipants: pkg.minParticipants,
    maxParticipants: pkg.maxParticipants,
    difficulty: pkg.difficulty,
    altitude: pkg.altitude,
    meetingPoint: pkg.meetingPoint,
    departureTime: pkg.departureTime,
    pickupArea: pkg.pickupArea,
    safetyInfo: pkg.safetyInfo,
    importantNotes: pkg.importantNotes,
    badge: pkg.badge,
    rating: pkg.rating,
    isActive: pkg.isActive,
    coverImage: pkg.coverImage,
    highlights: safeJsonParse<string[]>(pkg.highlights, []),
    includedItems: safeJsonParse<string[]>(pkg.includedItems, []),
    excludedItems: safeJsonParse<string[]>(pkg.excludedItems, []),
    itineraries: safeJsonParse<any[]>(pkg.itineraries, []),
    faqs: safeJsonParse<any[]>(pkg.faqs, []),
    schedules: (pkg.schedules || []).map((s: any) => ({
      id: s.id,
      departureDate: s.departureDate,
      availableSlots: s.availableSlots,
      bookedSlots: s.bookedSlots,
      status: s.status,
    })),
  };
}

/**
 * Fetch all active packages directly from the database.
 * Strictly checks `isActive: true` so unpublished or deactivated packages are immediately excluded.
 */
export async function getAllActivePackages(): Promise<CleanPackageData[]> {
  const dbPackages = await prisma.tripPackage.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      schedules: {
        where: { status: "OPEN" },
        orderBy: { departureDate: "asc" },
      },
    },
  });

  return dbPackages.map(mapPrismaPackage);
}

/**
 * Look up a specific package by ID or URL slug.
 */
export async function getPackageByIdOrSlug(
  idOrSlug: string
): Promise<CleanPackageData | null> {
  const pkg = await prisma.tripPackage.findFirst({
    where: {
      isActive: true,
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      schedules: {
        where: { status: "OPEN" },
        orderBy: { departureDate: "asc" },
      },
    },
  });

  return pkg ? mapPrismaPackage(pkg) : null;
}

/**
 * Search active packages based on keywords (e.g. "blue fire", "midnight", "camping", "baluran").
 */
export async function searchPackagesByKeywords(
  keywords: string[]
): Promise<CleanPackageData[]> {
  const all = await getAllActivePackages();
  if (!keywords || keywords.length === 0) return all;

  const normalizedKws = keywords.map((k) => k.toLowerCase().trim()).filter(Boolean);

  return all.filter((pkg) => {
    const textCorpus = [
      pkg.title,
      pkg.slug,
      pkg.category,
      pkg.difficulty,
      pkg.description,
      pkg.highlights.join(" "),
      pkg.includedItems.join(" "),
      pkg.itineraries.map((it) => `${it.title} ${it.desc}`).join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return normalizedKws.some((kw) => textCorpus.includes(kw));
  });
}

/**
 * Filter packages by user criteria: maxBudget, participants, duration in days, difficulty level.
 */
export async function filterPackagesByCriteria(criteria: {
  maxBudget?: number;
  minBudget?: number;
  participants?: number;
  durationDays?: number;
  difficulty?: string;
  category?: string;
}): Promise<CleanPackageData[]> {
  const all = await getAllActivePackages();

  return all.filter((pkg) => {
    if (criteria.maxBudget && criteria.maxBudget > 0) {
      if (pkg.basePrice > criteria.maxBudget) return false;
    }
    if (criteria.minBudget && criteria.minBudget > 0) {
      if (pkg.basePrice < criteria.minBudget) return false;
    }
    if (criteria.participants && criteria.participants > 0) {
      if (criteria.participants < pkg.minParticipants) return false;
      if (criteria.participants > pkg.maxParticipants) return false;
    }
    if (criteria.durationDays && criteria.durationDays > 0) {
      if (pkg.durationDays !== criteria.durationDays) return false;
    }
    if (criteria.difficulty && criteria.difficulty.trim()) {
      if (!pkg.difficulty.toLowerCase().includes(criteria.difficulty.toLowerCase())) {
        return false;
      }
    }
    if (criteria.category && criteria.category.trim()) {
      if (!pkg.category.toLowerCase().includes(criteria.category.toLowerCase())) {
        return false;
      }
    }
    return true;
  });
}
