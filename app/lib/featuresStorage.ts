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
    description: 'Dipandu langsung oleh warga lokal berpengalaman yang mengenal setiap lekuk jalur Kawah Ijen, waktu terbaik blue fire, dan spot foto tersembunyi.',
    color: 'text-secondary-600'
  },
  {
    id: 'feat-personalized-service',
    iconName: 'HeartHandshake',
    title: 'Personalized Service',
    subtitle: 'Tailored To Your Needs',
    description: 'Solusi tour yang fleksibel mulai dari open trip hemat hingga paket private eksklusif sesuai dengan kebutuhan dan preferensi perjalanan Anda.',
    color: 'text-primary-500'
  },
  {
    id: 'feat-proven-success',
    iconName: 'ShieldCheck',
    title: 'Proven Success',
    subtitle: 'Your Success Is Our Priority',
    description: 'Perjalanan terjamin aman dengan panduan keselamatan standar BKSDA, respirator gas berstandar medis, dan tim berpengalaman tanggap medan.',
    color: 'text-secondary-600'
  },
  {
    id: 'feat-industry-recognition',
    iconName: 'Award',
    title: 'Industry Recognition',
    subtitle: 'Trusted By Many',
    description: 'Layanan tour terpercaya dengan ribuan testimoni puas serta jaminan transparansi harga penuh tanpa ada biaya tak terduga.',
    color: 'text-primary-500'
  }
];
