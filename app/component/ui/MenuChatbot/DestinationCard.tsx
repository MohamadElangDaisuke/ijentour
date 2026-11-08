"use client";

import React from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { DestinationSummary } from "./types";

interface DestinationCardProps {
  dest: DestinationSummary;
  onSelect: (slug: string, name: string) => void;
}

export default function DestinationCard({ dest, onSelect }: DestinationCardProps) {
  return (
    <div className="flex gap-3 p-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 hover:border-primary-300 dark:hover:border-primary-600 transition group">
      {/* Image */}
      <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-secondary-100 dark:bg-secondary-800">
        {dest.image ? (
          <Image
            src={dest.image}
            alt={dest.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-6 h-6 text-secondary-400" />
          </div>
        )}
        {dest.tag && (
          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-primary-500 text-secondary-950 uppercase tracking-wide">
            {dest.tag}
          </span>
        )}
        {dest.isFeatured && !dest.tag && (
          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-emerald-500 text-white uppercase tracking-wide">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-xs text-secondary-900 dark:text-white leading-tight mb-1">
          {dest.name}
        </h4>

        <p className="text-[10px] text-secondary-500 dark:text-secondary-400 leading-relaxed line-clamp-2 mb-2">
          {dest.description}
        </p>

        <button
          type="button"
          onClick={() => onSelect(dest.slug, dest.name)}
          className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-primary-500 hover:bg-primary-600 text-secondary-950 transition cursor-pointer"
        >
          Learn More
        </button>
      </div>
    </div>
  );
}
