"use client";

import React, { useState } from "react";
import { Compass, CalendarCheck2, ShieldCheck, Sparkles, ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Pilih Petualangan Anda",
    subtitle: "Choose Your Tour",
    description: "Pilih paket wisata favorit mulai dari Midnight Blue Fire, Sunrise Kawah Ijen, hingga paket overland Baluran & Djawatan.",
    icon: Compass,
    badge: "Fleksibel",
  },
  {
    step: "02",
    title: "Pemesanan Cepat & Mudah",
    subtitle: "Fast Reservation",
    description: "Reservasi via website dalam 2 menit atau konsultasi langsung melalui WhatsApp kami untuk jadwal dan custom private trip.",
    icon: CalendarCheck2,
    badge: "Konfirmasi Cepat",
  },
  {
    step: "03",
    title: "Penjemputan & Briefing",
    subtitle: "Pickup & Preparation",
    description: "Kami jemput langsung di hotel, stasiun, atau bandara Banyuwangi. Disediakan masker gas respirator bersertifikat dan senter kepala.",
    icon: ShieldCheck,
    badge: "Standar Keamanan",
  },
  {
    step: "04",
    title: "Saksikan Magisnya Api Biru",
    subtitle: "Unforgettable Experience",
    description: "Mendaki bersama pemandu lokal berlisensi dan saksikan fenomena langka Blue Fire serta panorama danau kawah terasam di dunia.",
    icon: Sparkles,
    badge: "Momen Magis",
  },
];

export default function HowItWorks() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return (
    <section className="relative overflow-hidden bg-secondary-50 px-4 py-20 sm:px-8 sm:py-24 lg:py-28">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-100/40 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-14 max-w-2xl text-center md:text-left mx-auto md:mx-0">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-secondary-950">
            Bagaimana Cara Memulai Petualangan?
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-secondary-700">
            Hanya 4 langkah praktis dari pemesanan hingga berdiri di tepi kawah belerang terindah di dunia.
          </p>
        </div>

        {/* MOBILE VIEW: Row Memanjang with Title Only & Dropdown Description */}
        <div className="md:hidden space-y-3">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-secondary-200/80 bg-white shadow-2xs transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 cursor-pointer focus:outline-none"
                >
                  <div className="flex items-center justify-center gap-3.5 min-w-0 flex-1 text-center">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-xs font-black text-primary-700">
                      {item.step}
                    </span>
                    <span className="font-bold text-sm text-secondary-950 truncate">
                      {item.title}
                    </span>
                  </div>
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-100 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-primary-500 text-secondary-950" : "text-secondary-600"
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-secondary-100 px-5 pt-3 pb-5 text-xs text-secondary-600 leading-relaxed space-y-2.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-700">
                        {item.badge}
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary-500">
                        {item.subtitle}
                      </span>
                    </div>
                    <p className="text-secondary-700 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                      {item.description}
                    </p>
                    <div className="pt-1 flex items-center justify-center text-xs font-bold text-primary-600">
                      <Icon className="mr-1.5 h-3.5 w-3.5" />
                      <span>Langkah {item.step}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* DESKTOP VIEW: Grid of Cards */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -6 }}
                className="group relative flex flex-col justify-between rounded-3xl border border-secondary-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/10 sm:p-7"
              >
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-3xl font-black text-primary-500/60 transition-colors group-hover:text-primary-500">
                      {item.step}
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-secondary-200 bg-secondary-50 text-primary-600 shadow-xs transition-all group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-secondary-950">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  <span className="mb-2 inline-block rounded-full bg-primary-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-700">
                    {item.badge}
                  </span>

                  <h3 className="text-base sm:text-lg font-black text-secondary-950 transition-colors group-hover:text-primary-600">
                    {item.title}
                  </h3>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-secondary-500">
                    {item.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm leading-relaxed text-secondary-600">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center border-t border-secondary-200/60 pt-4 text-xs font-bold text-primary-600 transition-transform group-hover:translate-x-1">
                  <span>Langkah {item.step}</span>
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-14 text-center md:text-left">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-7 py-3.5 text-sm font-bold text-secondary-950 shadow-lg shadow-primary-500/20 transition hover:-translate-y-0.5 hover:bg-primary-400"
          >
            <span>Pilih Paket Petualangan Sekarang</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
