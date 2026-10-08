export interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  tag?: string;
}

export interface HeroStat {
  value: string;
  label: string;
}

export const defaultHeroStats: HeroStat[] = [
  { value: '2.769m', label: 'ketinggian Kawah Ijen' },
  { value: '02:00', label: 'waktu mulai terbaik' },
  { value: '01 hari', label: 'perjalanan berkesan' }
];

export const defaultDestinations: Destination[] = [
  { id: 'dest-ijen', name: 'Kawah Ijen', description: 'Blue fire dan sunrise', image: '/images/the-best-view-of-kawah.webp', tag: 'Gunung Berapi' },
  { id: 'dest-djawatan', name: 'Djawatan', description: 'Hutan trembesi ikonik', image: '/images/djawatan.png', tag: 'Hutan Magis' },
  { id: 'dest-baluran', name: 'TN Baluran', description: 'Savana Africa van Java', image: '/images/pkg-crater.png', tag: 'Safari Liar' },
  { id: 'dest-red-island', name: 'Pulau Merah', description: 'Pantai dan bukit merah', image: '/images/pkg-bali.png', tag: 'Sunset Spot' },
  { id: 'dest-green-island', name: 'Teluk Ijo', description: 'Pesisir hijau Banyuwangi', image: '/images/pkg-waterfall.png', tag: 'Pantai Tropis' },
  { id: 'dest-kawah-wurung', name: 'Kawah Wurung', description: 'Padang bukit yang tenang', image: '/images/pkg-bluefire.png', tag: 'Perbukitan Hijau' }
];
