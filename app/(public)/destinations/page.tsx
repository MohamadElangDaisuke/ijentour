"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { defaultDestinations, Destination } from "@/app/lib/destinationsStorage";

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>(defaultDestinations);

  useEffect(() => {
    fetch("/api/destinations")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.destinations && data.destinations.length > 0) {
          setDestinations(data.destinations);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-secondary-50 text-secondary-950 min-h-screen pb-24">
      {/* HERO SECTION */}
      <section className="relative h-[35vh] min-h-64 flex items-center justify-center text-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/djawatan.png')" }}
        >
          <div className="absolute inset-0 bg-secondary-950/75 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 mt-8">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Destinasi Wisata Unggulan
          </h1>
          <p className="text-sm text-secondary-200 mt-2 max-w-xl mx-auto">
            Jelajahi keajaiban kawah vulkanik, savana liar, hingga hutan magis di The Sunrise of Java.
          </p>
        </div>
      </section>

      {/* DESTINATION CARDS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest) => {
            const slug = (dest as any).slug || dest.id.replace("dest-", "");
            return (
              <div
                key={dest.id}
                className="bg-white rounded-3xl border border-secondary-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <Link href={`/destinations/${slug}`} className="block relative aspect-16/10 overflow-hidden bg-secondary-100">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/pkg-bluefire.png";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {dest.tag && (
                      <span className="absolute top-4 left-4 bg-primary-500 text-secondary-950 text-xs font-black px-3 py-1 rounded-full shadow-sm">
                        {dest.tag}
                      </span>
                    )}
                  </Link>

                  <div className="p-6">
                    <div className="flex items-center gap-1.5 text-xs text-secondary-500 font-semibold mb-2">
                      <MapPin className="w-3.5 h-3.5 text-primary-600" />
                      <span>Banyuwangi, Jawa Timur</span>
                    </div>
                    <Link href={`/destinations/${slug}`}>
                      <h3 className="text-xl font-black text-secondary-950 group-hover:text-primary-600 transition mb-2">
                        {dest.name}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-secondary-600 leading-relaxed">
                      {dest.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-secondary-100 mt-4 flex items-center justify-between">
                  <Link
                    href={`/destinations/${slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-secondary-700 hover:text-primary-600 transition"
                  >
                    <span>Informasi Destinasi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/packages"
                    className="px-4 py-2 rounded-xl bg-secondary-950 hover:bg-primary-500 hover:text-secondary-950 text-white text-xs font-bold transition shadow-xs"
                  >
                    Cari Paket Tur
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
