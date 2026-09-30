"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2, AlertCircle } from "lucide-react";
import ImageUpload from "@/app/component/ui/ImageUpload";
import MultiImageUpload from "@/app/component/ui/MultiImageUpload";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditTripPage({ params }: PageProps) {
  const resolved = use(params);
  const tripId = resolved.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("regular");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [basePrice, setBasePrice] = useState(0);
  const [badge, setBadge] = useState("");
  const [image, setImage] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState("");
  const [included, setIncluded] = useState<string[]>([]);
  const [newIncluded, setNewIncluded] = useState("");
  const [excluded, setExcluded] = useState<string[]>([]);
  const [newExcluded, setNewExcluded] = useState("");

  useEffect(() => {
    fetch(`/api/trips/${tripId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.package) {
          const p = data.package;
          setTitle(p.title || "");
          setCategory(p.category || "regular");
          setDuration(p.duration || "");
          setPrice(p.price || "");
          setBasePrice(p.basePrice || 0);
          setBadge(p.badge || "");
          const mainImg = p.image || p.coverImage || "";
          setImage(mainImg);
          const rawGallery = Array.isArray(p.gallery) ? p.gallery : [];
          setGalleryImages(rawGallery.filter((g: string) => g && g !== mainImg));
          setDescription(p.description || "");
          setHighlights(Array.isArray(p.highlights) ? p.highlights : []);
          setIncluded(Array.isArray(p.included) ? p.included : []);
          setExcluded(Array.isArray(p.excluded) ? p.excluded : []);
        } else {
          setError("Paket tidak ditemukan.");
        }
      })
      .catch((e) => setError("Gagal memuat paket."))
      .finally(() => setLoading(false));
  }, [tripId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const allGallery = galleryImages.length > 0 ? (image ? [image, ...galleryImages] : galleryImages) : [image || "/images/pkg-bluefire.png"];
      const res = await fetch(`/api/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          duration,
          price,
          basePrice: Number(basePrice),
          badge,
          image: image || "/images/pkg-bluefire.png",
          gallery: allGallery,
          description,
          highlights,
          included,
          excluded,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui paket.");

      router.push("/admin/trips");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan perubahan.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-black text-secondary-950">Sunting Paket: {title}</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-secondary-800 mb-2">Judul Paket *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 mb-2">Harga Tampilan (Label)</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-sm font-bold text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 mb-2">Harga Dasar (Integer)</label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
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
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <ImageUpload
              value={image}
              onChange={(url) => setImage(url)}
              folder="trips"
              label="Foto Sampul Tur (Cover Image - Supabase)"
              required
              aspectRatio="video"
              helperText="Upload foto utama untuk kartu dan banner tur (Maks. 5 MB)."
            />

            <MultiImageUpload
              value={galleryImages}
              onChange={(urls) => setGalleryImages(urls)}
              folder="trips"
              label="Galeri Foto Tur (Multiple Upload - Supabase)"
              maxFiles={8}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary-800 mb-2">Deskripsi Lengkap Tur</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
            ></textarea>
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
            <span>{submitting ? "Menyimpan Perubahan..." : "Simpan Perubahan Paket"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
