export interface Article {
  id: string;
  slug?: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  image: string;
  content?: string;
  author?: string;
  isFeatured?: boolean;
}

export const defaultArticles: Article[] = [
  {
    id: 'mengenal-fenomena-blue-fire',
    title: 'Mengenal Lebih Dekat Fenomena Api Biru (Blue Fire) Kawah Ijen',
    category: 'Edukasi Ijen',
    date: '12 Agustus 2026',
    readTime: '5 Menit Baca',
    excerpt: 'Blue fire di Kawah Ijen adalah satu dari dua fenomena serupa di dunia. Ketahui bagaimana gas belerang menciptakan pemandangan ajaib ini.',
    image: '/images/pkg-bluefire.png',
    isFeatured: true,
    author: 'Tim Ekspedisi Ijen',
    content: `Kawah Ijen merupakan salah satu keajaiban vulkanik paling spektakuler di planet bumi. Terletak di perbatasan Kabupaten Banyuwangi dan Bondowoso, Jawa Timur, gunung berapi aktif ini menyimpan fenomena langka yang hanya ada dua di dunia: **Api Biru (Blue Fire)**—selain yang terdapat di Danau Dallol, Ethiopia.

## Apa Sebenarnya Fenomena Blue Fire Itu?

Banyak orang mengira api biru adalah lava vulkanik yang berwarna biru. Namun secara ilmiah, ini bukanlah lava. **Blue Fire** terbentuk dari pembakaran gas belerang alami bertekanan tinggi yang menyembur keluar dari celah-celah batuan vulkanik dengan suhu mencapai **600°C**.

Ketika gas belerang berkonsentrasi tinggi ini bertemu dengan oksigen di udara bebas, gas tersebut seketika menyala dan menghasilkan api berwarna biru elektrik yang dapat membumbung tinggi hingga 5 meter ke udara.

## Waktu Terbaik Menyaksikan Blue Fire

Untuk dapat melihat keindahan api biru secara optimal, waktu sangat menentukan:
- **Pukul 02:00 – 04:00 WIB**: Ini adalah jendela waktu terbaik sebelum fajar menyingsing. Cahaya api biru hanya terlihat jelas dalam kegelapan malam.
- **Musim Kemarau (Juli – September)**: Jalur pendakian lebih kering dan langit cerah tanpa kabut tebal, sehingga visibilitas ke dasar kawah jauh lebih sempurna.

## Protokol Keselamatan Menuruni Kawah

Menyaksikan Blue Fire membutuhkan pendakian turun menuju dasar kawah (crater floor). Jalur ini memiliki konsentrasi gas belerang yang pekat:
- **Wajib Menggunakan Masker Respirator**: Masker medis biasa tidak mampu menyaring gas belerang (SO₂). Wajib memakai respirator dengan filter karbon aktif.
- **Didampingi Pemandu Berpengalaman**: Mengingat jalur bebatuan terjal di bibir kawah dan arah angin belerang yang bisa berubah sewaktu-waktu, sangat disarankan menggunakan jasa private guide resmi dari **Ijen Expedition**.
- **Gunakan Headlamp**: Membantu menjaga kedua tangan tetap bebas saat menuruni jalur berbatu yang curam.`
  },
  {
    id: 'persiapan-trekking-kawah-ijen',
    title: 'Persiapan Fisik dan Mental Sebelum Trekking Dini Hari',
    category: 'Tips & Trik',
    date: '28 Juli 2026',
    readTime: '4 Menit Baca',
    excerpt: 'Mendaki Kawah Ijen di malam hari membutuhkan stamina yang baik. Berikut adalah panduan latihan ringan dan perlengkapan sebelum Anda memulai ekspedisi.',
    image: '/images/pkg-crater.png',
    isFeatured: true,
    author: 'Guide Lokal Banyuwangi',
    content: `Pendakian Kawah Ijen dimulai dini hari sekitar pukul 02:00 WIB dari Pos Paltuding. Dengan jarak trekking sekitar **3 kilometer** dan elevasi menanjak dari 1.850 mdpl menuju 2.386 mdpl, persiapan fisik yang matang akan membuat pengalaman ekspedisi Anda terasa jauh lebih menyenangkan.

## 1. Latihan Fisik Ringan Sebelum Hari-H

Jalur trekking Ijen memiliki kemiringan rata-rata 25 hingga 35 derajat, terutama pada 2 kilometer pertama:
- Lakukan jalan santai atau jogging ringan minimal 3–4 hari sebelum pendakian.
- Latihan peregangan kaki akan membantu mencegah kram otot saat menghadapi tanjakan panjang.
- Istirahat tidur yang cukup di sore hari sebelum jadwal penjemputan dini hari.

## 2. Pilihan Layanan Troli (Ojek Ontong)

Bagi Anda yang merasa ragu dengan ketahanan fisik atau bepergian bersama lansia dan anak-anak, tersedia layanan **Troli Ijen** yang dikemudikan oleh penambang lokal tangguh:
- Tarif berkisar antara Rp 800.000 – Rp 1.000.000 PP tergantung rute kesepakatan.
- Menggunakan troli juga merupakan bentuk dukungan ekonomi langsung kepada masyarakat lokal penambang belerang.

## 3. Perlengkapan Esensial yang Wajib Dibawa

- **Jaket Penahan Angin (Windbreaker / Fleece)**: Suhu malam hari berkisar 8–12°C.
- **Sepatu Trekking atau Sepatu Olahraga**: Pastikan beralas sol bergerigi dan tidak licin di jalanan pasir berdebu.
- **Air Mineral & Camilan Berenergi**: Cokelat, biskuit, atau pisang untuk mengisi stamina di pos peristirahatan (Pos Bunder).`
  },
  {
    id: 'rekomendasi-kuliner-banyuwangi',
    title: 'Rekomendasi Kuliner Khas Banyuwangi Usai Mendaki',
    category: 'Kuliner',
    date: '15 Juli 2026',
    readTime: '6 Menit Baca',
    excerpt: 'Lelah setelah melihat sunrise? Waktunya mengisi tenaga dengan Sego Tempong, Rujak Soto, dan hidangan lokal Banyuwangi lainnya.',
    image: '/images/pkg-waterfall.png',
    isFeatured: true,
    author: 'Pencinta Kuliner Nusantara',
    content: `Setelah menaklukkan puncak Ijen dan kembali ke kaki gunung di pagi hari, nafsu makan Anda dipastikan melonjak. Banyuwangi terkenal dengan kekayaan kuliner tradisional khas suku Osing yang kaya rempah dan menggugah selera.

## 1. Sego Tempong (Nasi Tempong)

Kuliner wajib nomor satu di Banyuwangi. Kata *"Tempong"* dalam bahasa Osing berarti *"tampar"*, menggambarkan sensasi pedas menyengat dari sambal tomat terasi segar yang diulek dadakan.
- **Lauk Pendamping**: Ikan asin, tahu, tempe goreng, bakwan jagung, dan aneka rebusan sayur segar seperti daun bayam dan labu siam.
- **Rekomendasi**: Sego Tempong Mbok Wah atau Sego Tempong Mbok Nah di pusat kota Banyuwangi.

## 2. Rujak Soto

Perpaduan unik yang mungkin terdengar tidak biasa namun sangat lezat: rujak sayur bumbu kacang petis yang disiram kuah soto daging sapi gurih berempah hangat. Hidangan ini sangat cocok dinikmati untuk menghangatkan tubuh setelah dinginnya angin pegunungan Ijen.

## 3. Pecel Rawon

Kombinasi unik lainnya antara nasi pecel sayur berkuah bumbu kacang gurih manis, yang disiram kuah rawon daging sapi hitam pekat beraroma kluwek. Sajian ini sering disajikan dengan empal daging renyah dan rempeyek kacang.`
  },
  {
    id: 'panduan-memilih-pakaian',
    title: 'Panduan Memilih Pakaian yang Tepat untuk Kawah Ijen',
    category: 'Panduan',
    date: '02 Juli 2026',
    readTime: '3 Menit Baca',
    excerpt: 'Suhu di puncak Ijen bisa mencapai 10 derajat celcius, namun akan terasa panas saat mendaki. Ini rahasia teknik pakaian berlapis (layering).',
    image: '/images/pkg-bali.png',
    isFeatured: false,
    author: 'Tim Outdoor Gear',
    content: `Banyak pendaki pemula melakukan kesalahan umum saat memilih pakaian ke Kawah Ijen: memakai mantel yang terlalu tebal sejak awal, sehingga kepanasan dan basah kuyup oleh keringat di tengah tanjakan.

## Rahasia Teknik Pakaian Berlapis (Layering System)

Kunci kenyamanan mendaki di gunung tropis seperti Ijen adalah **sistem pakaian 3 lapis**:

### Lapis 1: Base Layer (Menyerap Keringat)
Gunakan kaos berbahan *quick-dry* (polyester atau wol sintetis). Hindari kaos katun tebal karena katun menahan keringat dan menjadi dingin saat Anda berhenti berjalan.

### Lapis 2: Mid Layer (Menjaga Kehangatan)
Jaket fleece ringan atau sweater hangat. Lapisan ini bisa Anda buka saat merasa gerah mendaki tanjakan dan dipasang kembali saat beristirahat di puncak.

### Lapis 3: Outer Layer (Penahan Angin & Debu)
Jaket windbreaker atau jaket gunung tipis untuk menghalau hembusan angin kencang di bibir kawah dan melindungi pakaian dari partikel debu belerang.

## Aksesoris Tambahan
- Sarung tangan rajut tipis untuk menghangatkan jari-jari tangan.
- Kupluk (beanie) untuk melindungi telinga dan kepala dari terpaan angin dingin.`
  },
  {
    id: 'etika-berinteraksi-penambang',
    title: 'Etika Berinteraksi dengan Penambang Belerang',
    category: 'Budaya Lokal',
    date: '20 Juni 2026',
    readTime: '4 Menit Baca',
    excerpt: 'Penambang belerang adalah pahlawan tanpa tanda jasa di Kawah Ijen. Pahami batas-batas saat memotret dan bagaimana kita bisa menghargai pekerjaan mereka.',
    image: '/images/ijen-expedition-tour.webp',
    isFeatured: false,
    author: 'Komunitas Penambang Ijen',
    content: `Penambang belerang Kawah Ijen adalah simbol ketangguhan manusia. Setiap hari, mereka memikul beban bongkahan belerang padat seberat **70 hingga 90 kilogram** menaiki tebing terjal kawah tanpa alat bantu mesin modern.

## Panduan Etika Bagi Wisatawan

Sebagai pengunjung yang bertanggung jawab, penting bagi kita untuk menghormati aktivitas mereka:

### 1. Berikan Hak Jalan Utama
Jalur pendakian yang sempit sering kali dilalui penambang yang sedang memikul beban berat. Selalu menepi dan berikan prioritas jalan kepada penambang. Berhenti sejenak agar mereka tidak kehilangan ritme langkah dan keseimbangan.

### 2. Minta Izin Sebelum Memotret
Selalu gunakan senyuman dan sapaan sopan sebelum mengarahkan kamera. Jika memungkinkan, beli cenderamata patung belerang kecil berbentuk kura-kura atau bunga yang mereka buat sebagai bentuk apresiasi langsung.

### 3. Berbagi Kebaikan
Membawa air mineral ekstra atau biskuit untuk dibagikan kepada para penambang yang sedang beristirahat adalah gestur kecil yang sangat mereka hargai.`
  },
  {
    id: 'alternatif-wisata-banyuwangi',
    title: 'Alternatif Wisata di Sekitar Kalipuro dan Banyuwangi',
    category: 'Destinasi',
    date: '10 Juni 2026',
    readTime: '5 Menit Baca',
    excerpt: 'Selain Ijen, Banyuwangi memiliki segudang surga tersembunyi. Mulai dari Taman Nasional Baluran hingga keindahan pantai di ujung timur Jawa.',
    image: '/images/the-best-view-of-kawah.webp',
    isFeatured: false,
    author: 'Pemandu Wisata Osing',
    content: `Kabupaten Banyuwangi yang berjuluk *"The Sunrise of Java"* memiliki bentang alam yang luar biasa lengkap. Setelah puas mengeksplorasi Kawah Ijen, luangkan waktu 1–2 hari tambahan untuk mengunjungi destinasi spektakuler lainnya:

## 1. Taman Nasional Baluran ("Africa van Java")
Hanya berjarak sekitar 1,5 jam perjalanan ke arah utara dari pusat Banyuwangi:
- Savana Bekol yang luas dengan latar belakang Gunung Baluran yang megah.
- Kawanan banteng Jawa, rusa timor, merak hijau, dan monyet ekor panjang yang hidup bebas.
- Pantai Bama dengan hutan mangrove asri dan dermaga kayu estetik.

## 2. Hutan De Djawatan Benculuk
Hutan lindung yang dipenuhi pohon trembesi (*Samanea saman*) berusia ratusan tahun yang diselimuti tanaman paku pakis menjuntai. Suasananya magis dan sangat mirip dengan Hutan Fangorn di film legendaris *The Lord of the Rings*.

## 3. Pulau Merah (Red Island)
Pantai pasir putih dengan bukit karang tanah merah unik di tengah laut. Destinasi terbaik di Banyuwangi untuk menikmati pemandangan matahari terbenam (*sunset*) sembari bersantai di kafe pinggir pantai.`
  }
];

export const articleCategories = [
  'Semua',
  'Panduan',
  'Tips & Trik',
  'Budaya Lokal',
  'Destinasi',
  'Kuliner',
  'Edukasi Ijen'
];

export const articlesStorageKey = 'ijen-tour-articles';
