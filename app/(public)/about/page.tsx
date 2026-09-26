import React from 'react';
import {
  ShieldCheck, Map, HeartHandshake, Award
} from 'lucide-react';
import { defaultFeatures } from '../../lib/featuresStorage';

const iconMap = {
  Map: <Map size={32} className="text-secondary-600" />,
  Award: <Award size={32} className="text-primary-600" />,
  HeartHandshake: <HeartHandshake size={32} className="text-secondary-600" />,
  ShieldCheck: <ShieldCheck size={32} className="text-primary-600" />
};

export default function AboutPage() {
  return (
    <div className="text-secondary-950 bg-secondary-50 min-h-screen">

      {/* HERO SECTION */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center text-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/HeroSection.webp')" }}
        >
          <div className="absolute inset-0 bg-secondary-950/70"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Cerita Perjalanan Kami
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Membawa Anda lebih dekat dengan keajaiban alam Kawah Ijen dan pesona ujung timur Pulau Jawa dengan aman, nyaman, dan berkesan.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* STORY & VISION SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 space-y-6">
            <h2 className="text-3xl font-black text-secondary-950">
              Lebih Dari Sekadar <span className="text-primary-600">Pemandu Wisata</span>
            </h2>
            <p className="text-secondary-700 leading-relaxed">
              Berbasis di <span translate="no" className="notranslate">Banyuwangi</span>, Ijen Expedition lahir dari kecintaan kami terhadap keindahan alam lokal dan keinginan untuk membagikannya kepada dunia. Kami bukan sekadar agen perjalanan; kami adalah warga lokal yang mengenal setiap sudut, rute, dan cerita di balik megahnya Gunung Ijen.
            </p>
            <p className="text-secondary-700 leading-relaxed">
              Visi kami adalah memberikan pengalaman wisata alam yang otentik dan berkelanjutan. Kami berkomitmen untuk memberdayakan komunitas lokal, termasuk para penambang belerang dan pemandu wisata daerah, sekaligus menjaga kelestarian lingkungan Kawah Ijen untuk generasi mendatang.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="border-l-4 border-primary-500 pl-4">
                <p className="text-3xl font-black text-secondary-950">5+</p>
                <p className="text-sm text-secondary-600 font-medium">Tahun Pengalaman</p>
              </div>
              <div className="border-l-4 border-secondary-500 pl-4">
                <p className="text-3xl font-black text-secondary-950">2K+</p>
                <p className="text-sm text-secondary-600 font-medium">Turis Bahagia</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3] border border-secondary-100 bg-secondary-100">
              <img
                src="/images/ijen-expedition-tour.webp"
                alt="Trekking Ijen"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary-950/40 to-transparent"></div>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US SECTION */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-secondary-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-secondary-950 mb-4">Kenapa Memilih Kami?</h2>
            <p className="text-secondary-700 max-w-2xl mx-auto">
              Kami memastikan setiap detik petualangan Anda terencana dengan sempurna, mengutamakan keselamatan tanpa mengurangi keseruan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {defaultFeatures.map((feature) => (
              <div key={feature.id || feature.title} className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 rounded-2xl bg-secondary-50 flex items-center justify-center mb-4 border border-secondary-200/60 shadow-xs">
                  {iconMap[feature.iconName] || <ShieldCheck size={32} className="text-primary-600" />}
                </div>
                <h3 className="font-bold text-secondary-950 mb-2">{feature.title}</h3>
                <p className="text-sm text-secondary-700 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}