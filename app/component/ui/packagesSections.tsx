'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, easeIn } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { TourPackage, defaultPackages, packagesStorageKey } from '../../lib/packagesStorage';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export default function PackagesSections() {
  const [packagesData, setPackagesData] = useState<TourPackage[]>(defaultPackages);
  const [activeIndex, setActiveIndex] = useState(0);

  // Sync package data from Database API / LocalStorage
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
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: easeIn },
    },
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
      {/* 1. DYNAMIC FULL BACKGROUND (Desktop Only - Hidden on Mobile) */}
      <div className="hidden lg:flex absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="w-1/2 h-full bg-secondary-50" />
        <div className="relative w-1/2 h-full overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={activePackage?.id || activeIndex}
              src={activePackage?.image || '/images/pkg-bluefire.png'}
              alt=""
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 0.24, scale: 1.02 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: easeIn }}
              className="absolute inset-0 h-full w-full object-cover object-center saturate-110"
            />
          </AnimatePresence>
          <div className="packages-gradient absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-secondary-50 via-secondary-50/45 to-transparent" />
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
        {/* LEFT COLUMN: Headline and View All Button */}
        <div className="col-span-1 lg:col-span-5 flex flex-col justify-center items-center lg:items-start space-y-5 sm:space-y-6 text-center lg:text-left">
          <div className="space-y-3 sm:space-y-4">
            <h2
              id="packages-heading"
              className="text-2xl sm:text-4xl lg:text-5xl font-black text-secondary-950 leading-tight tracking-tight"
            >
              Mount Ijen & Banyuwangi Tour Packages
            </h2>

            <p className="text-sm sm:text-base font-normal leading-relaxed text-secondary-700 max-w-lg mx-auto lg:mx-0">
              Choose thoughtfully crafted tour packages to experience Mount Ijen, the electric Blue Fire, and the stunning landscapes of East Java up close.
            </p>
          </div>

          {/* Action Row: View All Button (Desktop: tetap di kolom kiri) */}
          <div className="hidden lg:flex flex-wrap items-center justify-start gap-3 w-full">
            <Link
              href="/packages"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-5 sm:px-6 py-3 sm:py-3.5 text-secondary-950 text-xs sm:text-sm font-bold transition-all hover:bg-primary-400 hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>View All Packages</span>
              <ArrowRight className="hidden sm:inline-block w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Packages Carousel (Mobile: Shadcn UI Carousel, Desktop: 3D Cards Stage) */}
        <motion.div
          variants={itemVariants}
          className="col-span-1 lg:col-span-7 flex flex-col items-center justify-center relative min-h-80 sm:min-h-95 lg:items-center lg:pr-4 xl:pr-10 w-full overflow-hidden lg:overflow-visible"
        >
          {/* --- MOBILE VIEW: SHADCN UI CAROUSEL --- */}
          <div className="w-full flex lg:hidden flex-col items-center justify-center px-2 sm:px-4">
            <Carousel
              opts={{
                align: 'center',
                loop: true,
              }}
              className="w-full max-w-[19rem] sm:max-w-xs"
            >
              <CarouselContent>
                {packagesData.map((pkg) => (
                  <CarouselItem key={pkg.id}>
                    <div className="p-1">
                      <div className="overflow-hidden rounded-2xl border border-secondary-200/90 bg-white shadow-md text-secondary-950">
                        <div className="relative aspect-4/3 w-full bg-secondary-100 overflow-hidden">
                          <Image
                            src={pkg.image || '/images/pkg-bluefire.png'}
                            alt={`${pkg.title} - Mount Ijen and Banyuwangi tour`}
                            fill
                            sizes="(max-width: 640px) 100vw, 320px"
                            className="object-cover"
                          />
                          <div className="absolute left-3 top-3 rounded-lg bg-white/95 px-3 py-1 text-[10px] font-bold text-secondary-950 shadow-xs">
                            {pkg.badge || 'Ijen escape'}
                          </div>
                        </div>

                        <div className="p-4 sm:p-5">
                          <div className="mb-3 flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-1.5 text-primary-500">
                              {[0, 1, 2, 3, 4].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star < Math.round(pkg.rating || 4.9)
                                      ? 'fill-primary-500'
                                      : 'fill-transparent'
                                  }`}
                                />
                              ))}
                              <span className="ml-1 font-bold text-secondary-700">
                                {(pkg.rating || 4.9).toFixed(1)}
                              </span>
                            </div>
                            <span className="text-secondary-500">{pkg.duration}</span>
                          </div>

                          <h3 className="mb-3 line-clamp-2 text-sm font-extrabold leading-snug">
                            {pkg.title}
                          </h3>

                          <div className="flex items-end justify-between gap-3 border-t border-secondary-100 pt-3">
                            <div>
                              <p className="text-[10px] text-secondary-500">Starts from</p>
                              <p className="mt-0.5 text-sm font-black text-primary-600">
                                {pkg.price}
                              </p>
                            </div>
                            <Link
                              href={`/packages/${pkg.id}`}
                              className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline px-2.5 py-1 rounded-md bg-primary-50 hover:bg-primary-100 transition inline-flex items-center"
                            >
                              View details{' '}
                              <ArrowRight className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-2 sm:-left-4" />
              <CarouselNext className="-right-2 sm:-right-4" />
            </Carousel>

            {/* Mobile View All Button (Ditempatkan di bawah carousel agar alur visual natural) */}
            <div className="mt-7 sm:mt-8 flex items-center justify-center w-full">
              <Link
                href="/packages"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-3.5 text-secondary-950 text-sm font-bold transition-all hover:bg-primary-400 hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>View All Packages</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>

          {/* --- DESKTOP VIEW: INTERACTIVE 3D CARDS STAGE --- */}
          <div className="hidden lg:flex relative h-112 w-72 items-center justify-center mx-auto">
            {/* Desktop Prev Nav Button */}
            <motion.button
              type="button"
              onClick={handlePrev}
              aria-label="Previous package"
              title="Previous package"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ ease: easeIn, duration: 0.2 }}
              className="absolute -left-12 xl:-left-16 top-1/2 -translate-y-1/2 z-40 items-center justify-center w-10 h-10 rounded-full bg-white text-secondary-950 shadow-md hover:shadow-xl transition-all hover:bg-primary-500 cursor-pointer flex"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </motion.button>

            {/* Desktop Next Nav Button */}
            <motion.button
              type="button"
              onClick={handleNext}
              aria-label="Next package"
              title="Next package"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ ease: easeIn, duration: 0.2 }}
              className="absolute -right-12 xl:-right-16 top-1/2 -translate-y-1/2 z-40 items-center justify-center w-10 h-10 rounded-full bg-white text-secondary-950 shadow-md hover:shadow-xl transition-all hover:bg-primary-500 cursor-pointer flex"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </motion.button>

            {/* Desktop Cards Loop */}
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
                    zIndex: isCenter ? 20 : 10,
                  }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: isCenter ? 1.03 : 0.78 }}
                  onClick={() => {
                    if (!isCenter) {
                      setActiveIndex((prev) => prev + offset);
                    }
                  }}
                  className="absolute w-72 overflow-hidden rounded-2xl border border-secondary-100 bg-white shadow-xl shadow-secondary-900/10 cursor-pointer transform-gpu will-change-transform"
                >
                  <div className="relative aspect-4/3 w-full bg-secondary-100 overflow-hidden">
                    <Image
                      src={pkg.image || '/images/pkg-bluefire.png'}
                      alt={`${pkg.title} - Mount Ijen and Banyuwangi tour`}
                      fill
                      sizes="288px"
                      className="object-cover"
                    />
                    <div className="absolute left-3 top-3 rounded-lg bg-white/95 px-3 py-1 text-[10px] font-bold text-secondary-950 shadow-xs">
                      {pkg.badge || 'Ijen escape'}
                    </div>
                  </div>

                  <div className="p-4 text-secondary-950 sm:p-5">
                    <div className="mb-3 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-primary-500">
                        {[0, 1, 2, 3, 4].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star < Math.round(pkg.rating || 4.9)
                                ? 'fill-primary-500'
                                : 'fill-transparent'
                            }`}
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
                        <p className="text-[10px] text-secondary-500">Starts from</p>
                        <p className="mt-0.5 text-sm font-black text-primary-600">{pkg.price}</p>
                      </div>
                      <Link
                        href={`/packages/${pkg.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline px-2 py-1 rounded-md bg-primary-50 hover:bg-primary-100 transition"
                      >
                        View details{' '}
                        <ArrowRight className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Desktop Dots Indicator */}
          <motion.div
            variants={itemVariants}
            className="hidden lg:flex items-center gap-1.5 mt-4 sm:mt-6"
          >
            {packagesData.map((_, i) => {
              const currentActive =
                ((activeIndex % totalPackages) + totalPackages) % totalPackages;
              return (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentActive === i
                      ? 'w-6 bg-amber-400'
                      : 'w-2 bg-secondary-400 hover:bg-secondary-300'
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
