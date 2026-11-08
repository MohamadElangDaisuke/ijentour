/**
 * Response builder for the Interactive Menu Chatbot
 * Constructs MenuChatbotResponse objects for every screen type
 * Database as Single Source of Truth: dynamic items delegate to dataService
 */

import { getWhatsAppLink, WhatsAppTemplates } from "@/lib/whatsapp";
import { COMPANY_INFO, OFFICIAL_ADDRESS, OFFICIAL_PHONE, OFFICIAL_EMAIL } from "@/lib/constants";
import {
  getActivePackageSummaries,
  getPackageDetail,
  getDestinationSummaries,
  getDestinationDetail,
  getPackagesForDestination,
  getFaqsByTopics,
  CleanPackageData,
  CleanFaqData,
} from "./dataService";
import { MAIN_MENU_ITEMS, MENU_CATEGORY_MAP } from "./menuConfig";
import type {
  CategoryId,
  MenuChatbotRequest,
  MenuChatbotResponse,
  MenuItem,
  NavigationButton,
  PackageSummary,
  DestinationSummary,
} from "./types";

// Standard unavailable message as mandated by specification
const UNAVAILABLE_MESSAGE =
  "Sorry, this information is currently unavailable. Please contact our team for further assistance.";

// ─── Navigation helpers ───────────────────────────────────────────────────────

function navMainMenu(): NavigationButton {
  return { label: "🏠 Main Menu", action: "main_menu" };
}

function navBack(): NavigationButton {
  return { label: "◀ Back", action: "back" };
}

function navWhatsApp(message?: string): NavigationButton {
  const link = getWhatsAppLink(
    message ?? WhatsAppTemplates.generalInquiry("Tour Information")
  );
  return { label: "💬 Chat with Us on WhatsApp", action: "whatsapp", whatsappLink: link };
}

// ─── MAIN_MENU ────────────────────────────────────────────────────────────────

/**
 * Build the main menu response.
 * Navigation = [] as per spec (no back button on root).
 */
export function buildMainMenuResponse(): MenuChatbotResponse {
  return {
    screen: "MAIN_MENU",
    title: "🌋 Welcome to Ijen Tour",
    subtitle:
      "Discover the mystical Blue Fire & East Java Wonders. How can we help you today?",
    menuItems: MAIN_MENU_ITEMS,
    navigation: [],
  };
}

// ─── SUBMENU ──────────────────────────────────────────────────────────────────

/**
 * Build a category submenu response.
 * Navigation = [Main Menu]
 */
export function buildCategorySubmenuResponse(
  categoryId: CategoryId
): MenuChatbotResponse {
  const category = MENU_CATEGORY_MAP[categoryId];

  if (!category) {
    return {
      screen: "SUBMENU",
      title: "Category Not Found",
      subtitle: "We couldn't find that category. Please return to the main menu.",
      navigation: [navMainMenu()],
      error: `Unknown category: ${categoryId}`,
    };
  }

  return {
    screen: "SUBMENU",
    title: `${category.icon} ${category.label}`,
    subtitle: category.description,
    menuItems: category.subItems,
    navigation: [navMainMenu()],
  };
}

// ─── ITEM_LIST ────────────────────────────────────────────────────────────────

/**
 * Build an item list response with dynamic DB data.
 * - "destinations": returns DestinationSummary[] with ITEM_DETAIL buttons
 * - "packages": returns PackageSummary[] with ITEM_DETAIL buttons + filter sub-buttons
 * Navigation = [Back, Main Menu]
 */
