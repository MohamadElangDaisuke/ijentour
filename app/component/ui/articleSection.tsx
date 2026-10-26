'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { defaultArticles, articlesStorageKey, type Article } from '../../lib/articlesStorage';

interface ArticleSectionProps {
  variant?: 'guides' | 'latest';
}

export default function ArticleSection({ variant = 'latest' }: ArticleSectionProps) {
  const [articles, setArticles] = useState<Article[]>(defaultArticles);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    fetch('/api/articles')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.articles && data.articles.length > 0) {
          setArticles(data.articles);
        }
      })
      .catch(() => {});

    const saved = window.localStorage.getItem(articlesStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setArticles((prev) => {
            const existingSlugs = new Set(prev.map((a: any) => a.slug || a.id));
            const newFromSaved = parsed.filter((p: any) => !existingSlugs.has(p.slug || p.id));
            return [...prev, ...newFromSaved];
          });
        }
      } catch (e) {
        console.error('Error loading articles from localStorage:', e);
      }
    }
  }, []);

  const isGuidesSection = variant === 'guides';
  const displayArticles = isGuidesSection
    ? articles.filter((article) => ['Guides', 'Tips & Tricks', 'Ijen Insights'].includes(article.category)).slice(0, 3)
    : articles.slice(0, 3);
  const sectionId = isGuidesSection ? 'featured-guides' : 'latest-articles';
  const heading = isGuidesSection ? 'Featured Travel Guides' : 'Latest Articles & Travel Stories';
  const subheading = isGuidesSection
    ? 'Everything You Need to Know Before You Go'
    : 'Fresh Insights for Your Next Journey';

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
  }, [displayArticles]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id={sectionId}
      aria-labelledby={`${sectionId}-heading`}
      className="relative w-full overflow-hidden bg-white px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 text-secondary-950"
    >
      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Heading Section: left-aligned on mobile matching destination section */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary-600">
              Travel journal
            </p>
            <h2
              id={`${sectionId}-heading`}
              className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight text-secondary-950"
            >
              {heading}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-secondary-600">
              {subheading}
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-secondary-300 bg-secondary-50 px-5 py-2.5 text-xs sm:text-sm font-bold text-secondary-800 transition hover:border-primary-500 hover:bg-primary-500 hover:text-secondary-950 shrink-0"
          >
            View all articles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Carousel / Responsive Container: 1 Single Row, Seamless Album Space */}
        <div className="relative group">
          {/* Previous Scroll Button (visible on mobile / scroll) */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className={`absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-30 md:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white text-secondary-950 shadow-xl border border-secondary-100 transition-all duration-200 cursor-pointer ${
              canScrollLeft
                ? 'opacity-100 hover:bg-primary-500 hover:scale-105 active:scale-95'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
          </button>

          {/* Next Scroll Button (visible on mobile / scroll) */}
          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className={`absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-30 md:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white text-secondary-950 shadow-xl border border-secondary-100 transition-all duration-200 cursor-pointer ${
              canScrollRight
                ? 'opacity-100 hover:bg-primary-500 hover:scale-105 active:scale-95'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronRight className="h-5 w-5 stroke-[2.5]" />
          </button>

          {/* Albums in 1 Single Row (card carousel on mobile, seamless album on desktop) */}
          <div
            ref={scrollRef}
            className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-hidden md:rounded-3xl border-0 md:border md:border-secondary-300/80 bg-transparent md:bg-secondary-950 shadow-none md:shadow-lg hide-scrollbar scroll-smooth snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden gap-3 sm:gap-4 md:gap-0 py-1 md:py-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayArticles.map((article, index) => {
              const targetSlug = article.slug || article.id;
              return (
                <motion.article
                  key={article.id || article.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="group relative isolate flex min-h-[340px] sm:min-h-[400px] md:min-h-[440px] w-[285px] sm:w-[330px] md:w-auto shrink-0 md:shrink snap-start flex-col justify-end overflow-hidden rounded-2xl md:rounded-none border border-black/10 md:border-0 md:border-r md:last:border-r-0 md:border-white/20 p-5 sm:p-7 select-none transition duration-500 ease-out shadow-md md:shadow-none"
                >
                  <Link href={`/blog/${targetSlug}`} className="absolute inset-0 z-20" aria-label={article.title} />

                  {/* Full Background Photo */}
                  <img
                    src={article.image}
                    alt={`${article.title} - Banyuwangi travel guide`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/pkg-bluefire.png';
                    }}
                    className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
                  />

                  {/* Gradient Overlay for high readability */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15 transition-colors duration-500 group-hover:from-black/75"
                  />

                  {/* Category Badge on Top-Left */}
                  <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <span className="inline-block rounded-md bg-white/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-secondary-950 shadow-xs">
                      {article.category}
                    </span>
                  </div>

                  {/* Content at Bottom */}
                  <div className="relative z-10 pointer-events-none">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white leading-snug drop-shadow-sm group-hover:text-primary-300 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-white/80 line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-3 text-xs">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-primary-300 group-hover:text-primary-200 transition-colors">
                        Explore article <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="text-[11px] text-white/70 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {article.readTime}
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>

        {/* View All Link for Mobile (matching the reference destination screenshot) */}
        <div className="mt-5 text-center sm:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center text-xs font-bold text-primary-600 hover:text-primary-700"
          >
            View all articles <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
