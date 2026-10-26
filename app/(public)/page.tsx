import HeroSection from "../component/ui/heroSection";
import ChooseUs from "../component/ui/chooseUs";
import Packages from "../component/ui/packagesSections";
import DestinationInspiration from "../component/ui/destinationInspiration";
import ExperienceSections from "../component/ui/experienceSections";
import GallerySection from "../component/ui/gallerySection";
import TestimonialSection from "../component/ui/testimonialSection";
import FaqSection from "../component/ui/faqSection";
import ArticleSection from "../component/ui/articleSection";
import {
  CustomTourCtaSection,
  ExploreByInterestSection,
  LocalGuidesSection,
  TravelResourcesSection,
} from "../component/ui/homeSections";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Ijen Tour",
    description: "Mount Ijen Crater tour packages in Banyuwangi, rare blue fire phenomenon, and top natural destinations in East Java with licensed local guides.",
    areaServed: {
      "@type": "City",
      name: "Banyuwangi",
      containedInPlace: { "@type": "AdministrativeArea", name: "East Java" },
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

      {/* 2. Featured Tours */}
      <Packages />

      {/* 3. Why Choose Ijen Tour */}
      <ChooseUs />

      {/* 4. Get Inspired - Destination Carousel */}
      <DestinationInspiration />

      {/* 5. Explore by Interest */}
      <ExploreByInterestSection />

      {/* 6. Latest Articles & Travel Stories */}
      <ArticleSection variant="latest" />

      {/* 7. Experience / Destination */}
      <ExperienceSections />

      {/* 8. Meet Our Local Guides */}
      <LocalGuidesSection />

      {/* 9. Gallery */}
      <GallerySection />

      {/* 10. Testimonials */}
      <TestimonialSection />

      {/* 11. Travel Planning Resources */}
      <TravelResourcesSection />

      {/* 12. Custom Tour CTA */}
      <CustomTourCtaSection />

      {/* 13. FAQ Accordion */}
      <FaqSection />
    </>
  );
}
