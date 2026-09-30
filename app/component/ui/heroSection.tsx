'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Compass, Play } from 'lucide-react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { defaultHeroStats, defaultDestinations } from '../../lib/destinationsStorage';
import { getWhatsAppLink, WhatsAppTemplates } from '@/lib/whatsapp';

export default function HeroSection() {
  const [activeDestination, setActiveDestination] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const imageY = useTransform(scrollYProgress, [0, 1], [0, -55]);
  const destination = defaultDestinations[activeDestination] || defaultDestinations[0];

  const changeDestination = (direction: number) => {
    setActiveDestination((current) => (current + direction + defaultDestinations.length) % defaultDestinations.length);
  };

  useEffect(() => {
    const autoplay = window.setInterval(() => {
      setActiveDestination((current) => (current + 1) % defaultDestinations.length);
    }, 5000);
    return () => window.clearInterval(autoplay);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="group relative isolate overflow-hidden bg-secondary-50 px-5 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-32 lg:min-h-screen lg:px-12 lg:pb-12 lg:pt-32"
    >
      <div className="pointer-events-none absolute right-0 top-0 -z-10 hidden h-136 w-1/2 rounded-bl-[8rem] bg-primary-50 lg:block" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
        <motion.div
          style={{ y: contentY }}
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-xl text-center sm:text-left"
        >
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600">The Ijen Expedition Experience</p>
          <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-secondary-950 sm:text-5xl lg:text-6xl">
            Jelajahi Kawah Ijen dan <span translate="no" className="notranslate">Banyuwangi</span>.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-secondary-700 sm:text-base">
            Temukan sisi paling liar dari Jawa Timur bersama pemandu lokal yang tahu kapan harus berhenti, berjalan, dan menikmati keajaiban alam Blue Fire.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <Link href="/packages" className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3.5 text-sm font-bold text-secondary-950 transition hover:-translate-y-0.5 hover:bg-primary-400 hover:shadow-lg hover:shadow-primary-500/20">
              Jelajahi Paket Tur <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={getWhatsAppLink(WhatsAppTemplates.generalInquiry("Paket Wisata Kawah Ijen"))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-secondary-300 bg-white/70 px-5 py-3.5 text-sm font-bold text-secondary-800 transition hover:border-[#25D366] hover:bg-white hover:text-[#25D366]"
            >
              <FaWhatsapp className="h-4 w-4 text-[#25D366]" /> Chat WhatsApp
            </a>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-[11px] font-semibold text-secondary-600">
            <span className="px-3 py-1 rounded-full bg-white border border-secondary-200 shadow-2xs">✓ Local Guide Berlisensi</span>
            <span className="px-3 py-1 rounded-full bg-white border border-secondary-200 shadow-2xs">✓ Free Masker Gas & Senter</span>
            <span className="px-3 py-1 rounded-full bg-white border border-secondary-200 shadow-2xs">✓ 24/7 WhatsApp Support</span>
          </div>

          <div className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-secondary-200 pt-5 sm:mx-0">
            {defaultHeroStats.map((stat) => (
              <div key={stat.value}>
                <p className="text-xl font-black text-secondary-950 sm:text-2xl">{stat.value}</p>
                <p className="mt-1 max-w-24 text-[10px] leading-relaxed text-secondary-600 sm:text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

        </motion.div>

        <motion.div
          style={{ y: imageY }}
          initial={{ opacity: 0, scale: 0.96, x: 24 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          whileHover={{ scale: 1.015 }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-80 sm:min-h-136 lg:min-h-156"
        >
          <div className="absolute inset-0 rounded-[2.5rem] bg-secondary-100 sm:rounded-[3.5rem]" />
          <div className="absolute -bottom-4 -left-4 -z-10 h-32 w-32 rounded-4xl bg-primary-200 sm:-bottom-6 sm:-left-6" />
          <div className="absolute -right-3 top-8 z-20 flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 py-3 text-xs font-bold text-secondary-950 shadow-xl shadow-secondary-950/10 backdrop-blur sm:-right-5 sm:top-14">
            <Compass className="h-4 w-4 text-primary-600" /> Local guide, real stories
          </div>
          <div className="absolute inset-3 overflow-hidden rounded-[2.2rem] sm:inset-5 sm:rounded-[3rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={destination.name}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) > 70 || Math.abs(info.velocity.x) > 400) {
                    changeDestination(info.offset.x < 0 ? 1 : -1);
                  }
                }}
                initial={{ opacity: 0, x: 70 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -70 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
              >
                <Image
                  src={destination.image}
                  alt={`${destination.name}, destinasi wisata Banyuwangi`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="pointer-events-none object-cover object-center"
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="absolute bottom-8 right-8 z-20 flex gap-2 sm:bottom-12 sm:right-12">
            <button type="button" onClick={() => changeDestination(-1)} aria-label="Destinasi sebelumnya" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-secondary-950/70 text-white backdrop-blur transition hover:bg-primary-500 hover:text-secondary-950">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => changeDestination(1)} aria-label="Destinasi berikutnya" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-secondary-950/70 text-white backdrop-blur transition hover:bg-primary-500 hover:text-secondary-950">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="absolute bottom-8 left-8 z-20 max-w-52 rounded-2xl bg-secondary-950/90 p-4 text-white shadow-2xl sm:bottom-12 sm:left-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-300"><span translate="no" className="notranslate">Banyuwangi</span>{' '}destination</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-300">{destination.name}</p>
            <p className="mt-1 text-sm font-bold leading-snug">{destination.description}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
