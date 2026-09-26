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
      viewport={{ once: false, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, ease: easeInOut } }
      }}
      className="overflow-hidden bg-secondary-50"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
        <motion.div
          variants={{ hidden: { opacity: 0, x: 28 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: easeInOut } } }}
          className="relative z-10 flex flex-col justify-center text-center"
        >
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-600 sm:text-xs">
            Layanan wisata <span translate="no" className="notranslate">Banyuwangi</span>
          </p>
          <h2 className="text-xl font-black leading-tight text-secondary-950 sm:text-3xl lg:text-4xl">
            Partner terbaik untuk wisata Kawah Ijen
          </h2>
          <p className="mx-auto mt-2.5 max-w-xl text-xs leading-relaxed text-secondary-700 sm:text-sm">
            Partner lokal untuk menjelajahi keindahan Ijen dan destinasi Jawa Timur dengan nyaman, aman, dan berkesan.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 sm:gap-8">
            {defaultFeatures.map((feature, index) => {
              const Icon = iconMap[feature.iconName] || Map;

              return (
                <motion.article
                  key={feature.id || feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.4, delay: 0.08 * index, ease: easeInOut }}
                  whileHover={{ x: 4 }}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
                    <Icon className="h-6 w-6" strokeWidth={2.2} />
                  </div>
                  <div className="max-w-52">
                    <h3 className="text-xs font-extrabold text-secondary-950 sm:text-sm">{feature.title}</h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-secondary-700 sm:text-xs">{feature.description}</p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}