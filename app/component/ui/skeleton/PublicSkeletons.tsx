import React from "react";
import { Skeleton, SkeletonText, SkeletonBadge, SkeletonButton } from "./Skeleton";

/**
 * Tour Package Card Skeleton
 * Matches the exact card layout of /packages and homepage package section
 */
export function PackageCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="bg-white dark:bg-secondary-900 rounded-3xl border border-secondary-200/80 dark:border-secondary-800 overflow-hidden shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Image Aspect 16:10 */}
        <div className="relative aspect-16/10 w-full bg-secondary-100 dark:bg-secondary-800 overflow-hidden">
          <Skeleton className="w-full h-full" rounded="none" />
          <div className="absolute top-3 left-3 flex gap-2">
            <SkeletonBadge className="w-16 h-5" />
            <SkeletonBadge className="w-20 h-5" />
          </div>
        </div>

        {/* Content Details */}
        <div className="p-5 sm:p-6 space-y-3.5">
          {/* Rating & Duration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-4 h-4 rounded-sm" />
              <Skeleton className="w-16 h-3.5" rounded="md" />
            </div>
            <Skeleton className="w-20 h-3.5" rounded="md" />
          </div>

          {/* Title */}
          <SkeletonText lines={2} lineHeight="h-5" gap="gap-2" widths={["90%", "65%"]} />

          {/* Highlights / Features */}
          <div className="pt-2 space-y-2 border-t border-secondary-100 dark:border-secondary-800/80">
            <div className="flex items-center gap-2">
              <Skeleton className="w-3.5 h-3.5 rounded-full" />
              <Skeleton className="w-3/4 h-3" rounded="md" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-3.5 h-3.5 rounded-full" />
              <Skeleton className="w-2/3 h-3" rounded="md" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Price & Buttons */}
      <div className="p-5 sm:p-6 pt-0 mt-2 border-t border-secondary-100 dark:border-secondary-800/80">
        <div className="flex items-baseline justify-between mb-4 pt-3">
          <div>
            <Skeleton className="w-12 h-2.5 mb-1" rounded="sm" />
            <Skeleton className="w-28 h-6" rounded="lg" />
          </div>
          <Skeleton className="w-16 h-3" rounded="md" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <SkeletonButton className="w-full h-10" rounded="2xl" />
          <SkeletonButton className="w-full h-10" rounded="2xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of Tour Package Card Skeletons
 */
export function PackagesGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading tour packages..."
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <PackageCardSkeleton key={idx} />
      ))}
    </div>
  );
}

/**
 * Destination Card Skeleton
 * Matches the card layout in /destinations
 */
export function DestinationCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="bg-white dark:bg-secondary-900 rounded-3xl border border-secondary-200/80 dark:border-secondary-800 overflow-hidden shadow-xs flex flex-col justify-between"
    >
      <div>
        <div className="relative aspect-16/10 w-full overflow-hidden bg-secondary-100 dark:bg-secondary-800">
          <Skeleton className="w-full h-full" rounded="none" />
          <div className="absolute top-3 left-3">
            <SkeletonBadge className="w-24 h-5" />
          </div>
        </div>
        <div className="p-5 sm:p-6 space-y-3">
          <Skeleton className="w-3/4 h-5" rounded="lg" />
          <SkeletonText lines={2} lineHeight="h-3.5" gap="gap-1.5" widths={["100%", "75%"]} />
        </div>
      </div>
      <div className="px-5 sm:px-6 pb-5 pt-2 flex items-center justify-between border-t border-secondary-100 dark:border-secondary-800/80">
        <Skeleton className="w-24 h-3.5" rounded="md" />
        <Skeleton className="w-5 h-5 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Grid of Destination Card Skeletons
 */
export function DestinationsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading destinations..."
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <DestinationCardSkeleton key={idx} />
      ))}
    </div>
  );
}

/**
 * Destination Detail Page Skeleton
 * Matches the layout of /destinations/[slug]
 */
