'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { defaultDestinations, Destination } from '../../lib/destinationsStorage';

export default function DestinationInspiration() {
  const [destinations, setDestinations] = useState<Destination[]>(defaultDestinations);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Sync data dari Database API jika tersedia
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

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [destinations]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative w-full overflow-hidden bg-white py-14 sm:py-18 lg:py-20 text-secondary-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Heading Section */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary-950 tracking-tight">
              Get inspired for your next trip
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-secondary-600">
              Jelajahi keindahan alam dan tempat magis terbaik di Banyuwangi & sekitarnya.
            </p>
          </div>
          <Link
            href="/destinations"
            className="hidden sm:inline-flex items-center text-xs sm:text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors shrink-0"
          >
            Lihat semua destinasi →
          </Link>
        </div>

        {/* Carousel Slider */}
        <div className="relative group">
          {/* Tombol Navigasi Kiri */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll ke kiri"
            className={`absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-secondary-950 shadow-xl transition-all duration-200 cursor-pointer ${
              canScrollLeft
                ? 'opacity-100 hover:bg-primary-500 hover:scale-105 active:scale-95'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
          </button>

          {/* Tombol Navigasi Kanan */}
          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll ke kanan"
            className={`absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-secondary-950 shadow-xl transition-all duration-200 cursor-pointer ${
              canScrollRight
                ? 'opacity-100 hover:bg-primary-500 hover:scale-105 active:scale-95'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronRight className="h-5 w-5 stroke-[2.5]" />
          </button>

          {/* Daftar Kartu Destinasi Horisontal */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 pt-1 hide-scrollbar scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {destinations.map((dest) => {
              const slug = (dest as any).slug || dest.id.replace('dest-', '');
              return (
                <Link
                  key={dest.id}
                  href={`/destinations/${slug}`}
                  className="group/card relative h-48 sm:h-56 w-[260px] sm:w-[310px] shrink-0 snap-start overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 select-none block"
                >
                  {/* Foto Destinasi */}
                  <img
                    src={dest.image || '/images/pkg-bluefire.png'}
                    alt={dest.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/pkg-bluefire.png';
                    }}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
                  />

                  {/* Overlay Gradasi Hitam Bawah */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* Badge Label Kategori di Kiri Atas */}
                  <div className="absolute left-3.5 top-3.5 z-10">
                    <span className="inline-block rounded-md bg-white/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-secondary-950 shadow-xs">
                      {dest.tag || 'Destinasi'}
                    </span>
                  </div>

                  {/* Nama Destinasi di Kiri Bawah */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight drop-shadow-md group-hover/card:text-primary-300 transition-colors">
                      {dest.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Link Lihat Semua untuk Tampilan Mobile */}
        <div className="mt-4 text-center sm:hidden">
          <Link
            href="/destinations"
            className="inline-flex items-center text-xs font-bold text-primary-600 hover:text-primary-700"
          >
            Lihat semua destinasi →
          </Link>
        </div>

      </div>
    </section>
  );
}
