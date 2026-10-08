'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { defaultFeatures } from '../../lib/featuresStorage';

export default function ChooseUs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const leftFeatures = defaultFeatures.slice(0, 2);
  const rightFeatures = defaultFeatures.slice(2);

  return (
    <section id="choose-us" className="relative overflow-hidden bg-white px-4 pt-10 sm:px-8 sm:pt-14 lg:px-12 lg:pt-16 pb-12 sm:pb-16 lg:pb-20 dark:bg-secondary-950">
      {/* SVG Clip Path definition for central cylindrical arch image */}
      <svg className="absolute h-0 w-0 pointer-events-none" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="choose-us-cylinder-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0,0.05 C 0.22,0.12 0.35,0.12 0.5,0.12 C 0.65,0.12 0.78,0.12 1,0.05 L 1,0.80 C 1,0.93 0.75,1.0 0.5,1.0 C 0.25,1.0 0,0.93 0,0.80 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="mx-auto w-full max-w-7xl">
        {/* Top Header */}
        <header className="mb-4 sm:mb-6 flex flex-col items-center sm:items-end gap-3 sm:flex-row sm:justify-between text-center sm:text-left">
          <div className="w-full sm:w-auto">
            <h2 className="text-3xl font-black leading-[1.05] tracking-tight text-secondary-950 sm:text-4xl lg:text-5xl dark:text-white">
              Why<br className="hidden sm:inline" /> Choose Us
            </h2>
          </div>
          <p className="max-w-md mx-auto sm:mx-0 text-xs leading-relaxed text-secondary-600 sm:text-sm dark:text-secondary-300">
            Partner lokal resmi dan berpengalaman untuk menjelajahi keindahan Kawah Ijen dan destinasi Jawa Timur dengan jaminan kenyamanan, aman, dan berkesan bersama tim profesional.
          </p>
        </header>

        {/* Overhead Dashed Arch Curve */}
        <div className="relative mx-auto -mb-2 sm:-mb-4 lg:-mb-6 w-full max-w-5xl pointer-events-none select-none px-4 sm:px-8">
          <svg
            viewBox="0 0 1000 80"
            fill="none"
            preserveAspectRatio="none"
            className="h-8 sm:h-12 lg:h-16 w-full overflow-visible"
          >
            <path
              d="M 30 75 Q 500 8 970 75"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              className="text-secondary-400/80 dark:text-secondary-600"
            />
          </svg>
        </div>

        {/* MOBILE VIEW: Arched Image + Row Memanjang with Title & Dropdown Description */}
        <div className="lg:hidden space-y-4 pt-1">
          {/* Centered Compact Arched Image for Mobile */}
          <div className="relative mx-auto w-full max-w-[210px] sm:max-w-[250px] filter drop-shadow-[0_12px_20px_rgba(31,56,63,0.12)] dark:drop-shadow-[0_12px_20px_rgba(0,0,0,0.5)]">
            <div
              className="relative h-[220px] sm:h-[270px] w-full overflow-hidden bg-secondary-100 dark:bg-secondary-900"
              style={{
                clipPath: 'url(#choose-us-cylinder-clip)',
                WebkitClipPath: 'url(#choose-us-cylinder-clip)',
              }}
            >
              <Image
                src="/images/the-best-view-of-kawah.webp"
                alt="Pemandangan danau kawah berwarna turquoise di Kawah Ijen"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 35vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* Elongated Rows with Title & Dropdown Description */}
          <div className="space-y-2.5">
            {defaultFeatures.map((feature, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={feature.id}
                  className="overflow-hidden rounded-xl border border-secondary-200/80 bg-secondary-50/70 dark:bg-secondary-900/60 dark:border-secondary-800 shadow-2xs transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-center justify-center gap-2.5 min-w-0 flex-1 text-center">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950/60 text-[11px] font-black text-primary-700 dark:text-primary-400">
                        {`0${index + 1}`}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-secondary-950 dark:text-white truncate">
                        {feature.title}
                      </span>
                    </div>
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-200/70 dark:bg-secondary-800 transition-transform duration-200 ${
                        isOpen ? "rotate-180 bg-primary-500 text-secondary-950" : "text-secondary-600 dark:text-secondary-300"
                      }`}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-secondary-200/60 dark:border-secondary-800 px-4 pt-2.5 pb-3.5 text-xs text-secondary-600 dark:text-secondary-300 leading-relaxed space-y-1 text-center">
                      {feature.subtitle && (
                        <p className="text-[10px] font-semibold text-secondary-800 dark:text-secondary-200 uppercase tracking-wider">
                          {feature.subtitle}
                        </p>
                      )}
                      <p className="text-secondary-600 dark:text-secondary-300 text-xs leading-relaxed max-w-md mx-auto">
                        {feature.description}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* DESKTOP VIEW: 3-Column Content (Left Features | Center Arched Image | Right Features) */}
        <div className="hidden lg:grid items-center gap-8 lg:grid-cols-[1fr_1.15fr_1fr] xl:gap-10">
          {/* Left Column (Features 1 & 2) */}
          <div className="flex flex-col justify-between gap-8 lg:h-[360px] lg:py-2">
            {leftFeatures.map((feature) => (
              <article key={feature.id} className="space-y-1 transition-transform duration-300 hover:translate-x-1">
                <h3 className="text-lg font-bold tracking-tight text-secondary-950 sm:text-xl dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-xs font-semibold text-secondary-800 dark:text-secondary-200">
                  {feature.subtitle}
                </p>
                <p className="pt-0.5 text-xs leading-relaxed text-secondary-600 max-w-sm dark:text-secondary-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>

          {/* Center Column: Cylindrical Arch Image */}
          <div className="relative mx-auto w-full max-w-[290px] lg:max-w-[320px] filter drop-shadow-[0_16px_24px_rgba(31,56,63,0.12)] dark:drop-shadow-[0_16px_24px_rgba(0,0,0,0.5)]">
            <div
              className="relative h-[340px] lg:h-[390px] w-full overflow-hidden bg-secondary-100 dark:bg-secondary-900"
              style={{
                clipPath: 'url(#choose-us-cylinder-clip)',
                WebkitClipPath: 'url(#choose-us-cylinder-clip)',
              }}
            >
              <Image
                src="/images/the-best-view-of-kawah.webp"
                alt="Pemandangan danau kawah berwarna turquoise di Kawah Ijen"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 35vw"
                className="object-cover object-center transition-transform duration-700 ease-out hover:scale-105"
              />
            </div>
          </div>

          {/* Right Column (Features 3 & 4) */}
          <div className="flex flex-col justify-between gap-8 lg:h-[360px] lg:py-2">
            {rightFeatures.map((feature) => (
              <article key={feature.id} className="space-y-1 transition-transform duration-300 hover:translate-x-1">
                <h3 className="text-lg font-bold tracking-tight text-secondary-950 sm:text-xl dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-xs font-semibold text-secondary-800 dark:text-secondary-200">
                  {feature.subtitle}
                </p>
                <p className="pt-0.5 text-xs leading-relaxed text-secondary-600 max-w-sm dark:text-secondary-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* Bottom Bracket Frame & Circular Explore Button */}
        <div className="relative mt-8 sm:mt-10 lg:mt-12 w-full">
          <div className="h-16 sm:h-20 flex items-center justify-center w-full">
            {/* Left Bracket Arm (vertical tick up on left + horizontal line to center equator) */}
            <div className="flex-1 h-8 sm:h-10 self-start border-l border-b border-secondary-300 rounded-bl-xl sm:rounded-bl-2xl mr-3 sm:mr-5 dark:border-secondary-700" />

            {/* Center Circular Explore Button (centered with the horizontal line) */}
            <div className="shrink-0">
              <Link
                href="/packages"
                className="group relative flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-dashed border-secondary-400 bg-white transition-all duration-300 shadow-xs hover:shadow-md hover:border-secondary-950 hover:scale-105 dark:bg-secondary-900 dark:border-secondary-600 dark:hover:border-white"
                aria-label="Jelajahi paket wisata Kawah Ijen"
              >
                <span className="text-xs sm:text-sm font-semibold tracking-wide text-secondary-900 group-hover:text-primary-600 transition-colors dark:text-white dark:group-hover:text-primary-400">
                  Explore
                </span>
                <svg
                  className="mt-0.5 w-5 h-2.5 text-secondary-800 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-300 dark:text-secondary-200 dark:group-hover:text-primary-400"
                  viewBox="0 0 24 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="2" y1="6" x2="22" y2="6" />
                  <polyline points="16 1 22 6 16 11" />
                </svg>
              </Link>
            </div>

            {/* Right Bracket Arm (horizontal line from center equator + vertical tick up on right) */}
            <div className="flex-1 h-8 sm:h-10 self-start border-r border-b border-secondary-300 rounded-br-xl sm:rounded-br-2xl ml-3 sm:ml-5 dark:border-secondary-700" />
          </div>
        </div>
      </div>
    </section>
  );
}
