import React from "react";
import { GalleryGridSkeleton, Skeleton } from "@/app/component/ui/skeleton";

export default function GalleryLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading travel gallery..."
      className="bg-secondary-50 dark:bg-secondary-950 text-secondary-950 dark:text-white min-h-screen pb-24"
    >
      {/* Hero Banner */}
      <section className="relative h-[40vh] min-h-72 flex items-center justify-center text-center bg-secondary-200 dark:bg-secondary-900 overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full" rounded="none" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 mt-8 space-y-3">
          <Skeleton className="w-64 sm:w-80 h-10 mx-auto" rounded="xl" />
          <Skeleton className="w-72 sm:w-96 h-4 mx-auto" rounded="md" />
        </div>
      </section>

      {/* Filter and Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-24 h-9" rounded="full" />
          ))}
        </div>
        <GalleryGridSkeleton count={8} />
      </div>
    </div>
  );
}
