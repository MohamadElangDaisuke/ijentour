'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, easeIn } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { TourPackage, defaultPackages, packagesStorageKey } from '../../lib/packagesStorage';

export default function PackagesSections() {
  const [packagesData, setPackagesData] = useState<TourPackage[]>(defaultPackages);
  const [activeIndex, setActiveIndex] = useState(0);

  // Sinkronisasi data paket dari Database API / LocalStorage
  useEffect(() => {
    let isMounted = true;
    const loadPackages = async () => {
      try {
        const res = await fetch('/api/trips');
        if (res.ok) {
          const data = await res.json();
          if (data.packages && Array.isArray(data.packages) && data.packages.length > 0) {
            if (isMounted) setPackagesData(data.packages);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch /api/trips, falling back to local storage:', err);
      }

      // Fallback to local storage if API is unreachable
      const savedPackages = window.localStorage.getItem(packagesStorageKey);
      if (savedPackages && isMounted) {
        try {
          const parsed = JSON.parse(savedPackages);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPackagesData(parsed);
          }
        } catch (e) {
          console.error('Error parsing stored packages:', e);
        }
      }
    };

    loadPackages();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalPackages = packagesData.length || 1;

  // Safe Index Calculator
  const getPackageByOffset = (offset: number): TourPackage => {
    const rawIndex = activeIndex + offset;
    const safeIndex = ((rawIndex % totalPackages) + totalPackages) % totalPackages;
    return packagesData[safeIndex] || defaultPackages[0];
  };

  const activePackage = getPackageByOffset(0);

  const handleNext = () => setActiveIndex((prev) => prev + 1);
  const handlePrev = () => setActiveIndex((prev) => prev - 1);

  // Motion Variants untuk animasi staggered
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: easeIn }
    }
  };

  return (
    <motion.section
      id="packages"
      aria-labelledby="packages-heading"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease: easeIn }}
      className="relative w-full overflow-hidden bg-secondary-50 text-secondary-950 flex items-center justify-center px-4 sm:px-8 py-20 sm:py-24 lg:py-28 select-none"
    >
      {/* 1. DYNAMIC FULL BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex">
        {/* Sisi Kiri (Desktop Only): Solid bg-secondary-50, Sisi Kanan: Full foto */}
        <div className="hidden lg:block lg:w-1/2 h-full bg-secondary-50" />

        <div className="relative w-full lg:w-1/2 h-full overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={activePackage?.id || activeIndex}
              src={activePackage?.image || '/images/pkg-bluefire.png'}
              alt=""
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.24, scale: 1.02 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.8, ease: easeIn }}
              className="absolute inset-0 h-full w-full object-cover object-center saturate-110"
            />
          </AnimatePresence>
          <div className="packages-gradient hidden lg:block absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-secondary-50 via-secondary-50/45 to-transparent" />
        </div>
      </div>

      {/* 2. PACKAGES MAIN CONTENT WRAPPER */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative z-10 mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
      >
        {/* LEFT COLUMN: Headline, Deskripsi, & Tombol See More */}
        <div className="col-span-1 lg:col-span-5 flex flex-col justify-center items-center lg:items-start space-y-5 sm:space-y-6 text-center lg:text-left">
          <div className="space-y-4">
            <motion.p variants={itemVariants} className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600">
              Paket pilihan traveler
            </motion.p>
            <motion.h2
              id="packages-heading"
              className="text-2xl sm:text-4xl lg:text-5xl font-black text-secondary-950 leading-tight tracking-tight"
              variants={itemVariants}
            >
              Paket wisata Kawah Ijen dan Banyuwangi
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base font-normal leading-relaxed text-secondary-700 max-w-lg lg:max-w-none"
            >
              Pilih paket perjalanan yang dirancang untuk menikmati Ijen, blue fire, dan lanskap Jawa Timur dengan lebih dekat.
            </motion.p>
          </div>

          {/* Tombol See More (Lihat Selengkapnya) */}
          <Link
            href="/packages"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3.5 text-secondary-950 text-sm font-bold transition-all hover:bg-primary-400 hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
          >
            <span>Lihat Selengkapnya</span>
            <ArrowRightIcon className="hidden sm:inline-block w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>

        {/* RIGHT COLUMN: Interactive 3D Package Carousel */}
        <motion.div 
          variants={itemVariants}
          className="col-span-1 lg:col-span-7 flex flex-col items-center justify-center relative min-h-80 sm:min-h-95 lg:items-center lg:pr-14"
        >
          {/* Cards Stage Container */}
          <div className="relative h-96 w-56 sm:h-112 sm:w-72 flex items-center justify-center">
            
            {/* Prev Nav Button */}
            <motion.button
              type="button"
              onClick={handlePrev}
              aria-label="Paket sebelumnya"
              title="Paket sebelumnya"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ ease: easeIn, duration: 0.2 }}
              className="absolute -left-12 sm:-left-16 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-secondary-300 bg-white/90 text-secondary-950 shadow-lg transition-colors hover:border-primary-500 hover:bg-primary-500 cursor-pointer"
            >
              <ChevronLeftIcon className="w-5 h-5 stroke-[2.5]" />
            </motion.button>

            {/* Next Nav Button */}
            <motion.button
              type="button"
              onClick={handleNext}
              aria-label="Paket berikutnya"
              title="Paket berikutnya"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ ease: easeIn, duration: 0.2 }}
              className="absolute -right-12 sm:-right-16 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-secondary-300 bg-white/90 text-secondary-950 shadow-lg transition-colors hover:border-primary-500 hover:bg-primary-500 cursor-pointer"
            >
              <ChevronRightIcon className="w-5 h-5 stroke-[2.5]" />
            </motion.button>

            {/* Cards Loop */}
            {[-1, 0, 1].map((offset) => {
              const pkg = getPackageByOffset(offset);
              const isCenter = offset === 0;

              return (
                <motion.div
                  key={`${pkg.id}-${activeIndex + offset}`}
                  initial={false}
                  animate={{
                    x: offset * 110,
                    scale: isCenter ? 1 : 0.75,
                    rotateY: offset * 15,
                    opacity: isCenter ? 1 : 0.45,
                    zIndex: isCenter ? 20 : 10
                  }}
                  transition={{ duration: 0.5, ease: easeIn }}
                  whileHover={{ scale: isCenter ? 1.03 : 0.78 }}
                  onClick={() => {
                    if (!isCenter) {
                      setActiveIndex((prev) => prev + offset);
                    }
                  }}
                  className="absolute w-56 sm:w-72 overflow-hidden rounded-4xl border border-secondary-100 bg-white shadow-xl shadow-secondary-900/10 cursor-pointer"
                >
                  <div className="relative aspect-4/3 w-full bg-secondary-100">
                    <img
                      src={pkg.image || '/images/pkg-bluefire.png'}
                      alt={`${pkg.title} - wisata Banyuwangi dan Kawah Ijen`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-secondary-950 backdrop-blur-sm">
                      {pkg.badge || 'Ijen escape'}
                    </div>
                  </div>

                  <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ease: easeIn, duration: 0.3 }}
                      className="p-4 text-secondary-950 sm:p-5"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-primary-500">
                        {[0, 1, 2, 3, 4].map((star) => (
                          <StarIcon
                            key={star}
                            className={`h-3 w-3 ${star < Math.round(pkg.rating || 4.9) ? 'fill-primary-500' : 'fill-transparent'}`}
                          />
                        ))}
                        <span className="ml-1 font-bold text-secondary-700">
                          {(pkg.rating || 4.9).toFixed(1)}
                        </span>
                        </div>
                        <span className="text-secondary-500">{pkg.duration}</span>
                      </div>

                      <h3 className="mb-3 line-clamp-2 text-sm font-extrabold leading-snug sm:text-base">
                        {pkg.title}
                      </h3>
                      <div className="flex items-end justify-between gap-3 border-t border-secondary-100 pt-3">
                        <div>
                          <p className="text-[10px] text-secondary-500">Mulai dari</p>
                          <p className="mt-0.5 text-sm font-black text-primary-600">{pkg.price}</p>
                        </div>
                        <Link
                          href={`/packages/${pkg.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline px-2 py-1 rounded-md bg-primary-50 hover:bg-primary-100 transition"
                        >
                          Lihat detail →
                        </Link>
                      </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-1.5 mt-4 sm:mt-6"
          >
            {packagesData.map((_, i) => {
              const currentActive = ((activeIndex % totalPackages) + totalPackages) % totalPackages;
              return (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentActive === i ? 'w-6 bg-amber-400' : 'w-2 bg-secondary-400 hover:bg-secondary-300'
                  }`}
                />
              );
            })}
          </motion.div>

        </motion.div>

      </motion.div>
    </motion.section>
  );
}