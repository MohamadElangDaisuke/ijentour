"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Zap, Star } from "lucide-react";
import { PackageSummary } from "./types";

interface PackageCardProps {
  pkg: PackageSummary;
  onSelect: (id: string, label: string) => void;
}

export default function PackageCard({ pkg, onSelect }: PackageCardProps) {
  return (
    <div className="flex gap-3 p-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 hover:border-primary-300 dark:hover:border-primary-600 transition group">
      {/* Image */}
      <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-secondary-100 dark:bg-secondary-800">
        {pkg.coverImage ? (
          <Image
            src={pkg.coverImage}
            alt={pkg.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-secondary-400 text-xs">
            No image
          </div>
        )}
        {pkg.badge && (
          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-primary-500 text-secondary-950 uppercase tracking-wide">
            {pkg.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-xs text-secondary-900 dark:text-white leading-tight line-clamp-2 mb-1">
          {pkg.title}
        </h4>

        <p className="text-primary-600 dark:text-primary-400 font-black text-sm mb-1.5">
          {pkg.price}
        </p>

        <div className="flex items-center gap-2 text-[10px] text-secondary-500 dark:text-secondary-400 mb-2">
          <span className="flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            {pkg.duration}
          </span>
          <span className="flex items-center gap-0.5">
            <Zap className="w-3 h-3" />
            {pkg.difficulty}
          </span>
          {pkg.rating > 0 && (
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-primary-400 text-primary-400" />
              {pkg.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Link
            href={`/packages/${pkg.slug || pkg.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700 border border-secondary-200 dark:border-secondary-700 transition"
          >
            View Details
          </Link>
          <button
            type="button"
            onClick={() => onSelect(pkg.id, pkg.title)}
            className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-primary-500 hover:bg-primary-600 text-secondary-950 transition cursor-pointer"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
