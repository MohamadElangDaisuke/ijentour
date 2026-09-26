import HeroSection from "../component/ui/heroSection";
import ExperienceSections from "../component/ui/experienceSections";
import Packages from "../component/ui/packagesSections";
import GallerySection from "../component/ui/gallerySection";
import TestimonialSection from "../component/ui/testimonialSection";
import ChooseUs from "../component/ui/chooseUs";
import ArticleSection from "../component/ui/articleSection";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Ijen Tour",
    description: "Paket wisata Kawah Ijen Banyuwangi dan destinasi alam terbaik di Jawa Timur.",
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
      <HeroSection />
      <ChooseUs />
      <Packages />
      <ExperienceSections />
      <GallerySection />
      <ArticleSection />
      <TestimonialSection />
    </>
  );
}
