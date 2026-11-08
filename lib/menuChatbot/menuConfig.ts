/**
 * Static menu configuration for the Interactive Menu Chatbot
 * Ijen Tour – 9 categories (A–I), all text in English
 * Database as Single Source of Truth: dynamic items delegate to dataService
 */

import type { MenuItem, CategoryId } from "./types";

export interface CategoryConfig {
  id: CategoryId;
  label: string;
  icon: string;
  description: string;
  subItems: MenuItem[];
}

// ─── A. Travel Destinations ───────────────────────────────────────────────────
const destinationsCategory: CategoryConfig = {
  id: "destinations",
  label: "Travel Destinations",
  icon: "🗺️",
  description: "Explore all verified tourist destinations across East Java",
  subItems: [
    {
      id: "destinations-all",
      label: "Explore All Destinations",
      icon: "📋",
      description: "Browse all available destinations from database",
      action: "ITEM_LIST",
      categoryId: "destinations",
    },
    {
      id: "destinations-popular",
      label: "Popular Destinations",
      icon: "⭐",
      description: "Featured top-rated destinations",
      action: "ITEM_LIST",
      categoryId: "destinations",
      subAction: "popular",
    },
    {
      id: "destinations-overview",
      label: "Destination Overview",
      icon: "📖",
      description: "General overview of Mount Ijen & East Java highlights",
      action: "FAQ_ANSWER",
      categoryId: "destinations",
      subAction: "destination_overview",
    },
    {
      id: "destinations-activities",
      label: "Available Activities",
      icon: "🥾",
      description: "Hiking, Blue Fire viewing, photography & wildlife safari",
      action: "FAQ_ANSWER",
      categoryId: "destinations",
      subAction: "destination_activities",
    },
    {
      id: "destinations-access",
      label: "Location & Access",
      icon: "📍",
      description: "How to reach the destinations from Banyuwangi, Bali & Surabaya",
      action: "FAQ_ANSWER",
      categoryId: "destinations",
      subAction: "destination_access",
    },
    {
      id: "destinations-packages",
      label: "Available Tour Packages",
      icon: "🎒",
      description: "Find tour packages visiting these destinations",
      action: "ITEM_LIST",
      categoryId: "packages",
    },
  ],
};

// ─── B. Tour Packages ─────────────────────────────────────────────────────────
const packagesCategory: CategoryConfig = {
  id: "packages",
  label: "Tour Packages",
  icon: "🎒",
  description: "Browse open trip and private tour packages with live pricing",
  subItems: [
    {
      id: "packages-all",
      label: "View All Tour Packages",
      icon: "📋",
      description: "Complete list of active packages from our official catalog",
      action: "ITEM_LIST",
      categoryId: "packages",
    },
    {
      id: "packages-open-trip",
      label: "Open Trip Packages",
      icon: "👥",
      description: "Join scheduled group tours at friendly per-person rates",
      action: "ITEM_LIST",
      categoryId: "packages",
      subAction: "open_trip",
    },
    {
      id: "packages-private-trip",
      label: "Private Trip Packages",
      icon: "🔑",
      description: "Exclusive private tours tailored to your own schedule",
      action: "ITEM_LIST",
      categoryId: "packages",
      subAction: "private_trip",
    },
    {
      id: "packages-itineraries",
      label: "Tour Itineraries",
      icon: "⏱️",
      description: "Typical midnight Blue Fire & sunrise schedules",
      action: "FAQ_ANSWER",
      categoryId: "packages",
      subAction: "tour_itinerary",
    },
    {
      id: "packages-included",
      label: "What's Included & Excluded",
      icon: "✅",
      description: "Guide, gas mask, tickets, transport, and insurance inclusions",
      action: "FAQ_ANSWER",
      categoryId: "packages",
      subAction: "whats_included",
    },
    {
      id: "packages-duration",
      label: "Tour Duration Guide",
      icon: "⏳",
      description: "Single-day, overnight, and multi-day expedition durations",
      action: "FAQ_ANSWER",
      categoryId: "packages",
      subAction: "tour_duration",
    },
  ],
};

