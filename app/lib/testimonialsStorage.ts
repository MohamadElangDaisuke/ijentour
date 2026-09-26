export interface Testimonial {
  id: string;
  name: string;
  origin: string;
  quote: string;
  image: string;
  rating: number;
  date?: string;
}

export const defaultTestimonials: Testimonial[] = [
  {
    id: 'testi-1',
    name: 'Dimas Pratama & Rekan',
    origin: 'Jakarta, Indonesia',
    quote: 'Perjalanan yang hangat, rapi, dan membuat kami bisa menikmati keindahan Kawah Ijen tanpa khawatir mengatur semuanya sendiri.',
    image: '/images/pkg-bluefire.png',
    rating: 5,
    date: 'September 2026'
  },
  {
    id: 'testi-2',
    name: 'Sarah & Michael',
    origin: 'Sydney, Australia',
    quote: 'The midnight expedition was breathtaking! Exceptional local guide, safe gas masks, and the blue flame was truly magical.',
    image: '/images/the-best-view-of-kawah.webp',
    rating: 5,
    date: 'Agustus 2026'
  },
  {
    id: 'testi-3',
    name: 'Keluarga Hendra Wijaya',
    origin: 'Surabaya, Indonesia',
    quote: 'Private tour Baluran dan Ijen sangat ramah anak dan lansia. Supir sangat sabar dan mobil bersih ber-AC.',
    image: '/images/ijen-expedition-tour.webp',
    rating: 5,
    date: 'Juli 2026'
  }
];

export const testimonialsStorageKey = 'ijen-tour-testimonials';
