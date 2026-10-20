/**
 * Custom Tour Package Engine & Pricing Rules - Ijen Tour
 * Provides transparent, deterministic price estimation on both client and server.
 */

export interface CustomDestinationItem {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  tag?: string;
  ticketPrice: number; // Operational entry/permit fee per person in IDR
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
  pricePerDay: number; // IDR per day
  description: string;
}

export interface CustomGuideOption {
  id: string;
  name: string;
  pricePerDay: number; // IDR per day
  description: string;
}

export interface CustomAddonOption {
  id: string;
  name: string;
  price: number; // IDR
  perPerson: boolean; // true = multiplied by pax, false = flat per trip
  description: string;
}

// Operational Pricing Rules for Known Destinations
export const DESTINATION_PRICING_MAP: Record<string, number> = {
  'kawah-ijen': 150000, // Includes SIMAKSI permit, ranger fee, conservation
  'dest-ijen': 150000,
  'de-djawatan': 25000, // Hutan Trembesi entrance levy
  'dest-djawatan': 25000,
  'tn-baluran': 100000, // National Park entrance & safari vehicle permit
  'dest-baluran': 100000,
  'red-island': 25000, // Pantai Pulau Merah entrance fee
  'dest-red-island': 25000,
  'green-island': 75000, // Teluk Ijo entry + local boat transport
  'dest-green-island': 75000,
  'kawah-wurung': 30000, // Highland savanna entrance fee
  'dest-kawah-wurung': 30000,
};

export const DEFAULT_DESTINATION_TICKET_PRICE = 50000;

export const DURATION_OPTIONS: CustomDurationOption[] = [
  {
    id: '1d',
    name: '1 Day (Full Day Expedition)',
    days: 1,
    nights: 0,
    description: 'Best for 1-2 nearby destinations (e.g. Midnight Ijen + Morning Baluran/Djawatan)',
  },
  {
    id: '2d1n',
    name: '2 Days 1 Night (2D1N Explorer)',
    days: 2,
    nights: 1,
    description: 'Ideal combination covering Kawah Ijen, Baluran Safari, and Southern Beaches',
  },
  {
    id: '3d2n',
    name: '3 Days 2 Nights (3D2N Ultimate)',
    days: 3,
    nights: 2,
    description: 'Complete overland journey across all major natural wonders of Banyuwangi',
  },
];

export const TRANSPORT_OPTIONS: CustomTransportOption[] = [
  {
    id: 'mpv',
    name: 'Private AC MPV (Avanza / Innova)',
    capacity: '1 - 5 Travelers',
    pricePerDay: 650000,
    description: 'Comfortable family vehicle with licensed driver, fuel, and parking included',
  },
  {
    id: 'hiace',
    name: 'Executive Minibus (Toyota HiAce)',
    capacity: '6 - 13 Travelers',
    pricePerDay: 1250000,
    description: 'Spacious commuter minibus ideal for group adventures with luggage space',
  },
  {
    id: 'jeep',
    name: '4x4 Mountain Trooper / 4WD Jeep',
    capacity: '1 - 5 Travelers',
    pricePerDay: 950000,
    description: 'Rugged 4WD vehicle for steep highland terrain and crater access',
  },
  {
    id: 'none',
    name: 'Self-Arranged / Own Vehicle',
    capacity: 'Meet at Basecamp',
    pricePerDay: 0,
    description: 'Customer brings own vehicle; coordinator will meet at Paltuding basecamp',
  },
];

export const GUIDE_OPTIONS: CustomGuideOption[] = [
  {
    id: 'certified-guide',
    name: 'Certified English Mountain Guide',
    pricePerDay: 350000,
    description: 'Licensed local guide with first aid training and deep volcanic insight',
  },
  {
    id: 'guide-porter',
    name: 'Guide + Traditional Trolley Miner Assistant',
    pricePerDay: 1150000,
    description: 'Dedicated guide plus local miner companion for safety & assistance',
  },
  {
    id: 'none',
    name: 'No Guide (Self-Guided)',
    pricePerDay: 0,
    description: 'Trek without guide (only recommended for experienced trekkers)',
  },
];

