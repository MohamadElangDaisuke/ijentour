"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  Search,
  CheckCircle2,
  X,
  MapPin,
} from "lucide-react";
import { AdminTableSkeleton } from "@/app/component/ui/skeleton";

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadDestinations = () => {
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

  const handleDelete = async (id: string, destName: string) => {
    if (!confirm(`Hapus destinasi "${destName}"? Perubahan akan langsung tercermin di website.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/destinations/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus destinasi.");

      setDestinations((prev) => prev.filter((d) => d.id !== id));
      setSuccessMessage(`Destinasi "${destName}" berhasil dihapus.`);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      alert(err.message || "Gagal menghapus destinasi.");
    }
  };

  const filtered = destinations.filter(
    (d) =>
      d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tag?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Katalog Destinasi
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary-950 tracking-tight">
            Kelola Destinasi Wisata
          </h1>
          <p className="text-xs sm:text-sm text-secondary-600 mt-1">
            Tambah, sunting informasi, dan kelola foto destinasi yang tampil di homepage dan katalog.
          </p>
        </div>

        <Link
          href="/admin/destinations/create"
          className="px-5 py-2.5 rounded-2xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-xs transition shadow-sm inline-flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Tambah Destinasi Baru</span>
        </Link>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage("")}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-secondary-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-secondary-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama destinasi, tag..."
            className="w-full pl-10 pr-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <span className="text-xs font-bold text-secondary-500 shrink-0">
          Total: {destinations.length} Destinasi
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <AdminTableSkeleton columns={5} rows={5} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-secondary-200/80 shadow-xs overflow-hidden py-20 text-center text-xs text-secondary-500">
          Tidak ada destinasi yang ditemukan.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-secondary-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead>
                <tr className="bg-secondary-50 border-b border-secondary-100 text-[11px] font-bold text-secondary-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Foto & Nama Destinasi</th>
                  <th className="py-4 px-6">Tag / Label</th>
                  <th className="py-4 px-6">Deskripsi</th>
                  <th className="py-4 px-6 text-center">Urutan</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {filtered.map((dest) => {
                  const slug = dest.slug || dest.id.replace("dest-", "");
                  return (
                    <tr key={dest.id} className="hover:bg-secondary-50/60 transition">
                      <td className="py-4 px-6 align-middle">
                        <div className="flex items-center gap-3">
                          <img
                            src={dest.image || "/images/pkg-bluefire.png"}
                            alt={dest.name}
                            className="w-14 h-10 rounded-xl object-cover border border-secondary-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/pkg-bluefire.png";
                            }}
                          />
                          <div>
                            <p className="font-bold text-sm text-secondary-950">{dest.name}</p>
                            <span className="text-[10px] text-secondary-500 font-mono">
                              /destinations/{slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 align-middle">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary-100 text-primary-800">
                          {dest.tag || "Destinasi"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-secondary-700 font-medium max-w-sm truncate align-middle">
                        {dest.description}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-secondary-800 align-middle">
                        {dest.sortOrder ?? 0}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap align-middle">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Link
                            href={`/destinations/${slug}`}
                            target="_blank"
                            className="w-8 h-8 rounded-xl bg-secondary-100 hover:bg-secondary-200 text-secondary-700 hover:text-secondary-950 inline-flex items-center justify-center transition shrink-0"
                            title="Lihat Tampilan Publik"
                          >
                            <Eye className="w-4 h-4 shrink-0" />
                          </Link>
                          <Link
                            href={`/admin/destinations/${dest.id}`}
                            className="w-8 h-8 rounded-xl bg-primary-100 hover:bg-primary-200 text-primary-800 hover:text-primary-950 inline-flex items-center justify-center transition shrink-0"
                            title="Sunting Destinasi"
                          >
                            <Edit3 className="w-4 h-4 shrink-0" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(dest.id, dest.name)}
                            className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 inline-flex items-center justify-center transition cursor-pointer shrink-0"
                            title="Hapus Destinasi"
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
