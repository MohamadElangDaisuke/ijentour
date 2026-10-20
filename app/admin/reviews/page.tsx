"use client";

import { useState, useEffect } from "react";
import {
  Star,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Search,
  X,
  Save,
} from "lucide-react";
import ImageUpload from "@/app/component/ui/ImageUpload";
import { AdminTableSkeleton } from "@/app/component/ui/skeleton";
import { safeJsonParse } from "@/lib/utils";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "APPROVED" | "PENDING">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modal State
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isApproved, setIsApproved] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = () => {
    fetch("/api/reviews?all=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.reviews) {
          setReviews(data.reviews);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setEditingReview(null);
    setAuthorName("");
    setRating(5);
    setComment("");
    setPhotoUrl("");
    setIsApproved(true);
    setError("");
  };

  const openEditModal = (rev: any) => {
    setModalMode("edit");
    setEditingReview(rev);
    setAuthorName(rev.authorName || "");
    setRating(rev.rating || 5);
    setComment(rev.comment || "");
    const photos = safeJsonParse<string[]>(rev.photoUrls, []);
    setPhotoUrl(photos[0] || "");
    setIsApproved(rev.isApproved ?? true);
    setError("");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingReview(null);
    setError("");
  };

  const handleToggleApprove = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !currentStatus }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isApproved: !currentStatus } : r))
        );
        setSuccessMessage(`Status ulasan berhasil diubah menjadi ${!currentStatus ? "Aktif (Disetujui)" : "Tertunda"}.`);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) {
      setError("Nama pembuat ulasan dan komentar wajib diisi.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (modalMode === "create") {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authorName,
            rating,
            comment,
            photoUrls: photoUrl ? [photoUrl] : [],
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal menambahkan ulasan.");

        setReviews((prev) => [data.review, ...prev]);
        setSuccessMessage("Ulasan berhasil ditambahkan!");
      } else if (modalMode === "edit" && editingReview) {
        const res = await fetch(`/api/reviews/${editingReview.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authorName,
            rating,
            comment,
            photoUrls: photoUrl ? [photoUrl] : [],
            isApproved,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memperbarui ulasan.");

        setReviews((prev) =>
          prev.map((r) => (r.id === editingReview.id ? data.review : r))
        );
        setSuccessMessage("Ulasan berhasil diperbarui!");
      }

      closeModal();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, author: string) => {
    if (!confirm(`Hapus ulasan dari "${author}"?`)) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        setSuccessMessage("Ulasan berhasil dihapus.");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = reviews.filter((r) => {
    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "APPROVED" && r.isApproved) ||
      (filterStatus === "PENDING" && !r.isApproved);
    const matchesSearch =
      r.authorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Ulasan & Testimoni
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary-950 tracking-tight">
            Kelola Ulasan Wisatawan
          </h1>
          <p className="text-xs sm:text-sm text-secondary-600 mt-1">
            Moderasi, publikasikan ulasan, dan tambahkan testimoni traveler yang tampil di halaman depan.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-2xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-xs transition shadow-sm inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Ulasan Baru</span>
        </button>
      </div>

      {/* Success Notification */}
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

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-secondary-200 shadow-xs">
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "Semua", val: "ALL" },
            { label: "Disetujui / Tampil", val: "APPROVED" },
            { label: "Menunggu Moderasi", val: "PENDING" },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setFilterStatus(tab.val as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterStatus === tab.val
                  ? "bg-secondary-950 text-white shadow-2xs"
                  : "bg-secondary-50 text-secondary-700 hover:bg-secondary-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-secondary-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau isi ulasan..."
            className="w-full pl-10 pr-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <AdminTableSkeleton columns={5} rows={5} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-secondary-200/80 shadow-xs overflow-hidden py-20 text-center text-xs text-secondary-500">
          Tidak ada ulasan pada kategori ini.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-secondary-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-secondary-50 border-b border-secondary-100 text-[11px] font-bold text-secondary-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Wisatawan</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Komentar / Ulasan</th>
                  <th className="py-4 px-6 text-center">Status Publikasi</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {filtered.map((rev) => {
                  const photos = safeJsonParse<string[]>(rev.photoUrls, []);
                  const avatar = photos[0];
                  return (
                    <tr key={rev.id} className="hover:bg-secondary-50/60 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={rev.authorName}
                              className="w-10 h-10 rounded-full object-cover border border-secondary-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-800 font-black flex items-center justify-center shrink-0 text-xs">
                              {rev.authorName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-sm text-secondary-950">{rev.authorName}</p>
                            <span className="text-[10px] text-secondary-400">
                              {new Date(rev.createdAt).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center text-amber-500 gap-1 font-bold">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span>{rev.rating}.0</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-secondary-700 leading-relaxed max-w-md">
                        <p className="line-clamp-2">"{rev.comment}"</p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleToggleApprove(rev.id, rev.isApproved)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                            rev.isApproved
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          }`}
                          title="Klik untuk mengubah status publikasi"
                        >
                          {rev.isApproved ? "✓ Disetujui" : "⏳ Menunggu"}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(rev)}
                          className="p-2 rounded-xl bg-primary-100 hover:bg-primary-200 text-primary-800 inline-block transition cursor-pointer"
                          title="Sunting Ulasan"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rev.id, rev.authorName)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                          title="Hapus Ulasan"
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
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-secondary-200 shadow-2xl relative my-8 text-secondary-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-secondary-100 mb-6">
              <h2 className="text-xl font-black text-secondary-950">
                {modalMode === "create" ? "Tambah Ulasan Baru" : "Sunting Ulasan"}
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
              <div>
                <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                  Nama Wisatawan *
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Contoh: Sarah Jenkins / Budi Santoso"
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                  Rating Bintang (1 - 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-secondary-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-secondary-600 ml-2">
                    {rating} dari 5 Bintang
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                  Komentar / Pengalaman Wisata *
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tuliskan ulasan autentik mengenai pemandu, armada, dan pemandangan..."
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <ImageUpload
                  value={photoUrl}
                  onChange={(url) => setPhotoUrl(url)}
                  folder="avatars"
                  label="Foto Wisatawan (Opsional)"
                  aspectRatio="square"
                  helperText="Upload foto profil wisatawan atau avatar (Maks. 5 MB)."
                />
              </div>

              {modalMode === "edit" && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isApproved"
                    checked={isApproved}
                    onChange={(e) => setIsApproved(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="isApproved" className="text-xs font-bold text-secondary-800 cursor-pointer">
                    Publikasikan ulasan ini di homepage (Status Disetujui)
                  </label>
                </div>
              )}

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
                  <span>{submitting ? "Menyimpan..." : "Simpan Ulasan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
