import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Create / Upsert Users for all roles: ADMIN, CUSTOMER, CUSTOMER_PRO, MITRA
  // Idempotent: Can be run multiple times safely without duplicate errors
  const adminPass = await bcrypt.hash("admin123", 10);
  const custPass = await bcrypt.hash("customer123", 10);
  const mitraPass = await bcrypt.hash("mitra123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ijentour.com" },
    update: {
      name: "Ijen Tour Administrator",
      passwordHash: adminPass,
      phone: "6281234567890",
      role: "ADMIN",
      nationality: "Indonesia",
      isActive: true,
    },
    create: {
      name: "Ijen Tour Administrator",
      email: "admin@ijentour.com",
      passwordHash: adminPass,
      phone: "6281234567890",
      role: "ADMIN",
      nationality: "Indonesia",
      isActive: true,
    },
  });

  const customerPro = await prisma.user.upsert({
    where: { email: "pro@ijentour.com" },
    update: {
      name: "Budi Santoso (Pro Member)",
      passwordHash: custPass,
      phone: "6281234567801",
      role: "CUSTOMER_PRO",
      nationality: "Indonesia",
      isActive: true,
    },
    create: {
      name: "Budi Santoso (Pro Member)",
      email: "pro@ijentour.com",
      passwordHash: custPass,
      phone: "6281234567801",
      role: "CUSTOMER_PRO",
      nationality: "Indonesia",
      isActive: true,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {
      name: "John Traveler",
      passwordHash: custPass,
      phone: "6281234567802",
      role: "CUSTOMER",
      nationality: "United States",
      isActive: true,
    },
    create: {
      name: "John Traveler",
      email: "john@example.com",
      passwordHash: custPass,
      phone: "6281234567802",
      role: "CUSTOMER",
      nationality: "United States",
      isActive: true,
    },
  });

  const mitra = await prisma.user.upsert({
    where: { email: "mitra@ijentour.com" },
    update: {
      name: "Pak Slamet (Local Guide Mitra)",
      passwordHash: mitraPass,
      phone: "6281234567803",
      role: "MITRA",
      nationality: "Indonesia",
      isActive: true,
    },
    create: {
      name: "Pak Slamet (Local Guide Mitra)",
      email: "mitra@ijentour.com",
      passwordHash: mitraPass,
      phone: "6281234567803",
      role: "MITRA",
      nationality: "Indonesia",
      isActive: true,
    },
  });

  console.log("✅ Seeded Users: Admin, Customer Pro, Customer, Mitra");

  // 2. Seed Destinations
  const destinationsData = [
    {
      name: "Kawah Ijen",
      slug: "kawah-ijen",
      description: "Fenomena Blue Fire elektrik legendaris dan danau asam toska terbesar di dunia.",
      image: "/images/the-best-view-of-kawah.webp",
      tag: "Gunung Berapi",
      isFeatured: true,
      sortOrder: 1,
    },
    {
      name: "De Djawatan Forest",
      slug: "de-djawatan",
      description: "Hutan pohon trembesi raksasa berlumut seperti di negeri dongeng Lord of the Rings.",
      image: "/images/djawatan.png",
      tag: "Hutan Magis",
      isFeatured: true,
      sortOrder: 2,
    },
    {
      name: "Green Island Banyuwangi",
      slug: "green-island",
      description: "Surga pulau tersembunyi dengan pasir putih bersih dan air laut sejernih kristal.",
      image: "/images/pkg-bali.png",
      tag: "Pantai Tropis",
      isFeatured: true,
      sortOrder: 3,
    },
    {
      name: "Red Island (Pulau Merah)",
      slug: "red-island",
      description: "Pantai ikonik berbukit merah dengan panorama matahari terbenam paling spektakuler.",
      image: "/images/pkg-bali.png",
      tag: "Sunset Spot",
      isFeatured: true,
      sortOrder: 4,
    },
    {
      name: "Taman Nasional Baluran",
      slug: "tn-baluran",
      description: "Savana ala Afrika dengan satwa liar banteng, rusa, merak, dan Gunung Baluran.",
      image: "/images/pkg-crater.png",
      tag: "Safari Liar",
      isFeatured: true,
      sortOrder: 5,
    },
    {
      name: "Kawah Wurung",
      slug: "kawah-wurung",
      description: "Hamparan perbukitan hijau zamrud nan asri dengan padang sabana luas menenangkan jiwa.",
      image: "/images/pkg-bluefire.png",
      tag: "Perbukitan Hijau",
      isFeatured: true,
      sortOrder: 6,
    },
  ];

  for (const dest of destinationsData) {
    await prisma.destination.upsert({
      where: { slug: dest.slug },
      update: dest,
      create: dest,
    });
  }
  console.log("✅ Seeded Destinations");

  // 3. Seed Trip Packages
  const packages = [
    {
      title: "Midnight Expedition Blue Fire Ijen",
      slug: "midnight-expedition-blue-fire-ijen",
      category: "midnight",
      duration: "1 Hari (Midnight)",
      durationDays: 1,
      durationNights: 0,
      price: "Rp 750.000",
      basePrice: 750000,
      groupDiscountPercent: 10,
      minParticipants: 1,
      maxParticipants: 15,
      difficulty: "Sedang (Trekking 3 Km)",
      altitude: "2.769 mdpl",
      meetingPoint: "Hotel / Stasiun / Bandara Banyuwangi (Free Pick-up)",
      departureTime: "00:00 - 00:30 WIB Dini Hari",
      badge: "Best Seller",
      rating: 5.0,
      savedCount: "4.120K",
      isTrending: true,
      isRecent: true,
      isFeatured: true,
      isActive: true,
      coverImage: "/images/pkg-bluefire.png",
      description: "Rasakan sensasi petualangan malam hari mendaki puncak Kawah Ijen untuk menyaksikan fenomena kobaran api biru (Blue Fire) elektrik yang hanya ada dua di seluruh dunia. Didampingi pemandu lokal berpengalaman dan mantan penambang belerang asli, Anda akan diajak menikmati momen matahari terbit magis yang menyinari danau kawah asam berwarna toska.",
      galleryImages: JSON.stringify([
        "/images/pkg-bluefire.png",
        "/images/the-best-view-of-kawah.webp",
        "/images/pkg-crater.png",
        "/images/HeroSection.webp",
      ]),
      highlights: JSON.stringify([
        "Berangkat Jam 00:00 Dini Hari dari Banyuwangi",
        "Guide Penambang Belerang Lokal Berlisensi",
        "Masker Respirator Standar Keamanan & Senter Kepala",
        "Spot Foto Sunrise & Danau Asam Terbesar di Dunia",
        "Antar-Jemput Privat Armada Ber-AC",
      ]),
      itineraries: JSON.stringify([
        { day: "00:00 WIB", title: "Penjemputan di Hotel / Stasiun", desc: "Driver kami akan menjemput Anda di hotel atau stasiun area Banyuwangi dengan armada nyaman ber-AC." },
        { day: "01:30 WIB", title: "Tiba di Basecamp Paltuding", desc: "Briefing keselamatan dari guide lokal, pembagian masker respirator gas belerang dan senter kepala (headlamp)." },
        { day: "02:00 WIB", title: "Mulai Pendakian Jalur Ijen", desc: "Trekking santai sejauh 3 km menuju bibir kawah. Suasana malam dengan taburan bintang yang memukau." },
        { day: "03:45 WIB", title: "Fenomena Blue Fire Elektrik", desc: "Turun ke dasar kawah didampingi guide untuk mengagumi nyala api biru yang legendaris secara dekat dan aman." },
        { day: "05:15 WIB", title: "Golden Sunrise Kawah Ijen", desc: "Naik kembali ke bibir kawah untuk menikmati panorama danau toska berkilau di bawah siraman cahaya fajar." },
        { day: "07:00 WIB", title: "Kembali ke Paltuding & Sarapan Ringan", desc: "Perjalanan turun santai ke pos awal, rehat sejenak dan menikmati minuman hangat serta kudapan." },
        { day: "08:30 WIB", title: "Transfer Kembali ke Hotel / Stasiun", desc: "Perjalanan pulang menuju penginapan atau titik drop-off. Tour selesai dengan kenangan tak terlupakan." },
      ]),
      includedItems: JSON.stringify([
        "Transportasi AC PP dari Hotel/Stasiun Banyuwangi",
        "Tiket Masuk Resmi BKSDA / Kawah Ijen & Asuransi",
        "Pemandu Lokal Berlisensi (Former Sulfur Miner)",
        "Masker Gas Respirator Medis Standar Belerang",
        "Headlamp / Senter Kepala Penerangan",
        "Air Mineral & Snack Hangat",
        "P3K Dasar Standar Gunung",
      ]),
      excludedItems: JSON.stringify([
        "Pengeluaran Pribadi di Luar Paket",
        "Taksi Troly Dorong Kawah (Opsional jika lelah)",
        "Makan Berat Tambahan",
        "Tip Sukarela untuk Guide / Driver",
      ]),
      packingList: JSON.stringify([
        { item: "Jaket Tebal / Windbreaker", note: "Suhu puncak dini hari bisa mencapai 6°C - 10°C" },
        { item: "Sepatu Trekking / Sneakers Anti-Slip", note: "Jalur berpasir dan sedikit menanjak di awal" },
        { item: "Celana Panjang & Kaos Kaki Tebal", note: "Melindungi dari hawa dingin dan debu" },
        { item: "Kamera / Smartphone & Powerbank", note: "Untuk mengabadikan momen Blue Fire & Sunrise" },
        { item: "Uang Tunai Secukupnya", note: "Untuk membeli cinderamata belerang atau minuman hangat di pos" },
      ]),
      faqs: JSON.stringify([
        { q: "Apakah pemula atau anak-anak bisa mengikuti tour ini?", a: "Sangat bisa! Jalur pendakian cukup lebar dan jelas. Jika merasa lelah, tersedia jasa troli dorong lokal (trolley taxi) yang siap mengantar sampai ke puncak." },
        { q: "Kapan waktu terbaik melihat Blue Fire?", a: "Waktu terbaik adalah antara pukul 03:00 hingga 04:30 WIB saat langit masih gelap pekat. Kami mengatur jadwal agar Anda tiba tepat waktu di spot terbaik." },
        { q: "Apakah bau gas belerang berbahaya?", a: "Kami menyediakan masker respirator khusus berfilter aktif yang aman menyaring asap belerang. Guide kami juga selalu memantau arah angin demi keamanan Anda." },
      ]),
      sortOrder: 1,
    },
    {
      title: "Bromo & Ijen Crater Sunrise Combo",
      slug: "bromo-ijen-crater-sunrise-combo",
      category: "regular",
      duration: "3 Hari 2 Malam",
      durationDays: 3,
      durationNights: 2,
      price: "Rp 2.850.000",
      basePrice: 2850000,
      groupDiscountPercent: 15,
      minParticipants: 2,
      maxParticipants: 12,
      difficulty: "Sedang",
      altitude: "2.329m (Bromo) & 2.769m (Ijen)",
      meetingPoint: "Surabaya / Malang / Banyuwangi",
      departureTime: "08:00 WIB Hari Pertama",
      badge: "Paling Populer",
      rating: 4.9,
      savedCount: "3.200K",
      isTrending: true,
      isRecent: false,
      isFeatured: true,
      isActive: true,
      coverImage: "/images/pkg-crater.png",
      description: "Eksplorasi dua gunung berapi paling termasyhur di Jawa Timur dalam satu perjalanan komprehensif. Mulai dari lautan pasir dan kawah bergemuruh Gunung Bromo di kawasan Tengger, hingga kobaran api biru magis Kawah Ijen di Banyuwangi.",
      galleryImages: JSON.stringify([
        "/images/pkg-crater.png",
        "/images/pkg-bluefire.png",
        "/images/the-best-view-of-kawah.webp",
      ]),
      highlights: JSON.stringify([
        "Jeep 4x4 Land Cruiser di Lautan Pasir Bromo",
        "Sunrise Puncak Penanjakan View Semeru",
        "Midnight Blue Fire Kawah Ijen Trekking",
        "Termasuk Penginapan Hotel Berbintang 2 Malam",
      ]),
      itineraries: JSON.stringify([
        { day: "Hari 1", title: "Penjemputan Surabaya/Malang Menuju Bromo", desc: "Perjalanan santai ke area Taman Nasional Bromo Tengger Semeru. Check-in hotel dan istirahat." },
        { day: "Hari 2", title: "Sunrise Bromo & Perjalanan ke Banyuwangi", desc: "Tur jeep subuh melihat matahari terbit, kawah Bromo, Pasir Berbisik. Lanjut transfer darat ke Banyuwangi." },
        { day: "Hari 3", title: "Ekspedisi Midnight Ijen & Drop-off", desc: "Dini hari menuju Ijen melihat Blue Fire & Sunrise. Siang hari transfer ke Pelabuhan Ketapang (Bali) atau Stasiun Banyuwangi." },
      ]),
      includedItems: JSON.stringify([
        "Mobil Privat AC Selama 3 Hari + Bensin + Driver",
        "Jeep Privat 4WD di Bromo",
        "Hotel 2 Malam Termasuk Sarapan Pagi",
        "Semua Tiket Masuk Bromo & Kawah Ijen",
        "Masker Gas Ijen & Guide Lokal Berpengalaman",
      ]),
      excludedItems: JSON.stringify([
        "Makan Siang dan Makan Malam",
        "Sewa Kuda di Bromo",
        "Tiket Pesawat / Kereta ke Meeting Point",
      ]),
      packingList: JSON.stringify([
        { item: "Pakaian Hangat Ekstra", note: "Suhu Bromo bisa mencapai 3°C - 5°C di pagi hari" },
        { item: "Sepatu Olahraga / Trekking Nyaman", note: "Banyak berjalan di pasir dan tanjakan" },
      ]),
      faqs: JSON.stringify([
        { q: "Bisa diantar ke Bali setelah tour?", a: "Bisa sekali! Kami menyediakan opsi drop-off di Pelabuhan Ketapang Banyuwangi atau penyeberangan ke Bali." },
      ]),
      sortOrder: 2,
    },
    {
      title: "Private Crater Lake & Waterfall Tour",
      slug: "private-crater-lake-waterfall-tour",
      category: "private",
      duration: "1 Hari Penuh (Full Day)",
      durationDays: 1,
      durationNights: 0,
      price: "Rp 1.150.000",
      basePrice: 1150000,
      groupDiscountPercent: 10,
      minParticipants: 1,
      maxParticipants: 6,
      difficulty: "Mudah - Sedang",
      altitude: "2.769 mdpl",
      meetingPoint: "Hotel di Banyuwangi",
      departureTime: "00:00 WIB Dini Hari",
      badge: "Eksklusif Privat",
      rating: 4.9,
      savedCount: "2.450K",
      isTrending: false,
      isRecent: true,
      isFeatured: true,
      isActive: true,
      coverImage: "/images/pkg-waterfall.png",
      description: "Paket privat eksklusif tanpa dicampur peserta lain. Gabungan mendaki Kawah Ijen dan relaksasi menyegarkan di Air Terjun Kembar Jagir serta perkebunan kopi Kalipuro yang sejuk nan hijau.",
      galleryImages: JSON.stringify([
        "/images/pkg-waterfall.png",
        "/images/pkg-bluefire.png",
        "/images/the-best-view-of-kawah.webp",
      ]),
      highlights: JSON.stringify([
        "Armada Privat Premium Eksklusif Anda",
        "Waktu Fleksibel Tanpa Tergesa-gesa",
        "Air Terjun Jagir & Kebun Kopi Organik",
        "Makan Pagi Tradisional Khas Osing",
      ]),
      itineraries: JSON.stringify([
        { day: "00:00 WIB", title: "Privat Pick-up di Hotel", desc: "Dijemput armada privat khusus keluarga atau rombongan Anda." },
        { day: "02:00 WIB", title: "Mendaki Kawah Ijen & Blue Fire", desc: "Eksplorasi puncak kawah dengan pemandu pribadi yang fleksibel sesuai ritme langkah Anda." },
        { day: "08:30 WIB", title: "Sarapan Santai di Resto Perkebunan", desc: "Menikmati sarapan hangat di tengah perkebunan kopi arabika lereng gunung." },
        { day: "10:00 WIB", title: "Eksplorasi Air Terjun Kembar Jagir", desc: "Bermain air segar dan berfoto di air terjun alami dengan suasana asri." },
        { day: "12:00 WIB", title: "Kembali ke Hotel", desc: "Kembali ke penginapan untuk beristirahat dengan nyaman." },
      ]),
      includedItems: JSON.stringify([
        "Armada Privat Eksklusif + Driver + BBM",
        "Pemandu Khusus Rombongan Anda",
        "Semua Tiket Masuk Ijen & Air Terjun",
        "Sarapan Pagi Spesial & Air Mineral",
        "Masker Respirator Lengkap",
      ]),
      excludedItems: JSON.stringify([
        "Pengeluaran Pribadi",
        "Tip Sukarela",
      ]),
      packingList: JSON.stringify([
        { item: "Baju Ganti Santai", note: "Untuk bermain air di air terjun" },
        { item: "Sandal Gunung / Sepatu Trekking", note: "Aman di area bebatuan basah" },
      ]),
      faqs: JSON.stringify([
        { q: "Apakah jadwal bisa disesuaikan?", a: "Tentu saja! Karena ini private tour, Anda bebas menyesuaikan waktu berhenti atau durasi istirahat." },
      ]),
      sortOrder: 3,
    },
    {
      title: "Kawah Wurung & Djawatan Green Escape",
      slug: "kawah-wurung-djawatan-green-escape",
      category: "regular",
      duration: "1 Hari (Day Trip)",
      durationDays: 1,
      durationNights: 0,
      price: "Rp 650.000",
      basePrice: 650000,
      groupDiscountPercent: 10,
      minParticipants: 1,
      maxParticipants: 15,
      difficulty: "Sangat Mudah (Cocok Keluarga)",
      altitude: "Dataran Rendah & Perbukitan Sejuk",
      meetingPoint: "Kota Banyuwangi",
      departureTime: "08:00 WIB Pagi Hari",
      badge: "Ramah Anak & Lansia",
      rating: 4.8,
      savedCount: "1.890K",
      isTrending: true,
      isRecent: true,
      isFeatured: true,
      isActive: true,
      coverImage: "/images/djawatan.png",
      description: "Wisata alam yang santai dan instagramable tanpa perlu mendaki dini hari. Menjelajahi keajaiban hutan kanopi trembesi De Djawatan Benculuk dan bukit hijau savana Kawah Wurung Bondowoso.",
      galleryImages: JSON.stringify([
        "/images/djawatan.png",
        "/images/pkg-bluefire.png",
        "/images/pkg-bali.png",
      ]),
      highlights: JSON.stringify([
        "Foto Ikonik di Hutan De Djawatan ala Lord of the Rings",
        "Padang Rumput Bukit Hijau Kawah Wurung",
        "Mencicipi Kopi Asli Osing Banyuwangi",
        "Sangat Ramah Keluarga & Tanpa Trekking Berat",
      ]),
      itineraries: JSON.stringify([
        { day: "08:00 WIB", title: "Penjemputan Pagi", desc: "Penjemputan di hotel atau stasiun Banyuwangi setelah sarapan." },
        { day: "09:00 WIB", title: "De Djawatan Benculuk", desc: "Sesi foto estetik di antara pohon-pohon trembesi raksasa berusia ratusan tahun." },
        { day: "11:30 WIB", title: "Makan Siang Sego Tempong Khas", desc: "Menikmati kuliner legendaris Banyuwangi dengan sambal segar." },
        { day: "13:30 WIB", title: "Eksplorasi Kawah Wurung", desc: "Menikmati angin sejuk dan panorama bukit meliuk berkarpet hijau." },
        { day: "16:30 WIB", title: "Kembali ke Kota Banyuwangi", desc: "Mampir ke pusat oleh-oleh khas sebelum kembali ke hotel." },
      ]),
      includedItems: JSON.stringify([
        "Armada AC Nyaman + Driver + BBM",
        "Tiket Masuk Semua Wisata",
        "Makan Siang Kuliner Tradisional",
        "Air Mineral Sepuasnya",
      ]),
      excludedItems: JSON.stringify([
        "Sewa Kuda atau ATV di Kawah Wurung",
        "Pengeluaran Belanja Oleh-oleh",
      ]),
      packingList: JSON.stringify([
        { item: "Pakaian Kasual & Kacamata Hitam", note: "Cocok untuk foto-foto estetik outdoor" },
        { item: "Topi & Sunscreen", note: "Melindungi dari sinar matahari siang" },
      ]),
      faqs: JSON.stringify([
        { q: "Apakah rute ini ada jalan kaki jauh?", a: "Tidak ada, lokasi mobil sangat dekat dengan spot foto utama." },
      ]),
      sortOrder: 4,
    },
    {
      title: "Bali to Ijen Overnight Overland",
      slug: "bali-to-ijen-overnight-overland",
      category: "midnight",
      duration: "1 Malam (Overnight Bali Return)",
      durationDays: 1,
      durationNights: 1,
      price: "Rp 1.650.000",
      basePrice: 1650000,
      groupDiscountPercent: 12,
      minParticipants: 2,
      maxParticipants: 10,
      difficulty: "Sedang",
      altitude: "2.769 mdpl",
      meetingPoint: "Kuta / Seminyak / Ubud / Canggu (Bali)",
      departureTime: "18:00 - 19:00 WITA dari Bali",
      badge: "Bali Pick-up",
      rating: 5.0,
      savedCount: "2.900K",
      isTrending: true,
      isRecent: false,
      isFeatured: true,
      isActive: true,
      coverImage: "/images/pkg-bali.png",
      description: "Pilihan terbaik untuk wisatawan yang sedang berlibur di Pulau Bali dan ingin berkunjung ke Kawah Ijen tanpa repot memesan transportasi terpisah. Dijemput langsung dari hotel di Bali, menyeberang selat Bali dengan ferry, mendaki Ijen, dan kembali diantar ke hotel di Bali keesokan harinya.",
      galleryImages: JSON.stringify([
        "/images/pkg-bali.png",
        "/images/pkg-bluefire.png",
        "/images/the-best-view-of-kawah.webp",
      ]),
      highlights: JSON.stringify([
        "Penjemputan Langsung dari Hotel di Bali (Kuta/Canggu/Ubud/Sanur)",
        "Tiket Kapal Ferry Penyeberangan Bali - Jawa PP",
        "Blue Fire Trek & Sunrise Danau Belerang",
        "Antar Pulang Kembali ke Hotel di Bali",
      ]),
      itineraries: JSON.stringify([
        { day: "19:00 WITA", title: "Penjemputan di Hotel Bali", desc: "Driver menjemput di lobi hotel Bali dan berkendara menuju Pelabuhan Gilimanuk (Bali Barat)." },
        { day: "23:00 WITA", title: "Penyeberangan Selat Bali", desc: "Naik kapal ferry menuju Pelabuhan Ketapang Banyuwangi (perbedaan waktu 1 jam lebih lambat di Jawa)." },
        { day: "01:00 WIB", title: "Tiba di Basecamp Paltuding Ijen", desc: "Persiapan mendaki, safety briefing, dan pembagian masker gas." },
        { day: "02:00 WIB", title: "Trekking Kawah Ijen & Blue Fire", desc: "Menyaksikan kobaran api biru magis dan fajar menyingsing di atas danau toska." },
        { day: "08:00 WIB", title: "Sarapan Pagi & Perjalanan Pulang", desc: "Rehat sarapan sebelum kembali naik ferry ke Bali." },
        { day: "14:00 WITA", title: "Tiba Kembali di Hotel Bali", desc: "Drop-off kembali ke hotel Anda di Bali dengan selamat." },
      ]),
      includedItems: JSON.stringify([
        "Transportasi AC Nyaman PP dari Hotel di Bali",
        "Tiket Kapal Ferry PP Selat Bali",
        "Tiket Masuk Resmi BKSDA Kawah Ijen",
        "Pemandu Lokal Berlisensi",
        "Respirator Gas Mask & Headlamp",
        "Air Mineral Selama Perjalanan",
      ]),
      excludedItems: JSON.stringify([
        "Makan Malam di Bali",
        "Tip untuk Supir & Guide",
      ]),
      packingList: JSON.stringify([
        { item: "Jaket Hangat & Celana Panjang", note: "Untuk pendakian di Kawah Ijen" },
        { item: "Paspor / KTP Asli", note: "Wajib untuk registrasi ferry penyeberangan" },
      ]),
      faqs: JSON.stringify([
        { q: "Bisa drop-off di kota lain di Bali?", a: "Bisa, silakan informasikan lokasi drop-off saat pemesanan." },
      ]),
      sortOrder: 5,
    },
  ];

  const createdPackages: any[] = [];
  for (const pkg of packages) {
    const created = await prisma.tripPackage.upsert({
      where: { slug: pkg.slug },
      update: pkg,
      create: pkg,
    });
    createdPackages.push(created);

    // Create a schedule for each package if not already exists
    const existingSchedule = await prisma.tripSchedule.findFirst({
      where: { tripPackageId: created.id, departureDate: "2026-10-01" },
    });
    if (!existingSchedule) {
      await prisma.tripSchedule.create({
        data: {
          tripPackageId: created.id,
          departureDate: "2026-10-01",
          availableSlots: 15,
          bookedSlots: 3,
          status: "OPEN",
        },
      });
    }
  }
  console.log("✅ Seeded Trip Packages & Schedules");

  // 4. Seed Gallery Moments
  const galleryItems = [
    {
      title: "Api Biru Elektrik (Blue Fire)",
      image: "/images/pkg-bluefire.png",
      caption: "Kobaran api biru elektrik alami yang membara di dasar kawah Kawah Ijen.",
      category: "blue-fire",
      isFeatured: true,
      sortOrder: 1,
    },
    {
      title: "Panorama Danau Kawah Ijen",
      image: "/images/the-best-view-of-kawah.webp",
      caption: "Pemandangan spektakuler danau asam terbesar di dunia dengan air hijau toska.",
      category: "crater",
      isFeatured: true,
      sortOrder: 2,
    },
    {
      title: "Hutan Magis De Djawatan",
      image: "/images/djawatan.png",
      caption: "Kanopi pohon trembesi raksasa berusia ratusan tahun berlumut hijau alami.",
      category: "destination",
      isFeatured: true,
      sortOrder: 3,
    },
    {
      title: "Air Terjun Kembar Jagir",
      image: "/images/pkg-waterfall.png",
      caption: "Kesejukan gemericik air alami pegunungan Ijen di tengah perkebunan Kalipuro.",
      category: "crater",
      isFeatured: true,
      sortOrder: 4,
    },
    {
      title: "Golden Sunrise Puncak Kawah",
      image: "/images/pkg-crater.png",
      caption: "Sinar fajar keemasan menyapu bibir kawah dan Gunung Merapi Jawa Timur.",
      category: "sunrise",
      isFeatured: true,
      sortOrder: 5,
    },
    {
      title: "Perjuangan Penambang Belerang",
      image: "/images/ijen-expedition-tour.webp",
      caption: "Penambang belerang tangguh yang memikul beban puluhan kilogram demi keluarga.",
      category: "miners",
      isFeatured: true,
      sortOrder: 6,
    },
    {
      title: "Kawasan Pesisir Banyuwangi",
      image: "/images/pkg-bali.png",
      caption: "Keindahan alam tropis Banyuwangi dari perbukitan hingga pesisir selat Bali.",
      category: "destination",
      isFeatured: true,
      sortOrder: 7,
    },
    {
      title: "Puncak Gunung Berapi Ijen",
      image: "/images/HeroSection.webp",
      caption: "Kemegahan kaldera vulkanik aktif di ujung timur Pulau Jawa.",
      category: "crater",
      isFeatured: true,
      sortOrder: 8,
    },
  ];

  for (const item of galleryItems) {
    const existing = await prisma.galleryItem.findFirst({
      where: { title: item.title },
    });
    if (!existing) {
      await prisma.galleryItem.create({ data: item });
    }
  }
  console.log("✅ Seeded Gallery Moments");

  // 5. Seed Blog Articles
  const articles = [
    {
      title: "Mengenal Lebih Dekat Fenomena Api Biru (Blue Fire) Kawah Ijen",
      slug: "mengenal-fenomena-blue-fire",
      category: "Edukasi Ijen",
      date: "12 Agustus 2026",
      readTime: "5 Menit Baca",
      excerpt: "Blue fire di Kawah Ijen adalah satu dari dua fenomena serupa di dunia. Ketahui bagaimana gas belerang menciptakan pemandangan ajaib ini.",
      content: `## Fenomena Langka Dunia di Tanah Banyuwangi\n\nKawah Ijen yang terletak di perbatasan Kabupaten Banyuwangi dan Bondowoso memiliki daya tarik unik yang tidak ditemukan di hampir seluruh penjuru bumi: kobaran **Blue Fire** atau Api Biru.\n\n### Bukan Lahar Biru!\nBanyak wisatawan mengira bahwa Blue Fire adalah lava yang berwarna biru. Namun secara ilmiah, ini adalah gas belerang murni bertekanan tinggi yang menyembur keluar dari celah bebatuan vulkanik dengan suhu mencapai lebih dari 600°C. Begitu gas belerang ini bersentuhan dengan oksigen di udara bebas, gas langsung terbakar dan menghasilkan nyala api biru neon yang memesona.\n\n### Kapan Waktu Terbaik Melihatnya?\nApi biru hanya bisa disaksikan dalam kondisi gelap gulita, idealnya antara pukul **02.30 hingga 04.30 WIB**. Ketika fajar mulai merekah, warna biru akan memudar dan berganti dengan pemandangan danau kawah asam berwarna hijau toska yang memesona.`,
      image: "/images/pkg-bluefire.png",
      isFeatured: true,
      author: "Tim Ekspedisi Ijen",
      authorId: admin.id,
    },
    {
      title: "Persiapan Fisik dan Mental Sebelum Trekking Dini Hari ke Kawah Ijen",
      slug: "persiapan-trekking-kawah-ijen",
      category: "Tips & Trik",
      date: "28 Juli 2026",
      readTime: "4 Menit Baca",
      excerpt: "Mendaki Kawah Ijen di malam hari membutuhkan stamina yang baik. Berikut adalah panduan latihan ringan dan perlengkapan sebelum Anda memulai ekspedisi.",
      content: `## Tips Persiapan Pendakian Ijen\n\nJalur pendakian Kawah Ijen memiliki panjang kurang lebih 3 kilometer dari Pos Paltuding hingga bibir kawah. Walaupun jalurnya lebar dan tertata, tanjakan awal 1,5 kilometer pertama memiliki kemiringan yang cukup menguji stamina.\n\n1. **Pemanasan dan Istirahat Cukup**: Pastikan Anda tidur sore minimal 3-4 jam sebelum penjemputan jam 00:00 WIB.\n2. **Kenakan Pakaian Berlapis (Layering)**: Suhu malam hari berkisar 6-10°C, namun saat mendaki tubuh akan berkeringat. Gunakan jaket yang mudah dibuka.\n3. **Sepatu yang Tepat**: Hindari memakai sandal tipis; kenakan sepatu olahraga atau trekking berdaya cengkeram baik.\n4. **Manfaatkan Troli Jika Butuh**: Jangan memaksakan diri jika merasa lelah di tengah jalur. Warga lokal menyediakan jasa taksi troli resmi yang nyaman.`,
      image: "/images/pkg-crater.png",
      isFeatured: true,
      author: "Guide Lokal Banyuwangi",
      authorId: mitra.id,
    },
    {
      title: "Rekomendasi Kuliner Khas Banyuwangi Usai Menikmati Sunrise Ijen",
      slug: "rekomendasi-kuliner-banyuwangi",
      category: "Kuliner",
      date: "15 Juli 2026",
      readTime: "6 Menit Baca",
      excerpt: "Lelah setelah melihat sunrise? Waktunya mengisi tenaga dengan Sego Tempong, Rujak Soto, dan hidangan lokal Banyuwangi lainnya.",
      content: `## Menikmati Kelezatan Kuliner Bumi Blambangan\n\nSetelah membakar kalori mendaki puncak Ijen, lidah Anda wajib dimanjakan dengan kuliner otentik suku Osing Banyuwangi:\n\n- **Sego Tempong**: Nasi dengan aneka lauk goreng, lalapan rebus daun kenikir, dan sambal terasi mentah yang pedasnya 'menampar' (tempong).\n- **Rujak Soto**: Perpaduan unik antara rujak sayur bumbu petis dan kuah soto daging gurih kental.\n- **Kue Bagiak**: Camilan manis gurih berbahan dasar tepung sagu dan kelapa, sangat cocok dijadikan oleh-oleh.`,
      image: "/images/pkg-waterfall.png",
      isFeatured: true,
      author: "Pencinta Kuliner Nusantara",
      authorId: admin.id,
    },
  ];

  for (const art of articles) {
    await prisma.blogPost.upsert({
      where: { slug: art.slug },
      update: art,
      create: art,
    });
  }
  console.log("✅ Seeded Blog Posts");

  // 6. Seed Initial Bookings (upsert by bookingCode)
  const firstPkg = createdPackages[0];
  const secondPkg = createdPackages[1];

  await prisma.booking.upsert({
    where: { bookingCode: "IJN-20260925-B101" },
    update: {},
    create: {
      bookingCode: "IJN-20260925-B101",
      userId: customerPro.id,
      customerName: customerPro.name,
      customerEmail: customerPro.email,
      customerPhone: "081234567801",
      whatsappNumber: "6281234567801",
      tripPackageId: firstPkg?.id,
      packageName: firstPkg?.title || "Midnight Expedition Blue Fire Ijen",
      departureDate: "2026-10-05",
      numParticipants: 2,
      basePrice: 750000,
      addonTotal: 800000,
      addons: JSON.stringify([{ id: "trolley", name: "Sewa Troli Kawah Ijen PP", price: 800000 }]),
      discountAmount: 150000,
      totalPrice: 2150000,
      pickupLocation: "Hotel Santika Banyuwangi",
      status: "CONFIRMED",
      paymentStatus: "PAID",
      specialRequests: "Tolong siapkan masker untuk ukuran anak dan guide berbahasa Inggris.",
    },
  });

  await prisma.booking.upsert({
    where: { bookingCode: "IJN-20260925-C202" },
    update: {},
    create: {
      bookingCode: "IJN-20260925-C202",
      userId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: "081234567802",
      whatsappNumber: "6281234567802",
      tripPackageId: secondPkg?.id,
      packageName: secondPkg?.title || "Bromo & Ijen Crater Sunrise Combo",
      departureDate: "2026-10-12",
      numParticipants: 4,
      basePrice: 2850000,
      addonTotal: 650000,
      addons: JSON.stringify([{ id: "drone", name: "Dokumentasi Drone & Kamera 4K", price: 650000 }]),
      discountAmount: 1710000,
      totalPrice: 10340000,
      pickupLocation: "Stasiun Banyuwangi Kota",
      status: "PENDING",
      paymentStatus: "PENDING",
      specialRequests: "Ingin jemput jam 07:30 pagi di stasiun.",
    },
  });
  console.log("✅ Seeded Sample Bookings");

  // 7. Seed Notifications
  const initialNotifs = [
    {
      type: "booking",
      title: "Booking Baru Diterima",
      description: "Budi Santoso memesan 'Midnight Expedition Blue Fire Ijen' untuk 2 pax. Kode: IJN-20260925-B101",
      link: "/admin/bookings",
      unread: true,
    },
    {
      type: "booking",
      title: "Permintaan Konfirmasi Pembayaran",
      description: "John Traveler memesan 'Bromo & Ijen Crater Sunrise Combo' (4 pax). Menunggu verifikasi deposit.",
      link: "/admin/bookings",
      unread: true,
    },
    {
      type: "contact",
      title: "Pesan Kontak Masuk",
      description: "Pertanyaan mengenai ketersediaan paket overland Bali return akhir bulan.",
      link: "/admin/contacts",
      unread: false,
    },
  ];

  for (const n of initialNotifs) {
    const existing = await prisma.notification.findFirst({
      where: { title: n.title },
    });
    if (!existing) {
      await prisma.notification.create({ data: n });
    }
  }
  console.log("✅ Seeded Notifications");

  // 8. Seed Contact Inbox
  const existingContact = await prisma.contact.findFirst({
    where: { email: "sarah.m@gmail.com" },
  });
  if (!existingContact) {
    await prisma.contact.create({
      data: {
        name: "Sarah Miller",
        email: "sarah.m@gmail.com",
        phone: "+61 412 345 678",
        subject: "Private Tour Ijen untuk Keluarga dengan Anak 8 Tahun",
        message: "Halo Ijen Tour, kami berencana datang ke Banyuwangi tanggal 15 Oktober bersama anak 8 tahun. Apakah aman untuk naik troli dan apakah bisa penjemputan dari Pelabuhan Ketapang setelah tiba dari Bali?",
        status: "UNREAD",
      },
    });
  }

  // 9. Seed FAQs
  const faqs = [
    {
      question: "Apakah fenomena Blue Fire selalu bisa dilihat setiap malam?",
      answer: "Fenomena Blue Fire adalah proses alamiah yang aktif setiap malam sepanjang tahun, asalkan kawah tidak ditutup karena aktivitas vulkanik atau hujan lebat yang memadamkan api. Guide kami selalu memantau kondisi terkini dari pos pengamatan PVMBG sebelum berangkat.",
      category: "general",
      sortOrder: 1,
    },
    {
      question: "Apakah aman mendaki Kawah Ijen bersama anak-anak atau lansia?",
      answer: "Sangat aman dengan persiapan yang tepat. Jalur pendakian cukup lebar. Untuk anggota keluarga yang tidak kuat mendaki jalan kaki, tersedia jasa troli dorong lokal (trolley taxi) berlisensi yang siap mengantar pulang pergi ke puncak kawah dengan nyaman.",
      category: "safety",
      sortOrder: 2,
    },
    {
      question: "Kapan waktu penjemputan dan apa saja yang perlu kami bawa?",
      answer: "Untuk trip Midnight Blue Fire, penjemputan dilakukan antara pukul 00:00 - 00:30 WIB dini hari dari hotel Anda di Banyuwangi. Cukup bawa jaket hangat, sepatu kets/trekking, celana panjang, dan kartu identitas. Masker gas respirator dan senter kepala sudah kami sediakan.",
      category: "preparation",
      sortOrder: 3,
    },
    {
      question: "Bagaimana cara melakukan pemesanan dan pembayaran?",
      answer: "Anda dapat memilih paket wisata di website kami, menentukan jumlah peserta dan add-on yang diinginkan, lalu mengisi data pemesanan. Anda akan menerima kode booking resmi dan konfirmasi via WhatsApp dari tim kami.",
      category: "booking",
      sortOrder: 4,
    },
  ];

  for (const f of faqs) {
    const existing = await prisma.faq.findFirst({
      where: { question: f.question },
    });
    if (!existing) {
      await prisma.faq.create({ data: f });
    }
  }
  console.log("✅ Seeded FAQs");

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
