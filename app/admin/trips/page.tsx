"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Compass,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  LayoutGrid,
  List,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AdminTableSkeleton } from "@/app/component/ui/skeleton";
import AdminBadge from "@/app/component/admin/AdminBadge";
import AdminPageHeader from "@/app/component/admin/AdminPageHeader";
import AdminStatsCard from "@/app/component/admin/AdminStatsCard";

export default function AdminTripsPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & display
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [toastMessage, setToastMessage] = useState("");

  const loadTrips = () => {
    setLoading(true);
    fetch("/api/trips?includeInactive=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPackages(data.packages || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/trips/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setPackages((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive: !currentStatus } : p))
        );
        showToast(!currentStatus ? "Tour package published live!" : "Package moved to draft.");
      } else {
        alert("Failed to update status.");
      }
    } catch (e) {
      console.error(e);
      alert("Error occurred.");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete tour package "${title}"?`)) return;

    try {
      const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete package.");

      setPackages((prev) => prev.filter((p) => p.id !== id));
      showToast(`Package "${title}" deleted successfully.`);
    } catch (err: any) {
      alert(err.message || "Failed to delete package.");
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const active = packages.filter((p) => p.isActive !== false).length;
    const drafts = packages.filter((p) => p.isActive === false).length;
    const categories = new Set(packages.map((p) => p.category)).size;
    return { total: packages.length, active, drafts, categories };
  }, [packages]);

  // Unique categories list
  const categoriesList = useMemo(() => {
    return Array.from(new Set(packages.map((p) => p.category || "general")));
  }, [packages]);

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter((p) => {
      if (categoryFilter !== "ALL" && p.category !== categoryFilter) return false;
      if (statusFilter === "ACTIVE" && p.isActive === false) return false;
      if (statusFilter === "DRAFT" && p.isActive !== false) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (p.title || "").toLowerCase().includes(q);
        const matchesDesc = (p.description || "").toLowerCase().includes(q);
        const matchesCat = (p.category || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }, [packages, categoryFilter, statusFilter, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminTableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <AdminPageHeader
        title="Tour Packages Management"
        description="Create, edit, and organize all official Mount Ijen Tour expedition packages."
        badge={`${metrics.total} Packages`}
        breadcrumbs={[{ label: "Tour Packages" }]}
        actions={
          <Link
            href="/admin/trips/create"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Package</span>
          </Link>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <AdminStatsCard
          label="Total Packages"
          value={metrics.total}
          icon={<Compass className="w-4 h-4" />}
          subtitle="All itineraries in catalog"
          theme="slate"
        />
        <AdminStatsCard
          label="Live Published"
          value={metrics.active}
          icon={<CheckCircle2 className="w-4 h-4" />}
          subtitle="Visible on website"
          theme="emerald"
        />
        <AdminStatsCard
          label="Draft Packages"
          value={metrics.drafts}
          icon={<Clock className="w-4 h-4" />}
          subtitle="Hidden from public"
          theme="amber"
        />
        <AdminStatsCard
          label="Package Categories"
          value={metrics.categories}
          icon={<Layers className="w-4 h-4" />}
          subtitle="Trekking & overland"
          theme="teal"
        />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search package name, highlights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-amber-500 transition cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-amber-500 transition cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Published Only</option>
            <option value="DRAFT">Drafts Only</option>
          </select>

          {/* Grid / Table Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-700 text-amber-500 shadow-xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-700 text-amber-500 shadow-xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Package Content: Grid or Table */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image cover */}
                <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={pkg.coverImage || pkg.image || "/images/pkg-bluefire.png"}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white">
                      {pkg.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      onClick={() => handleToggleActive(pkg.id, pkg.isActive !== false)}
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm cursor-pointer transition ${
                        pkg.isActive !== false
                          ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                          : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                      }`}
                      title="Click to toggle publication status"
                    >
                      {pkg.isActive !== false ? "● Active" : "○ Draft"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                    <span>{pkg.duration || "1 Day"}</span>
                    {pkg.rating && (
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{pkg.rating}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
                    {pkg.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {pkg.description || "Official Mount Ijen expedition itinerary with licensed guide and transport."}
                  </p>
                </div>
              </div>

              {/* Card Footer: Price & Actions */}
              <div className="p-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Rate / Pax</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(Number(pkg.price) || 0)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/packages/${pkg.slug || pkg.id}`}
                    target="_blank"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-amber-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    title="View Public Page"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/admin/trips/${pkg.id}`}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(pkg.id, pkg.title)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    title="Delete Package"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <th className="py-3.5 pl-6">Package</th>
                  <th className="py-3.5">Category</th>
                  <th className="py-3.5">Duration</th>
                  <th className="py-3.5">Rate</th>
                  <th className="py-3.5">Rating</th>
                  <th className="py-3.5">Status</th>
                  <th className="py-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredPackages.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition"
                  >
                    <td className="py-3.5 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                          <img
                            src={pkg.coverImage || pkg.image || "/images/pkg-bluefire.png"}
                            alt={pkg.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900 dark:text-white truncate max-w-[240px]">
                            {pkg.title}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                            /{pkg.slug || pkg.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 font-bold uppercase text-[10px] text-slate-600 dark:text-slate-300">
                      {pkg.category}
                    </td>

                    <td className="py-3.5 text-slate-600 dark:text-slate-400">
                      {pkg.duration || "1 Day"}
                    </td>

                    <td className="py-3.5 font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {formatCurrency(Number(pkg.price) || 0)}
                    </td>

                    <td className="py-3.5">
                      <span className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{pkg.rating || 5.0}</span>
                      </span>
                    </td>

                    <td className="py-3.5">
                      <button
                        onClick={() => handleToggleActive(pkg.id, pkg.isActive !== false)}
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full cursor-pointer transition ${
                          pkg.isActive !== false
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200"
                        }`}
                      >
                        {pkg.isActive !== false ? "● Published" : "○ Draft"}
                      </button>
                    </td>

                    <td className="py-3.5 pr-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/packages/${pkg.slug || pkg.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-amber-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                          title="View on Public Site"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/trips/${pkg.id}`}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Edit Package"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(pkg.id, pkg.title)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Delete Package"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