export async function buildItemListResponse(
  categoryId: CategoryId,
  subAction?: string
): Promise<MenuChatbotResponse> {
  const baseNav: NavigationButton[] = [navBack(), navMainMenu()];

  if (categoryId === "destinations") {
    let destinations: DestinationSummary[] = [];
    try {
      destinations = await getDestinationSummaries();
    } catch {
      return {
        screen: "ITEM_SELECT",
        title: "🗺️ Travel Destinations",
        subtitle:
          "We're having trouble loading destinations from the database. Please try again or reach out on WhatsApp.",
        navigation: [...baseNav, navWhatsApp("Destinations Inquiry")],
        error: "Failed to load destinations",
      };
    }

    if (subAction === "popular") {
      destinations = destinations.filter((d) => d.isFeatured);
    }

    if (destinations.length === 0) {
      return {
        screen: "ITEM_SELECT",
        title: "🗺️ Travel Destinations",
        subtitle: "No destinations are currently available.",
        answerText: UNAVAILABLE_MESSAGE,
        navigation: [...baseNav, navWhatsApp("Destinations Inquiry")],
      };
    }

    // Build ITEM_DETAIL menu items for each destination
    const menuItems: MenuItem[] = destinations.map((dest) => ({
      id: `dest-${dest.id}`,
      label: `${dest.isFeatured ? "⭐ " : ""}${dest.name}`,
      icon: "📍",
      description: dest.tag ?? undefined,
      action: "ITEM_DETAIL",
      categoryId: "destinations",
      itemId: dest.slug || dest.id,
      subAction: "overview",
    }));

    return {
      screen: "ITEM_SELECT",
      title: subAction === "popular" ? "⭐ Popular Destinations" : "🗺️ Travel Destinations",
      subtitle: `Explore ${destinations.length} destination${destinations.length !== 1 ? "s" : ""} across East Java`,
      menuItems,
      destinations,
      navigation: baseNav,
    };
  }

  if (categoryId === "packages") {
    let packages: PackageSummary[] = [];
    try {
      packages = await getActivePackageSummaries();
    } catch {
      return {
        screen: "ITEM_SELECT",
        title: "🎒 Tour Packages",
        subtitle:
          "We're having trouble loading packages from the database. Please try again or reach out on WhatsApp.",
        navigation: [...baseNav, navWhatsApp("Tour Packages Inquiry")],
        error: "Failed to load packages",
      };
    }

    // Apply subAction filter (open_trip / private_trip)
    let filtered = packages;
    let titleSuffix = "All Tour Packages";
    if (subAction === "open_trip") {
      filtered = packages.filter(
        (p) =>
          p.category.toLowerCase().includes("open") ||
          p.title.toLowerCase().includes("open trip")
      );
      titleSuffix = "Open Trip Packages";
    } else if (subAction === "private_trip") {
      filtered = packages.filter(
        (p) =>
          p.category.toLowerCase().includes("private") ||
          p.title.toLowerCase().includes("private")
      );
      titleSuffix = "Private Trip Packages";
    }

    if (filtered.length === 0) {
      filtered = packages;
    }

    // Build ITEM_DETAIL menu items
    const menuItems: MenuItem[] = filtered.map((pkg) => ({
      id: `pkg-${pkg.id}`,
      label: `${pkg.badge ? `[${pkg.badge}] ` : ""}${pkg.title}`,
      icon: "🎒",
      description: `${pkg.duration} · ${pkg.price} · ${pkg.difficulty}`,
      action: "ITEM_DETAIL",
      categoryId: "packages",
      itemId: pkg.slug || pkg.id,
      subAction: "overview",
    }));

    // Add filter sub-buttons when showing all packages
    if (!subAction && packages.length > 0) {
      menuItems.unshift(
        {
          id: "filter-open-trip",
          label: "👥 Open Trip Packages",
          icon: "👥",
          description: "Filter by scheduled open trip departures",
          action: "ITEM_LIST",
          categoryId: "packages",
          subAction: "open_trip",
        },
        {
          id: "filter-private-trip",
          label: "🔑 Private Trip Packages",
          icon: "🔑",
          description: "Filter by exclusive private tours",
          action: "ITEM_LIST",
          categoryId: "packages",
          subAction: "private_trip",
        }
      );
    }

    return {
      screen: "ITEM_SELECT",
      title: `🎒 ${titleSuffix}`,
      subtitle: `${filtered.length} package${filtered.length !== 1 ? "s" : ""} available in our live catalog`,
      menuItems,
      packages: filtered,
      navigation: baseNav,
    };
  }

  // Unsupported list category
  return {
    screen: "ITEM_SELECT",
    title: "Items",
    subtitle: "No items to display for this category.",
    navigation: baseNav,
    error: `List not supported for category: ${categoryId}`,
  };
}

// ─── ITEM_DETAIL ──────────────────────────────────────────────────────────────

