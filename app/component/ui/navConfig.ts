/**
 * Navigation Configuration for Mount Ijen Tour
 * Structured specifically for international travelers and intuitive discovery.
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
  href?: string; // Set if direct link without dropdown (e.g. Home, About Us, Contact)
  sections?: NavSection[];
}

export const MAIN_NAV_ITEMS: NavDropdownItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Tours",
    sections: [
      {
        items: [
          {
            title: "Tour Packages",
            href: "/packages",
            description: "Guided trekking, midnight blue fire & overland expeditions",
            badge: "Popular",
          },
          {
            title: "Custom Trip",
            href: "/custom-package",
            description: "Design your personalized private adventure with local guides",
            badge: "Customizer",
          },
          {
            title: "Reservation Status",
            href: "/booking",
            description: "Track your booking code, departure time, and status",
          },
        ],
      },
    ],
  },
  {
    label: "Explore",
    sections: [
      {
        items: [
          {
            title: "Destinations",
            href: "/destinations",
            description: "Explore Kawah Ijen, Baluran Safari, and De Djawatan Forest",
          },
          {
            title: "Travel Gallery",
            href: "/gallery",
            description: "Authentic photos and stories from travelers & local guides",
          },
        ],
      },
    ],
  },
  {
    label: "Discover",
    sections: [
      {
        items: [
          {
            title: "Travel Blog",
            href: "/blog",
            description: "Insider stories, travel tips, and volcano insights",
          },
          {
            title: "Travel Guides",
            href: "/blog?category=Guides",
            description: "Fitness prep, 3-layer clothing, and respirator safety advice",
          },
          {
            title: "FAQ",
            href: "/about#faq",
            description: "Frequently asked questions on weather, fitness, and gear",
          },
        ],
      },
    ],
  },
  {
    label: "About Us",
    href: "/about",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];
