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
  const [tag, setTag] = useState(initialData?.tag || "Destination");
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
      setError("Destination name is required.");
      return;
    }
    if (!description.trim()) {
      setError("Destination description is required.");
      return;
    }
    if (!image) {
      setError("Destination cover photo must be uploaded.");
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
        tag: tag.trim() || "Destination",
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
        throw new Error(data.error || "Failed to save destination data.");
      }

      setSuccessMessage(
        mode === "create"
          ? "New destination added successfully!"
          : "Destination changes saved successfully!"
      );

      setTimeout(() => {
        router.push("/admin/destinations");
        router.refresh();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while processing the destination.");
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
            title="Back to Destinations List"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black text-secondary-950 truncate">
              {mode === "create" ? "Add New Destination" : `Edit Destination: ${name || "Destination"}`}
            </h1>
            <div className="flex items-center gap-2 text-xs text-secondary-500 font-mono truncate mt-0.5">
              <span>Slug: /destinations/{slug || "destination-slug"}</span>
              <span>•</span>
              <span className={`font-bold ${isFeatured ? "text-primary-600" : "text-secondary-400"}`}>
                {isFeatured ? "★ Featured Destination" : "Standard"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Link
            href="/admin/destinations"
            className="px-4 py-2.5 rounded-xl border border-secondary-200 hover:bg-secondary-100 text-secondary-700 font-bold text-xs transition inline-flex items-center justify-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-xs transition shadow-sm inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>{submitting ? "Saving..." : mode === "create" ? "Add Destination" : "Save Changes"}</span>
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
                  Basic Destination Information
                </h2>
                <p className="text-[11px] text-secondary-500">
                  Set the official attraction name, public URL slug, and category label.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Destination Name */}
              <div>
                <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                  Tourist Destination Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Ijen Crater & Blue Fire"
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs sm:text-sm font-bold text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
                />
              </div>

              {/* Slug URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider">
                    Unique URL Slug *
                  </label>
                  <button
                    type="button"
                    onClick={() => setAutoSlug(!autoSlug)}
                    className="text-[11px] font-bold text-primary-700 hover:underline cursor-pointer"
                  >
                    {autoSlug ? "✓ Auto-generated from name" : "Custom manual"}
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
                    Category Tag / Label
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      placeholder="e.g. Crater & Volcanic"
                      className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Crater & Volcanic", "National Park", "Protected Forest", "Beach & Marine", "Cultural Heritage"].map(
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
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
                  />
                  <span className="text-[10px] text-secondary-400 mt-1 block">
                    Smaller numbers (0, 1, 2) appear earlier in the catalog.
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
                  Destination Description & Story
                </h2>
                <p className="text-[11px] text-secondary-500">
                  Describe the scenic landscape, key attractions, and important visitor information.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Full Destination Description *
              </label>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a comprehensive overview of the crater panorama, natural phenomena, hiking access, and best time to visit..."
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
                  Documentation Photo
                </h2>
                <p className="text-[11px] text-secondary-500">
                  Upload high-resolution photo to Supabase Storage.
                </p>
              </div>
            </div>

            <div>
              <ImageUpload
                value={image}
                onChange={(url) => setImage(url)}
                folder="destinations"
                label="Destination Cover Image *"
                aspectRatio="video"
                required
                helperText="High-resolution JPG, PNG, or WebP format (Max. 5 MB)."
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
                  Publication Settings
                </h2>
                <p className="text-[11px] text-secondary-500">
                  Visibility and homepage highlight status.
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
                  Featured Destination
                </span>
                <span className="text-[11px] text-secondary-500 leading-relaxed block mt-0.5">
                  Display this destination in the main recommended grid on the homepage.
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
          Cancel & Back to List
        </Link>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-xs transition shadow-md inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4 shrink-0" />
          <span>
            {submitting
              ? "Saving Data..."
              : mode === "create"
              ? "Add New Destination"
              : "Save Destination Changes"}
          </span>
        </button>
      </div>
    </form>
  );
}