export const ADDON_OPTIONS: CustomAddonOption[] = [
  {
    id: 'gasmask-headlamp',
    name: 'Medical Respirator Gas Mask & High-Lumen Headlamp',
    price: 50000,
    perPerson: true,
    description: 'Essential multi-cartridge mask for crater sulfur smoke plus LED headlamp',
  },
  {
    id: 'thermal-jacket',
    name: 'Thermal Mountain Windbreaker Jacket Rental',
    price: 50000,
    perPerson: true,
    description: 'Warm fleece-lined windproof jacket for 8°C summit temperatures',
  },
  {
    id: 'trolley-taxi',
    name: 'Roundtrip Crater Trolley Taxi (Troli Tambang)',
    price: 800000,
    perPerson: true,
    description: 'Comfortable human-powered cart pulled by local sulfur miners up & down the crater',
  },
  {
    id: 'documentation',
    name: 'GoPro 4K & Action Photo Documentation',
    price: 450000,
    perPerson: false,
    description: 'Uncapped photos and 4K footage delivered directly to your smartphone',
  },
  {
    id: 'meal-box',
    name: 'Breakfast & Energy Snack Pack',
    price: 450000, // flat for group or per person: let's use 50000 per person
    perPerson: true,
    description: 'Hot tea/coffee, sandwiches, boiled eggs, fresh fruits, and mineral water',
  },
];

// Fix meal-box price to 50000 per person
ADDON_OPTIONS.find(a => a.id === 'meal-box')!.price = 50000;

export interface CustomTourCalculationInput {
  destinations: Array<{ id: string; name: string; slug?: string }>;
  durationId: string;
  transportId: string;
  guideId: string;
  addonIds: string[];
  numParticipants: number;
}

export interface CustomTourPriceBreakdown {
  destinationsList: Array<{ name: string; unitPrice: number; total: number }>;
  destinationsTotal: number;
  durationName: string;
  durationDays: number;
  transportName: string;
  transportDailyPrice: number;
  transportTotal: number;
  guideName: string;
  guideDailyPrice: number;
  guideTotal: number;
  addonsList: Array<{ name: string; unitPrice: number; qty: number; total: number }>;
  addonsTotal: number;
  numParticipants: number;
  subtotal: number;
  estimatedTotal: number;
}

/**
 * Deterministic server and client calculation engine
 */
export function calculateCustomTourEstimate(input: CustomTourCalculationInput): CustomTourPriceBreakdown {
  const pax = Math.max(1, Number(input.numParticipants) || 1);

  // 1. Duration
  const duration = DURATION_OPTIONS.find((d) => d.id === input.durationId) || DURATION_OPTIONS[0];
  const days = duration.days;

  // 2. Destinations
  const destinationsList = (input.destinations || []).map((dest) => {
    const slugKey = dest.slug || dest.id;
    const unitPrice = DESTINATION_PRICING_MAP[slugKey] ?? DEFAULT_DESTINATION_TICKET_PRICE;
    return {
      name: dest.name,
      unitPrice,
      total: unitPrice * pax,
    };
  });
  const destinationsTotal = destinationsList.reduce((sum, d) => sum + d.total, 0);

  // 3. Transport
  const transport = TRANSPORT_OPTIONS.find((t) => t.id === input.transportId) || TRANSPORT_OPTIONS[0];
  const transportTotal = transport.pricePerDay * days;

  // 4. Guide
  const guide = GUIDE_OPTIONS.find((g) => g.id === input.guideId) || GUIDE_OPTIONS[0];
  const guideTotal = guide.pricePerDay * days;

  // 5. Addons
  const selectedAddonIds = new Set(input.addonIds || []);
  const addonsList = ADDON_OPTIONS.filter((a) => selectedAddonIds.has(a.id)).map((addon) => {
    const qty = addon.perPerson ? pax : 1;
    const total = addon.price * qty;
    return {
      name: addon.name,
      unitPrice: addon.price,
      qty,
      total,
    };
  });
  const addonsTotal = addonsList.reduce((sum, a) => sum + a.total, 0);

  // 6. Subtotal & Estimated Total
  const subtotal = destinationsTotal + transportTotal + guideTotal + addonsTotal;
  const estimatedTotal = subtotal;

  return {
    destinationsList,
    destinationsTotal,
    durationName: duration.name,
    durationDays: days,
    transportName: transport.name,
    transportDailyPrice: transport.pricePerDay,
    transportTotal,
    guideName: guide.name,
    guideDailyPrice: guide.pricePerDay,
    guideTotal,
    addonsList,
    addonsTotal,
    numParticipants: pax,
    subtotal,
    estimatedTotal,
  };
}
