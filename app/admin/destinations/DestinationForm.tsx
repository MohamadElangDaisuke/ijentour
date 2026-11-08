"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Tag,
  Hash,
} from "lucide-react";
import ImageUpload from "@/app/component/ui/ImageUpload";
import { createSlug } from "@/lib/utils";

export interface DestinationFormProps {
  initialData?: any;
  mode: "create" | "edit";
  destinationId?: string;
}

export default function DestinationForm({
  initialData,
  mode,
  destinationId,
}: DestinationFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [autoSlug, setAutoSlug] = useState(mode === "create");
  const [description, setDescription] = useState(initialData?.description || "");
  const [image, setImage] = useState(initialData?.image || "");
  const [tag, setTag] = useState(initialData?.tag || "Destinasi");
  const [sortOrder, setSortOrder] = useState<number>(initialData?.sortOrder ?? 0);
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured ?? true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) {
      setSlug(createSlug(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama destinasi wajib diisi.");
      return;
    }
    if (!description.trim()) {
      setError("Deskripsi destinasi wajib diisi.");
      return;
    }
    if (!image) {
      setError("Foto cover destinasi wajib diunggah.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || createSlug(name),
        description: description.trim(),
        image: image.trim(),
        tag: tag.trim() || "Destinasi",
        sortOrder: Number(sortOrder) || 0,
        isFeatured: Boolean(isFeatured),
      };

      const url =
        mode === "create"
          ? "/api/destinations"
          : `/api/destinations/${destinationId || initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan data destinasi.");
      }

      setSuccessMessage(
        mode === "create"
          ? "Destinasi baru berhasil ditambahkan!"
          : "Perubahan destinasi berhasil disimpan!"
      );

      setTimeout(() => {
        router.push("/admin/destinations");
        router.refresh();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat memproses destinasi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-16">
      {/* PAGE HEADER: Actions & Title (In Normal Document Flow) */}
      <div className="pb-5 border-b border-secondary-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/destinations"
            className="w-10 h-10 rounded-xl border border-secondary-200 hover:bg-secondary-100 text-secondary-600 transition inline-flex items-center justify-center shrink-0"
            title="Kembali ke Daftar Destinasi"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black text-secondary-950 truncate">
              {mode === "create" ? "Tambah Destinasi Baru" : `Sunting Destinasi: ${name || "Destinasi"}`}
            </h1>
            <div className="flex items-center gap-2 text-xs text-secondary-500 font-mono truncate mt-0.5">
              <span>Slug: /destinations/{slug || "slug-destinasi"}</span>
              <span>•</span>
              <span className={`font-bold ${isFeatured ? "text-primary-600" : "text-secondary-400"}`}>
                {isFeatured ? "★ Destinasi Unggulan" : "Standar"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Link
            href="/admin/destinations"
            className="px-4 py-2.5 rounded-xl border border-secondary-200 hover:bg-secondary-100 text-secondary-700 font-bold text-xs transition inline-flex items-center justify-center"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-xs transition shadow-sm inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>{submitting ? "Menyimpan..." : mode === "create" ? "Tambah Destinasi" : "Simpan Perubahan"}</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK NOTIFICATIONS */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span className="font-semibold leading-relaxed">{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-bold leading-relaxed">{successMessage}</span>
        </div>
      )}

      {/* MAIN FORM GRID (Balanced 12-column layout with min-w-0) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Main Details (7 cols on lg, 8 cols on xl) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6 min-w-0">
          {/* Card 1: Informasi Dasar */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-secondary-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-secondary-100">
              <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-800 inline-flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 shrink-0" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-secondary-950">
                  Informasi Dasar Destinasi
                </h2>
                <p className="text-[11px] text-secondary-500">
                  Atur nama resmi tempat wisata, slug URL publik, dan label kategori.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Destination Name */}
              <div>
                <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                  Nama Destinasi Wisata *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: Kawah Ijen & Blue Fire"
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs sm:text-sm font-bold text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
                />
              </div>

              {/* Slug URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider">
                    Slug URL Unik *
                  </label>
                  <button
                    type="button"
                    onClick={() => setAutoSlug(!autoSlug)}
                    className="text-[11px] font-bold text-primary-700 hover:underline cursor-pointer"
                  >
                    {autoSlug ? "✓ Otomatis dari nama" : "Kustom manual"}
                  </button>
                </div>
                <div className="flex items-center rounded-xl bg-secondary-50 border border-secondary-200 px-3 py-2 text-xs">
                  <span className="text-secondary-400 font-mono select-none">/destinations/</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    disabled={autoSlug}
                    onChange={(e) =>
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))
                    }
                    placeholder="kawah-ijen"
                    className="w-full bg-transparent font-mono text-secondary-950 focus:outline-none px-1"
                  />
                </div>
              </div>

              {/* Tag / Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                    Label / Kategori Tag
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      placeholder="Contoh: Kawah & Vulkanik"
                      className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Kawah & Vulkanik", "Taman Nasional", "Hutan Lindung", "Pantai & Bahari", "Wisata Budaya"].map(
                      (quickTag) => (
                        <button
                          key={quickTag}
                          type="button"
                          onClick={() => setTag(quickTag)}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-secondary-100 hover:bg-secondary-200 text-secondary-700 cursor-pointer transition"
                        >
                          {quickTag}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                    Nomor Urut Tampilan
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
                  />
                  <span className="text-[10px] text-secondary-400 mt-1 block">
                    Semakin kecil angka (0, 1, 2), semakin awal destinasi tampil di katalog.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Deskripsi & Narasi */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-secondary-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-secondary-100">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 inline-flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 shrink-0" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-secondary-950">
                  Deskripsi & Cerita Destinasi
                </h2>
                <p className="text-[11px] text-secondary-500">
                  Jelaskan keindahan lanskap, daya tarik utama, dan informasi penting bagi wisatawan.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Deskripsi Lengkap Destinasi *
              </label>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tuliskan ulasan komprehensif mengenai panorama kawah, fenomena alam, akses pendakian, serta waktu terbaik berkunjung..."
                className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-xs sm:text-sm text-secondary-950 leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Media & Settings (5 cols on lg, 4 cols on xl) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6 min-w-0">
          {/* Card 3: Foto Cover Destinasi */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-secondary-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-secondary-100">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 inline-flex items-center justify-center shrink-0">
                <ImageIcon className="w-4 h-4 shrink-0" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-secondary-950">
                  Foto Dokumentasi
                </h2>
                <p className="text-[11px] text-secondary-500">
                  Unggah foto resolusi tinggi ke Supabase Storage.
                </p>
              </div>
            </div>

            <div>
              <ImageUpload
                value={image}
                onChange={(url) => setImage(url)}
                folder="destinations"
                label="Cover Image Destinasi *"
                aspectRatio="video"
                required
                helperText="Format JPG, PNG, atau WebP resolusi tinggi (Maks. 5 MB)."
              />
            </div>
          </div>

          {/* Card 4: Pengaturan & Status */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-secondary-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-secondary-100">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 inline-flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 shrink-0" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-secondary-950">
                  Pengaturan Publikasi
                </h2>
                <p className="text-[11px] text-secondary-500">
                  Visibilitas dan status sorotan di halaman depan.
                </p>
              </div>
            </div>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-secondary-200 bg-secondary-50 hover:bg-primary-50/40 cursor-pointer transition">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 mt-0.5 shrink-0"
              />
              <div>
                <span className="text-xs font-bold text-secondary-950 block">
                  Destinasi Unggulan (Featured)
                </span>
                <span className="text-[11px] text-secondary-500 leading-relaxed block mt-0.5">
                  Tampilkan destinasi ini pada grid rekomendasi utama di beranda.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 border-t border-secondary-200">
        <Link
          href="/admin/destinations"
          className="px-5 py-2.5 rounded-xl border border-secondary-200 text-secondary-700 hover:bg-secondary-100 font-bold text-xs text-center transition inline-flex items-center justify-center"
        >
          Batal & Kembali ke Daftar
        </Link>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-xs transition shadow-md inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4 shrink-0" />
          <span>
            {submitting
              ? "Menyimpan Data..."
              : mode === "create"
              ? "Tambah Destinasi Baru"
              : "Simpan Perubahan Destinasi"}
          </span>
        </button>
      </div>
    </form>
  );
}