/**
 * Build a detail response for a specific package or destination.
 * Navigation = [Back, Main Menu, WhatsApp Support]
 */
export async function buildItemDetailResponse(
  categoryId: CategoryId,
  itemId: string,
  subAction?: string,
  context?: MenuChatbotRequest["context"]
): Promise<MenuChatbotResponse> {
  const baseNav: NavigationButton[] = [navBack(), navMainMenu()];
  const whatsappNav = navWhatsApp(
    WhatsAppTemplates.generalInquiry(
      context?.selectedPackageTitle ??
        context?.selectedDestinationName ??
        "Tour Information"
    )
  );
  const fullNav: NavigationButton[] = [...baseNav, whatsappNav];

  if (categoryId === "packages") {
    let pkg: CleanPackageData | null = null;
    try {
      pkg = await getPackageDetail(itemId);
    } catch {
      /* handled below */
    }

    if (!pkg) {
      return {
        screen: "ANSWER",
        title: "Package Not Found",
        answerText: UNAVAILABLE_MESSAGE,
        navigation: fullNav,
        error: `Package not found: ${itemId}`,
      };
    }

    const bookingLink = getWhatsAppLink(WhatsAppTemplates.bookTrip(pkg.title, pkg.price));
    const answerText = buildPackageAnswerText(pkg, subAction);

    // Sub-navigation buttons for the package detail
    const subNavItems: MenuItem[] = [
      {
        id: "pkg-sub-overview",
        label: "📖 Package Overview",
        icon: "📖",
        action: "ITEM_DETAIL",
        categoryId: "packages",
        itemId,
        subAction: "overview",
      },
      {
        id: "pkg-sub-itinerary",
        label: "📋 Detailed Itinerary",
        icon: "📋",
        action: "ITEM_DETAIL",
        categoryId: "packages",
        itemId,
        subAction: "itinerary",
      },
      {
        id: "pkg-sub-included",
        label: "✅ What's Included / Excluded",
        icon: "✅",
        action: "ITEM_DETAIL",
        categoryId: "packages",
        itemId,
        subAction: "included",
      },
      {
        id: "pkg-sub-prices",
        label: "💰 Prices & Departure Schedules",
        icon: "💰",
        action: "ITEM_DETAIL",
        categoryId: "packages",
        itemId,
        subAction: "prices",
      },
    ];

    return {
      screen: "ANSWER",
      title: `🎒 ${pkg.title}`,
      subtitle: `${pkg.duration} · ${pkg.difficulty} · ${pkg.price}`,
      answerText,
      menuItems: subNavItems,
      navigation: [
        ...fullNav,
        {
          label: "📲 Inquire / Book via WhatsApp",
          action: "whatsapp",
          whatsappLink: bookingLink,
        },
      ],
      whatsappLink: bookingLink,
      whatsappMessage: WhatsAppTemplates.bookTrip(pkg.title, pkg.price),
    };
  }

  if (categoryId === "destinations") {
    let dest = null;
    try {
      dest = await getDestinationDetail(itemId);
    } catch {
      /* handled below */
    }

    if (!dest) {
      return {
        screen: "ANSWER",
        title: "Destination Not Found",
        answerText: UNAVAILABLE_MESSAGE,
        navigation: fullNav,
        error: `Destination not found: ${itemId}`,
      };
    }

    const inquiryLink = getWhatsAppLink(
      `Hello Ijen Tour! I am interested in visiting ${dest.name}. Could you please share tour options and availability?`
    );

    let answerText = "";

    if (subAction === "activities") {
      answerText = [
        `🥾 Activities & Attractions at ${dest.name}:`,
        "",
        dest.description,
        "",
        `✨ Highlights & Experiences:`,
        `• Guided trekking and sunrise exploration`,
        `• Photography spots and panoramic viewpoints`,
        `• Natural landscape and local culture immersion`,
        "",
        `For customized activities at ${dest.name}, feel free to chat with our local team on WhatsApp.`,
      ].join("\n");
    } else if (subAction === "access") {
      answerText = [
        `📍 Location & Access – ${dest.name}:`,
        "",
        `• Region: East Java, Indonesia`,
        dest.tag ? `• Classification: ${dest.tag}` : null,
        `• Gateway: Banyuwangi City / Blimbingsari Airport (BWX) / Ketapang Ferry Port`,
        "",
        `We provide full private transportation and pickup from hotels, airports, and train stations directly to ${dest.name}.`,
      ]
        .filter(Boolean)
        .join("\n");
    } else if (subAction === "packages") {
      let relatedPackages: CleanPackageData[] = [];
      try {
        relatedPackages = await getPackagesForDestination(dest.name);
      } catch {
        /* fallback */
      }

      if (relatedPackages.length > 0) {
        const pkgLines = relatedPackages.map(
          (p) => `• ${p.title} — ${p.price} (${p.duration}, ${p.difficulty})`
        );
        answerText = [
          `🎒 Tour Packages Visiting ${dest.name}:`,
          "",
          ...pkgLines,
          "",
          `Select any package from the Tour Packages menu or chat with us on WhatsApp to customize your trip.`,
        ].join("\n");
      } else {
        answerText = [
          `🎒 Tour Packages for ${dest.name}:`,
          "",
          `We offer flexible private trips and custom tour itineraries that include ${dest.name}.`,
          "",
          `Contact our travel coordinator on WhatsApp to arrange a personalized trip!`,
        ].join("\n");
      }
    } else {
      // Default: Overview
      answerText = [
        `📍 ${dest.name}`,
        dest.tag ? `🏷️ Category: ${dest.tag}` : null,
        "",
        dest.description,
        "",
        dest.isFeatured ? `⭐ Featured Highlight Destination` : null,
        "",
        `To explore tour packages for ${dest.name}, select the options below or chat with our team on WhatsApp.`,
      ]
        .filter(Boolean)
        .join("\n");
    }

    // Sub-actions for destination
    const destNavItems: MenuItem[] = [
      {
        id: "dest-sub-overview",
        label: "📖 Overview",
        icon: "📖",
        action: "ITEM_DETAIL",
        categoryId: "destinations",
        itemId,
        subAction: "overview",
      },
      {
        id: "dest-sub-activities",
        label: "🥾 Attractions & Activities",
        icon: "🥾",
        action: "ITEM_DETAIL",
        categoryId: "destinations",
        itemId,
        subAction: "activities",
      },
      {
        id: "dest-sub-access",
        label: "📍 Location & Access",
        icon: "📍",
        action: "ITEM_DETAIL",
        categoryId: "destinations",
        itemId,
        subAction: "access",
      },
      {
        id: "dest-sub-packages",
        label: "🎒 Related Tour Packages",
        icon: "🎒",
        action: "ITEM_DETAIL",
        categoryId: "destinations",
        itemId,
        subAction: "packages",
      },
    ];

    return {
      screen: "ANSWER",
      title: `🗺️ ${dest.name}`,
      subtitle: dest.tag ?? undefined,
      answerText,
      menuItems: destNavItems,
      navigation: [
        ...fullNav,
        {
          label: `💬 Inquire about ${dest.name}`,
          action: "whatsapp",
          whatsappLink: inquiryLink,
        },
      ],
      whatsappLink: inquiryLink,
    };
  }

  return {
    screen: "ANSWER",
    title: "Detail Not Available",
    answerText: UNAVAILABLE_MESSAGE,
    navigation: fullNav,
    error: `Detail not supported for category: ${categoryId}`,
  };
}

