"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Search,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Star,
} from "lucide-react";
import { AdminTableSkeleton } from "@/app/component/ui/skeleton";
import AdminBadge from "@/app/component/admin/AdminBadge";
import AdminPageHeader from "@/app/component/admin/AdminPageHeader";
import AdminStatsCard from "@/app/component/admin/AdminStatsCard";

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState("");

  const loadDestinations = () => {
    setLoading(true);
    fetch("/api/destinations")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.destinations) {
          setDestinations(data.destinations);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDestinations();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete destination "${name}"? Changes reflect immediately on the public website.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/destinations/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete destination.");

      setDestinations((prev) => prev.filter((d) => d.id !== id));
      showToast(`Destination "${name}" was deleted successfully.`);
    } catch (err: any) {
      alert(err.message || "Failed to delete destination.");
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const featured = destinations.filter((d) => d.isFeatured !== false).length;
    const uniqueTags = new Set(destinations.map((d) => d.tag || "Spot")).size;
    return { total: destinations.length, featured, uniqueTags };
  }, [destinations]);

  // Tags list
  const tagsList = useMemo(() => {
    return Array.from(new Set(destinations.map((d) => d.tag || "Destination")));
  }, [destinations]);

  // Filtered list
  const filteredDestinations = useMemo(() => {
    return destinations.filter((d) => {
      if (tagFilter !== "ALL" && (d.tag || "Destination") !== tagFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (d.name || "").toLowerCase().includes(q);
        const matchesDesc = (d.description || "").toLowerCase().includes(q);
        const matchesSlug = (d.slug || "").toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesSlug) return false;
      }
      return true;
    });
  }, [destinations, tagFilter, searchQuery]);

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
        title="Destinations & Travel Highlights"
        description="Manage the natural attractions, volcanic viewpoints, national parks, and heritage destinations featured on the platform."
        badge={`${metrics.total} Spots`}
        breadcrumbs={[{ label: "Destinations" }]}
        actions={
          <Link
            href="/admin/destinations/create"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Destination</span>
          </Link>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <AdminStatsCard
          label="Total Destinations"
          value={metrics.total}
          icon={<MapPin className="w-4 h-4" />}
          subtitle="All cataloged attractions"
          theme="slate"
        />
        <AdminStatsCard
          label="Featured Highlights"
          value={metrics.featured}
          icon={<Star className="w-4 h-4" />}
          subtitle="Displayed prominently on homepage"
          theme="amber"
        />
        <AdminStatsCard
          label="Area Classifications"
          value={metrics.uniqueTags}
          icon={<Layers className="w-4 h-4" />}
          subtitle="Distinct travel spots & parks"
          theme="teal"
        />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search destination name, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-amber-500 transition cursor-pointer"
          >
            <option value="ALL">All Tags & Categories</option>
            {tagsList.map((tag) => (
              <option key={tag} value={tag}>
                Tag: {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Destinations Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredDestinations.map((dest) => (
          <div
            key={dest.id}
            className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image Preview */}
              <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={dest.image || "/images/the-best-view-of-kawah.webp"}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white">
                    {dest.tag || "Destination"}
                  </span>
                </div>
                {dest.isFeatured !== false && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 fill-slate-950" />
                      <span>Featured</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Information */}
              <div className="p-5 space-y-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 transition-colors">
                  {dest.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {dest.description || "Mount Ijen and Banyuwangi regional natural destination."}
                </p>
              </div>
            </div>

            {/* Footer with Actions */}
            <div className="p-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                /{dest.slug || dest.id}
              </span>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/destinations/${dest.slug || dest.id}`}
                  target="_blank"
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-amber-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  title="View on Public Website"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/admin/destinations/${dest.id}`}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={() => handleDelete(dest.id, dest.name)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                  title="Delete Destination"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
