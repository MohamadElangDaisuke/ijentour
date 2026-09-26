export interface ExperienceStep {
  step: string;
  title: string;
  description: string;
  colorClass: string;
}

export const defaultExperienceSteps: ExperienceStep[] = [
  {
    step: '01',
    title: 'Choose your destination',
    description: 'Pilih paket Ijen, blue fire, atau perjalanan privat sesuai ritme liburanmu.',
    colorClass: 'bg-primary-100 text-primary-700'
  },
  {
    step: '02',
    title: 'Prepare your journey',
    description: 'Guide lokal, transportasi, perlengkapan, dan itinerary kami siapkan untukmu.',
    colorClass: 'bg-secondary-100 text-secondary-700'
  },
  {
    step: '03',
    title: 'Enjoy the wild',
    description: 'Berangkat dengan tenang dan bawa pulang pengalaman yang sulit dilupakan.',
    colorClass: 'bg-secondary-950 text-white'
  }
];
