import React from "react";
import { Skeleton, SkeletonText } from "./Skeleton";

/**
 * Single Metric Stat Card Skeleton for Admin Dashboard
 */
export function AdminStatCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="bg-white dark:bg-secondary-900 rounded-2xl p-5 border border-secondary-200/80 dark:border-secondary-800 shadow-xs space-y-2"
    >
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="w-20 h-3" rounded="sm" />
        <Skeleton className="w-8 h-8" rounded="xl" />
      </div>
      <Skeleton className="w-16 h-7" rounded="md" />
      <Skeleton className="w-24 h-2.5 mt-1" rounded="sm" />
    </div>
  );
}

/**
 * Full Admin Dashboard Skeleton
 * Matches the layout of /admin/dashboard
 */
export function AdminDashboardSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading admin dashboard metrics..."
      className="space-y-8"
    >
      {/* 6 Metric Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <AdminStatCardSkeleton key={idx} />
        ))}
      </div>

      {/* 2-Column Insight & Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-secondary-900 rounded-3xl p-6 sm:p-7 border border-secondary-200/80 dark:border-secondary-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-secondary-100 dark:border-secondary-800 pb-3">
            <Skeleton className="w-36 h-5" rounded="md" />
            <Skeleton className="w-24 h-3.5" rounded="sm" />
          </div>
          <div className="space-y-3 pt-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10" rounded="xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="w-36 h-4" rounded="md" />
                    <Skeleton className="w-24 h-3" rounded="sm" />
                  </div>
                </div>
                <Skeleton className="w-20 h-5" rounded="full" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-900 rounded-3xl p-6 sm:p-7 border border-secondary-200/80 dark:border-secondary-800 shadow-xs space-y-4">
          <Skeleton className="w-32 h-5" rounded="md" />
          <div className="p-4 rounded-2xl bg-secondary-50 dark:bg-secondary-800/50 space-y-3">
            <Skeleton className="w-full h-4" rounded="md" />
            <Skeleton className="w-3/4 h-4" rounded="md" />
            <Skeleton className="w-1/2 h-4" rounded="md" />
          </div>
        </div>
      </div>

      {/* Recent Bookings Table Skeleton */}
      <AdminTableSkeleton columns={7} rows={5} />
    </div>
  );
}

/**
 * Universal Admin Data Table Skeleton
 * Matches the layout of Bookings, Trips, Destinations, Reviews, Users
 */
export function AdminTableSkeleton({
  columns = 6,
  rows = 5,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading table data..."
      className="bg-white dark:bg-secondary-900 rounded-3xl border border-secondary-200/80 dark:border-secondary-800 shadow-xs overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-secondary-50 dark:bg-secondary-800/70 border-b border-secondary-100 dark:border-secondary-800">
              {Array.from({ length: columns }).map((_, cIdx) => (
                <th key={cIdx} className="py-4 px-6">
                  <Skeleton className="w-24 h-3" rounded="sm" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx} className="hover:bg-secondary-50/40 dark:hover:bg-secondary-800/40 transition">
                {/* Column 1: Thumbnail/Avatar + Title */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 shrink-0" rounded="xl" />
                    <div className="space-y-1.5 w-full">
                      <Skeleton className="w-36 h-3.5" rounded="md" />
                      <Skeleton className="w-24 h-2.5" rounded="sm" />
                    </div>
                  </div>
                </td>

                {/* Remaining Columns */}
                {Array.from({ length: columns - 2 }).map((_, cIdx) => (
                  <td key={cIdx} className="py-4 px-6">
                    <Skeleton className="w-24 h-3.5" rounded="md" />
                  </td>
                ))}

                {/* Last Column: Action Buttons */}
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Skeleton className="w-7 h-7" rounded="lg" />
                    <Skeleton className="w-7 h-7" rounded="lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Admin Card List Skeleton
 * Matches FAQs, Contacts, and Notifications list items
 */
export function AdminCardListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading list items..."
      className="space-y-3.5"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 sm:p-6 rounded-2xl bg-secondary-50 dark:bg-secondary-800/60 border border-secondary-200/80 dark:border-secondary-800 space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-secondary-200/60 dark:border-secondary-700/60">
            <div className="space-y-1">
              <Skeleton className="w-36 h-4" rounded="md" />
              <Skeleton className="w-24 h-3" rounded="sm" />
            </div>
            <Skeleton className="w-20 h-3" rounded="sm" />
          </div>
          <SkeletonText lines={2} lineHeight="h-3" gap="gap-1.5" widths={["95%", "75%"]} />
        </div>
      ))}
    </div>
  );
}

/**
 * Admin Gallery Grid Skeleton
 * Matches /admin/gallery
 */
export function AdminGallerySkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading gallery media..."
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl overflow-hidden aspect-4/3 bg-secondary-100 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-800"
        >
          <Skeleton className="w-full h-full" rounded="2xl" />
        </div>
      ))}
    </div>
  );
}
