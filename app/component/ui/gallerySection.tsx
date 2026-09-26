"use client";

import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { defaultStories, storiesStorageKey, type Story } from "../../lib/stories";

export default function GallerySection() {
  const [stories, setStories] = useState<Story[]>(defaultStories);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  useEffect(() => {
    let isMounted = true;
    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/gallery');
        if (res.ok) {
          const data = await res.json();
          if (data.gallery && Array.isArray(data.gallery) && data.gallery.length > 0) {
            // Map to Story structure if needed
            const mapped = data.gallery.map((g: any) => ({
              id: g.id,
              title: g.title,
              category: g.category || 'Landscape',
              image: g.imageUrl || g.image,
              location: g.location || 'Kawah Ijen',
              description: g.description || ''
            }));
            if (isMounted) setStories(mapped);
            return;
          }
        }
      } catch (e) {
        console.warn('Could not fetch /api/gallery, falling back:', e);
      }

      const stored = window.localStorage.getItem(storiesStorageKey);
      if (stored && isMounted) {
        try {
          setStories(JSON.parse(stored));
        } catch (error) {
          console.error("Gagal memuat galeri dari localStorage:", error);
        }
      }
    };

    fetchGallery();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedStory) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedStory(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStory]);

  return (
    <motion.section id="gallery" ref={sectionRef} aria-labelledby="gallery-heading" style={{ y: contentY }} className="relative w-full overflow-hidden bg-secondary-50 px-5 py-20 md:px-10 md:py-28">
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-5 text-center sm:flex-row sm:items-end sm:text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600">Gallery moments</p>
            <h2 id="gallery-heading" className="mt-3 text-2xl font-black leading-tight text-secondary-950 md:text-5xl">Galeri wisata Banyuwangi dan Kawah Ijen.</h2>
          </div>
          <Link href="/gallery" className="mx-auto inline-flex items-center gap-2 rounded-full border border-secondary-300 px-5 py-3 text-sm font-bold text-secondary-800 transition hover:border-primary-500 hover:bg-primary-500 hover:text-secondary-950 sm:mx-0">
            Lihat semua gallery
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {stories.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-secondary-200 p-12 text-center text-sm text-secondary-500">Belum ada foto galeri momen yang ditambahkan.</p>
        ) : (
          <div className="grid auto-rows-40 grid-cols-2 gap-3 sm:auto-rows-52 sm:grid-cols-4 sm:gap-5">
            {stories.map((story, index) => (
              <motion.button
                type="button"
                onClick={() => setSelectedStory(story)}
                key={story.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -6 }}
                className={`group relative overflow-hidden rounded-3xl bg-secondary-100 text-left ${index === 0 ? 'col-span-2 row-span-2' : ''} ${index === 1 ? 'sm:col-start-3 sm:row-start-1' : ''} ${index === 2 ? 'sm:col-start-4 sm:row-start-1 sm:row-span-2' : ''} ${index === 3 ? 'sm:col-start-3 sm:row-start-2' : ''}`}
              >
                {story.image ? (
                  <img
                    src={story.image}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/pkg-bluefire.png'; }}
                    alt={`${story.title} - galeri wisata Banyuwangi`}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-4 text-center text-xs text-secondary-400">Tidak ada gambar</div>
                )}
                <div className="absolute inset-0 flex items-end bg-linear-to-t from-secondary-950/80 via-transparent to-transparent p-4 opacity-90 transition group-hover:from-secondary-950/90 sm:p-5">
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-300"><span translate="no" className="notranslate">Banyuwangi</span></p>
                    <h3 className="text-sm font-bold text-white sm:text-base">{story.title}</h3>
                  </div>
                </div>
                <span className="absolute right-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[10px] font-bold text-secondary-950 opacity-0 backdrop-blur transition group-hover:opacity-100">Open photo</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-950/80 p-5 backdrop-blur-sm" onClick={() => setSelectedStory(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-secondary-950 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setSelectedStory(null)} aria-label="Tutup foto" className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-secondary-950 transition hover:bg-primary-500">
              <X className="h-5 w-5" />
            </button>
            {selectedStory.image && (
              <img
                src={selectedStory.image}
                onError={(e) => { (e.target as HTMLImageElement).src = '/images/pkg-bluefire.png'; }}
                alt={`${selectedStory.title} - foto perjalanan Kawah Ijen Banyuwangi`}
                className="max-h-[75vh] w-full object-contain"
              />
            )}
            <div className="px-5 py-4"><h3 className="font-bold text-white">{selectedStory.title}</h3><p className="mt-1 text-xs text-secondary-300"><span translate="no" className="notranslate">Banyuwangi</span>, East Java</p></div>
          </motion.div>
        </div>
      )}
    </motion.section>
  );
}
