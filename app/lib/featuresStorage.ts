export interface FeatureItem {
  id: string;
  iconName: 'Map' | 'Award' | 'HeartHandshake' | 'ShieldCheck';
  title: string;
  description: string;
  color?: string;
}

export const defaultFeatures: FeatureItem[] = [
  {
    id: 'feat-pemandu-ahli',
    iconName: 'Map',
    title: 'Pemandu Lokal Ahli',
    description: 'Dipandu langsung oleh warga lokal berpengalaman yang mengenal setiap medan Ijen dan Banyuwangi.',
    color: 'text-secondary-600'
  },
  {
    id: 'feat-harga-transparan',
    iconName: 'Award',
    title: 'Harga Transparan',
    description: 'Tidak ada biaya tersembunyi. Nikmati pilihan paket yang jelas dan sesuai kebutuhan perjalanan.',
    color: 'text-primary-500'
  },
  {
    id: 'feat-layanan-ramah',
    iconName: 'HeartHandshake',
    title: 'Layanan Ramah',
    description: 'Tim responsif yang siap membantu kebutuhan Anda dari persiapan hingga perjalanan selesai.',
    color: 'text-secondary-600'
  },
  {
    id: 'feat-keselamatan-terjamin',
    iconName: 'ShieldCheck',
    title: 'Keselamatan Terjamin',
    description: 'Perjalanan dikelola dengan panduan keselamatan standar BKSDA dan perhatian penuh pada kenyamanan Anda.',
    color: 'text-primary-500'
  }
];
