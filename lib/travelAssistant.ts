import { prisma, safeJsonParse } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export interface LivePackage {
  id: string;
  title: string;
  slug: string;
  category: string;
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
  badge?: string | null;
  rating: number;
  isActive: boolean;
  coverImage: string;
  highlights: string[];
  included: string[];
  excluded: string[];
  itinerary: Array<{ day: string; title: string; desc: string }>;
  faqs: Array<{ q: string; a: string }>;
  schedules: Array<{
    id: string;
    departureDate: string;
    availableSlots: number;
    bookedSlots: number;
    status: string;
  }>;
}

export interface LiveDestination {
  id: string;
  name: string;
  slug: string;
  description: string;
  tag?: string | null;
}

export interface LiveFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface LiveKnowledgeBase {
  packages: LivePackage[];
  destinations: LiveDestination[];
  faqs: LiveFaq[];
}

export interface CustomTripPrefill {
  isCustomTrip?: boolean;
  destinations?: string[];
  durationId?: string;
  departureDate?: string;
  numParticipants?: number;
  transportId?: string;
  guideId?: string;
  addonIds?: string[];
  specialRequests?: string;
  summary?: string;
}

/**
 * Fetch live data directly from the Supabase database via Prisma.
 * Strictly queries `isActive: true` so any newly published, edited, or unpublished
 * packages are immediately reflected on the next query without code changes or caching delays.
 */
export async function getLiveTourKnowledge(): Promise<LiveKnowledgeBase> {
  const [dbPackages, dbDestinations, dbFaqs] = await Promise.all([
    prisma.tripPackage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        schedules: {
          where: { status: "OPEN" },
          orderBy: { departureDate: "asc" },
        },
      },
    }),
    prisma.destination.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        tag: true,
      },
    }),
    prisma.faq.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
      },
    }),
  ]);

  const packages: LivePackage[] = dbPackages.map((pkg) => ({
    id: pkg.id,
    title: pkg.title,
    slug: pkg.slug,
    category: pkg.category,
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
    badge: pkg.badge,
    rating: pkg.rating,
    isActive: pkg.isActive,
    coverImage: pkg.coverImage,
    highlights: safeJsonParse<string[]>(pkg.highlights, []),
    included: safeJsonParse<string[]>(pkg.includedItems, []),
    excluded: safeJsonParse<string[]>(pkg.excludedItems, []),
    itinerary: safeJsonParse<any[]>(pkg.itineraries, []),
    faqs: safeJsonParse<any[]>(pkg.faqs, []),
    schedules: pkg.schedules.map((s) => ({
      id: s.id,
      departureDate: s.departureDate,
      availableSlots: s.availableSlots,
      bookedSlots: s.bookedSlots,
      status: s.status,
    })),
  }));

  return {
    packages,
    destinations: dbDestinations,
    faqs: dbFaqs,
  };
}

/**
 * Validates recommended package IDs strictly against current eligible database records.
 * If an ID was deleted, unpublished, or hallucinated, it is pruned immediately.
 */
export async function verifyAndEnrichPackageRecommendations(
  packageIds: string[]
): Promise<LivePackage[]> {
  if (!packageIds || packageIds.length === 0) return [];

  // Query only eligible packages matching the given IDs or slugs
  const dbPackages = await prisma.tripPackage.findMany({
    where: {
      isActive: true,
      OR: [{ id: { in: packageIds } }, { slug: { in: packageIds } }],
    },
    include: {
      schedules: {
        where: { status: "OPEN" },
      },
    },
  });

  // Preserve the ranking order requested by the assistant
  const enriched: LivePackage[] = [];
  for (const id of packageIds) {
    const found = dbPackages.find((p) => p.id === id || p.slug === id);
    if (found && !enriched.some((e) => e.id === found.id)) {
      enriched.push({
        id: found.id,
        title: found.title,
        slug: found.slug,
        category: found.category,
        duration: found.duration,
        durationDays: found.durationDays,
        durationNights: found.durationNights,
        price: found.price || formatCurrency(found.basePrice),
        basePrice: found.basePrice,
        groupDiscountPercent: found.groupDiscountPercent,
        minParticipants: found.minParticipants,
        maxParticipants: found.maxParticipants,
        difficulty: found.difficulty,
        altitude: found.altitude,
        meetingPoint: found.meetingPoint,
        departureTime: found.departureTime,
        badge: found.badge,
        rating: found.rating,
        isActive: found.isActive,
        coverImage: found.coverImage,
        highlights: safeJsonParse<string[]>(found.highlights, []),
        included: safeJsonParse<string[]>(found.includedItems, []),
        excluded: safeJsonParse<string[]>(found.excludedItems, []),
        itinerary: safeJsonParse<any[]>(found.itineraries, []),
        faqs: safeJsonParse<any[]>(found.faqs, []),
        schedules: found.schedules.map((s) => ({
          id: s.id,
          departureDate: s.departureDate,
          availableSlots: s.availableSlots,
          bookedSlots: s.bookedSlots,
          status: s.status,
        })),
      });
    }
  }

  return enriched;
}

