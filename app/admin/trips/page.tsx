"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit3, Trash2, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AdminTableSkeleton } from "@/app/component/ui/skeleton";

export default function AdminTripsPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");

  const loadTrips = () => {
    fetch("/api/trips")
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
      } else {
        alert("Failed to update package publication status.");
      }
    } catch (e) {
      console.error(e);
      alert("Error toggling status.");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete package "${title}"?`)) return;

    try {
      const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPackages((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete package.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = filterCategory === "all"
    ? packages
    : packages.filter((p) => p.category === filterCategory);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Tour Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary-950 tracking-tight">
            Manage Tour Packages (Trips)
          </h1>
          <p className="text-xs sm:text-sm text-secondary-600 mt-1">
            Add, edit facilities & itinerary, publish/unpublish, or manage public tour packages.
          </p>
        </div>

        <Link
          href="/admin/trips/create"
          className="px-5 py-2.5 rounded-2xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-xs transition shadow-sm inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Package</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-secondary-200 pb-3 overflow-x-auto">
        {[
          { label: "All Categories", val: "all" },
          { label: "Midnight Expedition", val: "midnight" },
          { label: "Regular Tour", val: "regular" },
          { label: "Private Tour", val: "private" },
        ].map((tab) => (
          <button
            key={tab.val}
            onClick={() => setFilterCategory(tab.val)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterCategory === tab.val
                ? "bg-secondary-950 text-white shadow-2xs"
                : "bg-white text-secondary-700 hover:bg-secondary-100 border border-secondary-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trips Table */}
      {loading ? (
        <AdminTableSkeleton columns={7} rows={5} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-secondary-200/80 shadow-xs overflow-hidden py-20 text-center text-xs text-secondary-500">
          No tour packages found in this category.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-secondary-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-secondary-50 border-b border-secondary-100 text-[11px] font-bold text-secondary-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Photo & Package Name</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Duration</th>
                  <th className="py-4 px-6">Base Price</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {filtered.map((pkg) => {
                  const isPublished = pkg.isActive !== false;
                  return (
                    <tr key={pkg.id} className="hover:bg-secondary-50/60 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={pkg.image || pkg.coverImage || "/images/pkg-bluefire.png"}
                            alt={pkg.title}
                            className="w-14 h-10 rounded-xl object-cover border border-secondary-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-sm text-secondary-950">{pkg.title}</p>
                            <span className="text-[10px] text-secondary-500 font-mono">
                              ID: {pkg.id} • {pkg.badge || "Standard"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary-100 text-secondary-800 capitalize">
                          {pkg.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-secondary-700 font-medium">
                        {pkg.duration}
                      </td>
                      <td className="py-4 px-6 font-black text-primary-600 text-sm">
                        {pkg.price || formatCurrency(pkg.basePrice)}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(pkg.id, isPublished)}
                          title={isPublished ? "Click to Unpublish from Website & Chatbot" : "Click to Publish to Website & Chatbot"}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                            isPublished
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-emerald-500" : "bg-amber-500"}`} />
                          <span>{isPublished ? "Published" : "Unpublished"}</span>
                        </button>
                      </td>
                      <td className="py-4 px-6 font-bold text-secondary-800">
                        ★ {(pkg.rating || 5.0).toFixed(1)}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          href={`/packages/${pkg.id}`}
                          target="_blank"
                          className="p-2 rounded-xl bg-secondary-100 hover:bg-secondary-200 text-secondary-800 inline-block transition"
                          title="View Public Page"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/trips/${pkg.id}`}
                          className="p-2 rounded-xl bg-primary-100 hover:bg-primary-200 text-primary-800 inline-block transition"
                          title="Edit Package"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(pkg.id, pkg.title)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                          title="Delete Package"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
