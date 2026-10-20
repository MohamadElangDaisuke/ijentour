import React from "react";
import { PackagesGridSkeleton, Skeleton, SkeletonBadge } from "@/app/component/ui/skeleton";

export default function PackagesLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading tour packages..."
      className="text-secondary-950 dark:text-white bg-secondary-50 dark:bg-secondary-950 min-h-screen"
    >
      {/* Hero Section Placeholder */}
      <section className="relative h-[55vh] min-h-[460px] flex items-end pb-16 bg-secondary-200 dark:bg-secondary-900 overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full" rounded="none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-4">
          <div className="flex gap-2">
            <SkeletonBadge className="w-24 h-6" />
            <SkeletonBadge className="w-28 h-6" />
          </div>
          <Skeleton className="w-3/4 max-w-2xl h-10 sm:h-12" rounded="xl" />
          <Skeleton className="w-1/3 max-w-md h-5" rounded="md" />
        </div>
      </section>

      {/* Filter and Packages Grid Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-secondary-200/80 dark:border-secondary-800 pb-6">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-28 h-9" rounded="full" />
            ))}
          </div>
          <Skeleton className="w-36 h-4" rounded="md" />
        </div>

        <PackagesGridSkeleton count={6} />
      </main>
    </div>
  );
}