export function DestinationDetailSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading destination details..."
      className="bg-secondary-50 dark:bg-secondary-950 text-secondary-950 dark:text-white min-h-screen pb-24"
    >
      {/* Hero Banner */}
      <div className="relative h-[45vh] min-h-[360px] bg-secondary-200 dark:bg-secondary-900 flex items-end pb-12 overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full" rounded="none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-3">
          <SkeletonBadge className="w-28 h-6" />
          <Skeleton className="w-2/3 max-w-xl h-10" rounded="xl" />
          <Skeleton className="w-1/3 max-w-md h-4" rounded="md" />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-secondary-900 rounded-3xl p-6 sm:p-8 border border-secondary-200/80 dark:border-secondary-800 shadow-xs space-y-4">
            <Skeleton className="w-48 h-6" rounded="lg" />
            <SkeletonText lines={4} lineHeight="h-4" gap="gap-2.5" />
            <SkeletonText lines={3} lineHeight="h-4" gap="gap-2.5" widths={["95%", "85%", "50%"]} />
          </div>

          <div className="bg-white dark:bg-secondary-900 rounded-3xl p-6 sm:p-8 border border-secondary-200/80 dark:border-secondary-800 shadow-xs space-y-4">
            <Skeleton className="w-40 h-6" rounded="lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-20" rounded="2xl" />
              <Skeleton className="h-20" rounded="2xl" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-secondary-900 rounded-3xl p-6 border border-secondary-200/80 dark:border-secondary-800 shadow-xs space-y-4">
            <Skeleton className="w-36 h-5" rounded="md" />
            <Skeleton className="w-full h-11" rounded="2xl" />
            <Skeleton className="w-full h-11" rounded="2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Blog Article Card Skeleton
 * Matches the card layout in /blog
 */
export function ArticleCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="bg-white dark:bg-secondary-900 rounded-3xl border border-secondary-200/80 dark:border-secondary-800 overflow-hidden shadow-xs flex flex-col justify-between"
    >
      <div>
        <div className="relative aspect-16/10 w-full overflow-hidden bg-secondary-100 dark:bg-secondary-800">
          <Skeleton className="w-full h-full" rounded="none" />
          <div className="absolute top-3 left-3">
            <SkeletonBadge className="w-20 h-5" />
          </div>
        </div>
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-20 h-3" rounded="sm" />
            <Skeleton className="w-16 h-3" rounded="sm" />
          </div>
          <SkeletonText lines={2} lineHeight="h-5" gap="gap-2" widths={["95%", "70%"]} />
          <SkeletonText lines={2} lineHeight="h-3.5" gap="gap-1.5" widths={["100%", "85%"]} />
        </div>
      </div>
      <div className="px-5 sm:px-6 pb-5 pt-2 flex items-center justify-between border-t border-secondary-100 dark:border-secondary-800/80">
        <Skeleton className="w-24 h-3.5" rounded="md" />
        <Skeleton className="w-4 h-4 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Blog Article Detail Page Skeleton
 * Matches the layout of /blog/[slug]
 */
