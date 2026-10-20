import React from "react";
import { ArticleCardSkeleton, Skeleton, SkeletonText } from "@/app/component/ui/skeleton";

export default function BlogLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading travel guides..."
      className="bg-secondary-50 dark:bg-secondary-950 text-secondary-950 dark:text-white min-h-screen pb-24"
    >
      {/* Hero Banner */}
      <section className="relative h-[40vh] min-h-80 flex items-center justify-center text-center bg-secondary-200 dark:bg-secondary-900 overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full" rounded="none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 mt-8 space-y-3">
          <Skeleton className="w-72 sm:w-96 h-10 mx-auto" rounded="xl" />
          <Skeleton className="w-80 sm:w-112 h-4 mx-auto" rounded="md" />
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        {/* Category Filter Pills & Search */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-secondary-200/80 dark:border-secondary-800 pb-6">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-24 h-9" rounded="full" />
            ))}
          </div>
          <Skeleton className="w-48 h-9" rounded="xl" />
        </div>

        {/* Featured Article Banner Skeleton */}
        <div className="bg-white dark:bg-secondary-900 rounded-3xl border border-secondary-200/80 dark:border-secondary-800 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 shadow-xs">
          <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-secondary-100 dark:bg-secondary-800">
            <Skeleton className="w-full h-full" rounded="2xl" />
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <Skeleton className="w-24 h-6" rounded="full" />
            <Skeleton className="w-4/5 h-8" rounded="xl" />
            <SkeletonText lines={3} lineHeight="h-4" gap="gap-2.5" />
            <Skeleton className="w-32 h-10" rounded="full" />
          </div>
        </div>

        {/* Articles Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
