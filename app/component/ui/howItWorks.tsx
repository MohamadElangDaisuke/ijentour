"use client";

import React from "react";
import { Compass, CalendarCheck2, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

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
  return (
    <section className="py-20 sm:py-24 bg-white dark:bg-secondary-900 border-t border-secondary-100 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-100/40 dark:bg-primary-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-secondary-800 border border-primary-200 text-xs font-bold text-primary-700 dark:text-primary-300 uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Alur Perjalanan
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-secondary-950 dark:text-white tracking-tight leading-tight">
            Bagaimana Cara Memulai Petualangan?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-secondary-600 dark:text-secondary-300 leading-relaxed">
            Hanya 4 langkah praktis dari pemesanan hingga berdiri di tepi kawah belerang terindah di dunia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group relative bg-secondary-50/70 dark:bg-secondary-950/60 rounded-3xl p-6 sm:p-7 border border-secondary-200/80 dark:border-secondary-800 hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-3xl font-black text-primary-500/60 group-hover:text-primary-500 transition-colors">
                      {item.step}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 flex items-center justify-center text-primary-600 shadow-sm group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-secondary-950 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300 bg-primary-100/70 dark:bg-secondary-800 px-2.5 py-0.5 rounded-full mb-2">
                    {item.badge}
                  </span>

                  <h3 className="text-lg font-black text-secondary-950 dark:text-white group-hover:text-primary-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-secondary-400 dark:text-secondary-400 uppercase tracking-wider mb-2">
                    {item.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-secondary-200/60 dark:border-secondary-800/80 flex items-center text-xs font-bold text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform">
                  <span>Langkah {item.step}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-sm shadow-lg shadow-primary-500/20 transition hover:scale-105 active:scale-95"
          >
            <span>Pilih Paket Petualangan Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
