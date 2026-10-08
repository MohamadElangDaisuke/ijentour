"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { defaultTestimonials, testimonialsStorageKey, type Testimonial } from "../../lib/testimonialsStorage";

export default function TestimonialSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const featuredTestimonial = testimonials[0];

  useEffect(() => {
    const saved = window.localStorage.getItem(testimonialsStorageKey);
    if (!saved) return;
    try {
      setTestimonials(JSON.parse(saved));
    } catch (error) {
      console.error("Gagal memuat testimonial dari localStorage:", error);
    }
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65 }}
      aria-labelledby="testimonial-heading"
      className="relative w-full overflow-hidden bg-secondary-50 px-4 py-20 sm:px-8 sm:py-24 lg:py-28"
    >
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div className="text-center lg:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600">Testimonials</p>
          <h2 id="testimonial-heading" className="mt-4 text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-secondary-950">
            What people say about us.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm sm:text-base leading-relaxed text-secondary-700 lg:mx-0">
            Cerita dari traveler yang sudah merasakan perjalanan bersama tim lokal IjenTour.
          </p>
        </div>

        {featuredTestimonial ? (
          <article className="grid items-center gap-6 rounded-4xl bg-white border border-secondary-200/80 p-6 sm:p-8 text-center shadow-xl shadow-secondary-900/5 sm:grid-cols-[0.8fr_1.2fr] sm:text-left">
            <div className="aspect-square overflow-hidden rounded-3xl bg-secondary-100">
              {featuredTestimonial.image ? (
                <img
                  src={featuredTestimonial.image}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/pkg-bluefire.png'; }}
                  alt={`${featuredTestimonial.name} - pengalaman wisata Banyuwangi`}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div>
              <p className="text-4xl font-black leading-none text-primary-500">“</p>
              <p className="mt-2 text-base font-medium leading-relaxed text-secondary-800">{featuredTestimonial.quote}</p>
              <p className="mt-6 text-base font-bold text-secondary-950">{featuredTestimonial.name}</p>
              <p className="mt-1 text-xs text-secondary-500">{featuredTestimonial.origin || 'Traveler IjenTour'}</p>
            </div>
          </article>
        ) : (
          <p className="rounded-2xl border border-dashed border-secondary-200 p-10 text-center text-sm text-secondary-500">
            Belum ada cerita perjalanan.
          </p>
        )}
      </div>
    </motion.section>
  );
}

