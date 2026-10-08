'use client';

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { defaultExperienceSteps } from "../../lib/experienceStorage";

export default function ExperienceSections() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="relative isolate overflow-hidden bg-white px-4 sm:px-8 py-20 sm:py-24 lg:py-28 text-secondary-950"
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-full md:w-1/2">
        <Image
          src="/images/HeroSection.webp"
          alt="Pemandangan Kawah Ijen dari jalur pendakian Banyuwangi"
          fill
          sizes="(max-width: 768px) 100vw, 66vw"
          className="object-cover object-center opacity-20 mask-[linear-gradient(to_left,black_35%,transparent_100%)]"
        />
        <div className="experience-gradient absolute inset-0 bg-linear-to-l from-transparent via-secondary-50/35 to-secondary-50" />
      </div>
      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
        <div className="text-center lg:text-left mx-auto lg:mx-0">
          <h2 id="experience-heading" className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-secondary-950">
            Cara menikmati wisata Kawah Ijen
          </h2>
          <p className="mt-5 max-w-md mx-auto lg:mx-0 text-sm sm:text-base leading-relaxed text-secondary-700">
            Semua kebutuhan perjalanan kami siapkan agar kamu bisa fokus menikmati lanskap dan cerita di sepanjang perjalanan.
          </p>
        </div>

        {/* MOBILE VIEW: Row Memanjang with Title Only & Dropdown Description - Centered Container, Left-Aligned Content */}
        <div className="sm:hidden space-y-3 max-w-lg mx-auto">
          {defaultExperienceSteps.map((stepItem, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={stepItem.step}
                className="overflow-hidden rounded-2xl border border-secondary-200/80 bg-secondary-50/70 shadow-2xs transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 cursor-pointer focus:outline-none"
                >
                  <div className="flex items-center justify-start gap-3 min-w-0 flex-1 text-left">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black shadow-xs ${stepItem.colorClass}`}>
                      {stepItem.step}
                    </span>
                    <span className="font-bold text-sm text-secondary-950 truncate text-left">
                      {stepItem.title}
                    </span>
                  </div>
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-200/70 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-primary-500 text-secondary-950" : "text-secondary-700"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-secondary-200/60 px-4 pt-2.5 pb-4 text-xs sm:text-sm text-secondary-700 leading-relaxed text-left">
                    {stepItem.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* DESKTOP / TABLET VIEW */}
        <div className="hidden sm:grid sm:gap-5">
          {defaultExperienceSteps.map((stepItem, index) => (
            <article
              key={stepItem.step}
              className={`flex flex-col items-start gap-4 text-left sm:flex-row sm:items-start ${
                index !== defaultExperienceSteps.length - 1 ? 'border-b border-secondary-200/60 pb-5' : ''
              }`}
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black shadow-xs ${stepItem.colorClass}`}>
                {stepItem.step}
              </span>
              <div>
                <h3 className="text-base font-bold text-secondary-950">{stepItem.title}</h3>
                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-secondary-700">{stepItem.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}