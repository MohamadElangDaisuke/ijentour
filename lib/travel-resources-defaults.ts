export interface TravelResourceChecklistItem {
  title: string;
  desc: string;
  highlight?: string;
  slug?: string;
}

export interface TravelResourceDTO {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  link: string | null;
  items: TravelResourceChecklistItem[];
  sortOrder: number;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export const TRAVEL_RESOURCE_ICON_OPTIONS = [
  "FileText",
  "Shirt",
  "Footprints",
  "HeartPulse",
  "Lightbulb",
  "Compass",
  "MapPin",
  "Shield",
  "Backpack",
  "Camera",
  "Mountain",
  "BookOpen",
] as const;

export const DEFAULT_TRAVEL_RESOURCES: Omit<TravelResourceDTO, "id">[] = [
  {
    slug: "documents",
    category: "Documents & Entry",
    title: "Required Documents & Permits",
    description:
      "To ensure smooth passage and avoid delays during BBKSDA checkpoint verification at the Paltuding basecamp, ensure these 4 official requirements are ready prior to departure.",
    icon: "FileText",
    link: null,
    sortOrder: 1,
    isActive: true,
    items: [
      {
        title: "Medical Health Certificate",
        desc: "Mandatory requirement! Present an original doctor's health certificate issued no more than 3 days prior to your climb date.",
        highlight: "Without this certificate, BBKSDA park rangers will strictly deny entry to the trail.",
      },
      {
        title: "BBKSDA Online Entry Ticket",
        desc: "Book your official permit online via the East Java BBKSDA ticketing system before reaching the Paltuding checkpoint.",
        highlight: "On-site ticket purchases at the entrance are often unavailable due to strict daily visitor quotas.",
      },
      {
        title: "Official Photo ID",
        desc: "Carry valid physical identification (Passport for international visitors, or National ID/Driver's License for domestic visitors) for ticket checks.",
        highlight: "The identification name must match the name on your online booking permit.",
      },
      {
        title: "Cash in Indonesian Rupiah (IDR)",
        desc: "Prepare small cash denominations to rent equipment (gas masks, traditional Ijen trolley carts) or purchase warm drinks and snacks at basecamp.",
        highlight: "ATM machines and digital cellular signals at Paltuding are very limited.",
      },
    ],
  },
  {
    slug: "clothing",
    category: "Warm Layering",
    title: "Warm Clothing & Cold Protection",
    description:
      "Temperatures at the crater and summit drop below 10°C with severe midnight winds. Avoid light casual wear; apply an efficient multi-layering system.",
    icon: "Shirt",
    link: null,
    sortOrder: 2,
    isActive: true,
    items: [
      {
        title: "Heavy Jacket / Windbreaker",
        desc: "Provides vital windproof insulation against biting night winds along exposed ridgelines and the crater rim.",
      },
      {
        title: "Thermal Base Layers",
        desc: "Wear moisture-wicking thermal tops and leggings to keep your core dry and prevent chills during rest stops.",
      },
      {
        title: "Outdoor Trekking Pants",
        desc: "Choose flexible, quick-drying outdoor trousers designed for trekking.",
        highlight: "Avoid stiff denim jeans so your legs can move naturally and comfortably on steep trails.",
      },
      {
        title: "Warm Gloves & Beanie",
        desc: "Crucial for keeping your ears and fingertips warm against freezing early-morning temperatures.",
      },
    ],
  },
  {
    slug: "gear",
    category: "Hiking Gear",
    title: "Essential Trekking Equipment",
    description:
      "Hikes start around midnight in complete darkness across steep, sandy, and rocky terrain. The following equipment is essential for safety.",
    icon: "Footprints",
    link: null,
    sortOrder: 3,
    isActive: true,
    items: [
      {
        title: "Gas Mask Respirator",
        desc: "Sulfur vapors near the crater rim are dense and hazardous. A carbon-filter respirator mask is mandatory (available for rent at Paltuding).",
        highlight: "Tip: Bring moist wipes or clean tissue to line the inside of the mask for better facial comfort.",
      },
      {
        title: "Headlamp / Flashlight",
        desc: "The mountain trail has no pathway lighting. A headlamp is strongly recommended to keep both hands free for balance.",
      },
      {
        title: "Sturdy Trekking Shoes",
        desc: "Wear sturdy hiking or trail shoes with deep anti-slip tread to tackle slippery volcanic dust both uphill and downhill.",
      },
      {
        title: "Trekking Poles",
        desc: "Greatly relieves strain on knees and joints, helps maintain balance on steep inclines, and supports the descent.",
      },
    ],
  },
  {
    slug: "supplies",
    category: "Hydration & First Aid",
    title: "Provisions & Personal First Aid",
    description:
      "The uphill trek takes approximately 2 to 3 hours of steady hiking. Ensure your hydration, energy snacks, and personal medication kit are packed before you begin.",
    icon: "HeartPulse",
    link: null,
    sortOrder: 4,
    isActive: true,
    items: [
      {
        title: "Drinking Water & Electrolytes",
        desc: "Carry 1 to 1.5 liters of drinking water to prevent dehydration. Sip regularly in small amounts along the trail.",
      },
      {
        title: "High-Calorie Trail Snacks",
        desc: "Pack easily digestible high-calorie snacks such as chocolate, dates, honey sticks, or biscuits for fast energy boosts.",
      },
      {
        title: "Personal Medication",
        desc: "Bring antacids, motion sickness tablets, pain relief, and a personal inhaler if you have any history of mild respiratory sensitivity.",
      },
      {
        title: "Eye Drops & Spare Masks",
        desc: "Very useful for soothing stinging eyes caused by shifting sulfur gas fumes, along with spare medical masks for the return journey.",
        highlight: "Apply lubricating eye drops if your eyes feel irritated from volcanic sulfur gas.",
      },
    ],
  },
  {
    slug: "tips",
    category: "Tips & Etiquette",
    title: "Trail Tips & Visitor Etiquette",
    description:
      "Essential recommendations on physical preparation, local etiquette with sulfur miners, and park operational schedules for a seamless journey.",
    icon: "Lightbulb",
    link: null,
    sortOrder: 5,
    isActive: true,
    items: [
      {
        title: "Physical Preparation",
        desc: "Engage in light cardio workouts like jogging or brisk walking a week in advance so your leg muscles don't cramp during the climb.",
      },
      {
        title: "Check Operational Schedule (Ijen Clean-Up)",
        desc: "Mount Ijen is routinely closed on the first Friday of each month for conservation and environmental clean-up. Verify dates in advance.",
        highlight: "Always reconfirm your trekking dates with our team before booking your trip.",
      },
      {
        title: "Yield to Sulfur Miners",
        desc: "The trail is actively shared with local sulfur miners carrying baskets up to 80 kg. Always give them right-of-way and step aside safely.",
      },
      {
        title: "Leave No Trace & Respect Locals",
        desc: "Do not litter along trails or at the crater. Always ask politely with a smile before taking photographs of miners at work.",
      },
    ],
  },
];

