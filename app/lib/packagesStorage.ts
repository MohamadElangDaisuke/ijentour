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
    duration: '1 Hari (Midnight)',
    savedCount: '4.120K',
    rawSaved: 4120,
    image: '/images/pkg-bluefire.png',
    price: 'Rp 750.000',
    rating: 5.0,
    badge: 'Best Seller',
    isTrending: true,
    isRecent: true,
    description: 'Rasakan sensasi petualangan malam hari mendaki puncak Kawah Ijen untuk menyaksikan fenomena kobaran api biru (Blue Fire) elektrik yang hanya ada dua di seluruh dunia. Didampingi pemandu lokal berpengalaman dan mantan penambang belerang asli, Anda akan diajak menikmati momen matahari terbit magis yang menyinari danau kawah asam berwarna toska.',
    difficulty: 'Sedang (Trekking 3 Km)',
    altitude: '2.769 mdpl',
    meetingPoint: 'Hotel / Stasiun / Bandara Banyuwangi (Free Pick-up)',
    departureTime: '00:00 - 00:30 WIB Dini Hari',
    groupSize: 'Grup Fleksibel (1 - 15 Orang)',
    languages: ['Bahasa Indonesia', 'English'],
    gallery: [
      '/images/pkg-bluefire.png',
      '/images/the-best-view-of-kawah.webp',
      '/images/pkg-crater.png',
      '/images/HeroSection.webp'
    ],
    highlights: [
      'Berangkat Jam 00:00 Dini Hari dari Banyuwangi',
      'Guide Penambang Belerang Lokal Berlisensi',
      'Masker Respirator Standar Keamanan & Senter Kepala',
      'Spot Foto Sunrise & Danau Asam Terbesar di Dunia',
      'Antar-Jemput Privat Armada Ber-AC'
    ],
    itinerary: [
      { day: '00:00 WIB', title: 'Penjemputan di Hotel / Stasiun', desc: 'Driver kami akan menjemput Anda di hotel atau stasiun area Banyuwangi dengan armada nyaman ber-AC.' },
      { day: '01:30 WIB', title: 'Tiba di Basecamp Paltuding', desc: 'Briefing keselamatan dari guide lokal, pembagian masker respirator gas belerang dan senter kepala (headlamp).' },
      { day: '02:00 WIB', title: 'Mulai Pendakian Jalur Ijen', desc: 'Trekking santai sejauh 3 km menuju bibir kawah. Suasana malam dengan taburan bintang yang memukau.' },
      { day: '03:45 WIB', title: 'Fenomena Blue Fire Elektrik', desc: 'Turun ke dasar kawah didampingi guide untuk mengagumi nyala api biru yang legendaris secara dekat dan aman.' },
      { day: '05:15 WIB', title: 'Golden Sunrise Kawah Ijen', desc: 'Naik kembali ke bibir kawah untuk menikmati panorama danau toska berkilau di bawah siraman cahaya fajar.' },
      { day: '07:00 WIB', title: 'Kembali ke Paltuding & Sarapan Ringan', desc: 'Perjalanan turun santai ke pos awal, rehat sejenak dan menikmati minuman hangat serta kudapan.' },
      { day: '08:30 WIB', title: 'Transfer Kembali ke Hotel / Stasiun', desc: 'Perjalanan pulang menuju penginapan atau titik drop-off. Tour selesai dengan kenangan tak terlupakan.' }
    ],
    included: [
      'Transportasi AC PP dari Hotel/Stasiun Banyuwangi',
      'Tiket Masuk Resmi BKSDA / Kawah Ijen & Asuransi',
      'Pemandu Lokal Berlisensi (Former Sulfur Miner)',
      'Masker Gas Respirator Medis Standar Belerang',
      'Headlamp / Senter Kepala Penerangan',
      'Air Mineral & Snack Hangat',
      'P3K Dasar Standar Gunung'
    ],
    excluded: [
      'Pengeluaran Pribadi di Luar Paket',
      'Taksi Troly Dorong Kawah (Opsional jika lelah)',
      'Makan Berat Tambahan',
      'Tip Sukarela untuk Guide / Driver'
    ],
    packingList: [
      { item: 'Jaket Tebal / Windbreaker', note: 'Suhu puncak dini hari bisa mencapai 6°C - 10°C' },
      { item: 'Sepatu Trekking / Sneakers Anti-Slip', note: 'Jalur berpasir dan sedikit menanjak di awal' },
      { item: 'Celana Panjang & Kaos Kaki Tebal', note: 'Melindungi dari hawa dingin dan debu' },
      { item: 'Kamera / Smartphone & Powerbank', note: 'Untuk mengabadikan momen Blue Fire & Sunrise' },
      { item: 'Uang Tunai Secukupnya', note: 'Untuk membeli cinderamata belerang atau minuman hangat di pos' }
    ],
    faqs: [
      { q: 'Apakah pemula atau anak-anak bisa mengikuti tour ini?', a: 'Sangat bisa! Jalur pendakian cukup lebar dan jelas. Jika merasa lelah, tersedia jasa troli dorong lokal (trolley taxi) yang siap mengantar sampai ke puncak.' },
      { q: 'Kapan waktu terbaik melihat Blue Fire?', a: 'Waktu terbaik adalah antara pukul 03:00 hingga 04:30 WIB saat langit masih gelap pekat. Kami mengatur jadwal agar Anda tiba tepat waktu di spot terbaik.' },
      { q: 'Apakah bau gas belerang berbahaya?', a: 'Kami menyediakan masker respirator khusus berfilter aktif yang aman menyaring asap belerang. Guide kami juga selalu memantau arah angin demi keamanan Anda.' },
      { q: 'Bagaimana jika cuaca hujan atau berkabut?', a: 'Jika kawah ditutup sementara oleh otoritas resmi BKSDA karena alasan cuaca ekstrem, kami akan memberikan opsi reschedule atau penyesuaian destinasi alternatif.' }
    ]
  },
  {
    id: 'pkg-6',
    title: 'Private Tour Ijen & Baluran Savanna',
    category: 'private',
    duration: '2 Hari 1 Malam',
    savedCount: '2.100K',
    rawSaved: 2100,
    image: '/images/pkg-crater.png',
    price: 'Rp 1.950.000',
    rating: 4.9,
    badge: 'Privat Premium',
    isTrending: true,
    isRecent: true,
    description: 'Kombinasi eksklusif dua mahakarya alam Jawa Timur: petualangan api biru Kawah Ijen dan safari liar padang Savana Bekol di Taman Nasional Baluran yang sering dijuluki "Africa van Java". Paket privat ini memberi fleksibilitas penuh tanpa terburu-buru, cocok untuk keluarga maupun pasangan.',
    difficulty: 'Mudah - Sedang',
    altitude: '2.769 mdpl',
    meetingPoint: 'Banyuwangi Kota / Bandara Blimbingsari / Ketapang',
    departureTime: 'Fleksibel Sesuai Tiket Kedatangan',
    groupSize: 'Privat (Mobil Eksklusif)',
    languages: ['Bahasa Indonesia', 'English'],
    gallery: [
      '/images/pkg-crater.png',
      '/images/djawatan.png',
      '/images/pkg-bluefire.png',
      '/images/HeroSection.webp'
    ],
    highlights: [
      'Safari Liar Savana Bekol Baluran & Pantai Bama',
      'Trekking Eksklusif Kawah Ijen & Blue Fire',
      'Hutan Trembesi Magis De Djawatan',
      'Mobil Privat SUV / MPV Nyaman + Driver + BBM',
      'Kuliner Khas Banyuwangi Pilihan'
    ],
    itinerary: [
      { day: 'Hari 1 - Siang', title: 'Tiba di Banyuwangi & De Djawatan', desc: 'Penjemputan kedatangan, makan siang khas Sego Tempong, lalu eksplorasi magis hutan De Djawatan ala Lord of the Rings.' },
      { day: 'Hari 1 - Sore', title: 'Safari Savana Baluran & Sunset Bama', desc: 'Menuju TN Baluran melihat kawanan banteng liar, rusa, dan monyet ekor panjang di Savana Bekol, dilanjutkan sunset di Pantai Bama.' },
      { day: 'Hari 1 - Malam', title: 'Check-in Hotel & Istirahat', desc: 'Check-in hotel di Banyuwangi, makan malam, dan istirahat awal sebelum pendakian dini hari.' },
      { day: 'Hari 2 - Dini Hari', title: 'Midnight Trekking Ijen Blue Fire', desc: 'Berangkat ke Paltuding pukul 00:30 WIB, trekking ke kawah untuk menyaksikan Blue Fire dan danau toska saat matahari terbit.' },
      { day: 'Hari 2 - Siang', title: 'Kembali ke Hotel, Oleh-Oleh & Drop Off', desc: 'Bersih-bersih di hotel, belanja oleh-oleh khas Banyuwangi (kopi Osing & batik), lalu diantar ke stasiun/bandara.' }
    ],
    included: [
      'Armada Privat Mobil AC (Innova/Avanza) + BBM + Driver',
      'Tiket Masuk Semua Destinasi (Baluran, Djawatan, Kawah Ijen)',
      'Guide Lokal Privat Berlisensi',
      'Masker Gas Respirator & Headlamp',
      'Makan Sesuai Program & Air Mineral Bebas',
      'Dokumentasi Foto Selama Tour'
    ],
    excluded: [
      'Akomodasi Hotel (Bisa dibantu bookingkan)',
      'Pengeluaran Pribadi & Souvenir',
      'Tip Driver dan Guide Sukarela'
    ],
    packingList: [
      { item: 'Pakaian Hangat & Kasual', note: 'Jaket tebal untuk Ijen, baju santai/adem untuk Baluran' },
      { item: 'Kacamata Hitam & Sunscreen', note: 'Savana Baluran cukup terik di siang hari' },
      { item: 'Sepatu Olahraga / Trekking', note: 'Sangat direkomendasikan untuk kenyamanan bergerak' }
    ],
    faqs: [
      { q: 'Apakah bisa dijemput dari luar Banyuwangi?', a: 'Bisa, kami melayani penjemputan dari Surabaya, Malang, atau Bali dengan biaya tambahan bahan bakar dan tol yang terjangkau.' },
      { q: 'Apakah jadwal perjalanan bisa disesuaikan?', a: 'Tentu! Karena ini private tour, Anda bebas menyesuaikan durasi di setiap destinasi sesuai keinginan.' }
    ]
  },
  {
    id: 'pkg-1',
    title: 'Paket Tour Bali 6 Hari 5 Malam',
    category: 'regular',
    duration: '6 Hari 5 Malam',
    savedCount: '3.219K',
    rawSaved: 3219,
    image: '/images/pkg-bali.png',
    price: 'Rp 3.850.000',
    rating: 4.9,
    badge: 'Terpopuler',
    isTrending: true,
    isRecent: false,
    description: 'Eksplorasi mahakarya Jawa Timur dan pesona Pulau Dewata Bali dalam satu paket liburan spektakuler. Mulai dari keajaiban Blue Fire Kawah Ijen hingga pantai pasir putih, pura sakral di atas tebing, dan pusat kebudayaan Ubud Bali.',
    difficulty: 'Mudah - Santai',
    altitude: '2.769 mdpl & Dataran Rendah',
    meetingPoint: 'Bandara Juanda / Banyuwangi / Denpasar Bali',
    departureTime: 'Sesuai Jadwal Penerbangan',
    groupSize: 'Terbuka untuk Umum & Privat',
    languages: ['Bahasa Indonesia', 'English'],
    gallery: [
      '/images/pkg-bali.png',
      '/images/pkg-bluefire.png',
      '/images/the-best-view-of-kawah.webp',
      '/images/pkg-waterfall.png'
    ],
    highlights: [
      'Penjemputan Area Banyuwangi & Tiket Penyeberangan Ferry Bali',
      'Tur Api Biru (Blue Fire) & Sunrise Kawah Ijen',
      'Eksplorasi Tanah Lot, Pantai Kuta, dan Uluwatu',
      'Hotel Pilihan Berbintang & Sarapan Termasuk',
      'Transportasi Wisata Ber-AC Standar Pariwisata'
    ],
    itinerary: [
      { day: 'Hari 1', title: 'Kedatangan di Banyuwangi & Briefing', desc: 'Penjemputan di bandara/stasiun Banyuwangi, istirahat di hotel persiapan mendaki.' },
      { day: 'Hari 2', title: 'Kawah Ijen Blue Fire & Penyeberangan Bali', desc: 'Trekking Ijen dini hari, kembali ke hotel, lalu menyeberang ke Bali via Pelabuhan Ketapang-Gilimanuk.' },
      { day: 'Hari 3', title: 'Eksplorasi Pura Ulun Danu Beratan & Tanah Lot', desc: 'Mengunjungi danau pegunungan Bedugul dan pura ikonik Tanah Lot saat senja.' },
      { day: 'Hari 4', title: 'Budaya Ubud & Kintamani Volcano View', desc: 'Melihat persawahan Tegalalang, pasar seni Ubud, dan makan siang berlatar Gunung Batur.' },
      { day: 'Hari 5', title: 'Pantai Melasti & Pura Uluwatu Sunset', desc: 'Relaksasi pantai pasir putih tebing kapur dan pertunjukan Tari Kecak spektakuler di Uluwatu.' },
      { day: 'Hari 6', title: 'Belanja Oleh-Oleh & Transfer Bandara Bali', desc: 'Belanja cinderamata khas Krisna/Joger dan pengantaran ke Bandara Ngurah Rai.' }
    ],
    included: [
      'Akomodasi Hotel 5 Malam + Sarapan Pagi',
      'Tiket Penyeberangan Ferry Ketapang-Gilimanuk PP',
      'Tiket Masuk Seluruh Objek Wisata Sesuai Jadwal',
      'Guide Ijen & Driver Tour Bali Berpengalaman',
      'Masker Respirator Ijen & Transportasi AC Penuh'
    ],
    excluded: [
      'Tiket Pesawat Kedatangan & Kepulangan',
      'Makan Siang & Malam di Luar Program',
      'Pengeluaran Pribadi'
    ]
  },
  {
    id: 'pkg-2',
    title: 'Paket Tour Bali 5 Hari 4 Malam',
    category: 'regular',
    duration: '5 Hari 4 Malam',
    savedCount: '2.516K',
    rawSaved: 2516,
    image: '/images/pkg-bluefire.png',
    price: 'Rp 2.950.000',
    rating: 4.9,
    badge: 'Favorit Hemat',
    isTrending: true,
    isRecent: true,
    description: 'Pilihan paling ideal bagi Anda yang ingin memadukan petualangan mendaki Kawah Ijen dengan liburan santai di pantai dan tempat wisata terfavorit di Pulau Bali dengan harga ramah kantong.',
    difficulty: 'Mudah - Sedang',
    altitude: '2.769 mdpl',
    meetingPoint: 'Banyuwangi / Bali',
    departureTime: 'Fleksibel',
    groupSize: 'Min. 2 Orang',
    languages: ['Bahasa Indonesia', 'English'],
    gallery: [
      '/images/pkg-bluefire.png',
      '/images/pkg-bali.png',
      '/images/pkg-crater.png',
      '/images/djawatan.png'
    ],
    highlights: [
      'Midnight Trekking Kawah Ijen & Blue Fire',
      'Situs Pura Ulun Danu & Danau Beratan Bali',
      'Pantai Pandawa & Tebing Uluwatu',
      'Transportasi AC Privat & Hotel Pilihan Nyaman'
    ],
    itinerary: [
      { day: 'Hari 1', title: 'Kedatangan Banyuwangi', desc: 'Briefing perjalanan dan istirahat sebelum pendakian malam.' },
      { day: 'Hari 2', title: 'Kawah Ijen Sunrise & Ferry ke Bali', desc: 'Menikmati pemandangan kawah asam lalu transfer menuju hotel di Bali.' },
      { day: 'Hari 3', title: 'Bedugul & Tanah Lot Tour', desc: 'Jelajah dataran tinggi Bali yang sejuk dan pura terapung.' },
      { day: 'Hari 4', title: 'Pantai Pandawa, Melasti & Uluwatu', desc: 'Menikmati pantai eksotis dan matahari terbenam di atas tebing.' },
      { day: 'Hari 5', title: 'Drop Off Bandara Ngurah Rai', desc: 'Belanja oleh-oleh dan kepulangan.' }
    ],
    included: [
      'Transportasi Wisata AC Sepanjang Perjalanan',
      'Hotel 4 Malam + Sarapan',
      'Tiket Kapal Ferry Selat Bali',
      'Masker Gas Kawah Ijen & Pemandu Lokal'
    ],
    excluded: [
      'Tiket Pesawat',
      'Pengeluaran Pribadi'
    ]
  },
  {
    id: 'pkg-3',
    title: 'Paket Tour Bali 4 Hari 3 Malam',
    category: 'regular',
    duration: '4 Hari 3 Malam',
    savedCount: '1.803K',
    rawSaved: 1803,
    image: '/images/pkg-crater.png',
    price: 'Rp 2.200.000',
    rating: 4.8,
    badge: 'Paling Laris',
    isTrending: false,
    isRecent: true,
    description: 'Petualangan ringkas namun padat pengalaman: mendaki Kawah Ijen di Banyuwangi dilanjutkan dengan tur pesona alam air terjun tropis dan wisata Bali selatan.',
    difficulty: 'Sedang',
    altitude: '2.769 mdpl',
    meetingPoint: 'Banyuwangi',
    departureTime: 'Fleksibel',
    groupSize: 'Min. 2 Orang',
    languages: ['Bahasa Indonesia', 'English'],
    gallery: [
      '/images/pkg-crater.png',
      '/images/pkg-waterfall.png',
      '/images/pkg-bluefire.png',
      '/images/the-best-view-of-kawah.webp'
    ],
    highlights: [
      'Kawah Ijen Blue Fire & Air Terjun Tropis',
      'Pemandangan Danau Kawah Klorofil Terbesar',
      'Tiket Masuk & Asuransi Wisata',
      'Dokumentasi Foto Selama Kegiatan'
    ],
    itinerary: [
      { day: 'Hari 1', title: 'Penyambutan Tamu di Banyuwangi', desc: 'Transfer dari stasiun/bandara ke hotel pilihan dan istirahat.' },
      { day: 'Hari 2', title: 'Blue Fire & Rim Kawah Ijen', desc: 'Trekking jam 02:00 pagi ke puncak Ijen bersama guide berpengalaman.' },
      { day: 'Hari 3', title: 'Air Terjun Jagir & Wisata Bali', desc: 'Relaksasi air terjun lalu menyeberang menuju Bali.' },
      { day: 'Hari 4', title: 'Kepulangan', desc: 'Oleh-oleh khas dan transfer kembali ke bandara.' }
    ],
    included: [
      'Transportasi AC + Driver + BBM',
      'Tiket Masuk Objek Wisata',
      'Guide Pendakian Kawah Ijen & Masker Gas'
    ],
    excluded: [
      'Pengeluaran Pribadi',
      'Tip Driver/Guide'
    ]
  },
  {
    id: 'pkg-4',
    title: 'Paket Tour Bali 3 Hari 2 Malam',
    category: 'regular',
    duration: '3 Hari 2 Malam',
    savedCount: '1.083K',
    rawSaved: 1083,
    image: '/images/pkg-waterfall.png',
    price: 'Rp 1.450.000',
    rating: 4.8,
    isTrending: false,
    isRecent: true,
    description: 'Paket akhir pekan terbaik untuk melepaskan penat: mendaki Ijen melihat fenomena alam langka dan menikmati kesegaran air terjun alami Banyuwangi.',
    difficulty: 'Sedang',
    altitude: '2.769 mdpl',
    meetingPoint: 'Banyuwangi Kota',
    departureTime: 'Fleksibel',
    groupSize: 'Min. 2 Orang',
    languages: ['Bahasa Indonesia', 'English'],
    gallery: [
      '/images/pkg-waterfall.png',
      '/images/pkg-bluefire.png',
      '/images/pkg-crater.png',
      '/images/HeroSection.webp'
    ],
    highlights: [
      'Paket Singkat Sensasi Ijen Midnight',
      'Perlengkapan Pendakian Lengkap Standar BKSDA',
      'Kunjungan Air Terjun Tropis Asri',
      'Snack & Minuman Hangat'
    ],
    itinerary: [
      { day: 'Hari 1', title: 'Kedatangan & Persiapan', desc: 'Check-in homestay & persiapan trekking malam.' },
      { day: 'Hari 2', title: 'Pendakian Ijen & Air Terjun', desc: 'Mengejar fenomena api biru dan relaksasi di air terjun.' },
      { day: 'Hari 3', title: 'Transfer Keluar', desc: 'Makan pagi dan pengantaran kembali ke stasiun/bandara.' }
    ],
    included: [
      'Transportasi AC Selama Program',
      'Tiket Masuk Kawah Ijen & Air Terjun',
      'Masker Respirator Gas & Guide Lokal'
    ],
    excluded: [
      'Pengeluaran Pribadi'
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
