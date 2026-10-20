"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { defaultStories, Story } from "@/app/lib/stories";
import ImageUpload from "@/app/component/ui/ImageUpload";
import { AdminGallerySkeleton } from "@/app/component/ui/skeleton";

export default function AdminGalleryPage() {
  const [items, setItems] = useState<Story[]>(defaultStories);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("crater");
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !image) {
      setError("Photo title and image file are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          image,
          category,
          caption: caption || title,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add photo.");

      setItems([data.item, ...items]);
      setTitle("");
      setImage("");
      setCaption("");
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this photo moment?")) return;

    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
          Media & Documentation
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-secondary-950 tracking-tight">
          Manage Moments Gallery
        </h1>
        <p className="text-xs sm:text-sm text-secondary-600 mt-1">
          Upload or update documentation photos of Mount Ijen stored directly in Supabase Storage.
        </p>
      </div>

      {/* Add New Photo Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-xs">
        <h2 className="text-base font-black text-secondary-950 uppercase tracking-wider pb-3 border-b border-secondary-100 mb-6">
          Add New Gallery Photo
        </h2>

        {error && (
          <div className="p-3.5 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAddPhoto} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary-800 mb-1.5">Photo Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Turquoise Crater Lake of Mount Ijen"
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary-800 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="blue-fire">Blue Fire</option>
                  <option value="crater">Crater Lake</option>
                  <option value="sunrise">Sunrise</option>
                  <option value="miners">Sulfur Miners</option>
                  <option value="destination">Banyuwangi Destinations</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary-800 mb-1.5">Caption / Description</label>
                <textarea
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Brief description of this adventure moment..."
                  className="w-full px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <ImageUpload
                value={image}
                onChange={(url) => setImage(url)}
                folder="gallery"
                label="Upload Photo File (Supabase Storage)"
                required
                aspectRatio="video"
                helperText="Choose a JPG, PNG, or WebP file from your device (Max 5 MB)."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? "Saving..." : "Add to Gallery"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Gallery Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-xs">
        <h2 className="text-base font-black text-secondary-950 uppercase tracking-wider pb-3 border-b border-secondary-100 mb-6">
          Active Gallery Photos ({items.length})
        </h2>

        {loading ? (
          <AdminGallerySkeleton count={8} />
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-xs text-secondary-400">
            No gallery photos added yet. Use the form above to add your first photo.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-secondary-100 border border-secondary-200 shadow-2xs"
            >
              <img
                src={item.image}
                alt={item.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/pkg-bluefire.png";
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary-950/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                <p className="text-white font-bold text-xs truncate">{item.title}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600/80 hover:bg-red-600 text-white transition cursor-pointer"
                title="Delete Photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