// ─── C. Prices & Payment ──────────────────────────────────────────────────────
const pricesCategory: CategoryConfig = {
  id: "prices",
  label: "Prices & Payment",
  icon: "💰",
  description: "Official tour prices, payment methods, and deposit rules",
  subItems: [
    {
      id: "prices-tour-prices",
      label: "Tour Prices (Live Catalog)",
      icon: "💵",
      description: "Live package pricing directly from our database",
      action: "FAQ_ANSWER",
      categoryId: "prices",
      subAction: "tour_prices",
    },
    {
      id: "prices-additional-fees",
      label: "Additional Fees & Extras",
      icon: "🏷️",
      description: "Weekend surcharges, health certificate & gear rental fees",
      action: "FAQ_ANSWER",
      categoryId: "prices",
      subAction: "additional_fees",
    },
    {
      id: "prices-payment-methods",
      label: "Payment Methods",
      icon: "💳",
      description: "Bank transfer, credit card, Wise, PayPal & cash options",
      action: "FAQ_ANSWER",
      categoryId: "prices",
      subAction: "payment_methods",
    },
    {
      id: "prices-deposit-info",
      label: "Deposit Information",
      icon: "🏦",
      description: "Required deposit percentage to secure your departure",
      action: "FAQ_ANSWER",
      categoryId: "prices",
      subAction: "deposit_info",
    },
    {
      id: "prices-payment-policies",
      label: "Payment Policies",
      icon: "📄",
      description: "Currency, balance due date, and receipt terms",
      action: "FAQ_ANSWER",
      categoryId: "prices",
      subAction: "payment_policies",
    },
  ],
};

// ─── D. Booking Information ───────────────────────────────────────────────────
const bookingCategory: CategoryConfig = {
  id: "booking",
  label: "Booking Information",
  icon: "📋",
  description: "Reservation steps, requirements, and cancellation policies",
  subItems: [
    {
      id: "booking-how-to",
      label: "How to Book?",
      icon: "📝",
      description: "Step-by-step reservation guide",
      action: "FAQ_ANSWER",
      categoryId: "booking",
      subAction: "how_to_book",
    },
    {
      id: "booking-requirements",
      label: "Booking Requirements",
      icon: "🪪",
      description: "Passport/ID, medical health certificate & participant info",
      action: "FAQ_ANSWER",
      categoryId: "booking",
      subAction: "booking_requirements",
    },
    {
      id: "booking-group",
      label: "Group Booking",
      icon: "👥",
      description: "Special arrangements and discounts for groups of 4+",
      action: "FAQ_ANSWER",
      categoryId: "booking",
      subAction: "group_booking",
    },
    {
      id: "booking-cancellation",
      label: "Cancellation Policy",
      icon: "❌",
      description: "Refund policy and cancellation notice timeframes",
      action: "FAQ_ANSWER",
      categoryId: "booking",
      subAction: "cancellation_policy",
    },
    {
      id: "booking-rescheduling",
      label: "Rescheduling Policy",
      icon: "🔄",
      description: "Changing departure dates without penalty fees",
      action: "FAQ_ANSWER",
      categoryId: "booking",
      subAction: "rescheduling_policy",
    },
    {
      id: "booking-inquiry-wa",
      label: "Reserve via WhatsApp",
      icon: "💬",
      description: "Chat with our coordinator to secure departure slots",
      action: "WHATSAPP_HANDOFF",
      categoryId: "booking",
      subAction: "booking_inquiry",
    },
  ],
};

