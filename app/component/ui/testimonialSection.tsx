"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { defaultTestimonials, type Testimonial } from "../../lib/testimonialsStorage";

export default function TestimonialSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          const mapped: Testimonial[] = data.reviews.map((r: any) => ({
            id: r.id,
            name: r.authorName || r.customerName || "Traveler",
            quote: r.comment,
            origin: r.tripPackage?.title || "Mount Ijen Tour Traveler",
            image: r.avatar || "/images/pkg-bluefire.png",
          }));
          setTestimonials(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const featuredTestimonial = testimonials[activeIndex % testimonials.length] || defaultTestimonials[0];

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
        <div className="text-center lg:text-left mx-auto lg:mx-0">
          <h2 id="testimonial-heading" className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-secondary-950">
            What people say about us.
          </h2>
          <p className="mt-5 max-w-md mx-auto lg:mx-0 text-sm sm:text-base leading-relaxed text-secondary-700">
            Real stories from travelers who explored Mount Ijen with our local guides.
          </p>
        </div>

        {featuredTestimonial ? (
          <article className="grid items-center gap-6 rounded-4xl bg-white border border-secondary-200/80 p-6 sm:p-8 text-center sm:text-left shadow-xl shadow-secondary-900/5 sm:grid-cols-[0.8fr_1.2fr]">
            <div className="aspect-square overflow-hidden rounded-3xl bg-secondary-100 max-w-[260px] sm:max-w-none mx-auto sm:mx-0 w-full">
              {featuredTestimonial.image ? (
                <img
                  src={featuredTestimonial.image}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/pkg-bluefire.png'; }}
                  alt={`${featuredTestimonial.name} - Banyuwangi travel experience`}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div>
              <p className="text-4xl font-black leading-none text-primary-500">“</p>
              <p className="mt-2 text-base font-medium leading-relaxed text-secondary-800">{featuredTestimonial.quote}</p>
              <div className="flex items-center justify-between mt-6">
                <div>
                  <p className="text-base font-bold text-secondary-950">{featuredTestimonial.name}</p>
                  <p className="mt-0.5 text-xs text-secondary-500">{featuredTestimonial.origin || 'Mount Ijen Tour Traveler'}</p>
                </div>
                {testimonials.length > 1 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                      aria-label="Previous Testimonial"
                      className="w-8 h-8 rounded-full border border-secondary-300 flex items-center justify-center hover:bg-secondary-100 transition cursor-pointer text-xs font-bold text-secondary-800"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveIndex((prev) => (prev + 1) % testimonials.length)}
                      aria-label="Next Testimonial"
                      className="w-8 h-8 rounded-full border border-secondary-300 flex items-center justify-center hover:bg-secondary-100 transition cursor-pointer text-xs font-bold text-secondary-800"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </article>
        ) : (
          <p className="rounded-2xl border border-dashed border-secondary-200 p-10 text-center sm:text-left text-sm text-secondary-500">
            No travel stories added yet.
          </p>
        )}
      </div>
    </motion.section>
  );
}
