"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Flame, ShieldCheck, Clock, Users, Compass } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { getWhatsAppLink, WhatsAppTemplates } from "@/lib/whatsapp";

export default function FinalCta() {
  return (
    <section className="relative py-24 sm:py-28 overflow-hidden bg-secondary-950 text-white">
      {/* Background Volcanic Glow & Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(251,161,2,0.22),rgba(255,255,255,0))]" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-secondary-600/15 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/20 border border-primary-500/40 text-xs font-black text-primary-300 uppercase tracking-widest mb-6">
          <Flame className="w-4 h-4 text-primary-400" /> Pengalaman Sekali Seumur Hidup
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
          Siap Menyaksikan Keajaiban <span className="text-primary-400">Blue Fire</span> Kawah Ijen?
        </h2>

        <p className="mt-6 text-sm sm:text-base lg:text-lg text-secondary-200 max-w-2xl mx-auto leading-relaxed">
          Jangan lewatkan momen magis berdiri di atas kawah vulkanik terindah bersama pemandu lokal berpengalaman. Kuota pendakian harian terbatas sesuai regulasi BBKSDA Jawa Timur.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-sm transition-all duration-300 shadow-xl shadow-primary-500/25 hover:scale-105 active:scale-95"
          >
            <span>Pesan Petualangan Anda</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href={getWhatsAppLink(WhatsAppTemplates.generalInquiry("Kawah Ijen Banyuwangi"))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 hover:border-[#25D366] text-white font-bold text-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <FaWhatsapp className="w-5 h-5 text-[#25D366]" />
            <span>Tanya via WhatsApp</span>
          </a>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Local Guides</p>
              <p className="text-[11px] text-secondary-400">Warga lokal Banyuwangi</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Standar Keselamatan</p>
              <p className="text-[11px] text-secondary-400">Masker respirator gas</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Reschedule Mudah</p>
              <p className="text-[11px] text-secondary-400">Fleksibilitas cuaca</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Ribuan Wisatawan</p>
              <p className="text-[11px] text-secondary-400">Ulasan bintang 5</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
