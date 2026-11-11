export interface Testimonial {
  id: string;
  name: string;
  origin: string;
  quote: string;
  image: string;
  rating: number;
  date?: string;
  isVerifiedCustomer?: boolean;
}

// Fabricated testimonials have been removed in compliance with Phase 3 integrity audit.
// Real customer reviews are retrieved from the verified database.
export const defaultTestimonials: Testimonial[] = [];

export const testimonialsStorageKey = 'ijen-tour-testimonials';
