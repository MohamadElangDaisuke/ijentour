import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
}

const roundedMap = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  full: "rounded-full",
};

/**
 * Base Skeleton element with gentle shimmer sweep animation
 */
export function Skeleton({
  className = "",
  rounded = "xl",
  ...props
}: SkeletonProps) {
  const roundedClass = roundedMap[rounded] || "rounded-xl";
  return (
    <div
      aria-hidden="true"
      className={`skeleton-shimmer ${roundedClass} ${className}`}
      {...props}
    />
  );
}

/**
 * Skeleton for text lines with natural varying widths
 */
export function SkeletonText({
  lines = 3,
  className = "",
  lineHeight = "h-3.5",
  gap = "gap-2",
  widths = ["100%", "92%", "70%"],
}: {
  lines?: number;
  className?: string;
  lineHeight?: string;
  gap?: string;
  widths?: string[];
}) {
  return (
    <div className={`flex flex-col ${gap} ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => {
        const width = widths[index % widths.length];
        return (
          <Skeleton
            key={index}
            className={`${lineHeight}`}
            style={{ width }}
            rounded="md"
          />
        );
      })}
    </div>
  );
}

/**
 * Skeleton for responsive media/images with fixed or relative aspect ratio
 */
export function SkeletonImage({
  aspectRatio = "aspect-16/10",
  className = "",
  rounded = "2xl",
}: {
  aspectRatio?: string;
  className?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
}) {
  return (
    <div
      className={`relative w-full overflow-hidden ${aspectRatio} ${className}`}
      aria-hidden="true"
    >
      <Skeleton className="w-full h-full" rounded={rounded} />
    </div>
  );
}

/**
 * Skeleton for small category/status tags and pills
 */
export function SkeletonBadge({
  className = "w-20 h-5",
}: {
  className?: string;
}) {
  return <Skeleton className={className} rounded="full" />;
}

/**
 * Skeleton for button controls
 */
export function SkeletonButton({
  className = "w-28 h-9",
  rounded = "full",
}: {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
}) {
  return <Skeleton className={className} rounded={rounded} />;
}
