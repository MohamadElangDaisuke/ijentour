"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Flame, ShieldCheck, Clock, Users, Compass } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { getWhatsAppLink, WhatsAppTemplates } from "@/lib/whatsapp";

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-secondary-950 py-20 px-4 sm:px-8 sm:py-24 lg:py-28 text-white">
      {/* Background Volcanic Glow & Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(251,161,2,0.22),rgba(255,255,255,0))]" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-secondary-600/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-400">
          Pengalaman Sekali Seumur Hidup
        </p>

        <h2 className="mt-4 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight max-w-4xl mx-auto leading-tight text-white">
          Siap Menyaksikan Keajaiban <span className="text-primary-400">Blue Fire</span> Kawah Ijen?
        </h2>

        <p className="mt-4 text-sm sm:text-base leading-relaxed text-secondary-300 max-w-2xl mx-auto">
          Jangan lewatkan momen magis berdiri di atas kawah vulkanik terindah bersama pemandu lokal berpengalaman. Kuota pendakian harian terbatas sesuai regulasi BBKSDA Jawa Timur.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-8 py-4 text-sm font-bold text-secondary-950 shadow-xl shadow-primary-500/25 transition hover:-translate-y-0.5 hover:bg-primary-400"
          >
            <span>Pesan Petualangan Anda</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <a
            href={getWhatsAppLink(WhatsAppTemplates.generalInquiry("Kawah Ijen Banyuwangi"))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur-sm transition hover:border-[#25D366] hover:bg-white/20 hover:text-[#25D366]"
          >
            <FaWhatsapp className="h-5 w-5 text-[#25D366]" />
            <span>Tanya via WhatsApp</span>
          </a>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary-400">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Local Guides</p>
              <p className="text-[11px] text-secondary-400">Warga lokal Banyuwangi</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Standar Keselamatan</p>
              <p className="text-[11px] text-secondary-400">Masker respirator gas</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Reschedule Mudah</p>
              <p className="text-[11px] text-secondary-400">Fleksibilitas cuaca</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary-400">
              <Users className="h-5 w-5" />
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

