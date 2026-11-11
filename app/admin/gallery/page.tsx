"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Layers,
  Search,
  ExternalLink,
  Copy,
  Check,
  Maximize2,
  X,
  UploadCloud,
} from "lucide-react";
import ImageUpload from "@/app/component/ui/ImageUpload";
import { AdminGallerySkeleton } from "@/app/component/ui/skeleton";
import AdminPageHeader from "@/app/component/admin/AdminPageHeader";
import AdminStatsCard from "@/app/component/admin/AdminStatsCard";
import AdminDrawer from "@/app/component/admin/AdminDrawer";

interface GalleryItem {
  id: string;
  title: string;
  image: string;
  category: string;
  caption?: string;
  createdAt?: string;
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("crater");
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Filters & Preview
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [previewPhoto, setPreviewPhoto] = useState<GalleryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadGallery = () => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items) {
          setItems(data.items);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleCopyUrl = (item: GalleryItem) => {
    navigator.clipboard.writeText(item.image);
    setCopiedId(item.id);
    showToast("Image URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !image.trim()) {
      setError("Photo title and image are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          image: image.trim(),
          category: category.trim(),
          caption: caption.trim() || title.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add photo.");

      setIsUploadOpen(false);
      setTitle("");
      setImage("");
      setCaption("");
      showToast(`Photo "${title}" published to gallery!`);
      loadGallery();
    } catch (err: any) {
      setError(err.message || "Failed to add photo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, photoTitle: string) => {
    if (!confirm(`Are you sure you want to delete photo "${photoTitle}"?`)) return;

    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete photo.");

      setItems((prev) => prev.filter((i) => i.id !== id));
      if (previewPhoto?.id === id) setPreviewPhoto(null);
      showToast(`Photo "${photoTitle}" deleted.`);
    } catch (err: any) {
      alert(err.message || "Failed to delete photo.");
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const categories = new Set(items.map((i) => i.category || "crater")).size;
    return { total: items.length, categories };
  }, [items]);

  // Unique categories
  const categoriesList = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.category || "crater")));
  }, [items]);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    return items.filter((i) => {
      if (categoryFilter !== "ALL" && (i.category || "crater") !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (i.title || "").toLowerCase().includes(q);
        const matchesCaption = (i.caption || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesCaption) return false;
      }
      return true;
    });
  }, [items, categoryFilter, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminGallerySkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <AdminPageHeader
        title="Photo Gallery & Visual Media"
        description="Curate high-resolution photography of Mount Ijen Crater, Blue Fire expeditions, and traveler moments."
        badge={`${metrics.total} Photos`}
        breadcrumbs={[{ label: "Gallery" }]}
        actions={
          <button
            onClick={() => {
              setError("");
              setIsUploadOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Photo</span>
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <AdminStatsCard
          label="Total Photos"
          value={metrics.total}
          icon={<ImageIcon className="w-4 h-4" />}
          subtitle="Public gallery assets"
          theme="slate"
        />
        <AdminStatsCard
          label="Categories"
          value={metrics.categories}
          icon={<Layers className="w-4 h-4" />}
          subtitle="Crater, Blue Fire, culture"
          theme="teal"
        />
        <AdminStatsCard
          label="Storage System"
          value="WebP / Cloud"
          icon={<UploadCloud className="w-4 h-4" />}
          subtitle="Sharp automated compression"
          theme="emerald"
        />
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search photo title, caption..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center gap-2.5">
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
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredPhotos.map((item) => (
          <div
            key={item.id}
            className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image Preview with Hover Actions */}
              <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute top-2.5 left-2.5">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white">
                    {item.category}
                  </span>
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPreviewPhoto(item)}
                    className="p-2 rounded-xl bg-white/90 text-slate-900 hover:bg-white transition cursor-pointer"
                    title="Zoom preview"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopyUrl(item)}
                    className="p-2 rounded-xl bg-white/90 text-slate-900 hover:bg-white transition cursor-pointer"
                    title="Copy direct image URL"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Title & Caption */}
              <div className="p-4 space-y-1">
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                  {item.title}
                </h4>
                {item.caption && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.caption}
                  </p>
                )}
              </div>
            </div>

            {/* Delete button */}
            <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400 font-mono">
                {item.id.substring(0, 8)}
              </span>
              <button
                onClick={() => handleDelete(item.id, item.title)}
                className="text-slate-400 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer font-bold text-[11px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Drawer */}
      <AdminDrawer
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload New Gallery Photo"
        subtitle="Optimized with Sharp and stored securely in Supabase Storage."
        width="md"
        footer={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddPhoto}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition disabled:opacity-50"
            >
              {submitting ? "Uploading..." : "Publish Photo"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleAddPhoto} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
              {error}
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
              Select Photo Image *
            </label>
            <ImageUpload
              value={image}
              onChange={(url) => setImage(url)}
              folder="gallery"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
              Photo Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Majestic Dawn at Ijen Crater Rim"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="crater">Crater & Volcano Views</option>
              <option value="bluefire">Electric Blue Fire</option>
              <option value="hikers">Travelers & Trekkers</option>
              <option value="sunrise">Golden Sunrise Vistas</option>
              <option value="culture">Sulfur Mining & Culture</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
              Short Description / Caption
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Optional caption explaining vantage point or expedition..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </form>
      </AdminDrawer>

      {/* Lightbox Preview Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="max-w-3xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/10] bg-black">
              <img
                src={previewPhoto.image}
                alt={previewPhoto.title}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/70 text-white hover:bg-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">
                  {previewPhoto.category}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {previewPhoto.title}
                </h3>
                {previewPhoto.caption && (
                  <p className="text-xs text-slate-500 mt-1">{previewPhoto.caption}</p>
                )}
              </div>
              <button
                onClick={() => handleCopyUrl(previewPhoto)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-amber-500" />
                <span>Copy URL</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
