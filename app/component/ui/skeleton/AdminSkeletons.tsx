import React from "react";
import { Skeleton, SkeletonText } from "./Skeleton";

/**
 * Responsive Header Skeleton for Admin Pages
 * Adapts between mobile (stacked) and desktop (inline)
 */
export function AdminHeaderSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading header..."
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2"
    >
      <div className="space-y-1.5">
        <Skeleton className="w-20 sm:w-24 h-2.5 sm:h-3" rounded="sm" />
        <Skeleton className="w-48 sm:w-72 h-6 sm:h-8" rounded="lg" />
        <Skeleton className="w-64 sm:w-96 h-2.5 sm:h-3" rounded="sm" />
      </div>
      <div className="flex items-center gap-2.5 self-start sm:self-auto">
        <Skeleton className="w-28 sm:w-36 h-9 sm:h-10" rounded="2xl" />
        <Skeleton className="w-24 sm:w-32 h-9 sm:h-10" rounded="2xl" />
      </div>
    </div>
  );
}

/**
 * Responsive Search & Filter Toolbar Skeleton
 */
export function AdminToolbarSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading filter toolbar..."
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-secondary-900 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-secondary-200/80 dark:border-secondary-800 shadow-xs"
    >
      <Skeleton className="w-full sm:w-72 h-9" rounded="xl" />
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        <Skeleton className="w-20 h-8 shrink-0" rounded="xl" />
        <Skeleton className="w-24 h-8 shrink-0" rounded="xl" />
        <Skeleton className="w-20 h-8 shrink-0" rounded="xl" />
      </div>
    </div>
  );
}

/**
 * Single Metric Stat Card Skeleton for Admin Dashboard
 * Responsive: Compact on mobile, spacious on tablet/desktop
 */
export function AdminStatCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="bg-white dark:bg-secondary-900 rounded-2xl p-3.5 sm:p-5 border border-secondary-200/80 dark:border-secondary-800 shadow-xs space-y-2 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <Skeleton className="w-16 sm:w-20 h-2.5 sm:h-3" rounded="sm" />
        <Skeleton className="w-7 h-7 sm:w-8 sm:h-8" rounded="xl" />
      </div>
      <div className="space-y-1">
        <Skeleton className="w-14 sm:w-20 h-6 sm:h-7" rounded="md" />
        <Skeleton className="w-20 sm:w-24 h-2 sm:h-2.5" rounded="sm" />
      </div>
    </div>
  );
}

/**
 * Full Admin Dashboard Skeleton
 * Matches the layout of /admin/dashboard
 * Responsive: 2 cols on mobile, 3 cols on tablet, 6 cols on desktop
 */
export function AdminDashboardSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading admin dashboard metrics..."
      className="space-y-6 sm:space-y-8"
    >
      {/* Header Skeleton */}
      <AdminHeaderSkeleton />

      {/* 6 Metric Stat Cards Grid: 2 columns on mobile (<640px), 3 on tablet, 6 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <AdminStatCardSkeleton key={idx} />
        ))}
      </div>

      {/* 2-Column Insight & Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Popular Trips Section */}
        <div className="lg:col-span-2 bg-white dark:bg-secondary-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 border border-secondary-200/80 dark:border-secondary-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-secondary-100 dark:border-secondary-800 pb-3">
            <div className="space-y-1">
              <Skeleton className="w-24 h-2.5" rounded="sm" />
              <Skeleton className="w-36 h-5" rounded="md" />
            </div>
            <Skeleton className="w-28 h-3.5" rounded="sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="p-3 sm:p-3.5 rounded-2xl bg-secondary-50/70 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-800 flex items-center gap-3"
              >
                <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 shrink-0" rounded="xl" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton className="w-20 h-2.5" rounded="sm" />
                  <Skeleton className="w-4/5 h-3.5" rounded="md" />
                  <div className="flex items-center justify-between pt-1">
                    <Skeleton className="w-16 h-3" rounded="sm" />
                    <Skeleton className="w-10 h-3" rounded="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insight / Quick Action Card */}
        <div className="bg-white dark:bg-secondary-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 border border-secondary-200/80 dark:border-secondary-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="space-y-1">
              <Skeleton className="w-24 h-2.5" rounded="sm" />
              <Skeleton className="w-36 h-5" rounded="md" />
            </div>
            <div className="p-4 rounded-2xl bg-secondary-50/70 dark:bg-secondary-800/50 space-y-3 mt-2">
              <Skeleton className="w-full h-4" rounded="md" />
              <Skeleton className="w-4/5 h-4" rounded="md" />
              <Skeleton className="w-2/3 h-4" rounded="md" />
            </div>
          </div>
          <Skeleton className="w-full h-10 mt-3" rounded="2xl" />
        </div>
      </div>

      {/* Recent Bookings Table Skeleton */}
      <AdminTableSkeleton columns={7} rows={5} />
    </div>
  );
}

