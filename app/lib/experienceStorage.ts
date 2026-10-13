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
    description: 'Select an Ijen package, electric blue fire trek, or private excursion tailored to your travel pace.',
    colorClass: 'bg-primary-100 text-primary-700'
  },
  {
    step: '02',
    title: 'Prepare your journey',
    description: 'Local guides, private transportation, safety gear, and detailed itineraries are all arranged for you.',
    colorClass: 'bg-secondary-100 text-secondary-700'
  },
  {
    step: '03',
    title: 'Enjoy the wild',
    description: 'Travel with complete peace of mind and bring home unforgettable wilderness memories.',
    colorClass: 'bg-secondary-950 text-white'
  }
];