export function ArticleDetailSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading article..."
      className="bg-secondary-50 dark:bg-secondary-950 text-secondary-950 dark:text-white min-h-screen pb-24"
    >
      {/* Top Header / Breadcrumb */}
      <div className="border-b border-secondary-200/80 dark:border-secondary-800 bg-white/70 dark:bg-secondary-900/70 backdrop-blur-md sticky top-16 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Skeleton className="w-32 h-5" rounded="xl" />
          <Skeleton className="w-20 h-7" rounded="full" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        {/* Category & Date */}
        <div className="flex items-center gap-3 mb-4">
          <SkeletonBadge className="w-24 h-6" />
          <Skeleton className="w-28 h-4" rounded="md" />
          <Skeleton className="w-20 h-4" rounded="md" />
        </div>

        {/* Title */}
        <div className="space-y-3 mb-6">
          <Skeleton className="w-full h-8 sm:h-11" rounded="xl" />
          <Skeleton className="w-4/5 h-8 sm:h-11" rounded="xl" />
        </div>

        {/* Excerpt */}
        <SkeletonText lines={2} lineHeight="h-4" gap="gap-2" widths={["98%", "80%"]} className="mb-8" />

        {/* Hero Image */}
        <div className="relative aspect-16/9 w-full rounded-3xl overflow-hidden mb-10 bg-secondary-200 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-800">
          <Skeleton className="w-full h-full" rounded="3xl" />
        </div>

        {/* Article Body Paragraphs */}
        <div className="bg-white dark:bg-secondary-900 rounded-3xl p-6 sm:p-10 border border-secondary-200/80 dark:border-secondary-800 shadow-xs space-y-6">
          <Skeleton className="w-48 h-6" rounded="lg" />
          <SkeletonText lines={5} lineHeight="h-4" gap="gap-2.5" widths={["100%", "96%", "98%", "92%", "70%"]} />
          <Skeleton className="w-40 h-6 mt-8" rounded="lg" />
          <SkeletonText lines={4} lineHeight="h-4" gap="gap-2.5" widths={["98%", "94%", "97%", "65%"]} />
        </div>
      </div>
    </div>
  );
}

/**
 * Gallery Grid Skeleton
 * Matches the layout in /gallery
 */
export function GalleryGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading travel gallery..."
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-3xl aspect-4/3 overflow-hidden bg-secondary-200 dark:bg-secondary-800 border border-secondary-200/80 dark:border-secondary-800"
        >
          <Skeleton className="w-full h-full" rounded="3xl" />
        </div>
      ))}
    </div>
  );
}

/**
 * Booking Lookup Result Skeleton
 * Matches the reservation card in /booking
 */
export function BookingResultSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Searching reservation..."
      className="max-w-3xl mx-auto px-4 mt-10"
    >
      <div className="bg-white dark:bg-secondary-900 rounded-3xl p-6 sm:p-8 border border-secondary-200/80 dark:border-secondary-800 shadow-md space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-secondary-100 dark:border-secondary-800 gap-4">
          <div className="space-y-2">
            <Skeleton className="w-28 h-3" rounded="sm" />
            <Skeleton className="w-64 h-7" rounded="lg" />
            <Skeleton className="w-36 h-6" rounded="md" />
          </div>
          <SkeletonBadge className="w-28 h-8" />
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-800 space-y-2">
            <Skeleton className="w-24 h-3" rounded="sm" />
            <Skeleton className="w-48 h-4" rounded="md" />
            <Skeleton className="w-40 h-3" rounded="sm" />
          </div>
          <div className="p-4 rounded-2xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-800 space-y-2">
            <Skeleton className="w-24 h-3" rounded="sm" />
            <Skeleton className="w-48 h-4" rounded="md" />
            <Skeleton className="w-32 h-3" rounded="sm" />
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="p-4 rounded-2xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-800 flex items-center justify-between">
          <Skeleton className="w-32 h-4" rounded="md" />
          <Skeleton className="w-36 h-6" rounded="lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Custom Trip Step 1 Destinations Skeleton
 * Matches the destination selector cards in /custom-package
 */
export function CustomTripDestinationsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading custom trip destinations..."
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-secondary-200/80 dark:border-secondary-800 bg-white dark:bg-secondary-900 p-4 space-y-3"
        >
          <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-secondary-100 dark:bg-secondary-800">
            <Skeleton className="w-full h-full" rounded="xl" />
            <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white/70 dark:bg-secondary-800/70" />
          </div>
          <Skeleton className="w-3/4 h-5" rounded="md" />
          <SkeletonText lines={2} lineHeight="h-3" gap="gap-1.5" widths={["100%", "70%"]} />
        </div>
      ))}
    </div>
  );
}
