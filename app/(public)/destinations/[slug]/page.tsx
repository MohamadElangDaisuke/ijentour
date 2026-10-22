import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { defaultDestinations, getDestinationBySlugFromList } from "@/app/lib/destinationsStorage";
import { defaultPackages } from "@/app/lib/packagesStorage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DestinationDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let dest: any = null;
  try {
    const aliases = [
      slug,
      slug === "ijen" ? "kawah-ijen" : slug === "kawah-ijen" ? "ijen" : null,
      slug === "baluran" ? "tn-baluran" : slug === "tn-baluran" ? "baluran" : null,
      slug === "djawatan" ? "de-djawatan" : slug === "de-djawatan" ? "djawatan" : null,
    ].filter(Boolean) as string[];

    dest = await prisma.destination.findFirst({
      where: {
        OR: [
          ...aliases.map((s) => ({ slug: s })),
          ...aliases.map((s) => ({ id: s })),
        ],
      },
    });
  } catch (e) {
    console.error("DB error fetching destination:", e);
  }

  if (!dest) {
    dest = getDestinationBySlugFromList(defaultDestinations, slug) || defaultDestinations[0];
  }

  let dbPackages: any[] = [];
  try {
    dbPackages = await prisma.tripPackage.findMany({
      where: { isActive: true },
      take: 6,
    });
  } catch (e) {
    console.error("DB error fetching trip packages:", e);
  }

  let relevantPackages = dbPackages.filter(
    (p) =>
      p.title.toLowerCase().includes(dest.name.toLowerCase()) ||
      p.description?.toLowerCase().includes(dest.name.toLowerCase())
  );

  if (relevantPackages.length === 0) {
    relevantPackages =
      dbPackages.length > 0 ? dbPackages.slice(0, 3) : (defaultPackages as any[]).slice(0, 3);
  }

  return (
    <div className="bg-secondary-50 text-secondary-950 min-h-screen pb-24">
      {/* HERO SECTION */}
      <section className="relative h-[45vh] min-h-80 flex items-center justify-center text-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${dest.image || "/images/djawatan.png"}')` }}
        >
          <div className="absolute inset-0 bg-secondary-950/70 backdrop-blur-[1px]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 mt-12 text-center">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-400 hover:text-primary-300 mb-3 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Destinations</span>
          </Link>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {dest.name}
          </h1>
          <p className="text-base text-secondary-200 mt-2 max-w-xl mx-auto">
            {dest.description}
          </p>
        </div>
      </section>

      {/* DETAIL CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-secondary-200/80 shadow-sm mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 block mb-2">
            About Destination
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-secondary-950 mb-4">
            Explore the Wonders of {dest.name}
          </h2>
          <p className="text-secondary-700 leading-relaxed text-sm sm:text-base mb-6">
            {dest.name} is one of East Java&apos;s most iconic travel highlights. Featuring breathtaking landscapes and rare natural ecosystems, this destination offers an authentic holiday experience for adventurous explorers and leisure travelers alike.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-secondary-100">
            <div className="p-4 rounded-2xl bg-secondary-50">
              <span className="text-xs text-secondary-500 block mb-0.5">Location</span>
              <span className="font-bold text-sm text-secondary-950">Banyuwangi, East Java</span>
            </div>
            <div className="p-4 rounded-2xl bg-secondary-50">
              <span className="text-xs text-secondary-500 block mb-0.5">Category</span>
              <span className="font-bold text-sm text-secondary-950">{dest.tag || "Nature Destination"}</span>
            </div>
            <div className="p-4 rounded-2xl bg-secondary-50">
              <span className="text-xs text-secondary-500 block mb-0.5">Best Time to Visit</span>
              <span className="font-bold text-sm text-secondary-950">All Year Round</span>
            </div>
          </div>
        </div>

        {/* RELATED PACKAGES */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600 block">
                Related Tour Packages
              </span>
              <h3 className="text-2xl font-black text-secondary-950">
                Featured Tour Packages to {dest.name}
              </h3>
            </div>
            <Link
              href="/packages"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
            >
              <span>All Packages</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relevantPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-3xl border border-secondary-200 overflow-hidden shadow-xs hover:shadow-lg transition p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-16/10 rounded-2xl overflow-hidden mb-4 bg-secondary-100">
                    <img
                      src={pkg.image || pkg.coverImage || "/images/pkg-bluefire.png"}
                      alt={pkg.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-base text-secondary-950 mb-1">{pkg.title}</h4>
                  <p className="text-xs text-secondary-600 line-clamp-2 mb-4">{pkg.description}</p>
                </div>
                <div className="flex justify-end pt-3 border-t border-secondary-100">
                  <Link
                    href={`/packages/${pkg.id}`}
                    className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-bold text-xs"
                  >
                    Package Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
