import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Backpack,
  CalendarDays,
  Compass,
  Leaf,
  MapPinned,
  Mountain,
  ShieldCheck,
  Users,
} from "lucide-react";

const interests = [
  {
    label: "Adventure",
    category: "Ijen Insights",
    image: "https://images.pexels.com/photos/672358/pexels-photo-672358.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    label: "Nature",
    category: "Destinations",
    image: "https://images.pexels.com/photos/460621/pexels-photo-460621.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    label: "Culture",
    category: "Local Culture",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Culinary",
    category: "Culinary",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Travel Tips",
    category: "Tips & Tricks",
    image: "https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

const resources = [
  {
    title: "Best time to visit",
    description: "Read about when the night trek and Blue Fire are best experienced.",
    href: "/blog/mengenal-fenomena-blue-fire",
    icon: CalendarDays,
  },
  {
    title: "Ijen trek and crater safety",
    description: "Learn about the night trek, the Blue Fire, and important safety preparation.",
    href: "/blog/mengenal-fenomena-blue-fire",
    icon: ShieldCheck,
  },
  {
    title: "Prepare for your trek",
    description: "Review practical fitness and packing advice before your Ijen adventure.",
    href: "/blog/persiapan-trekking-kawah-ijen",
    icon: Backpack,
  },
  {
    title: "What to wear in Ijen",
    description: "Find clothing tips for the cool conditions on the mountain.",
    href: "/blog/panduan-memilih-pakaian",
    icon: Mountain,
  },
  {
    title: "Weather and clothing",
    description: "Prepare for cool mountain conditions with practical clothing advice.",
    href: "/blog/panduan-memilih-pakaian",
    icon: Leaf,
  },
  {
    title: "Transport and pickup",
    description: "Ask our team about available routes, pickup locations, and trip logistics.",
    href: "/contact",
    icon: MapPinned,
  },
  {
    title: "Current visitor information",
    description: "Contact the team to confirm current access rules and visitor requirements.",
    href: "/contact",
    icon: Compass,
  },
];

export function ExploreByInterestSection() {
  return (
    <section
      id="explore-by-interest"
      aria-labelledby="explore-by-interest-heading"
      className="bg-secondary-50 px-4 py-16 sm:px-8 sm:py-20 lg:py-24 dark:bg-secondary-950"
    >
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_2fr] lg:items-center lg:gap-10">
        <header className="max-w-md text-center lg:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600">Explore by interest</p>
          <h2 id="explore-by-interest-heading" className="mt-3 text-3xl font-black tracking-tight text-secondary-950 sm:text-4xl dark:text-white">
            Travel Your Way
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-secondary-600 dark:text-secondary-300">
            Find inspiration for the kind of journey you want to take.
          </p>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-3">
          {interests.map(({ label, category, image }) => (
            <Link
              key={label}
              href={`/blog?category=${encodeURIComponent(category)}`}
              className="group relative isolate flex min-h-48 transform-gpu flex-col justify-end overflow-hidden border border-white/20 p-5 transition duration-500 ease-out hover:z-20 hover:scale-[1.03] focus-visible:z-20 focus-visible:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-primary-400 sm:min-h-56 sm:p-6 motion-reduce:transform-none motion-reduce:transition-none"
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-70 transition duration-700 ease-out group-hover:scale-110 group-hover:opacity-100 group-focus-visible:scale-110 group-focus-visible:opacity-100 motion-reduce:transform-none motion-reduce:transition-none"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 transition-colors duration-500 group-hover:from-black/70 group-focus-visible:from-black/70"
              />
              <span className="relative z-10">
                <span className="block text-lg font-bold text-white sm:text-xl">{label}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-300 transition-colors group-hover:text-primary-200 group-focus-visible:text-primary-200">
                  Explore articles <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LocalGuidesSection() {
  return (
    <section
      id="local-guides"
      aria-labelledby="local-guides-heading"
      className="bg-secondary-50 px-4 py-16 sm:px-8 sm:py-20 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-10 rounded-3xl border border-secondary-200 bg-white p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-14">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600">Meet our local guides</p>
          <h2 id="local-guides-heading" className="mt-3 text-2xl font-black tracking-tight text-secondary-950 sm:text-4xl">
            Discover Indonesia with Local Experts
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-secondary-700 sm:text-base">
            Get to know Banyuwangi through the local team who helps bring each journey together, from sharing regional insight to helping you plan your experience.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <div className="flex items-center gap-3 rounded-2xl bg-secondary-50 px-4 py-3 text-sm font-semibold text-secondary-800">
            <Compass className="h-5 w-5 shrink-0 text-primary-600" aria-hidden="true" />
            Local knowledge
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-secondary-50 px-4 py-3 text-sm font-semibold text-secondary-800">
            <Users className="h-5 w-5 shrink-0 text-primary-600" aria-hidden="true" />
            Personal trip planning
          </div>
        </div>
      </div>
    </section>
  );
}

export function TravelResourcesSection() {
  return (
    <section
      id="travel-resources"
      aria-labelledby="travel-resources-heading"
      className="bg-white px-4 py-16 sm:px-8 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600">Travel planning resources</p>
          <h2 id="travel-resources-heading" className="mt-3 text-2xl font-black tracking-tight text-secondary-950 sm:text-4xl">
            Plan Your Trip with Confidence
          </h2>
          <p className="mt-3 text-sm text-secondary-700 sm:text-base">
            Find practical information to help you prepare for a visit to Ijen and Banyuwangi.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {resources.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-2xl border border-secondary-200 bg-secondary-50 p-5 transition hover:-translate-y-1 hover:border-primary-500 hover:bg-white"
            >
              <Icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
              <h3 className="mt-4 font-bold text-secondary-950">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary-700">{description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary-600">
                Read more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CustomTourCtaSection() {
  const destinationImages = [
    { src: "/images/the-best-view-of-kawah.webp", alt: "Mount Ijen crater" },
    { src: "/images/djawatan.png", alt: "De Djawatan forest" },
    { src: "/images/pkg-waterfall.png", alt: "Banyuwangi waterfall" },
    { src: "/images/pkg-crater.png", alt: "Volcanic crater landscape" },
    { src: "/images/pkg-bali.png", alt: "Banyuwangi coastal scenery" },
    { src: "/images/ijen-expedition-tour.webp", alt: "Ijen trekking experience" },
    { src: "/images/HeroSection.webp", alt: "Mount Ijen landscape" },
    { src: "/images/the-best-view-of-kawah.webp", alt: "Ijen crater lake" },
    { src: "/images/djawatan.png", alt: "Banyuwangi forest" },
  ];

  return (
    <section
      id="custom-tour"
      aria-labelledby="custom-tour-heading"
      className="bg-white px-4 py-16 sm:px-8 sm:py-20 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl border border-secondary-200 bg-secondary-50 lg:grid-cols-2">
        <div className="relative isolate flex min-h-[380px] items-end overflow-hidden bg-secondary-950 px-6 py-8 sm:min-h-[440px] sm:px-10 sm:py-12 lg:min-h-[500px] lg:px-12">
          <div
            className="pointer-events-none absolute inset-0 z-0 grid grid-cols-3 grid-rows-3 opacity-55"
            aria-hidden="true"
          >
            {destinationImages.map((image, index) => (
              <div key={`${image.src}-${index}`} className="relative min-h-0 min-w-0 overflow-hidden">
                <Image src={image.src} alt="" fill sizes="(max-width: 1024px) 40vw, 25vw" className="object-cover" />
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-secondary-950/90 via-secondary-950/55 to-secondary-950/35" aria-hidden="true" />
          <div className="relative z-20 max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-400">Ijen Tour · Banyuwangi</p>
            <h2 id="custom-tour-heading" className="mt-3 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Your next journey starts here.
            </h2>
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">Custom tour</p>
          <h3 className="mt-3 text-2xl font-black tracking-tight text-secondary-950 sm:text-3xl">
            Custom Your Destination
          </h3>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-secondary-700 sm:text-base">
            Choose the places you want to visit, then tell us your dates and group size. Our travel team will help plan an itinerary around your trip.
          </p>
          <Link
            href="/custom-package"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-6 py-3.5 text-sm font-bold text-secondary-950 transition hover:bg-primary-400 sm:w-fit"
          >
            Custom your destination <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