/**
 * Deterministic package filter based on verified requirements (budget, travelers, duration, keywords).
 * Used for pre-filtering and resilient offline/error fallback.
 */
export function filterPackagesDeterministically(
  packages: LivePackage[],
  criteria: {
    maxBudgetPerPerson?: number;
    totalBudget?: number;
    participants?: number;
    durationDays?: number;
    keywords?: string[];
  }
): LivePackage[] {
  const pax = Math.max(1, criteria.participants || 1);

  return packages.filter((pkg) => {
    // Check max budget per person
    if (criteria.maxBudgetPerPerson && criteria.maxBudgetPerPerson > 0) {
      if (pkg.basePrice > criteria.maxBudgetPerPerson) return false;
    }

    // Check total budget
    if (criteria.totalBudget && criteria.totalBudget > 0) {
      const estimatedCost = pkg.basePrice * pax;
      if (estimatedCost > criteria.totalBudget) return false;
    }

    // Check participants capacity
    if (criteria.participants && criteria.participants > 0) {
      if (criteria.participants < pkg.minParticipants) return false;
      if (criteria.participants > pkg.maxParticipants) return false;
    }

    // Check duration days
    if (criteria.durationDays && criteria.durationDays > 0) {
      if (pkg.durationDays !== criteria.durationDays) return false;
    }

    // Check keyword matching
    if (criteria.keywords && criteria.keywords.length > 0) {
      const searchableText = `${pkg.title} ${pkg.category} ${pkg.difficulty} ${pkg.highlights.join(" ")} ${pkg.included.join(" ")}`.toLowerCase();
      const matchesAnyKeyword = criteria.keywords.some((kw) =>
        searchableText.includes(kw.toLowerCase())
      );
      if (!matchesAnyKeyword) return false;
    }

    return true;
  });
}

/**
 * Builds a query string to prefill the Custom Trip builder wizard.
 */
export function buildCustomTripUrl(prefill: CustomTripPrefill): string {
  const params = new URLSearchParams();

  if (prefill.destinations && prefill.destinations.length > 0) {
    params.set("destinations", prefill.destinations.join(","));
  }
  if (prefill.durationId) {
    params.set("duration", prefill.durationId);
  }
  if (prefill.departureDate) {
    params.set("date", prefill.departureDate);
  }
  if (prefill.numParticipants) {
    params.set("pax", String(prefill.numParticipants));
  }
  if (prefill.transportId) {
    params.set("transport", prefill.transportId);
  }
  if (prefill.guideId) {
    params.set("guide", prefill.guideId);
  }
  if (prefill.addonIds && prefill.addonIds.length > 0) {
    params.set("addons", prefill.addonIds.join(","));
  }
  if (prefill.specialRequests) {
    params.set("requests", prefill.specialRequests);
  }

  const query = params.toString();
  return `/custom-package${query ? `?${query}` : ""}`;
}

/**
 * Formats a clean, readable text summary of custom trip preferences.
 */
export function formatCustomTripSummary(prefill: CustomTripPrefill): string {
  const lines: string[] = [
    "📋 *CUSTOM TRIP PREFERENCES - IJEN TOUR*",
    "----------------------------------------",
  ];

  if (prefill.destinations && prefill.destinations.length > 0) {
    lines.push(`📍 Destinations: ${prefill.destinations.join(", ")}`);
  }
  if (prefill.durationId) {
    lines.push(`⏱ Duration: ${prefill.durationId.toUpperCase()}`);
  }
  if (prefill.departureDate) {
    lines.push(`📅 Preferred Date: ${prefill.departureDate}`);
  }
  if (prefill.numParticipants) {
    lines.push(`👥 Travelers: ${prefill.numParticipants} Person(s)`);
  }
  if (prefill.transportId) {
    lines.push(`🚗 Transport: ${prefill.transportId.toUpperCase()}`);
  }
  if (prefill.guideId) {
    lines.push(`🧭 Guide Option: ${prefill.guideId}`);
  }
  if (prefill.addonIds && prefill.addonIds.length > 0) {
    lines.push(`🎒 Add-ons: ${prefill.addonIds.join(", ")}`);
  }
  if (prefill.specialRequests) {
    lines.push(`📝 Special Requests: ${prefill.specialRequests}`);
  }

  lines.push("----------------------------------------");
  lines.push("Ready to finalize on our Custom Trip builder or via WhatsApp!");

  return lines.join("\n");
}
