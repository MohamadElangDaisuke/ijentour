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
  { id: 'dest-ijen', name: 'Ijen', description: 'Blue fire dan sunrise', image: '/images/pkg-crater.png', tag: 'Gunung Berapi' },
  { id: 'dest-djawatan', name: 'Djawatan', description: 'Hutan trembesi ikonik', image: '/images/djawatan.png', tag: 'Hutan Magis' },
  { id: 'dest-green-island', name: 'Green Island', description: 'Pesisir hijau Banyuwangi', image: '/images/pkg-bali.png', tag: 'Pantai Tropis' },
  { id: 'dest-red-island', name: 'Red Island', description: 'Pantai dan bukit merah', image: '/images/pkg-bali.png', tag: 'Sunset Spot' },
  { id: 'dest-baluran', name: 'TN Baluran', description: 'Savana Africa van Java', image: '/images/pkg-crater.png', tag: 'Safari Liar' },
  { id: 'dest-kawah-wurung', name: 'Kawah Wurung', description: 'Padang bukit yang tenang', image: '/images/pkg-bluefire.png', tag: 'Perbukitan Hijau' }
];
