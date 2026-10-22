export interface CustomDestinationItem {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  tag?: string;
}

export interface CustomDurationOption {
  id: string;
  name: string;
  days: number;
  nights: number;
  description: string;
}

export interface CustomTransportOption {
  id: string;
  name: string;
  capacity: string;
  description: string;
}

export interface CustomGuideOption {
  id: string;
  name: string;
  description: string;
}

export interface CustomAddonOption {
  id: string;
  name: string;
  description: string;
}

export const DURATION_OPTIONS: CustomDurationOption[] = [
  {
    id: "1d",
    name: "1 Day (Full Day Expedition)",
    days: 1,
    nights: 0,
    description: "Best for 1-2 nearby destinations (e.g. Midnight Ijen + Morning Baluran/Djawatan)",
  },
  {
    id: "2d1n",
    name: "2 Days 1 Night (2D1N Explorer)",
    days: 2,
    nights: 1,
    description: "Ideal combination covering Kawah Ijen, Baluran Safari, and Southern Beaches",
  },
  {
    id: "3d2n",
    name: "3 Days 2 Nights (3D2N Ultimate)",
    days: 3,
    nights: 2,
    description: "Complete overland journey across all major natural wonders of Banyuwangi",
  },
];

export const TRANSPORT_OPTIONS: CustomTransportOption[] = [
  {
    id: "mpv",
    name: "Private AC MPV (Avanza / Innova)",
    capacity: "1 - 5 Travelers",
    description: "Comfortable family vehicle with licensed driver, fuel, and parking included",
  },
  {
    id: "hiace",
    name: "Executive Minibus (Toyota HiAce)",
    capacity: "6 - 13 Travelers",
    description: "Spacious commuter minibus ideal for group adventures with luggage space",
  },
  {
    id: "jeep",
    name: "4x4 Mountain Trooper / 4WD Jeep",
    capacity: "1 - 5 Travelers",
    description: "Rugged 4WD vehicle for steep highland terrain and crater access",
  },
  {
    id: "none",
    name: "Self-Arranged / Own Vehicle",
    capacity: "Meet at Basecamp",
    description: "Customer brings own vehicle; coordinator will meet at Paltuding basecamp",
  },
];

export const GUIDE_OPTIONS: CustomGuideOption[] = [
  {
    id: "certified-guide",
    name: "Certified English Mountain Guide",
    description: "Licensed local guide with first aid training and deep volcanic insight",
  },
  {
    id: "guide-porter",
    name: "Guide + Traditional Trolley Miner Assistant",
    description: "Dedicated guide plus local miner companion for safety & assistance",
  },
  {
    id: "none",
    name: "No Guide (Self-Guided)",
    description: "Trek without guide (only recommended for experienced trekkers)",
  },
];

export const ADDON_OPTIONS: CustomAddonOption[] = [
  {
    id: "gasmask-headlamp",
    name: "Medical Respirator Gas Mask & High-Lumen Headlamp",
    description: "Essential multi-cartridge mask for crater sulfur smoke plus LED headlamp",
  },
  {
    id: "thermal-jacket",
    name: "Thermal Mountain Windbreaker Jacket Rental",
    description: "Warm fleece-lined windproof jacket for 8°C summit temperatures",
  },
  {
    id: "trolley-taxi",
    name: "Roundtrip Crater Trolley Taxi (Troli Tambang)",
    description: "Comfortable human-powered cart pulled by local sulfur miners up & down the crater",
  },
  {
    id: "documentation",
    name: "GoPro 4K & Action Photo Documentation",
    description: "Uncapped photos and 4K footage delivered directly to your smartphone",
  },
  {
    id: "meal-box",
    name: "Breakfast & Energy Snack Pack",
    description: "Hot tea/coffee, sandwiches, boiled eggs, fresh fruits, and mineral water",
  },
];
