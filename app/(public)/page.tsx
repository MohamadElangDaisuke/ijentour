import HeroSection from "../component/ui/heroSection";
import ChooseUs from "../component/ui/chooseUs";
import Packages from "../component/ui/packagesSections";
import ExperienceSections from "../component/ui/experienceSections";
import HowItWorks from "../component/ui/howItWorks";
import GallerySection from "../component/ui/gallerySection";
import TestimonialSection from "../component/ui/testimonialSection";
import FaqSection from "../component/ui/faqSection";
import FinalCta from "../component/ui/finalCta";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Ijen Tour",
    description: "Paket wisata Kawah Ijen Banyuwangi, fenomena langka blue fire, dan destinasi alam terbaik di Jawa Timur bersama pemandu lokal berlisensi.",
    areaServed: {
      "@type": "City",
      name: "Banyuwangi",
      containedInPlace: { "@type": "AdministrativeArea", name: "Jawa Timur" },
    },
    touristDestinations: [
      "Kawah Ijen",
      "Djawatan",
      "Green Island",
      "Red Island",
      "Taman Nasional Baluran",
      "Kawah Wurung",
    ].map((name) => ({ "@type": "TouristAttraction", name })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Why Choose Ijen Tour */}
      <ChooseUs />

      {/* 3. Featured Tours */}
      <Packages />

      {/* 4. Experience / Destination */}
      <ExperienceSections />

      {/* 5. How It Works */}
      <HowItWorks />

      {/* 6. Gallery */}
      <GallerySection />

      {/* 7. Testimonials */}
      <TestimonialSection />

      {/* 8. FAQ Accordion */}
      <FaqSection />

      {/* 9. Final CTA */}
      <FinalCta />
    </>
  );
}
