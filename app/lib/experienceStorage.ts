export interface ExperienceStep {
  step: string;
  title: string;
  description: string;
  colorClass: string;
}

export const defaultExperienceSteps: ExperienceStep[] = [
  {
    step: '01',
    title: 'Choose Your Adventure',
    description: 'Pick your preferred tour package, from Midnight Blue Fire and Mount Ijen Sunrise to overland trips covering Baluran & De Djawatan.',
    colorClass: 'bg-primary-100 text-primary-700'
  },
  {
    step: '02',
    title: 'Quick & Easy Booking',
    description: 'Book online via our website in under 2 minutes or chat directly with our team on WhatsApp for custom private itineraries.',
    colorClass: 'bg-teal-100 text-teal-800'
  },
  {
    step: '03',
    title: 'Pickup & Briefing',
    description: 'Enjoy hassle-free pickup from your hotel, train station, or Banyuwangi Airport. Certified respirator gas masks and headlamps are provided.',
    colorClass: 'bg-sky-100 text-sky-800'
  },
  {
    step: '04',
    title: 'Witness the Magical Blue Fire',
    description: 'Hike with licensed local guides to witness the rare natural Blue Fire phenomenon and the world\'s most acidic turquoise crater lake.',
    colorClass: 'bg-secondary-950 text-white'
  }
];
