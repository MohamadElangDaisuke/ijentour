export interface Destination {
  id: string;
  slug?: string;
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
  { value: '2,769m', label: 'Mount Ijen summit altitude' },
  { value: '02:00 AM', label: 'ideal trek start time' },
  { value: '01 day', label: 'unforgettable expedition' }
];

export const defaultDestinations: Destination[] = [
  { id: 'dest-ijen', slug: 'kawah-ijen', name: 'Mount Ijen Crater', description: 'Electric blue fire and golden sunrise', image: '/images/the-best-view-of-kawah.webp', tag: 'Volcano' },
  { id: 'dest-djawatan', slug: 'de-djawatan', name: 'De Djawatan Forest', description: 'Iconic ancient trembesi forest', image: '/images/djawatan.png', tag: 'Enchanted Woods' },
  { id: 'dest-baluran', slug: 'tn-baluran', name: 'Baluran National Park', description: 'Wild savanna dubbed Africa van Java', image: '/images/pkg-crater.png', tag: 'Wildlife Safari' },
  { id: 'dest-red-island', slug: 'red-island', name: 'Red Island (Pulau Merah)', description: 'Scenic beach and reddish coastal hill', image: '/images/pkg-bali.png', tag: 'Sunset Spot' },
  { id: 'dest-green-island', slug: 'green-island', name: 'Green Bay (Teluk Ijo)', description: 'Pristine turquoise tropical coastline', image: '/images/pkg-waterfall.png', tag: 'Tropical Beach' },
  { id: 'dest-kawah-wurung', slug: 'kawah-wurung', name: 'Kawah Wurung', description: 'Serene rolling highland savanna hills', image: '/images/pkg-bluefire.png', tag: 'Green Highlands' }
];

export function getDestinationBySlugFromList(destinations: Destination[], slug: string): Destination | undefined {
  const norm = slug.toLowerCase().trim();
  const found = destinations.find((d) => (d.slug && d.slug === norm) || d.id === norm || d.id === `dest-${norm}`);
  if (found) return found;
  return defaultDestinations.find(
    (d) =>
      (d.slug && d.slug === norm) ||
      d.id === norm ||
      d.id === `dest-${norm}` ||
      d.name.toLowerCase().includes(norm.replace(/-/g, ' '))
  );
}

