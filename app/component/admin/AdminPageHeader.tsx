import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  categoryTag?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  action?: React.ReactNode;
}

export default function AdminPageHeader({
  title,
  description,
  badge,
  categoryTag,
  breadcrumbs = [],
  actions,
  action,
}: AdminPageHeaderProps) {
  const displayBadge = badge || categoryTag;
  const displayActions = actions || action;
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
      <div className="space-y-1.5 min-w-0">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/admin/dashboard"
            className="hover:text-primary-600 transition flex items-center gap-1"
            title="Dashboard Overview"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              {bc.href ? (
                <Link
                  href={bc.href}
                  className="hover:text-primary-600 transition truncate max-w-[140px] sm:max-w-none"
                >
                  {bc.label}
                </Link>
              ) : (
                <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[140px] sm:max-w-none">
                  {bc.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Title & Tag */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          {displayBadge && (
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-500/10 text-primary-700 dark:text-primary-400 border border-primary-500/20">
              {displayBadge}
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Action buttons */}
      {displayActions && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {displayActions}
        </div>
      )}
    </div>
  );
}

