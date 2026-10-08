'use client';

import { easeInOut, motion } from 'framer-motion';
import { Award, HeartHandshake, Map, ShieldCheck } from 'lucide-react';
import { defaultFeatures } from '../../lib/featuresStorage';

const iconMap = {
  Map,
  Award,
  HeartHandshake,
  ShieldCheck
};

export default function ChooseUs() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, ease: easeInOut } }
      }}
      className="overflow-hidden bg-white px-4 py-20 sm:px-8 lg:py-28"
    >
      <div className="mx-auto w-full max-w-7xl">
        <motion.div
          variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeInOut } } }}
          className="relative z-10 flex flex-col justify-center text-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600">
            Layanan wisata <span translate="no" className="notranslate">Banyuwangi</span>
          </p>
          <h2 className="mt-4 text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-secondary-950">
            Partner terbaik untuk wisata Kawah Ijen
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-secondary-700">
            Partner lokal untuk menjelajahi keindahan Ijen dan destinasi Jawa Timur dengan nyaman, aman, dan berkesan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {defaultFeatures.map((feature, index) => {
            const Icon = iconMap[feature.iconName] || Map;

            return (
              <motion.article
                key={feature.id || feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: 0.08 * index, ease: easeInOut }}
                whileHover={{ y: -6 }}
                className="flex flex-col items-center gap-4 text-center p-6 rounded-3xl bg-secondary-50 border border-secondary-200/80 shadow-xs hover:shadow-md hover:border-primary-500/50 transition-all"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
                  <Icon className="h-6 w-6" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-secondary-950 sm:text-base">{feature.title}</h3>
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-secondary-600">{feature.description}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}