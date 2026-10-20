import React from "react";
import { DestinationsGridSkeleton, Skeleton } from "@/app/component/ui/skeleton";

export default function DestinationsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading destinations..."
      className="bg-secondary-50 dark:bg-secondary-950 text-secondary-950 dark:text-white min-h-screen pb-24"
    >
      {/* Hero Banner */}
      <section className="relative h-[35vh] min-h-64 flex items-center justify-center text-center bg-secondary-200 dark:bg-secondary-900 overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full" rounded="none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 mt-8 space-y-3">
          <Skeleton className="w-64 sm:w-80 h-10 mx-auto" rounded="xl" />
          <Skeleton className="w-80 sm:w-96 h-4 mx-auto" rounded="md" />
        </div>
      </section>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <DestinationsGridSkeleton count={6} />
      </div>
    </div>
  );
}
