/**
 * Official Ijen Tour Knowledge Base
 * Authoritative facts, safety protocols, hiking requirements, and policies.
 */

export interface KnowledgeItem {
  id: string;
  category: "safety" | "preparation" | "bluefire" | "transport" | "booking" | "geology";
  title: string;
  summary: string;
  details: string[];
  keywords: string[];
}

export const OFFICIAL_KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: "blue-fire-phenomenon",
    category: "bluefire",
    title: "Electric Blue Fire Phenomenon (Kawah Ijen)",
    summary:
      "A rare natural wonder where high-pressure sulfuric gas ignites upon contact with air at ~600°C, producing electric blue flames visible only in pitch darkness.",
    details: [
      "Optimal viewing time is strictly between 02:00 AM and 04:30 AM before sunrise.",
      "Requires descending the steep rocky path into the crater basin (approx. 700-800m descent from rim).",
      "Visibility depends on natural volcanic activity, wind direction, and sulfur smoke density.",
      "Professional certified gas respirators (masks with SO2 cartridges) are MANDATORY for anyone near the crater.",
    ],
    keywords: ["blue fire", "api biru", "fenomena", "jam berapa", "waktu", "crater", "kawah"],
  },
  {
    id: "hiking-trail-difficulty",
    category: "preparation",
    title: "Hiking Trail, Elevation & Difficulty",
    summary:
      "Trek from Paltuding Base Camp (1,850m) to Crater Summit Rim (2,799m asl) with a total distance of 3 to 3.5 km.",
    details: [
      "Total distance: 3.0 to 3.5 km one way; takes approximately 1.5 to 2.5 hours at a moderate pace.",
      "First 2 km has a steep incline (20-35 degrees gradient); the final 1 km is relatively flatter towards the rim.",
      "Difficulty: Moderate to challenging for complete beginners, but well-paved dirt road accessible for general fitness.",
      "Local miner trolley service ('troli tambang / taxi ijen') is available at Paltuding for children or elderly unable to walk uphill.",
    ],
    keywords: ["jarak", "trekking", "mendaki", "hiking", "troli", "trolley", "anak", "lansia", "elevation", "ketinggian", "paltuding"],
  },
  {
    id: "required-equipment-packing",
    category: "preparation",
    title: "Required Gear and Packing List",
    summary:
      "Essential clothing and safety gear for cold mountain temperatures and volcanic gases.",
    details: [
      "Safety gear: Certified respirator gas mask with activated sulfur dioxide (SO2) filters and eye goggles (included in Ijen Tour packages).",
      "Lighting: Headlamp or high-power flashlight (essential for night hiking).",
      "Clothing: Warm layered jacket, fleece/windbreaker, long trekking pants, beanie/warm hat, and gloves (night temperatures drop to 8-12°C).",
      "Footwear: Sturdy trekking boots or sport shoes with deep grip (gravel/dust trail).",
      "Personal items: 1-1.5L drinking water, high-energy snacks, personal medication, and wet wipes.",
    ],
    keywords: ["perlengkapan", "bawa", "pakaian", "sepatu", "masker", "gas mask", "suhu", "dingin", "packing list", "baju", "jaket"],
  },
  {
    id: "health-safety-restrictions",
    category: "safety",
    title: "Health & Safety Guidelines",
    summary:
      "Health screening and restrictions for climbing Mount Ijen.",
    details: [
      "Official health certificate ('Surat Keterangan Sehat') is mandated by BKSDA park regulations and can be obtained at local clinics in Banyuwangi or at Paltuding.",
      "Not recommended for pregnant women or individuals with severe asthma, heart disease, high blood pressure, or respiratory disorders.",
      "Always follow your certified local guide's instructions; never hike alone into restricted sulfuric vent zones.",
      "Give way to traditional sulfur miners carrying 70-90 kg loads up and down the steep trails.",
    ],
    keywords: ["surat sehat", "kesehatan", "asma", "jantung", "hamil", "bahaya", "keamanan", "safety", "penambang", "bksda"],
  },
  {
    id: "transport-meeting-point",
    category: "transport",
    title: "Pickup Areas & Transportation",
    summary:
      "Roundtrip transportation provided across Banyuwangi and Ketapang ferry port.",
    details: [
      "Standard midnight pickup time is 00:00 - 00:30 WIB from Banyuwangi city hotels, train stations (Karangasem / Banyuwangi Kota), or homestays.",
      "Ketapang Ferry Port pickup available for travelers crossing from Bali (Gilimanuk).",
      "Bali overland packages include roundtrip hotel transfers from Bali (Kuta, Seminyak, Ubud, Canggu, Sanur) with ferry tickets included.",
      "Transport uses private air-conditioned vehicles (Avanza, Innova, HiAce, or 4WD Trooper for rugged routes).",
    ],
    keywords: ["penjemputan", "pickup", "transportasi", "stasiun", "bandara", "bali", "ferry", "ketapang", "meeting point", "lokasi penjemputan"],
  },
  {
    id: "booking-and-cancellation-policy",
    category: "booking",
    title: "Reservation & Cancellation Policy",
    summary:
      "Flexible booking through website or WhatsApp with transparent policies.",
    details: [
      "Reservations can be placed online through the website booking form or direct WhatsApp consultation.",
      "Custom itineraries (multi-day combinations with Bromo, Baluran, Tumpak Sewu, or Sukamade) can be tailored via WhatsApp.",
      "If Mount Ijen is officially closed due to high volcanic activity (status Level 3/4) or severe weather by BKSDA, rescheduling or refund according to policy is guaranteed.",
      "Contact WhatsApp customer service (+62 822-6817-7188) for immediate assistance, date changes, or group discounts.",
    ],
    keywords: ["booking", "pesan", "pembatalan", "cancel", "refund", "reschedule", "kebijakan", "custom trip", "wa", "whatsapp"],
  },
];

/**
 * Searches the Knowledge Base for items matching the user query.
 */
export function searchKnowledgeBase(query: string): KnowledgeItem[] {
  const lower = query.toLowerCase().trim();
  if (!lower || lower.length < 3) return [];

  const words = lower.split(/\s+/).filter((w) => w.length > 2);
  if (words.length === 0) return [];

  return OFFICIAL_KNOWLEDGE_BASE.filter((item) => {
    const text = `${item.title} ${item.summary} ${item.details.join(" ")} ${item.keywords.join(" ")}`.toLowerCase();
    if (lower.length >= 4 && text.includes(lower)) return true;
    return words.some((w) => item.keywords.some((kw) => kw.includes(w) || w.includes(kw)));
  });
}
