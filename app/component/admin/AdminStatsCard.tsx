import React from "react";

export type StatTheme = "gold" | "teal" | "emerald" | "amber" | "sky" | "purple" | "slate";

interface AdminStatsCardProps {
  label?: string;
  title?: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  theme?: StatTheme;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export default function AdminStatsCard({
  label,
  title,
  value,
  icon,
  subtitle,
  theme = "gold",
  trend,
}: AdminStatsCardProps) {
  const displayLabel = label || title || "";
  const themeClasses: Record<StatTheme, { bg: string; text: string; border: string }> = {
    gold: {
      bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
      text: "text-amber-600 dark:text-amber-400",
      border: "hover:border-amber-400/50",
    },
    teal: {
      bg: "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400",
      text: "text-teal-600 dark:text-teal-400",
      border: "hover:border-teal-400/50",
    },
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "hover:border-emerald-400/50",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",
      text: "text-amber-600 dark:text-amber-400",
      border: "hover:border-amber-400/50",
    },
    sky: {
      bg: "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400",
      text: "text-sky-600 dark:text-sky-400",
      border: "hover:border-sky-400/50",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400",
      text: "text-purple-600 dark:text-purple-400",
      border: "hover:border-purple-400/50",
    },
    slate: {
      bg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
      text: "text-slate-600 dark:text-slate-300",
      border: "hover:border-slate-400/50",
    },
  };

  const selectedTheme = themeClasses[theme] || themeClasses.gold;

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${selectedTheme.border}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
          {displayLabel}
        </span>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${selectedTheme.bg}`}
        >
          {icon}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {value}
        </p>

        <div className="flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium truncate">
              {subtitle}
            </span>
          )}
          {trend && (
            <span
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                trend.isPositive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