// ─── E. Transportation & Accommodation ────────────────────────────────────────
const transportCategory: CategoryConfig = {
  id: "transport",
  label: "Transportation & Accommodation",
  icon: "🚐",
  description: "Pickup areas, meeting points, airport transfers & hotels",
  subItems: [
    {
      id: "transport-services",
      label: "Transportation Services",
      icon: "🚗",
      description: "Air-conditioned 4WD troopers, MPVs & tourist vans",
      action: "FAQ_ANSWER",
      categoryId: "transport",
      subAction: "transport_services",
    },
    {
      id: "transport-hotel-pickup",
      label: "Hotel Pickup Service",
      icon: "🏨",
      description: "Free pickup areas in Banyuwangi City & Ketapang Port",
      action: "FAQ_ANSWER",
      categoryId: "transport",
      subAction: "hotel_pickup",
    },
    {
      id: "transport-meeting-point",
      label: "Basecamp Meeting Point",
      icon: "📍",
      description: "Paltuding Basecamp coordinates and meeting guidelines",
      action: "FAQ_ANSWER",
      categoryId: "transport",
      subAction: "meeting_point",
    },
    {
      id: "transport-accommodation",
      label: "Accommodation Information",
      icon: "🛏️",
      description: "Recommended hotels, homestays, and included tour lodging",
      action: "FAQ_ANSWER",
      categoryId: "transport",
      subAction: "accommodation_info",
    },
    {
      id: "transport-station-pickup",
      label: "Airport / Station Pickup",
      icon: "✈️",
      description: "Banyuwangi Airport (BWX) & Karangasem train station pickup",
      action: "FAQ_ANSWER",
      categoryId: "transport",
      subAction: "station_pickup",
    },
  ],
};

// ─── F. Safety & Preparation ──────────────────────────────────────────────────
const safetyCategory: CategoryConfig = {
  id: "safety",
  label: "Safety & Preparation",
  icon: "🦺",
  description: "Trek readiness, gas masks, clothing tips & age restrictions",
  subItems: [
    {
      id: "safety-preparation",
      label: "Travel Preparation",
      icon: "🎒",
      description: "Fitness requirements and preparation checklist",
      action: "FAQ_ANSWER",
      categoryId: "safety",
      subAction: "travel_preparation",
    },
    {
      id: "safety-equipment",
      label: "Recommended Equipment",
      icon: "🔦",
      description: "Headlamp, trekking pole, warm gloves & water bottle",
      action: "FAQ_ANSWER",
      categoryId: "safety",
      subAction: "recommended_equipment",
    },
    {
      id: "safety-clothing",
      label: "Clothing Recommendations",
      icon: "🧥",
      description: "Layered clothing for 5°C - 12°C cold mountain temperatures",
      action: "FAQ_ANSWER",
      categoryId: "safety",
      subAction: "clothing_recommendations",
    },
    {
      id: "safety-gas-masks",
      label: "Safety Information & Gas Masks",
      icon: "😷",
      description: "Professional sulfur gas respirators & crater safety",
      action: "FAQ_ANSWER",
      categoryId: "safety",
      subAction: "gas_mask_equipment",
    },
    {
      id: "safety-age-restrictions",
      label: "Age Restrictions & Health",
      icon: "🚫",
      description: "Restrictions for asthma, heart conditions, elderly & kids",
      action: "FAQ_ANSWER",
      categoryId: "safety",
      subAction: "restrictions",
    },
  ],
};

// ─── G. Weather & Travel Conditions ───────────────────────────────────────────
const weatherCategory: CategoryConfig = {
  id: "weather",
  label: "Weather & Travel Conditions",
  icon: "⛅",
  description: "Trail conditions, volcanic activity status & Blue Fire visibility",
  subItems: [
    {
      id: "weather-trail-conditions",
      label: "Current Trail Conditions",
      icon: "🥾",
      description: "Trekking route status, rain forecast, and crater accessibility",
      action: "FAQ_ANSWER",
      categoryId: "weather",
      subAction: "trail_conditions",
    },
    {
      id: "weather-blue-fire",
      label: "Blue Fire Visibility",
      icon: "🔥",
      description: "Weather factors determining Blue Fire visibility at night",
      action: "FAQ_ANSWER",
      categoryId: "weather",
      subAction: "blue_fire_visibility",
    },
    {
      id: "weather-best-season",
      label: "Best Time to Visit",
      icon: "🗓️",
      description: "Dry season (April - October) vs rainy season recommendations",
      action: "FAQ_ANSWER",
      categoryId: "weather",
      subAction: "best_season",
    },
    {
      id: "weather-volcanic-status",
      label: "Volcanic Activity Status",
      icon: "🌋",
      description: "PVMBG official activity level and crater safety zone",
      action: "FAQ_ANSWER",
      categoryId: "weather",
      subAction: "volcanic_alert",
    },
  ],
};

