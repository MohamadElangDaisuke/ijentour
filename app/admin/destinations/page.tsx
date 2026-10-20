"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  AlertCircle,
  Search,
  CheckCircle2,
  X,
  Save,
} from "lucide-react";
import { AdminTableSkeleton } from "@/app/component/ui/skeleton";
import ImageUpload from "@/app/component/ui/ImageUpload";

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modal State: "create" | "edit" | null
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingDest, setEditingDest] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [tag, setTag] = useState("Destinasi");
  const [sortOrder, setSortOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);

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

  const openCreateModal = () => {
    setModalMode("create");
    setEditingDest(null);
    setName("");
    setDescription("");
    setImage("");
    setTag("Destinasi");
    setSortOrder(destinations.length);
    setError("");
  };

  const openEditModal = (dest: any) => {
    setModalMode("edit");
    setEditingDest(dest);
    setName(dest.name || "");
    setDescription(dest.description || "");
    setImage(dest.image || "");
    setTag(dest.tag || "Destinasi");
    setSortOrder(dest.sortOrder || 0);
    setError("");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingDest(null);
    setError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !image) {
      setError("Nama, deskripsi, dan foto destinasi wajib diisi.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (modalMode === "create") {
        const res = await fetch("/api/destinations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, image, tag, sortOrder }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal menambahkan destinasi.");

        setDestinations((prev) => [...prev, data.destination]);
        setSuccessMessage("Destinasi baru berhasil ditambahkan!");
      } else if (modalMode === "edit" && editingDest) {
        const res = await fetch(`/api/destinations/${editingDest.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, image, tag, sortOrder }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memperbarui destinasi.");

        setDestinations((prev) =>
          prev.map((d) => (d.id === editingDest.id ? data.destination : d))
        );
        setSuccessMessage("Destinasi berhasil diperbarui!");
      }

      closeModal();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, destName: string) => {
    if (!confirm(`Hapus destinasi "${destName}"? Perubahan akan langsung tercermin di website.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/destinations/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus destinasi.");

      setDestinations((prev) => prev.filter((d) => d.id !== id));
      setSuccessMessage("Destinasi berhasil dihapus.");
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

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-2xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-xs transition shadow-sm inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Destinasi Baru</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage("")} className="text-emerald-700 hover:text-emerald-950 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-secondary-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-secondary-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
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
                      <td className="py-4 px-6">
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
                              /{slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary-100 text-primary-800">
                          {dest.tag || "Destinasi"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-secondary-700 font-medium max-w-sm truncate">
                        {dest.description}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-secondary-800">
                        {dest.sortOrder ?? 0}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <Link
                          href={`/destinations/${slug}`}
                          target="_blank"
                          className="p-2 rounded-xl bg-secondary-100 hover:bg-secondary-200 text-secondary-800 inline-block transition"
                          title="Lihat Tampilan Publik"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(dest)}
                          className="p-2 rounded-xl bg-primary-100 hover:bg-primary-200 text-primary-800 inline-block transition cursor-pointer"
                          title="Sunting Destinasi"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dest.id, dest.name)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                          title="Hapus Destinasi"
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

      {/* CREATE / EDIT MODAL */}
      {modalMode && (
        <div
          className="fixed inset-0 z-50 bg-secondary-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-secondary-200 shadow-2xl relative my-8 text-secondary-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-secondary-100 mb-6">
              <h2 className="text-xl font-black text-secondary-950">
                {modalMode === "create" ? "Tambah Destinasi Baru" : `Sunting Destinasi: ${editingDest?.name}`}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-secondary-100 text-secondary-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                    Nama Destinasi *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Kawah Ijen Blue Fire"
                    className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                    Label / Tag
                  </label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="Contoh: Gunung Berapi / Hutan Magis"
                    className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                  Deskripsi Destinasi *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsikan keindahan dan daya tarik destinasi ini..."
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <ImageUpload
                  value={image}
                  onChange={(url) => setImage(url)}
                  folder="destinations"
                  label="Foto Destinasi (Supabase Storage) *"
                  required
                  aspectRatio="video"
                  helperText="Upload foto lanskap destinasi (Maks. 5 MB)."
                />
              </div>

              <div className="w-32">
                <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                  Urutan Tampil (Sort Order)
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-secondary-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl border border-secondary-200 bg-white hover:bg-secondary-100 text-secondary-700 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? "Menyimpan..." : "Simpan Destinasi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
