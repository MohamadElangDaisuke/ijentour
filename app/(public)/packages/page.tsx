'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Star, Check, XCircle, ChevronLeft, ChevronRight, Clock, Sparkles, ArrowRight, ExternalLink
} from 'lucide-react';
import { TourPackage, defaultPackages, packagesStorageKey } from '../../lib/packagesStorage';

function PackagesContent() {
  const searchParams = useSearchParams();
  const packageIdFromUrl = searchParams.get('id');

  const [packagesData, setPackagesData] = useState<TourPackage[]>(defaultPackages);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');

  // Synchronize data from API and localStorage
  useEffect(() => {
    fetch('/api/trips')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.packages && data.packages.length > 0) {
          setPackagesData(data.packages);
        }
      })
      .catch(() => {});

    const saved = window.localStorage.getItem(packagesStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPackagesData((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newFromSaved = parsed.filter((p: any) => !existingIds.has(p.id));
            return [...prev, ...newFromSaved];
          });
        }
      } catch (e) {
        console.error("Gagal memuat paket dari localStorage:", e);
      }
    }
  }, []);

  // Determine active package
  useEffect(() => {
    if (packageIdFromUrl && packagesData.some(p => p.id === packageIdFromUrl)) {
      setSelectedPackageId(packageIdFromUrl);
    } else if (packagesData.length > 0 && !selectedPackageId) {
      setSelectedPackageId(packagesData[0].id);
    }
  }, [packageIdFromUrl, packagesData, selectedPackageId]);

  const activePackage = packagesData.find(p => p.id === selectedPackageId) || packagesData[0] || defaultPackages[0];

  const filteredPackages = packagesData.filter(pkg => {
    if (selectedCategory === 'all') return true;
    return pkg.category === selectedCategory;
  });

  const galleryImages = [
    activePackage.image || '/images/pkg-bluefire.png',
    '/images/pkg-crater.png',
    '/images/pkg-waterfall.png',
    '/images/the-best-view-of-kawah.webp'
  ];

  const whatsappMessage = encodeURIComponent(
    `Halo Ijen Tour, saya ingin memesan paket "${activePackage.title}" (${activePackage.price}). Mohon informasi ketersediaan tanggal.`
  );

  return (
    <div className="text-secondary-950 bg-secondary-50 min-h-screen">

      {/* HERO SECTION */}
      <section className="relative h-[60vh] min-h-[500px] flex items-end pb-16">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url('${activePackage.image || '/images/pkg-bluefire.png'}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-secondary-950/95 via-secondary-950/60 to-secondary-950/20"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="bg-primary-500 text-secondary-950 text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider">
              {activePackage.badge || 'Paket Populer'}
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-md capitalize">
              {activePackage.category === 'midnight' ? 'Midnight Trip' : activePackage.category === 'private' ? 'Private Tour' : 'Regular Tour'}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 max-w-3xl leading-tight">
            {activePackage.title}
          </h1>

          <div className="flex flex-wrap items-center text-white/90 gap-4 text-sm font-medium mb-5">
            <div className="flex items-center text-primary-400">
              <Star size={18} className="fill-current mr-1.5" />
              <span className="font-bold text-white">
                {(activePackage.rating || 4.9).toFixed(1)}{' '}
                <span className="text-white/70 font-normal">({activePackage.savedCount || '2.5K+'} tersimpan)</span>
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center text-white/90">
              <Clock size={16} className="mr-1.5 text-primary-400" />
              <span>Durasi: {activePackage.duration}</span>
            </div>
            <span>•</span>
            <div className="flex items-center text-primary-400 font-extrabold text-base">
              {activePackage.price}
            </div>
          </div>

          <Link
            href={`/packages/${activePackage.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-secondary-950 text-xs font-black transition-all shadow-md transform hover:-translate-y-0.5"
          >
            <span>Buka Halaman Detail Lengkap</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* PACKAGE SELECTOR & FILTER SECTION */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-secondary-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-secondary-100">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 mb-1">Pilihan Paket Wisata</p>
              <h2 className="text-2xl font-black text-secondary-950">Pilih Paket yang Anda Inginkan</h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'Semua Paket' },
                { id: 'midnight', label: 'Midnight Trip' },
                { id: 'private', label: 'Private Tour' },
                { id: 'regular', label: 'Regular Tour' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === tab.id
                      ? 'bg-secondary-950 text-white shadow-sm'
                      : 'bg-secondary-50 text-secondary-700 hover:bg-secondary-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Package Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPackages.map((pkg) => {
              const isSelected = pkg.id === activePackage.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={`group relative rounded-2xl border p-4 transition-all cursor-pointer overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50/20 ring-2 ring-primary-500/20 shadow-md'
                      : 'border-secondary-100 bg-white hover:border-secondary-300 hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="relative aspect-16/10 rounded-xl overflow-hidden mb-3 bg-secondary-100">
                      <img
                        src={pkg.image || '/images/pkg-bluefire.png'}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/pkg-bluefire.png'; }}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-secondary-950 text-[10px] font-bold px-2.5 py-1 rounded-md">
                        {pkg.badge || pkg.duration}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-secondary-950 text-base leading-snug mb-2 group-hover:text-primary-600 transition">
                      {pkg.title}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-secondary-100 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-secondary-500">Mulai dari</p>
                      <p className="text-sm font-black text-primary-600">{pkg.price}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/packages/${pkg.id}`}
                        onClick={(e) => e.stopPropagation()}
                        title="Buka halaman detail paket"
                        className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-secondary-200 text-secondary-700 hover:bg-secondary-100 hover:text-secondary-950 transition flex items-center gap-1"
                      >
                        <span>Detail</span>
                        <ExternalLink size={12} />
                      </Link>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                        isSelected
                          ? 'bg-primary-500 text-secondary-950'
                          : 'bg-secondary-100 text-secondary-800 group-hover:bg-secondary-950 group-hover:text-white'
                      }`}>
                        {isSelected ? 'Terpilih ✓' : 'Pilih'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ACTIVE PACKAGE DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">

          {/* LEFT COLUMN - DETAILS */}
          <div className="lg:col-span-2 space-y-12">

            {/* Galeri Foto */}
            <section>
              <h3 className="font-bold text-secondary-950 mb-4 uppercase tracking-wide text-xs">Galeri Foto Momen</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {galleryImages.map((imgUrl, i) => (
                  <div key={i} className="aspect-video rounded-2xl overflow-hidden bg-secondary-100 border border-secondary-200/50">
                    <img
                      src={imgUrl}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/pkg-bluefire.png'; }}
                      alt={`Galeri ${activePackage.title} ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Highlights Paket */}
            {activePackage.highlights && activePackage.highlights.length > 0 && (
              <section className="bg-white rounded-3xl p-6 md:p-8 border border-secondary-100 shadow-sm">
                <div className="flex items-center gap-2 text-primary-600 font-bold text-xs uppercase tracking-wider mb-2">
                  <Sparkles size={16} /> Keunggulan Utama
                </div>
                <h3 className="text-2xl font-black text-secondary-950 mb-6">Highlight Perjalanan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activePackage.highlights.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-secondary-50 border border-secondary-100">
                      <Check size={18} className="text-primary-600 shrink-0 mt-0.5" />
                      <span className="text-sm font-semibold text-secondary-800">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Itinerary */}
            {activePackage.itinerary && activePackage.itinerary.length > 0 && (
              <section className="bg-white rounded-3xl p-6 md:p-8 border border-secondary-100 shadow-sm">
                <h2 className="text-2xl font-black text-secondary-950 mb-6">Rencana Perjalanan (Itinerary)</h2>
                <div className="space-y-6 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-secondary-200">
                  {activePackage.itinerary.map((item, idx) => (
                    <div key={idx} className="relative pl-10">
                      <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-primary-500 ring-4 ring-white" />
                      <div className="inline-block px-3 py-1 rounded-md bg-secondary-100 text-secondary-950 text-xs font-extrabold mb-1">
                        {item.day}
                      </div>
                      <h4 className="font-extrabold text-secondary-950 text-base">{item.title}</h4>
                      <p className="text-secondary-700 text-sm mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Termasuk & Tidak Termasuk */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-secondary-100">
                <h3 className="font-black text-secondary-950 mb-4 text-lg">Termasuk (Included)</h3>
                <ul className="space-y-3">
                  {["Transportasi AC PP", "Tiket Masuk & Konservasi", "Pemandu Lokal Berlisensi", "Masker Gas Medis Respirator", "Air Minum & P3K"].map((item, i) => (
                    <li key={i} className="flex items-start text-sm text-secondary-700">
                      <Check size={18} className="text-secondary-600 mr-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-secondary-100">
                <h3 className="font-black text-secondary-950 mb-4 text-lg">Tidak Termasuk (Excluded)</h3>
                <ul className="space-y-3">
                  {["Pengeluaran Pribadi", "Tip Pemandu (Sukarela)", "Makan & Camilan Pribadi", "Taksi Troly Kawah (Jika Dibutuhkan)"].map((item, i) => (
                    <li key={i} className="flex items-start text-sm text-secondary-700">
                      <XCircle size={18} className="text-primary-600 mr-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN - BOOKING CARD */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl border border-secondary-100 p-6 sticky top-24">
              <div className="mb-6 pb-5 border-b border-secondary-100">
                <span className="text-secondary-500 text-xs font-bold uppercase tracking-wider block mb-1">Total Biaya Paket</span>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-primary-600">{activePackage.price}</span>
                  <span className="text-secondary-600 text-sm pb-1 font-medium">/ Org</span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-extrabold text-secondary-950 mb-3 text-sm">Pilih Tanggal Keberangkatan</h4>

                {/* Kalender Mock */}
                <div className="bg-secondary-50 p-4 rounded-2xl border border-secondary-200">
                  <div className="flex justify-between items-center mb-4 text-sm font-bold text-secondary-800">
                    <span>Juni 2026</span>
                    <div className="flex gap-2 text-secondary-400">
                      <ChevronLeft size={16} className="cursor-pointer hover:text-secondary-700 transition" />
                      <ChevronRight size={16} className="cursor-pointer hover:text-secondary-700 transition" />
                    </div>
                  </div>
                  <div className="grid grid-cols-7 text-center text-xs text-secondary-500 gap-y-2 mb-2 font-medium">
                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                    <div className="text-secondary-300">1</div><div className="text-secondary-300">2</div>
                    <div className="text-secondary-300">3</div><div className="text-secondary-300">4</div>
                    <div className="text-secondary-300">5</div><div className="text-secondary-300">6</div>
                    <div className="text-secondary-300">7</div>
                    <div className="text-secondary-800">8</div><div className="text-secondary-800">9</div><div className="text-secondary-800">10</div><div className="text-secondary-800">11</div><div className="text-secondary-800">12</div><div className="text-secondary-800">13</div>
                    <div className="bg-primary-500 text-secondary-950 font-bold rounded-md py-1">14</div>
                    <div className="text-secondary-800">15</div><div className="text-secondary-800">16</div><div className="text-secondary-800">17</div><div className="text-secondary-800">18</div><div className="text-secondary-800">19</div><div className="text-secondary-800">20</div><div className="text-secondary-800">21</div>
                  </div>
                </div>
              </div>

              <div className="bg-secondary-100 border border-secondary-200 text-secondary-900 text-xs px-3.5 py-2.5 rounded-xl flex items-center mb-6 font-medium">
                <Check size={16} className="mr-2 text-secondary-700 shrink-0" />
                Paket & kuota pemandu tersedia untuk tanggal pilihan!
              </div>

              <a
                href={`https://wa.me/6281234567890?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-primary-500 hover:bg-primary-600 text-secondary-950 font-black py-4 rounded-2xl shadow-xs hover:shadow transition duration-200 flex items-center justify-center space-x-2 text-center"
              >
                <span>PESAN SEKARANG VIA WHATSAPP</span>
                <ArrowRight size={18} />
              </a>

              <Link
                href={`/packages/${activePackage.id}`}
                className="w-full mt-3 border border-secondary-300 hover:border-primary-500 hover:bg-primary-50 text-secondary-900 font-bold py-3 rounded-2xl transition duration-200 flex items-center justify-center space-x-1.5 text-xs text-center"
              >
                <span>Lihat Detail Lengkap & Itinerary</span>
                <ExternalLink size={14} className="text-primary-600" />
              </Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default function PackagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <PackagesContent />
    </Suspense>
  );
}