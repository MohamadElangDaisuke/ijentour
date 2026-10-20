import { LivePackage, LiveDestination } from "@/lib/travelAssistant";
import { ExtractedEntities } from "./types";

/**
 * Extract entities from user query based on dynamic DB knowledge
 */
export function extractEntities(
  normalizedText: string,
  livePackages: LivePackage[],
  liveDestinations: LiveDestination[]
): ExtractedEntities {
  const matchedPackageIds = new Set<string>();
  const matchedDestinationSlugs = new Set<string>();
  let maxBudget: number | undefined;
  let durationDays: number | undefined;
  let participants: number | undefined;
  let isCustomTrip = false;
  const rawKeywords: string[] = [];

  // 1. Match Packages dynamically by checking title, slug, and keywords
  for (const pkg of livePackages) {
    const pkgTitle = pkg.title.toLowerCase();
    const pkgSlug = pkg.slug.toLowerCase();

    // Direct title or slug substring match
    if (normalizedText.includes(pkgSlug) || normalizedText.includes(pkgTitle)) {
      matchedPackageIds.add(pkg.id);
      continue;
    }

    // Specific package distinctive signature words
    if (
      (pkgSlug.includes("midnight") || pkgSlug.includes("blue-fire")) &&
      (normalizedText.includes("midnight") ||
        normalizedText.includes("blue fire") ||
        normalizedText.includes("api biru") ||
        normalizedText.includes("kawah ijen midnight"))
    ) {
      matchedPackageIds.add(pkg.id);
    } else if (
      pkgSlug.includes("bromo") &&
      (normalizedText.includes("bromo") || normalizedText.includes("sunrise combo"))
    ) {
      matchedPackageIds.add(pkg.id);
    } else if (
      (pkgSlug.includes("waterfall") || pkgSlug.includes("crater-lake")) &&
      (normalizedText.includes("waterfall") ||
        normalizedText.includes("air terjun") ||
        normalizedText.includes("crater lake"))
    ) {
      matchedPackageIds.add(pkg.id);
    } else if (
      (pkgSlug.includes("wurung") || pkgSlug.includes("djawatan")) &&
      (normalizedText.includes("wurung") ||
        normalizedText.includes("djawatan") ||
        normalizedText.includes("green escape"))
    ) {
      matchedPackageIds.add(pkg.id);
    } else if (
      pkgSlug.includes("bali") &&
      (normalizedText.includes("bali") ||
        normalizedText.includes("overland") ||
        normalizedText.includes("bali return"))
    ) {
      matchedPackageIds.add(pkg.id);
    }
  }

  // 2. Match Destinations dynamically
  for (const dest of liveDestinations) {
    const destName = dest.name.toLowerCase();
    const destSlug = dest.slug.toLowerCase();

    if (
      normalizedText.includes(destName) ||
      normalizedText.includes(destSlug) ||
      (destSlug === "kawah-ijen" && (normalizedText.includes("ijen") || normalizedText.includes("blue fire"))) ||
      (destSlug === "de-djawatan" && (normalizedText.includes("djawatan") || normalizedText.includes("jawatan"))) ||
      (destSlug === "tn-baluran" && normalizedText.includes("baluran")) ||
      (destSlug === "red-island" && (normalizedText.includes("pulau merah") || normalizedText.includes("red island"))) ||
      (destSlug === "green-island" && normalizedText.includes("green island")) ||
      (destSlug === "kawah-wurung" && normalizedText.includes("wurung"))
    ) {
      matchedDestinationSlugs.add(dest.slug);
    }
  }

  // 3. Extract Budget
  // Formats like: "Rp 800.000", "800k", "800 rb", "800ribu", "1.5 jt", "1.5 juta", "1.5 million", "budget 1000000"
  const budgetRegex = /(?:rp\.?|idr|budget|anggaran|biaya|maksimal|under|dibawah|di bawah)?\s*(\d+(?:[\.,]\d+)?)\s*(k|rb|ribu|jt|juta|million|m)?\b/i;
  const matches = normalizedText.match(budgetRegex);

  if (matches) {
    const numStr = matches[1].replace(/\./g, "").replace(/,/g, ".");
    let multiplier = 1;
    const unit = matches[2]?.toLowerCase();

    if (unit === "k" || unit === "rb" || unit === "ribu") multiplier = 1000;
    else if (unit === "jt" || unit === "juta" || unit === "million" || unit === "m") multiplier = 1000000;

    let val = parseFloat(numStr) * multiplier;

    // Handle decimal multiplier (e.g., "1.5 jt" -> 1500000)
    if (matches[1].includes(".") || matches[1].includes(",")) {
      const parts = matches[1].split(/[\.,]/);
      if (multiplier === 1000000 && parts.length === 2 && parts[1].length < 6) {
        val = parseFloat(matches[1].replace(",", ".")) * 1000000;
      }
    }

    if (val >= 100000 && val <= 50000000) {
      maxBudget = Math.round(val);
    }
  }

  // Fallback check for numbers written plainly if budget context is present
  if (!maxBudget && (normalizedText.includes("budget") || normalizedText.includes("anggaran") || normalizedText.includes("murah"))) {
    const rawNum = normalizedText.match(/\b(\d{3,7})\b/);
    if (rawNum) {
      const parsed = parseInt(rawNum[1], 10);
      if (parsed >= 100 && parsed <= 5000) {
        maxBudget = parsed * 1000; // e.g. "800" in "budget 800"
      } else if (parsed >= 100000) {
        maxBudget = parsed;
      }
    }
  }

  // 4. Extract Duration
  if (normalizedText.includes("3d2n") || normalizedText.includes("3 hari") || normalizedText.includes("3 days")) {
    durationDays = 3;
  } else if (normalizedText.includes("2d1n") || normalizedText.includes("2 hari") || normalizedText.includes("2 days")) {
    durationDays = 2;
  } else if (
    normalizedText.includes("1d") ||
    normalizedText.includes("1 hari") ||
    normalizedText.includes("1 day") ||
    normalizedText.includes("seharian") ||
    normalizedText.includes("one day") ||
    normalizedText.includes("full day")
  ) {
    durationDays = 1;
  }

  // 5. Extract Participants
  const paxMatch = normalizedText.match(/(\d+)\s*(?:orang|pax|person|people|peserta)/);
  if (paxMatch) {
    participants = parseInt(paxMatch[1], 10);
  } else if (normalizedText.includes("solo") || normalizedText.includes("sendiri")) {
    participants = 1;
  } else if (normalizedText.includes("keluarga") || normalizedText.includes("family")) {
    participants = 4;
  }

  // 6. Custom Trip Flag
  if (
    normalizedText.includes("custom") ||
    normalizedText.includes("kustom") ||
    normalizedText.includes("atur sendiri") ||
    normalizedText.includes("rute sendiri") ||
    normalizedText.includes("private custom")
  ) {
    isCustomTrip = true;
  }

  // Keywords extraction
  if (normalizedText.includes("blue fire") || normalizedText.includes("api biru")) rawKeywords.push("blue fire");
  if (normalizedText.includes("sunrise") || normalizedText.includes("matahari terbit")) rawKeywords.push("sunrise");
  if (normalizedText.includes("trekking") || normalizedText.includes("hiking") || normalizedText.includes("mendaki")) rawKeywords.push("trekking");
  if (normalizedText.includes("waterfall") || normalizedText.includes("air terjun")) rawKeywords.push("waterfall");
  if (normalizedText.includes("safari") || normalizedText.includes("savana")) rawKeywords.push("safari");

  return {
    packageIds: Array.from(matchedPackageIds),
    destinationSlugs: Array.from(matchedDestinationSlugs),
    maxBudget,
    durationDays,
    participants,
    isCustomTrip,
    rawKeywords,
  };
}
