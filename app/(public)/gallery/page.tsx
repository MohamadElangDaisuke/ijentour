"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, X, Sparkles, Filter, Camera, ZoomIn } from "lucide-react";
import { defaultStories, Story } from "@/app/lib/stories";

const CATEGORIES = [
  { label: "Semua Momen", value: "all" },
  { label: "Blue Fire", value: "blue-fire" },
  { label: "Danau Kawah", value: "crater" },
  { label: "Golden Sunrise", value: "sunrise" },
  { label: "Penambang Belerang", value: "miners" },
  { label: "Destinasi Banyuwangi", value: "destination" },
];

export default function GalleryPage() {
  const [items, setItems] = useState<Story[]>(defaultStories);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPhoto, setSelectedPhoto] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items && data.items.length > 0) {
          setItems(data.items);
        }
      })
      .catch((e) => console.error("Gallery fetch error:", e))
      .finally(() => setLoading(false));
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPhoto(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredItems =
    selectedCategory === "all"
      ? items
      : items.filter(
          (item) =>
            (item as any).category === selectedCategory ||
            item.id.includes(selectedCategory)
        );

  return (
    <div className="bg-secondary-50 text-secondary-950 min-h-screen pb-24">
      {/* HERO SECTION */}
      <section className="relative h-[35vh] min-h-64 flex items-center justify-center text-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/the-best-view-of-kawah.webp')" }}
        >
          <div className="absolute inset-0 bg-secondary-950/75 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 mt-8">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Galeri Momen Kawah Ijen
          </h1>
          <p className="text-sm text-secondary-200 mt-2 max-w-xl mx-auto">
            Kumpulan potret magis kobaran api biru, fajar keemasan, dan keindahan alam Banyuwangi.
          </p>
        </div>
      </section>

      {/* FILTER BUTTONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.value
                  ? "bg-primary-500 text-secondary-950 shadow-sm"
                  : "bg-white text-secondary-700 border border-secondary-200 hover:border-primary-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* LOADING SKELETON */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="rounded-3xl aspect-4/3 bg-secondary-200 animate-pulse border border-secondary-200"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-20 bg-white rounded-3xl border border-secondary-200 my-8 p-8">
            <Camera className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-secondary-900">Belum ada foto dalam kategori ini</h3>
            <p className="text-xs text-secondary-500 mt-1">Pilih kategori lain untuk melihat foto momen wisata lainnya.</p>
            <button
              onClick={() => setSelectedCategory("all")}
              className="mt-4 px-5 py-2 rounded-full bg-primary-500 hover:bg-primary-400 text-secondary-950 font-bold text-xs transition"
            >
              Tampilkan Semua Foto
            </button>
          </div>
        ) : (
          /* PHOTO GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                className="group relative rounded-3xl overflow-hidden aspect-4/3 bg-secondary-100 border border-secondary-200 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/pkg-bluefire.png";
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary-950/85 via-secondary-950/20 to-transparent p-5 flex flex-col justify-end">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400 mb-1 block">
                        Banyuwangi Moment
                      </span>
                      <h3 className="text-white font-bold text-sm sm:text-base leading-tight group-hover:text-primary-300 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-secondary-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-16/10 bg-secondary-950">
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                aria-label="Tutup preview"
                className="absolute top-4 right-4 p-2 rounded-full bg-secondary-950/60 hover:bg-secondary-950 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-primary-600 uppercase tracking-wider">
                  Dokumentasi Wisata Ijen
                </span>
                <h3 className="text-xl font-black text-secondary-950">{selectedPhoto.title}</h3>
                {(selectedPhoto as any).caption && (
                  <p className="text-xs text-secondary-600 mt-1 max-w-xl">
                    {(selectedPhoto as any).caption}
                  </p>
                )}
              </div>
              <Link
                href="/packages"
                className="px-5 py-2.5 rounded-full bg-primary-500 hover:bg-primary-400 text-secondary-950 font-bold text-xs inline-flex items-center gap-1.5 transition shadow-sm whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                <span>Lihat Paket Wisata Terkait</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
