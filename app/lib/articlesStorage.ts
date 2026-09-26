export interface Article {
  id: string;
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
    author: 'Tim Ekspedisi Ijen'
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
    author: 'Guide Lokal Banyuwangi'
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
    author: 'Pencinta Kuliner Nusantara'
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
    author: 'Tim Outdoor Gear'
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
    author: 'Komunitas Penambang Ijen'
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
    author: 'Pemandu Wisata Osing'
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
