/**
 * Navigation Configuration for Ijen Tour
 * Structured specifically for international travelers and natural English phrasing.
 */

export interface NavChildItem {
  title: string;
  href: string;
  description: string;
  badge?: string;
}

export interface NavSection {
  title?: string;
  items: NavChildItem[];
}

export interface NavDropdownItem {
  label: string;
  href?: string; // Set if direct link without dropdown (e.g. Home)
  sections?: NavSection[];
}

export const MAIN_NAV_ITEMS: NavDropdownItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Explore",
    sections: [
      {
        title: "Tour Packages",
        items: [
          {
            title: "All Tour Packages",
            href: "/packages",
            description: "Explore all guided trekking and overland packages",
          },
          {
            title: "Midnight Blue Fire Trek",
            href: "/packages?category=midnight",
            description: "00:00 AM expedition to witness rare electric blue flames",
            badge: "Popular",
          },
          {
            title: "Private Family & Group Tours",
            href: "/packages?category=private",
            description: "Dedicated vehicle, private guide, and flexible itinerary",
          },
          {
            title: "Regular Open Trips",
            href: "/packages?category=regular",
            description: "Budget-friendly shared adventures with fellow travelers",
          },
        ],
      },
      {
        title: "Top Destinations",
        items: [
          {
            title: "All Destinations",
            href: "/destinations",
            description: "Complete guide to East Java's natural wonders",
          },
          {
            title: "Mount Ijen Crater",
            href: "/destinations/kawah-ijen",
            description: "Electric blue fire and turquoise acidic crater lake",
          },
          {
            title: "Baluran National Park",
            href: "/destinations/tn-baluran",
            description: "Wildlife safari savanna dubbed 'Africa van Java'",
          },
          {
            title: "De Djawatan Forest",
            href: "/destinations/de-djawatan",
            description: "Enchanted ancient trembesi forest like Lord of the Rings",
          },
        ],
      },
      {
        title: "Visual Gallery",
        items: [
          {
            title: "Photo & Video Gallery",
            href: "/gallery",
            description: "Authentic moments captured by our travelers & guides",
          },
        ],
      },
    ],
  },
  {
    label: "Plan Your Trip",
    sections: [
      {
        title: "Trip Planning & Booking",
        items: [
          {
            title: "Build Your Own Trip",
            href: "/custom-package",
            description: "Select destinations, private transport, and local guides",
            badge: "Customizer",
          },
          {
            title: "Track Reservation Status",
            href: "/booking",
            description: "Check your booking code, departure time, and status",
          },
        ],
      },
    ],
  },
  {
    label: "Travel Guide",
    sections: [
      {
        title: "Insights & Advice",
        items: [
          {
            title: "Travel Articles & Stories",
            href: "/blog",
            description: "In-depth guides and insider tips from local Banyuwangi guides",
          },
          {
            title: "Hiking & Safety Preparation",
            href: "/blog?category=Tips%20%26%20Tricks",
            description: "Fitness checklist, 3-layer clothing system, and gas masks",
          },
          {
            title: "Ijen Volcanic Insights",
            href: "/blog?category=Ijen%20Insights",
            description: "The rare science of blue fire and sulfur mining culture",
          },
          {
            title: "Frequently Asked Questions",
            href: "/about#faq",
            description: "Clear answers on weather, fitness, and equipment rental",
          },
        ],
      },
    ],
  },
  {
    label: "About Us",
    sections: [
      {
        title: "Who We Are",
        items: [
          {
            title: "Our Story & Team",
            href: "/about",
            description: "Certified local guides dedicated to sustainable eco-tourism",
          },
          {
            title: "Contact & Direct Support",
            href: "/contact",
            description: "24/7 WhatsApp assistance, coordinator team, and inquiries",
          },
        ],
      },
    ],
  },
];
