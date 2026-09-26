"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2, Sparkles, AlertCircle } from "lucide-react";

export default function CreateTripPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("regular");
  const [duration, setDuration] = useState("1 Hari");
  const [price, setPrice] = useState("Rp 750.000");
  const [basePrice, setBasePrice] = useState(750000);
  const [rating, setRating] = useState(5.0);
  const [badge, setBadge] = useState("Paket Rekomendasi");
  const [image, setImage] = useState("/images/pkg-bluefire.png");
  const [description, setDescription] = useState("");

  const [highlights, setHighlights] = useState<string[]>([
    "Pemandu Lokal Berlisensi",
    "Tiket Masuk Resmi & Asuransi",
    "Peralatan Masker Respirator Lengkap"
  ]);
  const [newHighlight, setNewHighlight] = useState("");

  const [included, setIncluded] = useState<string[]>([
    "Transportasi AC PP",
    "Guide Lokal",
    "Air Mineral"
  ]);
  const [newIncluded, setNewIncluded] = useState("");

  const [excluded, setExcluded] = useState<string[]>([
    "Pengeluaran Pribadi",
    "Tip Sukarela"
  ]);
  const [newExcluded, setNewExcluded] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addHighlightItem = () => {
    if (newHighlight.trim()) {
      setHighlights([...highlights, newHighlight.trim()]);
      setNewHighlight("");
    }
  };

  const removeHighlightItem = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const addIncludedItem = () => {
    if (newIncluded.trim()) {
      setIncluded([...included, newIncluded.trim()]);
      setNewIncluded("");
    }
  };

  const removeIncludedItem = (index: number) => {
    setIncluded(included.filter((_, i) => i !== index));
  };

  const addExcludedItem = () => {
    if (newExcluded.trim()) {
      setExcluded([...excluded, newExcluded.trim()]);
      setNewExcluded("");
    }
  };

  const removeExcludedItem = (index: number) => {
    setExcluded(excluded.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Judul paket wisata wajib diisi.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          duration,
          price,
          basePrice: Number(basePrice),
          rating: Number(rating),
          badge,
          image,
          description,
          highlights,
          included,
          excluded,
          itinerary: [
            { day: "Hari 1", title: "Keberangkatan & Persiapan", desc: "Briefing keselamatan dan perjalanan ke basecamp." },
            { day: "Hari 2", title: "Pendakian Puncak & Kawah", desc: "Menyaksikan keindahan kawah dan fajar menyingsing." }
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat paket tur.");
      }

      router.push("/admin/trips");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between border-b border-secondary-200 pb-4">
        <div>
          <Link
            href="/admin/trips"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary-600 hover:text-primary-600 mb-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Paket</span>
          </Link>
          <h1 className="text-2xl font-black text-secondary-950">Tambah Paket Wisata Baru</h1>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-xs space-y-6">
          <h2 className="text-base font-black text-secondary-950 uppercase tracking-wider pb-3 border-b border-secondary-100">
            1. Informasi Dasar Paket
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-secondary-800 mb-2">Judul Paket *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Midnight Expedition Blue Fire Ijen"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-sm font-bold text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 mb-2">Kategori Tur</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-sm font-bold text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="regular">Regular / Open Tour</option>
                <option value="midnight">Midnight Expedition (Blue Fire)</option>
                <option value="private">Private VIP Tour</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-secondary-800 mb-2">Durasi Paket</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Contoh: 1 Hari (Midnight)"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 mb-2">Harga Tampilan (Label)</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Rp 750.000"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-sm font-bold text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 mb-2">Harga Dasar (Angka Integer)</label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                placeholder="750000"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-secondary-800 mb-2">Badge Promosi</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Contoh: Best Seller / Paling Laris"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 mb-2">URL Foto Sampul</label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/images/pkg-bluefire.png"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary-800 mb-2">Deskripsi Lengkap Tur</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan daya tarik, suasana, dan fasilitas petualangan..."
              className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
            ></textarea>
          </div>
        </div>

        {/* Dynamic Highlights & Facilities */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-xs space-y-6">
          <h2 className="text-base font-black text-secondary-950 uppercase tracking-wider pb-3 border-b border-secondary-100">
            2. Keunggulan & Fasilitas
          </h2>

          {/* Highlights */}
          <div>
            <label className="block text-xs font-bold text-secondary-800 mb-2">Keunggulan Utama (Highlights)</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                placeholder="Tambah keunggulan..."
                className="grow px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={addHighlightItem}
                className="px-4 py-2 bg-secondary-950 text-white rounded-xl text-xs font-bold hover:bg-primary-500 hover:text-secondary-950 transition cursor-pointer"
              >
                + Tambah
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {highlights.map((h, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-100 text-secondary-800 rounded-full text-xs font-medium">
                  {h}
                  <button type="button" onClick={() => removeHighlightItem(i)} className="text-red-500 hover:text-red-700">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Included Items */}
          <div>
            <label className="block text-xs font-bold text-secondary-800 mb-2">Fasilitas Termasuk (Included)</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newIncluded}
                onChange={(e) => setNewIncluded(e.target.value)}
                placeholder="Contoh: Tiket Masuk BKSDA, Masker Gas..."
                className="grow px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={addIncludedItem}
                className="px-4 py-2 bg-secondary-950 text-white rounded-xl text-xs font-bold hover:bg-primary-500 hover:text-secondary-950 transition cursor-pointer"
              >
                + Tambah
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {included.map((inc, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-medium">
                  ✓ {inc}
                  <button type="button" onClick={() => removeIncludedItem(i)} className="text-red-500 hover:text-red-700">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Excluded Items */}
          <div>
            <label className="block text-xs font-bold text-secondary-800 mb-2">Tidak Termasuk (Excluded)</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newExcluded}
                onChange={(e) => setNewExcluded(e.target.value)}
                placeholder="Contoh: Pengeluaran pribadi..."
                className="grow px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={addExcludedItem}
                className="px-4 py-2 bg-secondary-950 text-white rounded-xl text-xs font-bold hover:bg-primary-500 hover:text-secondary-950 transition cursor-pointer"
              >
                + Tambah
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {excluded.map((exc, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 text-red-800 rounded-full text-xs font-medium">
                  ✗ {exc}
                  <button type="button" onClick={() => removeExcludedItem(i)} className="text-red-500 hover:text-red-700">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/trips"
            className="px-6 py-3 rounded-2xl bg-secondary-100 hover:bg-secondary-200 text-secondary-800 font-bold text-xs transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-2xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-sm transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Menyimpan ke Database..." : "Simpan & Publikasikan Paket"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
