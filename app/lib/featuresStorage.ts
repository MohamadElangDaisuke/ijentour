export interface FeatureItem {
  id: string;
  iconName: 'Map' | 'Award' | 'HeartHandshake' | 'ShieldCheck';
  title: string;
  subtitle?: string;
  description: string;
  color?: string;
}

export const defaultFeatures: FeatureItem[] = [
  {
    id: 'feat-local-experts',
    iconName: 'Map',
    title: 'Local Experts',
    subtitle: 'Local Knowledge That Matters',
    description: 'Guided directly by experienced local residents who know every bend of the Mount Ijen trails, the optimal blue fire timing, and secret viewpoints.',
    color: 'text-secondary-600'
  },
  {
    id: 'feat-personalized-service',
    iconName: 'HeartHandshake',
    title: 'Personalized Service',
    subtitle: 'Tailored To Your Needs',
    description: 'Flexible tour options ranging from budget-friendly open trips to exclusive private packages tailored to your schedule and preferences.',
    color: 'text-primary-500'
  },
  {
    id: 'feat-proven-success',
    iconName: 'ShieldCheck',
    title: 'Proven Success',
    subtitle: 'Your Success Is Our Priority',
    description: 'Guaranteed safe expeditions with official reserve safety guidelines, certified miner-grade gas respirators, and a responsive mountain team.',
    color: 'text-secondary-600'
  },
  {
    id: 'feat-industry-recognition',
    iconName: 'Award',
    title: 'Industry Recognition',
    subtitle: 'Trusted By Many',
    description: 'Trusted tour services backed by thousands of 5-star reviews and full price transparency with absolutely no hidden fees.',
    color: 'text-primary-500'
  }
];