// ─── FAQ_ANSWER ───────────────────────────────────────────────────────────────

/**
 * Find relevant FAQs from DB and format an answer text.
 * Special handlers for dynamic live prices from TripPackage table.
 * Navigation = [Back, Main Menu, WhatsApp Support]
 */
export async function buildFaqAnswerResponse(
  subAction: string,
  context?: MenuChatbotRequest["context"]
): Promise<MenuChatbotResponse> {
  const baseNav: NavigationButton[] = [navBack(), navMainMenu()];
  const supportNav = navWhatsApp(
    WhatsAppTemplates.generalInquiry(subAction.replace(/_/g, " "))
  );
  const fullNav: NavigationButton[] = [...baseNav, supportNav];

  // 1. Dynamic Live Tour Prices from Database
  if (subAction === "tour_prices") {
    try {
      const packages = await getActivePackageSummaries();
      if (packages.length > 0) {
        const lines = [
          "💰 Official Tour Package Rates (Live Database):",
          "",
          ...packages.map(
            (p) => `• ${p.title}: ${p.price} / person (${p.duration}, ${p.difficulty})`
          ),
          "",
          "All prices include licensed local guide, safety equipment, and entrance permits.",
          "For custom group sizes, private quotes, or multi-day itineraries, please chat with our team on WhatsApp.",
        ];
        return {
          screen: "ANSWER",
          title: "💰 Tour Prices",
          answerText: lines.join("\n"),
          navigation: fullNav,
        };
      }
    } catch {
      /* fallback to FAQ search below */
    }
  }

  // 2. Company Information Direct Handler
  if (subAction === "company_location" || subAction === "contact_info") {
    const lines = [
      `🏢 ${COMPANY_INFO.name}`,
      `📍 Address: ${OFFICIAL_ADDRESS}`,
      `📞 Phone: ${OFFICIAL_PHONE}`,
      `📧 Email: ${OFFICIAL_EMAIL}`,
      `⏰ Operating Hours: ${COMPANY_INFO.operatingHours}`,
      "",
      `Our operational basecamp is located right in Banyuwangi, East Java, ensuring fast support and direct coordination for your Ijen expedition.`,
    ];
    return {
      screen: "ANSWER",
      title: subAction === "company_location" ? "📍 Company Location" : "📞 Contact Information",
      answerText: lines.join("\n"),
      navigation: fullNav,
    };
  }

  // 3. Search database FAQs by topic keywords
  const topicKeywords = deriveKeywordsFromSubAction(subAction, context);

  let faqs: CleanFaqData[] = [];
  try {
    faqs = await getFaqsByTopics(topicKeywords);
  } catch {
    return {
      screen: "ANSWER",
      title: formatSubActionTitle(subAction),
      answerText: UNAVAILABLE_MESSAGE,
      navigation: fullNav,
      error: "Failed to load FAQ data",
    };
  }

  const answerText =
    faqs.length > 0
      ? formatFaqAnswerText(faqs)
      : UNAVAILABLE_MESSAGE;

  return {
    screen: "ANSWER",
    title: formatSubActionTitle(subAction),
    answerText,
    navigation: fullNav,
  };
}

