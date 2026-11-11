import React from "react";

export type AdminBadgeVariant =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "ACTIVE"
  | "DRAFT"
  | "ADMIN"
  | "STAFF"
  | "CUSTOMER"
  | "CUSTOM"
  | "PACKAGE"
  | "APPROVED"
  | "PRIMARY"
  | "DEFAULT";

interface AdminBadgeProps {
  status: string;
  label?: string;
  variant?: AdminBadgeVariant;
  size?: "sm" | "md";
  className?: string;
}

export default function AdminBadge({
  status,
  label,
  variant,
  size = "md",
  className = "",
}: AdminBadgeProps) {
  const norm = (variant || status || "").toUpperCase();

  let styles = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  let dotColor = "bg-slate-400";

  switch (norm) {
    case "CONFIRMED":
    case "APPROVED":
    case "ACTIVE":
      styles = "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
      dotColor = "bg-emerald-500";
      break;
    case "PENDING":
      styles = "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
      dotColor = "bg-amber-500 animate-pulse";
      break;
    case "COMPLETED":
      styles = "bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800";
      dotColor = "bg-sky-500";
      break;
    case "CANCELLED":
      styles = "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800";
      dotColor = "bg-rose-500";
      break;
    case "DRAFT":
      styles = "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
      dotColor = "bg-slate-400";
      break;
    case "ADMIN":
      styles = "bg-primary-50 text-primary-800 border-primary-200 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-800";
      dotColor = "bg-primary-500";
      break;
    case "CUSTOM":
      styles = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
      dotColor = "bg-purple-500";
      break;
    case "PACKAGE":
      styles = "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800";
      dotColor = "bg-teal-500";
      break;
    default:
      break;
  }

  const sizeClasses =
    size === "sm"
      ? "text-[10px] px-2 py-0.5 font-semibold"
      : "text-xs px-2.5 py-1 font-bold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide transition-colors ${styles} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="capitalize">{label || status.toLowerCase()}</span>
    </span>
  );
}

