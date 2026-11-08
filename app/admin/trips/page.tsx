"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit3, Trash2, Eye, Search, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AdminTableSkeleton } from "@/app/component/ui/skeleton";

export default function AdminTripsPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
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
        setToastMessage(!currentStatus ? "Paket wisata dipublikasikan ke publik." : "Paket wisata diubah menjadi Draft.");
        setTimeout(() => setToastMessage(""), 3000);
      } else {
        alert("Gagal mengubah status publikasi paket.");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi error.");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus paket "${title}"?`)) return;

    try {
      const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        if (data.softDeleted) {
          setPackages((prev) =>
            prev.map((p) => (p.id === id ? { ...p, isActive: false } : p))
          );
          setToastMessage(data.message || "Paket dinonaktifkan karena memiliki booking aktif.");
        } else {
          setPackages((prev) => prev.filter((p) => p.id !== id));
          setToastMessage("Paket wisata berhasil dihapus.");
        }
        setTimeout(() => setToastMessage(""), 4000);
      } else {
        alert(data.error || "Gagal menghapus paket.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = packages.filter((pkg) => {
    const matchesCategory = filterCategory === "all" || pkg.category === filterCategory;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PUBLISHED" && pkg.isActive !== false) ||
      (statusFilter === "DRAFT" && pkg.isActive === false);
    const matchesSearch =
      searchQuery === "" ||
      pkg.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.id?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Katalog Paket Tour
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary-950 tracking-tight">
            Kelola Paket Wisata (Trips)
          </h1>
          <p className="text-xs sm:text-sm text-secondary-600 mt-1">
            Tambah, edit spesifikasi & jadwal itinerary, unggah galeri, atur add-on, dan terbitkan paket ke publik.
          </p>
        </div>

        <Link
          href="/admin/trips/create"
          className="px-5 py-2.5 rounded-2xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-xs transition shadow-sm inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket Baru</span>
        </Link>
      </div>

      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-secondary-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-secondary-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama tur, slug, atau ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs font-bold text-secondary-950 focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="PUBLISHED">● Hanya Published</option>
              <option value="DRAFT">○ Hanya Draft</option>
            </select>
          </div>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex gap-2 border-t border-secondary-100 pt-3 overflow-x-auto no-scrollbar">
          {[
            { label: "Semua Kategori", val: "all" },
            { label: "Midnight Expedition", val: "midnight" },
            { label: "Regular Tour", val: "regular" },
            { label: "Private Tour", val: "private" },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setFilterCategory(tab.val)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                filterCategory === tab.val
                  ? "bg-secondary-950 text-white shadow-2xs"
                  : "bg-secondary-50 text-secondary-700 hover:bg-secondary-100 border border-secondary-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trips Table & Cards */}
      {loading ? (
        <AdminTableSkeleton columns={7} rows={4} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-secondary-200/80 shadow-xs overflow-hidden py-16 text-center text-xs text-secondary-500">
          Tidak ada paket wisata yang cocok dengan filter.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-secondary-200/80 shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="bg-secondary-50 border-b border-secondary-100 text-[11px] font-bold text-secondary-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Foto & Nama Paket</th>
                  <th className="py-4 px-4">Kategori & Tipe</th>
                  <th className="py-4 px-4">Durasi</th>
                  <th className="py-4 px-4">Harga Dasar</th>
                  <th className="py-4 px-4">Status Publikasi</th>
                  <th className="py-4 px-4">Rating</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
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
                            src={pkg.coverImage || pkg.image || "/images/pkg-bluefire.png"}
                            alt={pkg.title}
                            className="w-14 h-11 rounded-xl object-cover border border-secondary-200 shrink-0 bg-secondary-100"
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-sm text-secondary-950 truncate" title={pkg.title}>
                              {pkg.title}
                            </p>
                            <span className="text-[10px] text-secondary-500 font-mono block truncate">
                              /{pkg.slug || pkg.id} • {pkg.badge || "Standard"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary-100 text-secondary-800 capitalize">
                          {pkg.category}
                        </span>
                        <span className="block text-[10px] text-secondary-500 mt-0.5">
                          {pkg.packageType || "Open Trip"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-secondary-700 font-medium">
                        {pkg.duration}
                      </td>
                      <td className="py-4 px-4 font-black text-primary-600 text-sm whitespace-nowrap">
                        {pkg.price || formatCurrency(pkg.basePrice)}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(pkg.id, isPublished)}
                          title={isPublished ? "Klik untuk mengarsipkan (Draft)" : "Klik untuk menerbitkan (Publish)"}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                            isPublished
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-emerald-500" : "bg-amber-500"}`} />
                          <span>{isPublished ? "Published" : "Draft"}</span>
                        </button>
                      </td>
                      <td className="py-4 px-4 font-bold text-secondary-800 whitespace-nowrap">
                        ★ {(pkg.rating || 5.0).toFixed(1)}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap align-middle">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Link
                            href={`/packages/${pkg.slug || pkg.id}`}
                            target="_blank"
                            className="w-8 h-8 rounded-xl bg-secondary-100 hover:bg-secondary-200 text-secondary-700 hover:text-secondary-950 inline-flex items-center justify-center transition shrink-0"
                            title="Lihat Halaman Publik"
                          >
                            <Eye className="w-4 h-4 shrink-0" />
                          </Link>
                          <Link
                            href={`/admin/trips/${pkg.id}`}
                            className="w-8 h-8 rounded-xl bg-primary-100 hover:bg-primary-200 text-primary-800 hover:text-primary-950 inline-flex items-center justify-center transition shrink-0"
                            title="Sunting Detail Paket"
                          >
                            <Edit3 className="w-4 h-4 shrink-0" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(pkg.id, pkg.title)}
                            className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 inline-flex items-center justify-center transition cursor-pointer shrink-0"
                            title="Hapus / Nonaktifkan Paket"
                          >
                            <Trash2 className="w-4 h-4 shrink-0" />
                          </button>
                        </div>
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