/**
 * Universal Responsive Admin Data Table Skeleton
 * Adapts between:
 * - Desktop (>= 768px): Full tabular view with column headers, cells, and actions
 * - Mobile (< 768px): Native stacked cards view with thumbnail, metadata grid, and actions
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
      className="bg-white dark:bg-secondary-900 rounded-2xl sm:rounded-3xl border border-secondary-200/80 dark:border-secondary-800 shadow-xs overflow-hidden"
    >
      {/* ============================================================== */}
      {/* DESKTOP VIEW (md: and above) - Full Tabular Skeleton          */}
      {/* ============================================================== */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-secondary-50 dark:bg-secondary-800/70 border-b border-secondary-100 dark:border-secondary-800">
              {Array.from({ length: columns }).map((_, cIdx) => (
                <th key={cIdx} className="py-3.5 px-4 lg:py-4 lg:px-6">
                  <Skeleton
                    className={`${cIdx === 0 ? "w-28" : cIdx === columns - 1 ? "w-14 ml-auto" : "w-20"} h-3`}
                    rounded="sm"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr
                key={rIdx}
                className="hover:bg-secondary-50/40 dark:hover:bg-secondary-800/40 transition"
              >
                {/* Column 1: Thumbnail/Avatar + Title + Subtitle */}
                <td className="py-3.5 px-4 lg:py-4 lg:px-6">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 lg:w-12 lg:h-12 shrink-0" rounded="xl" />
                    <div className="space-y-1.5 w-full min-w-0">
                      <Skeleton className="w-32 lg:w-40 h-3.5" rounded="md" />
                      <Skeleton className="w-20 lg:w-24 h-2.5" rounded="sm" />
                    </div>
                  </div>
                </td>

                {/* Remaining Mid Columns */}
                {Array.from({ length: Math.max(1, columns - 2) }).map((_, cIdx) => (
                  <td key={cIdx} className="py-3.5 px-4 lg:py-4 lg:px-6">
                    {cIdx === 0 ? (
                      <Skeleton className="w-20 lg:w-24 h-5" rounded="full" />
                    ) : cIdx === 1 ? (
                      <div className="space-y-1">
                        <Skeleton className="w-20 lg:w-28 h-3.5" rounded="md" />
                        <Skeleton className="w-14 lg:w-16 h-2.5" rounded="sm" />
                      </div>
                    ) : (
                      <Skeleton className="w-16 lg:w-24 h-3.5" rounded="md" />
                    )}
                  </td>
                ))}

                {/* Last Column: Action Buttons */}
                <td className="py-3.5 px-4 lg:py-4 lg:px-6 text-right">
                  <div className="flex items-center justify-end gap-1.5 lg:gap-2">
                    <Skeleton className="w-7 h-7 lg:w-8 lg:h-8" rounded="lg" />
                    <Skeleton className="w-7 h-7 lg:w-8 lg:h-8" rounded="lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ============================================================== */}
      {/* MOBILE VIEW (< md) - Stacked Mobile Cards Skeleton            */}
      {/* ============================================================== */}
      <div className="block md:hidden divide-y divide-secondary-100 dark:divide-secondary-800">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="p-4 space-y-3">
            {/* Top Row: Thumbnail + Title/Subtitle + Status Badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Skeleton className="w-11 h-11 shrink-0" rounded="xl" />
                <div className="space-y-1.5 min-w-0 flex-1">
                  <Skeleton className="w-4/5 h-3.5" rounded="md" />
                  <Skeleton className="w-1/2 h-2.5" rounded="sm" />
                </div>
              </div>
              <Skeleton className="w-16 h-5 shrink-0" rounded="full" />
            </div>

            {/* Mid Row: 2-Column Key/Value Grid */}
            <div className="grid grid-cols-2 gap-2.5 py-2 px-3 rounded-xl bg-secondary-50/70 dark:bg-secondary-800/40 border border-secondary-100 dark:border-secondary-800/60">
              <div className="space-y-1">
                <Skeleton className="w-12 h-2" rounded="sm" />
                <Skeleton className="w-20 h-3" rounded="md" />
              </div>
              <div className="space-y-1">
                <Skeleton className="w-12 h-2" rounded="sm" />
                <Skeleton className="w-16 h-3" rounded="md" />
              </div>
            </div>

            {/* Bottom Row: Metadata & Action Buttons */}
            <div className="flex items-center justify-between pt-1">
              <Skeleton className="w-24 h-2.5" rounded="sm" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-7 h-7" rounded="lg" />
                <Skeleton className="w-7 h-7" rounded="lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Responsive Admin Card List Skeleton
 * Matches FAQs, Contacts, and Notifications list items
 */
export function AdminCardListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading list items..."
      className="space-y-3"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-3.5 sm:p-5 md:p-6 rounded-2xl bg-secondary-50/80 dark:bg-secondary-800/60 border border-secondary-200/80 dark:border-secondary-800 space-y-3"
        >
          {/* Header row: wraps gracefully on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-secondary-200/60 dark:border-secondary-700/60">
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="w-44 sm:w-56 h-4" rounded="md" />
              <Skeleton className="w-28 sm:w-36 h-3" rounded="sm" />
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Skeleton className="w-20 h-5" rounded="full" />
              <Skeleton className="w-16 h-3" rounded="sm" />
            </div>
          </div>

          {/* Body preview */}
          <SkeletonText lines={2} lineHeight="h-3" gap="gap-1.5" widths={["96%", "75%"]} />

          {/* Footer action bar */}
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="w-24 h-2.5" rounded="sm" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-7 h-7" rounded="lg" />
              <Skeleton className="w-7 h-7" rounded="lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Responsive Admin Gallery Grid Skeleton
 * Matches /admin/gallery
 */
export function AdminGallerySkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading gallery media..."
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-4/3 bg-secondary-100 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-800"
        >
          <Skeleton className="w-full h-full" rounded="none" />
          {/* Top-right overlay action icon */}
          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5">
            <Skeleton className="w-6 h-6 sm:w-7 sm:h-7" rounded="lg" />
          </div>
          {/* Bottom tag placeholder */}
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-2.5 sm:left-2.5 flex items-center justify-between">
            <Skeleton className="w-16 sm:w-24 h-3 sm:h-3.5" rounded="sm" />
            <Skeleton className="w-10 sm:w-12 h-3 sm:h-3.5" rounded="full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Responsive Admin Form Skeleton
 * Matches create & edit forms in /admin/trips, /admin/destinations, etc.
 */
export function AdminFormSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading form..."
      className="space-y-6 pb-12"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-secondary-200 dark:border-secondary-800 pb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9" rounded="xl" />
          <Skeleton className="w-36 sm:w-52 h-6" rounded="lg" />
        </div>
        <Skeleton className="w-24 sm:w-28 h-9" rounded="xl" />
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-secondary-900 rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-secondary-200/80 dark:border-secondary-800 shadow-xs space-y-5">
        <div className="space-y-1.5">
          <Skeleton className="w-24 h-3" rounded="sm" />
          <Skeleton className="w-full h-10" rounded="xl" />
        </div>

        {/* 2-column inputs on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Skeleton className="w-20 h-3" rounded="sm" />
            <Skeleton className="w-full h-10" rounded="xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="w-20 h-3" rounded="sm" />
            <Skeleton className="w-full h-10" rounded="xl" />
          </div>
        </div>

        {/* Media Upload Area */}
        <div className="space-y-1.5">
          <Skeleton className="w-28 h-3" rounded="sm" />
          <div className="aspect-16/9 sm:aspect-21/9 w-full rounded-2xl overflow-hidden bg-secondary-100 dark:bg-secondary-800">
            <Skeleton className="w-full h-full" rounded="none" />
          </div>
        </div>

        {/* Textarea */}
        <div className="space-y-1.5">
          <Skeleton className="w-24 h-3" rounded="sm" />
          <Skeleton className="w-full h-28" rounded="2xl" />
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <Skeleton className="w-full sm:w-36 h-10" rounded="xl" />
        </div>
      </div>
    </div>
  );
}