// ─── H. About Ijen Tour ───────────────────────────────────────────────────────
const aboutCategory: CategoryConfig = {
  id: "about",
  label: "About Ijen Tour",
  icon: "ℹ️",
  description: "Official company background, operating hours & office details",
  subItems: [
    {
      id: "about-overview",
      label: "About Our Company",
      icon: "🏢",
      description: "Licensed local operator based in Banyuwangi, East Java",
      action: "FAQ_ANSWER",
      categoryId: "about",
      subAction: "who_we_are",
    },
    {
      id: "about-services",
      label: "Our Services",
      icon: "⭐",
      description: "Open trips, private tours, custom packages & transport",
      action: "FAQ_ANSWER",
      categoryId: "about",
      subAction: "our_services",
    },
    {
      id: "about-why-choose",
      label: "Why Choose Us?",
      icon: "🏆",
      description: "Local licensed guides, safety standards & verified reviews",
      action: "FAQ_ANSWER",
      categoryId: "about",
      subAction: "why_choose_us",
    },
    {
      id: "about-location",
      label: "Company Location",
      icon: "📍",
      description: "Official operational office address in Banyuwangi",
      action: "FAQ_ANSWER",
      categoryId: "about",
      subAction: "company_location",
    },
    {
      id: "about-contact",
      label: "Contact Information",
      icon: "📞",
      description: "Official telephone, email, and 24/7 emergency support",
      action: "FAQ_ANSWER",
      categoryId: "about",
      subAction: "contact_info",
    },
  ],
};

// ─── I. Customer Support ─────────────────────────────────────────────────────
const supportCategory: CategoryConfig = {
  id: "support",
  label: "Customer Support",
  icon: "💬",
  description: "Direct assistance with our coordinator via official WhatsApp",
  subItems: [
    {
      id: "support-team",
      label: "Contact Our Team",
      icon: "👨‍💼",
      description: "Connect with our local travel specialist",
      action: "WHATSAPP_HANDOFF",
      categoryId: "support",
      subAction: "general",
    },
    {
      id: "support-whatsapp",
      label: "WhatsApp Support",
      icon: "💬",
      description: "24/7 direct WhatsApp messaging channel",
      action: "WHATSAPP_HANDOFF",
      categoryId: "support",
      subAction: "general",
    },
    {
      id: "support-custom-trip",
      label: "Custom Trip Inquiry",
      icon: "✨",
      description: "Tailor a custom private itinerary for your group",
      action: "WHATSAPP_HANDOFF",
      categoryId: "support",
      subAction: "custom_trip",
    },
    {
      id: "support-assistance",
      label: "Need Assistance?",
      icon: "🆘",
      description: "Immediate help for ongoing bookings or urgent questions",
      action: "WHATSAPP_HANDOFF",
      categoryId: "support",
      subAction: "emergency",
    },
  ],
};

// ─── Exported config (9 Categories) ───────────────────────────────────────────
export const MENU_CATEGORIES: CategoryConfig[] = [
  destinationsCategory,
  packagesCategory,
  pricesCategory,
  bookingCategory,
  transportCategory,
  safetyCategory,
  weatherCategory,
  aboutCategory,
  supportCategory,
];

/** Map for quick lookup by category ID */
export const MENU_CATEGORY_MAP: Record<string, CategoryConfig> = Object.fromEntries(
  MENU_CATEGORIES.map((c) => [c.id, c])
);

/** Main menu items (one per category) */
export const MAIN_MENU_ITEMS: MenuItem[] = MENU_CATEGORIES.map((cat) => ({
  id: `main-${cat.id}`,
  label: cat.label,
  icon: cat.icon,
  description: cat.description,
  action: "CATEGORY" as const,
  categoryId: cat.id,
}));
