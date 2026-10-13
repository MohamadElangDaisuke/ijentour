export interface TourPackage {
  id: string;
  title: string;
  category: 'regular' | 'private' | 'midnight';
  duration: string;
  savedCount: string;
  rawSaved: number;
  image: string;
  price: string;
  rating: number;
  badge?: string;
  isTrending?: boolean;
  isRecent?: boolean;
  highlights: string[];
  itinerary: { day: string; title: string; desc: string }[];
  description?: string;
  difficulty?: string;
  altitude?: string;
  meetingPoint?: string;
  departureTime?: string;
  groupSize?: string;
  languages?: string[];
  gallery?: string[];
  included?: string[];
  excluded?: string[];
  packingList?: { item: string; note: string }[];
  faqs?: { q: string; a: string }[];
}

export const defaultPackages: TourPackage[] = [
  {
    id: 'pkg-5',
    title: 'Midnight Expedition Blue Fire Ijen',
    category: 'midnight',
    duration: '1 Day (Midnight)',
    savedCount: '4.120K',
    rawSaved: 4120,
    image: '/images/pkg-bluefire.png',
    price: 'IDR 750,000',
    rating: 5.0,
    badge: 'Best Seller',
    isTrending: true,
    isRecent: true,
    description: 'Experience the thrill of a midnight ascent to the summit of Mount Ijen to witness the electric Blue Fire—a phenomenon found in only two places on earth. Guided by experienced local guides and former sulfur miners, marvel at the magical dawn illuminating the world’s largest acidic turquoise crater lake.',
    difficulty: 'Moderate (3 Km Hike)',
    altitude: '2,769m ASL',
    meetingPoint: 'Hotel / Train Station / Banyuwangi Airport (Free Pickup)',
    departureTime: '00:00 - 00:30 AM (Midnight)',
    groupSize: 'Flexible Group (1 - 15 Pax)',
    languages: ['English', 'Indonesian'],
    gallery: [
      '/images/pkg-bluefire.png',
      '/images/the-best-view-of-kawah.webp',
      '/images/pkg-crater.png',
      '/images/HeroSection.webp'
    ],
    highlights: [
      'Midnight Departure (00:00 AM) from Banyuwangi',
      'Licensed Local Guide & Former Sulfur Miner',
      'Certified Gas Respirator Mask & Headlamp Included',
      'Spectacular Sunrise & Largest Acidic Lake in the World',
      'Private Air-Conditioned Vehicle Pickup & Drop-Off'
    ],
    itinerary: [
      { day: '00:00 AM', title: 'Pickup at Hotel / Train Station', desc: 'Our private driver picks you up from your hotel or station in Banyuwangi in a comfortable AC vehicle.' },
      { day: '01:30 AM', title: 'Arrival at Paltuding Basecamp', desc: 'Safety briefing by your local guide, distribution of gas respirator masks and headlamps.' },
      { day: '02:00 AM', title: 'Start of Mount Ijen Trek', desc: 'Enjoyable 3 km trek toward the crater rim under a starry, crisp mountain night sky.' },
      { day: '03:45 AM', title: 'Electric Blue Fire Phenomenon', desc: 'Descend to the crater floor guided safely to admire the legendary blue flames up close.' },
      { day: '05:15 AM', title: 'Golden Sunrise at the Crater Rim', desc: 'Ascend to the rim to watch the sunrise cast golden light across the sparkling turquoise lake.' },
      { day: '07:00 AM', title: 'Return to Paltuding & Warm Refreshments', desc: 'Leisurely descent to basecamp, rest, and enjoy warm tea or coffee with light snacks.' },
      { day: '08:30 AM', title: 'Transfer Back to Hotel / Station', desc: 'Scenic drive back to your hotel or drop-off point. Tour concludes with unforgettable memories.' }
    ],
    included: [
      'Roundtrip AC Transportation from Banyuwangi Hotel/Station',
      'Official National Park Entry Ticket & Conservation Insurance',
      'Licensed Local Guide (Former Sulfur Miner)',
      'Certified Medical-Grade Gas Respirator Mask',
      'High-Power LED Headlamp',
      'Bottled Mineral Water & Warm Tea/Coffee',
      'Mountain First Aid Kit'
    ],
    excluded: [
      'Personal Expenses Outside Itinerary',
      'Trolley Taxi Service (Optional for tired hikers)',
      'Heavy Additional Meals',
      'Voluntary Tips for Guide & Driver'
    ],
    packingList: [
      { item: 'Warm Jacket / Windbreaker', note: 'Pre-dawn summit temperatures range between 6°C - 10°C' },
      { item: 'Trekking Shoes / Non-Slip Sneakers', note: 'Trails are sandy with gravel inclines' },
      { item: 'Long Hiking Pants & Warm Socks', note: 'Protects against cold mountain winds and dust' },
      { item: 'Camera / Smartphone & Power Bank', note: 'To capture Blue Fire and sunrise photography' },
      { item: 'Sufficient Local Cash (IDR)', note: 'For warm drinks, snacks, or sulfur souvenirs' }
    ],
    faqs: [
      { q: 'Can beginners or children join this tour?', a: 'Yes! The trail is wide and well-marked. For those who feel tired, traditional trolley taxis operated by local miners are available to pull guests to the summit.' },
      { q: 'When is the best time to see the Blue Fire?', a: 'The ideal window is between 03:00 and 04:30 AM when the sky is completely pitch-black. We time the hike so you arrive at the best viewing spot.' },
      { q: 'Are sulfur gases dangerous?', a: 'We supply high-filtration active carbon respirator masks that safely filter sulfur fumes. Your guide continually monitors wind direction for safety.' },
      { q: 'What happens in case of heavy rain or bad weather?', a: 'If the park is temporarily closed by park authorities due to extreme weather, we provide full reschedule options or alternative destination adjustments.' }
    ]
  },
  {
    id: 'pkg-6',
    title: 'Private Tour Ijen & Baluran Savanna',
    category: 'private',
    duration: '2 Days 1 Night',
    savedCount: '2.100K',
    rawSaved: 2100,
    image: '/images/pkg-crater.png',
    price: 'IDR 1,950,000',
    rating: 4.9,
    badge: 'Premium Private',
    isTrending: true,
    isRecent: true,
    description: 'An exclusive combination of two natural wonders: the midnight blue fire adventure of Mount Ijen and the wild savanna safari of Baluran National Park, dubbed "Africa van Java". This private package provides complete flexibility and leisurely pacing, perfect for couples and families.',
    difficulty: 'Easy - Moderate',
    altitude: '2,769m ASL',
    meetingPoint: 'Banyuwangi City / Blimbingsari Airport / Ketapang Port',
    departureTime: 'Flexible According to Arrival Flight/Train',
    groupSize: 'Private (Exclusive Car)',
    languages: ['English', 'Indonesian'],
    gallery: [
      '/images/pkg-crater.png',
      '/images/djawatan.png',
      '/images/pkg-bluefire.png',
      '/images/HeroSection.webp'
    ],
    highlights: [
      'Wildlife Safari in Bekol Savanna & Bama Beach',
      'Exclusive Mount Ijen Trekking & Blue Fire Experience',
      'Enchanted Trembesi Forest of De Djawatan',
      'Comfortable Private SUV / MPV + Driver + Fuel',
      'Authentic Banyuwangi Culinary Tastings'
    ],
    itinerary: [
      { day: 'Day 1 - Noon', title: 'Arrival in Banyuwangi & De Djawatan', desc: 'Arrival pickup, traditional Sego Tempong lunch, then explore the magical Lord of the Rings-esque De Djawatan forest.' },
      { day: 'Day 1 - Afternoon', title: 'Baluran Savanna Safari & Bama Sunset', desc: 'Journey to Baluran National Park to view wild water buffalo, deer, and monkeys across Bekol Savanna, followed by coastal sunset at Bama Beach.' },
      { day: 'Day 1 - Night', title: 'Hotel Check-in & Rest', desc: 'Check into your hotel in Banyuwangi, dinner, and early rest before the midnight ascent.' },
      { day: 'Day 2 - Midnight', title: 'Midnight Trekking Ijen Blue Fire', desc: 'Depart for Paltuding at 00:30 AM, trek to the crater to admire the Blue Fire and turquoise lake at sunrise.' },
      { day: 'Day 2 - Noon', title: 'Return to Hotel, Souvenirs & Drop-Off', desc: 'Shower and refresh at hotel, browse authentic Osing coffee and batik souvenirs, followed by airport or station transfer.' }
    ],
    included: [
      'Private AC Vehicle (Innova/Avanza) + Fuel + Driver',
      'Entrance Tickets to All Destinations (Baluran, Djawatan, Ijen)',
      'Licensed Private Local Guide',
      'Certified Gas Respirator Mask & Headlamp',
      'Scheduled Meals & Complimentary Mineral Water',
      'Full Tour Photo Documentation'
    ],
    excluded: [
      'Hotel Accommodation (Can be added on request)',
      'Personal Expenses & Souvenirs',
      'Voluntary Tips for Driver and Guide'
    ],
    packingList: [
      { item: 'Warm & Casual Clothing', note: 'Heavy jacket for Ijen, breathable casual wear for Baluran' },
      { item: 'Sunglasses & Sunscreen', note: 'The Baluran Savanna can be bright and sunny during the day' },
      { item: 'Athletic / Trekking Shoes', note: 'Highly recommended for easy mobility across terrain' }
    ],
    faqs: [
      { q: 'Can pickup be arranged outside Banyuwangi?', a: 'Yes, we provide pickup services from Surabaya, Malang, or Bali for an affordable additional fuel and highway surcharge.' },
      { q: 'Can the itinerary be tailored to our preferences?', a: 'Absolutely! Since this is a private tour, you are free to customize the duration spent at each destination.' }
    ]
  },
  {
    id: 'pkg-1',
    title: 'Bali & Mount Ijen Tour (6 Days 5 Nights)',
    category: 'regular',
    duration: '6 Days 5 Nights',
    savedCount: '3.219K',
    rawSaved: 3219,
    image: '/images/pkg-bali.png',
    price: 'IDR 3,850,000',
    rating: 4.9,
    badge: 'Most Popular',
    isTrending: true,
    isRecent: false,
    description: 'Explore the volcanic masterworks of East Java and the tropical allure of Bali in one spectacular vacation. From Mount Ijen’s electric Blue Fire to white-sand beaches, cliffside sea temples, and the cultural heart of Ubud.',
    difficulty: 'Easy - Leisurely',
    altitude: '2,769m ASL & Coastal Lowlands',
    meetingPoint: 'Surabaya Juanda / Banyuwangi / Denpasar Bali',
    departureTime: 'Matched to Flight Schedule',
    groupSize: 'Open Group & Private Available',
    languages: ['English', 'Indonesian'],
    gallery: [
      '/images/pkg-bali.png',
      '/images/pkg-bluefire.png',
      '/images/the-best-view-of-kawah.webp',
      '/images/pkg-waterfall.png'
    ],
    highlights: [
      'Banyuwangi Pickup & Roundtrip Bali Strait Ferry',
      'Mount Ijen Blue Fire & Golden Sunrise Trek',
      'Tanah Lot, Kuta Beach, and Uluwatu Cliff Temple',
      'Selected Starred Hotel Stays with Breakfast Included',
      'Comfortable Tourism-Standard AC Transport Throughout'
    ],
    itinerary: [
      { day: 'Day 1', title: 'Arrival in Banyuwangi & Briefing', desc: 'Pickup at airport/station in Banyuwangi, hotel check-in, rest and briefing for the midnight hike.' },
      { day: 'Day 2', title: 'Mount Ijen Blue Fire & Bali Ferry Crossing', desc: 'Pre-dawn Ijen hike, return to hotel to freshen up, then cross to Bali via Ketapang-Gilimanuk ferry.' },
      { day: 'Day 3', title: 'Ulun Danu Beratan Temple & Tanah Lot', desc: 'Explore highland Bedugul lake and the iconic sea-facing Tanah Lot temple at sunset.' },
      { day: 'Day 4', title: 'Ubud Culture & Kintamani Volcano View', desc: 'Visit Tegalalang rice terraces, Ubud art market, and enjoy lunch overlooking Mount Batur.' },
      { day: 'Day 5', title: 'Melasti Beach & Uluwatu Sunset Kecak Dance', desc: 'Relax by limestone beach cliffs and experience the dramatic Kecak Fire Dance performance.' },
      { day: 'Day 6', title: 'Souvenir Shopping & Bali Airport Transfer', desc: 'Shop for authentic Balinese souvenirs and transfer to Ngurah Rai International Airport.' }
    ],
    included: [
      '5 Nights Hotel Accommodation + Daily Breakfast',
      'Roundtrip Ketapang-Gilimanuk Ferry Tickets',
      'All Attraction & Park Entry Tickets on Itinerary',
      'Experienced Ijen Guide & Bali Tour Driver',
      'Gas Respirator Mask & Full AC Transportation'
    ],
    excluded: [
      'Domestic or International Flights',
      'Lunches & Dinners Outside Scheduled Program',
      'Personal Souvenirs & Expenses'
    ]
  },
  {
    id: 'pkg-2',
    title: 'Bali & Mount Ijen Tour (5 Days 4 Nights)',
    category: 'regular',
    duration: '5 Days 4 Nights',
    savedCount: '2.516K',
    rawSaved: 2516,
    image: '/images/pkg-bluefire.png',
    price: 'IDR 2,950,000',
    rating: 4.9,
    badge: 'Best Value',
    isTrending: true,
    isRecent: true,
    description: 'The optimal vacation package combining the thrilling midnight ascent of Mount Ijen with relaxing beach days and cultural highlights across Bali at an affordable rate.',
    difficulty: 'Easy - Moderate',
    altitude: '2,769m ASL',
    meetingPoint: 'Banyuwangi / Bali',
    departureTime: 'Flexible',
    groupSize: 'Min. 2 Persons',
    languages: ['English', 'Indonesian'],
    gallery: [
      '/images/pkg-bluefire.png',
      '/images/pkg-bali.png',
      '/images/pkg-crater.png',
      '/images/djawatan.png'
    ],
    highlights: [
      'Midnight Mount Ijen Trek & Blue Fire',
      'Iconic Floating Temple of Lake Beratan',
      'Pandawa Beach & Uluwatu Coastal Cliffs',
      'Private AC Tourism Transport & Quality Hotels'
    ],
    itinerary: [
      { day: 'Day 1', title: 'Arrival in Banyuwangi', desc: 'Tour briefing and hotel check-in before the midnight ascent.' },
      { day: 'Day 2', title: 'Mount Ijen Sunrise & Ferry to Bali', desc: 'Experience the turquoise crater lake, then cross over to your hotel in Bali.' },
      { day: 'Day 3', title: 'Bedugul & Tanah Lot Excursion', desc: 'Discover Bali’s refreshing highlands and dramatic coastal temples.' },
      { day: 'Day 4', title: 'Pandawa, Melasti & Uluwatu', desc: 'Relax along pristine beaches and admire clifftop ocean sunsets.' },
      { day: 'Day 5', title: 'Ngurah Rai Airport Drop-Off', desc: 'Souvenir shopping and airport transfer.' }
    ],
    included: [
      'AC Tourism Transportation Throughout',
      '4 Nights Hotel + Daily Breakfast',
      'Bali Strait Ferry Crossing Tickets',
      'Gas Respirator Mask & Local Mountain Guide'
    ],
    excluded: [
      'Flight Tickets',
      'Personal Expenses'
    ]
  },
  {
    id: 'pkg-3',
    title: 'Bali & Mount Ijen Tour (4 Days 3 Nights)',
    category: 'regular',
    duration: '4 Days 3 Nights',
    savedCount: '1.803K',
    rawSaved: 1803,
    image: '/images/pkg-crater.png',
    price: 'IDR 2,200,000',
    rating: 4.8,
    badge: 'Top Seller',
    isTrending: false,
    isRecent: true,
    description: 'A compact yet immersive adventure: hike Mount Ijen in Banyuwangi followed by refreshing tropical waterfalls and south Bali coastal highlights.',
    difficulty: 'Moderate',
    altitude: '2,769m ASL',
    meetingPoint: 'Banyuwangi',
    departureTime: 'Flexible',
    groupSize: 'Min. 2 Persons',
    languages: ['English', 'Indonesian'],
    gallery: [
      '/images/pkg-crater.png',
      '/images/pkg-waterfall.png',
      '/images/pkg-bluefire.png',
      '/images/the-best-view-of-kawah.webp'
    ],
    highlights: [
      'Mount Ijen Blue Fire & Tropical Waterfalls',
      'World’s Largest Acidic Turquoise Crater Lake',
      'All Entry Tickets & Tour Insurance Included',
      'Photo Documentation Throughout the Journey'
    ],
    itinerary: [
      { day: 'Day 1', title: 'Banyuwangi Welcome & Check-in', desc: 'Pickup from station/airport to hotel, relaxation and rest.' },
      { day: 'Day 2', title: 'Blue Fire & Mount Ijen Crater Rim', desc: 'Midnight hike to the summit with your certified guide.' },
      { day: 'Day 3', title: 'Jagir Waterfall & Crossing to Bali', desc: 'Relax by natural waterfalls before taking the scenic ferry to Bali.' },
      { day: 'Day 4', title: 'Departure Transfer', desc: 'Local souvenir shopping and airport drop-off.' }
    ],
    included: [
      'AC Transportation + Driver + Fuel',
      'All Tourist Attraction Entrance Fees',
      'Mount Ijen Guide & Protective Gas Masks'
    ],
    excluded: [
      'Personal Expenses',
      'Driver & Guide Gratuities'
    ]
  },
  {
    id: 'pkg-4',
    title: 'Mount Ijen & Banyuwangi Explorer (3 Days 2 Nights)',
    category: 'regular',
    duration: '3 Days 2 Nights',
    savedCount: '1.083K',
    rawSaved: 1083,
    image: '/images/pkg-waterfall.png',
    price: 'IDR 1,450,000',
    rating: 4.8,
    isTrending: false,
    isRecent: true,
    description: 'The ultimate weekend escape: climb Mount Ijen for the rare midnight electric blue flames and soak in the freshness of Banyuwangi’s tropical waterfalls.',
    difficulty: 'Moderate',
    altitude: '2,769m ASL',
    meetingPoint: 'Banyuwangi City',
    departureTime: 'Flexible',
    groupSize: 'Min. 2 Persons',
    languages: ['English', 'Indonesian'],
    gallery: [
      '/images/pkg-waterfall.png',
      '/images/pkg-bluefire.png',
      '/images/pkg-crater.png',
      '/images/HeroSection.webp'
    ],
    highlights: [
      'Short Yet Thrilling Ijen Midnight Experience',
      'Official Standard Mountain & Safety Equipment',
      'Lush Tropical Waterfall Visit',
      'Warm Drinks & Basecamp Snacks'
    ],
    itinerary: [
      { day: 'Day 1', title: 'Arrival & Preparation', desc: 'Hotel check-in and preparation for the midnight trek.' },
      { day: 'Day 2', title: 'Ijen Ascent & Waterfall Excursion', desc: 'Witness the blue flames, sunrise over the lake, and relax by the waterfall.' },
      { day: 'Day 3', title: 'Outbound Transfer', desc: 'Breakfast and drop-off at Banyuwangi station or airport.' }
    ],
    included: [
      'Full AC Transportation During the Program',
      'Mount Ijen & Waterfall Entry Tickets',
      'Certified Gas Respirator Mask & Local Guide'
    ],
    excluded: [
      'Personal Expenses'
    ]
  }
];

export const packagesStorageKey = 'ijen-tour-packages';

/**
 * Helper to fetch a package by ID with fallback to default packages
 */
export function getPackageByIdFromList(packages: TourPackage[], id: string): TourPackage | undefined {
  return packages.find((p) => p.id === id) || defaultPackages.find((p) => p.id === id);
}