// ─── WHATSAPP_HANDOFF ─────────────────────────────────────────────────────────

/**
 * Build a WhatsApp handoff response.
 * Navigation = [Back, Main Menu]
 */
export function buildWhatsAppResponse(
  context?: MenuChatbotRequest["context"],
  subAction?: string
): MenuChatbotResponse {
  const topic =
    context?.selectedPackageTitle ??
    context?.selectedDestinationName ??
    (subAction ? subAction.replace(/_/g, " ") : "Tour Information");

  let message: string;
  if (subAction === "booking_inquiry") {
    message = `Hello Ijen Tour! I would like to inquire about booking availability and reservations. Could you please assist me?`;
  } else if (subAction === "custom_trip") {
    message = `Hello Ijen Tour! I would like to inquire about a custom private tour package for my group. Could you please assist me?`;
  } else if (subAction === "emergency") {
    message = `🆘 EMERGENCY: I need immediate assistance regarding my tour. Please contact me as soon as possible.`;
  } else if (subAction === "complaint") {
    message = `Hello Ijen Tour Team, I would like to share feedback regarding my tour experience.`;
  } else {
    message = `Hello Ijen Tour! I have some questions regarding ${topic}. Could you please assist me?`;
  }

  const whatsappLink = getWhatsAppLink(message);

  return {
    screen: "WHATSAPP",
    title: "💬 Contact Our Team on WhatsApp",
    subtitle:
      "Our local coordinator is ready to help you 24/7. Click the button below to start your WhatsApp chat directly.",
    answerText: `You are being directed to our official WhatsApp service:\n\n📱 Number: ${OFFICIAL_PHONE}\n💬 Message context: "${message}"\n\nClick "Chat with Us on WhatsApp" below to open the chat.`,
    whatsappLink,
    whatsappMessage: message,
    navigation: [navBack(), navMainMenu()],
  };
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function buildPackageAnswerText(pkg: CleanPackageData, subAction?: string): string {
  const lines: string[] = [];

  switch (subAction) {
    case "itinerary": {
      lines.push(`📋 Itinerary – ${pkg.title}`, "");
      if (pkg.itineraries.length === 0) {
        lines.push(UNAVAILABLE_MESSAGE);
      } else {
        pkg.itineraries.forEach((item, idx) => {
          const dayLabel = item.day ?? `Step ${idx + 1}`;
          lines.push(`🔹 ${dayLabel}: ${item.title}`);
          if (item.desc) lines.push(`   ${item.desc}`);
          lines.push("");
        });
      }
      break;
    }

    case "included": {
      lines.push(`✅ Inclusions & Exclusions – ${pkg.title}`, "");
      lines.push("✅ INCLUDED IN PACKAGE:");
      if (pkg.includedItems.length > 0) {
        pkg.includedItems.forEach((item) => lines.push(`  • ${item}`));
      } else {
        lines.push(`  • Please contact our coordinator for the official inclusion checklist.`);
      }
      lines.push("");
      lines.push("❌ NOT INCLUDED:");
      if (pkg.excludedItems.length > 0) {
        pkg.excludedItems.forEach((item) => lines.push(`  • ${item}`));
      } else {
        lines.push(`  • Personal expenses, tipping, and travel insurance.`);
      }
      break;
    }

    case "prices": {
      lines.push(`💰 Prices & Departure Schedules – ${pkg.title}`, "");
      lines.push(`💵 Official Price: ${pkg.price} per person`);
      if (pkg.groupDiscountPercent > 0) {
        lines.push(`🏷️ Group Discount: ${pkg.groupDiscountPercent}% off for group bookings`);
      }
      lines.push(`👥 Participant Quota: ${pkg.minParticipants}–${pkg.maxParticipants} persons`);
      lines.push("");

      if (pkg.schedules.length > 0) {
        lines.push("📅 Upcoming Open Schedules:");
        pkg.schedules.slice(0, 5).forEach((s) => {
          const slots = s.availableSlots - s.bookedSlots;
          lines.push(
            `  • Departure: ${s.departureDate} — ${slots > 0 ? `${slots} slot${slots !== 1 ? "s" : ""} available` : "Full / Closed"}`
          );
        });
      } else {
        lines.push(
          "📅 Open trip departures run daily subject to trail status.",
          "Please chat with us on WhatsApp to confirm tomorrow's departure slot."
        );
      }
      break;
    }

    case "overview":
    default: {
      lines.push(`🎒 ${pkg.title}`, "");
      if (pkg.shortDescription ?? pkg.description) {
        lines.push(pkg.shortDescription ?? pkg.description.slice(0, 320));
        lines.push("");
      }
      lines.push(`⏱️ Duration: ${pkg.duration}`);
      lines.push(`⛰️ Difficulty Level: ${pkg.difficulty}`);
      lines.push(`💰 Price: ${pkg.price}`);
      if (pkg.meetingPoint) lines.push(`📍 Meeting Point: ${pkg.meetingPoint}`);
      if (pkg.departureTime) lines.push(`🕐 Departure Time: ${pkg.departureTime}`);
      if (pkg.pickupArea) lines.push(`🚐 Pickup Area: ${pkg.pickupArea}`);
      if (pkg.altitude) lines.push(`🏔️ Altitude: ${pkg.altitude}`);
      lines.push(`⭐ Verified Rating: ${pkg.rating}/5.0`);

      if (pkg.highlights.length > 0) {
        lines.push("", "✨ Tour Highlights:");
        pkg.highlights
          .slice(0, 5)
          .forEach((h) => lines.push(`  • ${h}`));
      }
      break;
    }
  }

  return lines.join("\n").trim();
}

function formatFaqAnswerText(faqs: CleanFaqData[]): string {
  const lines: string[] = [];
  faqs.forEach((faq, idx) => {
    if (idx > 0) lines.push("");
    lines.push(`❓ ${faq.question}`);
    lines.push(`💡 ${faq.answer}`);
  });
  return lines.join("\n");
}

function formatSubActionTitle(subAction: string): string {
  return subAction
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Derive keyword arrays from a subAction slug + context for FAQ search.
 */
function deriveKeywordsFromSubAction(
  subAction: string,
  context?: MenuChatbotRequest["context"]
): string[] {
  const keywords = subAction.split("_").filter((k) => k.length > 1);

  // Merge context hints if present
  if (context?.selectedPackageTitle) {
    keywords.push(...context.selectedPackageTitle.toLowerCase().split(" "));
  }
  if (context?.selectedDestinationName) {
    keywords.push(...context.selectedDestinationName.toLowerCase().split(" "));
  }

  // Domain-specific synonyms for accurate FAQ matching
  const synonymMap: Record<string, string[]> = {
    // Destinations
    destination_overview: ["ijen", "crater", "overview", "attraction", "destination"],
    destination_activities: ["activity", "trekking", "blue fire", "hiking", "photography"],
    destination_access: ["access", "location", "reach", "how to get", "route", "airport"],

    // Packages
    tour_itinerary: ["itinerary", "schedule", "timeline", "midnight", "program"],
    whats_included: ["included", "include", "package", "facility", "facilities"],
    tour_duration: ["duration", "how long", "hours", "days", "time"],

    // Prices & Payment
    tour_prices: ["price", "cost", "rate", "fee", "package price"],
    additional_fees: ["fee", "additional", "extra", "rental", "surcharge", "certificate"],
    payment_methods: ["payment", "pay", "bank transfer", "wise", "credit card", "paypal"],
    deposit_info: ["deposit", "down payment", "dp", "advance", "booking fee"],
    payment_policies: ["policy", "payment", "currency", "terms", "receipt"],

    // Booking
    how_to_book: ["book", "reserve", "order", "reservation", "how to book"],
    booking_requirements: ["requirement", "id", "passport", "health", "medical", "certificate"],
    group_booking: ["group", "discount", "family", "corporate", "pax"],
    cancellation_policy: ["cancel", "cancellation", "refund", "refund policy"],
    rescheduling_policy: ["reschedule", "change date", "date change", "postpone"],
    departure_schedules: ["schedule", "departure", "date", "calendar", "availability"],

    // Transport & Accommodation
    transport_services: ["transport", "car", "driver", "vehicle", "van", "jeep", "4wd"],
    hotel_pickup: ["hotel", "pick up", "pickup", "ketapang", "banyuwangi", "area"],
    meeting_point: ["meeting", "trailhead", "start point", "paltuding", "basecamp"],
    accommodation_info: ["accommodation", "hotel", "homestay", "resort", "lodging", "stay"],
    station_pickup: ["airport", "station", "train", "bwx", "karangasem", "blimbingsari"],

    // Safety & Preparation
    travel_preparation: ["prepare", "preparation", "ready", "fitness", "physical"],
    recommended_equipment: ["equipment", "gear", "headlamp", "pole", "shoes", "flashlight"],
    clothing_recommendations: ["clothing", "clothes", "jacket", "warm", "cold", "temperature"],
    gas_mask_equipment: ["gas mask", "mask", "respirator", "sulfur", "safety gear", "smoke"],
    restrictions: ["age", "restriction", "pregnant", "children", "elderly", "asthma", "heart"],

    // Weather & Conditions
    trail_conditions: ["trail", "condition", "weather", "rain", "path", "crater"],
    blue_fire_visibility: ["blue fire", "visibility", "night", "fire", "crater lake"],
    best_season: ["season", "best time", "month", "weather", "dry season", "when to visit"],
    volcanic_alert: ["volcanic", "alert", "status", "pvmbg", "crater", "closed", "activity"],

    // About Ijen Tour
    who_we_are: ["about", "company", "team", "ijen tour", "profile"],
    our_services: ["service", "services", "tour operator", "trips"],
    why_choose_us: ["choose", "best", "why", "advantage", "licensed"],
    company_location: ["location", "address", "office", "where", "licin"],
    contact_info: ["contact", "phone", "email", "whatsapp", "call"],
  };

  const extra = synonymMap[subAction] ?? [];
  return [...new Set([...keywords, ...extra])];
}
