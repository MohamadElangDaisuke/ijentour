"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, PenLine, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { defaultTestimonials, type Testimonial } from "../../lib/testimonialsStorage";
import WriteReviewModal from "./WriteReviewModal";

export default function TestimonialSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  const fetchReviews = () => {
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
            rating: r.rating || 5,
            isVerifiedCustomer: r.isVerifiedCustomer,
          }));
          setTestimonials(mapped);
        } else {
          setTestimonials([]);
        }
      })
      .catch(() => {
        setTestimonials([]);
      });
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const featuredTestimonial =
    testimonials.length > 0
      ? testimonials[activeIndex % testimonials.length]
      : null;

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

          <div className="mt-8 flex justify-center lg:justify-start">
            <button
              type="button"
              onClick={() => setIsWriteModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Leave a Review</span>
            </button>
          </div>
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
              <div className="flex items-center justify-center sm:justify-start gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < (featuredTestimonial.rating || 5)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-4xl font-black leading-none text-primary-500">“</p>
              <p className="mt-2 text-base font-medium leading-relaxed text-secondary-800">{featuredTestimonial.quote}</p>
              <div className="flex items-center justify-between mt-6">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-secondary-950">{featuredTestimonial.name}</p>
                    {featuredTestimonial.isVerifiedCustomer && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Verified Customer
                      </span>
                    )}
                  </div>
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
          <div className="rounded-3xl border border-dashed border-secondary-200 bg-white/50 p-12 text-center text-secondary-600">
            <p className="text-sm font-semibold text-secondary-800">No verified traveler reviews published yet.</p>
            <p className="text-xs text-secondary-500 mt-1">Be the first to share your Mount Ijen adventure story!</p>
          </div>
        )}
      </div>

      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        onSuccess={fetchReviews}
      />
    </motion.section>
  );
}
