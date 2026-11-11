'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Compass } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { defaultHeroStats, defaultDestinations } from '../../lib/destinationsStorage';
import { useBookingModal } from '@/lib/bookingModalStore';

export default function HeroSection() {
  const { openBookingModal } = useBookingModal();
  const [destinations, setDestinations] = useState<any[]>(defaultDestinations);
  const [activeDestination, setActiveDestination] = useState(0);

  useEffect(() => {
    fetch('/api/destinations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.destinations && data.destinations.length > 0) {
          setDestinations(data.destinations);
        }
      })
      .catch(() => {});
  }, []);

  const destList = destinations.length > 0 ? destinations : defaultDestinations;
  const destination = destList[activeDestination % destList.length] || defaultDestinations[0];

  const changeDestination = (direction: number) => {
    setActiveDestination((current) => (current + direction + destList.length) % destList.length);
  };

  useEffect(() => {
    if (destList.length <= 1) return;
    const autoplay = window.setInterval(() => {
      setActiveDestination((current) => (current + 1) % destList.length);
    }, 5000);
    return () => window.clearInterval(autoplay);
  }, [destList.length]);

  return (
    <section
      id="hero"
      className="group relative isolate overflow-hidden bg-secondary-50 px-4 pb-14 pt-24 sm:px-8 sm:pb-20 sm:pt-28 lg:min-h-[calc(100vh-4rem)] lg:flex lg:items-center lg:px-12 lg:py-16"
    >
      <div className="pointer-events-none absolute right-0 top-0 -z-10 hidden h-136 w-1/2 rounded-bl-[8rem] bg-primary-50 lg:block" />

      <div className="mx-auto grid max-w-7xl w-full items-center gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
        <motion.div
          initial={{ opacity: 0, x: -32, y: 15 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-xl text-center sm:text-left mx-auto sm:mx-0"
        >
          <h1 className="text-3xl font-black leading-tight tracking-tight text-secondary-950 sm:text-5xl lg:text-5xl">
            Explore Mount Ijen and <span translate="no" className="notranslate">Banyuwangi</span>.
          </h1>
          <p className="mt-4 max-w-md mx-auto sm:mx-0 text-sm leading-relaxed text-secondary-700 sm:text-base">
            Discover the wild wonders of East Java alongside licensed local guides who know when to pause, trek, and immerse you in the magical Blue Fire phenomenon.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <Link href="/packages" className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3.5 text-sm font-bold text-secondary-950 transition hover:-translate-y-0.5 hover:bg-primary-400 hover:shadow-lg hover:shadow-primary-500/20">
              Explore Tour Packages <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => openBookingModal()}
              className="inline-flex items-center gap-2 rounded-full border border-secondary-300 bg-white/70 px-5 py-3.5 text-sm font-bold text-secondary-800 transition hover:border-[#25D366] hover:bg-white hover:text-[#25D366] cursor-pointer"
            >
              <FaWhatsapp className="h-4 w-4 text-[#25D366]" /> Chat on WhatsApp
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-[11px] font-semibold text-secondary-600">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant'))}
              className="px-3 py-1 rounded-full bg-primary-100/80 border border-primary-300 text-secondary-900 shadow-2xs hover:bg-primary-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-secondary-950">AI Travel Assistant (Live)</span>
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-secondary-200 shadow-2xs"><Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> Licensed Local Guides</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-secondary-200 shadow-2xs"><Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> Free Gas Masks & Headlamps</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-secondary-200 shadow-2xs"><Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> 24/7 WhatsApp Support</span>
          </div>

          <div className="mx-auto mt-7 grid max-w-lg grid-cols-3 gap-4 border-t border-secondary-200 pt-4 text-center sm:text-left sm:mx-0">
            {defaultHeroStats.map((stat) => (
              <div key={stat.value}>
                <p className="text-xl font-black text-secondary-950 sm:text-2xl">{stat.value}</p>
                <p className="mt-1 max-w-24 mx-auto sm:mx-0 text-[10px] leading-relaxed text-secondary-600 sm:text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, x: 24, y: 25 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          whileHover={{ scale: 1.015 }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-80 sm:h-112 lg:h-[min(72svh,38rem)]"
        >
          <div className="absolute inset-0 rounded-[2.5rem] bg-secondary-100 sm:rounded-[3.5rem]" />
          <div className="absolute -bottom-4 -left-4 -z-10 h-32 w-32 rounded-4xl bg-primary-200 sm:-bottom-6 sm:-left-6" />
          <div className="absolute -right-1 sm:-right-5 top-8 z-20 flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-xs font-bold text-secondary-950 shadow-xl shadow-secondary-950/10 backdrop-blur sm:top-14">
            <Compass className="h-4 w-4 text-primary-600 shrink-0" /> Local guide, real stories
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
                  alt={`${destination.name}, Banyuwangi travel destination`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="pointer-events-none object-cover object-center"
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="absolute bottom-4 right-4 z-20 flex gap-2 sm:bottom-12 sm:right-12">
            <button type="button" onClick={() => changeDestination(-1)} aria-label="Previous destination" className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/50 bg-secondary-950/70 text-white backdrop-blur transition hover:bg-primary-500 hover:text-secondary-950 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => changeDestination(1)} aria-label="Next destination" className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/50 bg-secondary-950/70 text-white backdrop-blur transition hover:bg-primary-500 hover:text-secondary-950 cursor-pointer">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="absolute bottom-4 left-4 z-20 max-w-[calc(100%-5.5rem)] sm:max-w-52 rounded-2xl bg-secondary-950/90 p-3 sm:p-4 text-white shadow-2xl sm:bottom-12 sm:left-12">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-primary-300"><span translate="no" className="notranslate">Banyuwangi</span>{' '}destination</p>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-primary-300 truncate">{destination.name}</p>
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-bold leading-snug line-clamp-2">{destination.description}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
