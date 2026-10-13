import React from 'react';
import {
  ShieldCheck, Map, HeartHandshake, Award
} from 'lucide-react';
import { defaultFeatures } from '../../lib/featuresStorage';
import FaqSection from '@/app/component/ui/faqSection';
import FinalCta from '@/app/component/ui/finalCta';

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
            Our Journey & Story
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Bringing you closer to the magical wonders of Mount Ijen and East Java's eastern frontier with safety, comfort, and authenticity.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* STORY & VISION SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 space-y-6">
            <h2 className="text-3xl font-black text-secondary-950">
              More Than Just <span className="text-primary-600">Tour Guides</span>
            </h2>
            <p className="text-secondary-700 leading-relaxed">
              Based in <span translate="no" className="notranslate">Banyuwangi</span>, Ijen Tour was founded out of a deep passion for our local volcanic landscapes and a desire to share them with travelers worldwide. We are not just a travel agency; we are local residents who know every trail, sunrise vantage, and historic story behind Mount Ijen.
            </p>
            <p className="text-secondary-700 leading-relaxed">
              Our vision is to deliver authentic and sustainable eco-tourism experiences. We are dedicated to empowering local communities—including sulfur miners and licensed regional guides—while protecting Mount Ijen's fragile volcanic environment for generations to come.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="border-l-4 border-primary-500 pl-4">
                <p className="text-3xl font-black text-secondary-950">5+</p>
                <p className="text-sm text-secondary-600 font-medium">Years Experience</p>
              </div>
              <div className="border-l-4 border-secondary-500 pl-4">
                <p className="text-3xl font-black text-secondary-950">2K+</p>
                <p className="text-sm text-secondary-600 font-medium">Happy Travelers</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3] border border-secondary-100 bg-secondary-100">
              <img
                src="/images/ijen-expedition-tour.webp"
                alt="Mount Ijen trekking"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary-950/40 to-transparent"></div>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US SECTION */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-secondary-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-secondary-950 mb-4">Why Choose Us?</h2>
            <p className="text-secondary-700 max-w-2xl mx-auto">
              We ensure every detail of your expedition is seamlessly planned, prioritizing safety without compromising the thrill of exploration.
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

        {/* FAQ ACCORDION SECTION */}
        <FaqSection />
      </main>

      <FinalCta />
    </div>
  );
}