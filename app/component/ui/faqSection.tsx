"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { getWhatsAppLink, WhatsAppTemplates } from "@/lib/whatsapp";

interface FaqItem {
  q: string;
  a: string;
}

const defaultFaqs: FaqItem[] = [
  {
    q: "Berapa lama durasi pendakian menuju puncak Kawah Ijen?",
    a: "Pendakian dari Pos Paltuding ke puncak Kawah Ijen berjarak sekitar 3 km dengan waktu tempuh rata-rata 1,5 hingga 2 jam berjalan santai. Jalur berupa jalan setapak tanah yang cukup lebar. Jika ingin turun ke dasar kawah untuk melihat Blue Fire dari dekat, dibutuhkan waktu tambahan sekitar 30-45 menit menuruni jalan bebatuan.",
  },
  {
    q: "Apakah disediakan masker gas respirator dan perlengkapan keselamatan?",
    a: "Ya! Semua paket wisata Kawah Ijen kami sudah termasuk peminjaman masker gas respirator standar penambang belerang dan senter kepala (headlamp). Pemandu lokal kami juga membawa cadangan masker dan pertolongan pertama.",
  },
  {
    q: "Kapan waktu terbaik untuk menyaksikan fenomena Blue Fire?",
    a: "Fenomena Blue Fire (Api Biru) hanya dapat disaksikan dalam kondisi gelap gulita antara pukul 02:00 hingga 04:30 WIB dini hari sebelum fajar menyingsing. Oleh karena itu, tur midnight berangkat dari Banyuwangi sekitar pukul 00:00 - 00:30 WIB.",
  },
  {
    q: "Bagaimana jika saya tidak kuat mendaki jalan kaki?",
    a: "Tersedia layanan 'Troli / Gerobak Dorong' tradisional yang dioperasikan oleh warga lokal dan penambang Ijen. Anda dapat menyewa troli baik untuk naik, turun, maupun pulang-pergi dengan tarif lokal standar (bisa kami bantu pesankan saat reservasi).",
  },
  {
    q: "Apakah ada layanan penjemputan dari hotel, stasiun, atau bandara?",
    a: "Tentu! Kami menyediakan layanan antar-jemput gratis di area Kota Banyuwangi, Stasiun Banyuwangi Kota, Stasiun Ketapang, Bandara Blimbingsari, hingga pelabuhan Ketapang bagi peserta yang baru menyeberang dari Bali.",
  },
  {
    q: "Bagaimana prosedur pemesanan dan kebijakan pembatalan / reschedule?",
    a: "Pemesanan dapat dilakukan online lewat website atau langsung chat WhatsApp kami. Anda dapat melakukan reschedule jadwal tanpa biaya tambahan dengan konfirmasi minimal 24 jam sebelum jadwal keberangkatan, menyesuaikan status aktivitas vulkanik kawah.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative overflow-hidden bg-white px-4 py-20 sm:px-8 sm:py-24 lg:py-28">
      <div className="max-w-4xl mx-auto">
        <div className="mb-14 max-w-2xl text-center sm:text-left mx-auto sm:mx-0">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-secondary-950 tracking-tight leading-tight">
            Hal yang Sering Ditanyakan
          </h2>
          <p className="mt-4 text-sm sm:text-base text-secondary-700 leading-relaxed">
            Semua informasi penting yang perlu Anda ketahui sebelum menaklukkan Kawah Ijen.
          </p>
        </div>

        <div className="space-y-3.5">
          {defaultFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-secondary-50 rounded-2xl border border-secondary-200/80 overflow-hidden shadow-2xs transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="w-full px-6 py-4.5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <span className="font-bold text-sm sm:text-base text-secondary-950 flex-1 text-center sm:text-left">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-secondary-200/70 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-primary-500 text-secondary-950" : "text-secondary-700"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-secondary-600 leading-relaxed border-t border-secondary-200/60 mt-1 text-center sm:text-left">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* WhatsApp Help Banner */}
        <div className="mt-12 p-6 sm:p-7 rounded-3xl bg-secondary-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-secondary-800 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-[#25D366] flex items-center justify-center shrink-0">
              <FaWhatsapp className="w-6 h-6 text-[#25D366]" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-white">Punya pertanyaan lain seputar perjalanan?</h4>
              <p className="text-xs text-secondary-300">Tim pemandu lokal kami siap menjawab via WhatsApp 24/7.</p>
            </div>
          </div>
          <a
            href={getWhatsAppLink(WhatsAppTemplates.generalInquiry("perjalanan Kawah Ijen"))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs transition shadow-md shrink-0 hover:scale-105 active:scale-95 mx-auto sm:mx-0"
          >
            <FaWhatsapp className="w-4 h-4" />
            <span>Chat CS WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
