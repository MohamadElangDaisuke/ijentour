"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Plus, Image as ImageIcon, AlertCircle } from "lucide-react";

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: "trips" | "gallery" | "blog" | "destinations" | "general";
  label?: string;
  maxFiles?: number;
}

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export default function MultiImageUpload({
  value = [],
  onChange,
  folder = "trips",
  label = "Galeri Foto Tambahan",
  maxFiles = 8,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    if (value.length + fileArray.length > maxFiles) {
      setErrorMessage(`Batas maksimum adalah ${maxFiles} foto galeri.`);
      return;
    }

    // Validate all files
    for (const f of fileArray) {
      if (!ALLOWED_TYPES.includes(f.type.toLowerCase())) {
        setErrorMessage("Format gambar tidak didukung. Harap gunakan format JPG, JPEG, PNG, atau WebP.");
        return;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setErrorMessage(`File ${f.name} terlalu besar (maksimal ${MAX_SIZE_MB} MB).`);
        return;
      }
    }

    setErrorMessage(null);
    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of fileArray) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.success) {
          uploadedUrls.push(data.url);
        } else {
          throw new Error(data.error || "Gagal mengunggah beberapa gambar.");
        }
      }

      onChange([...value, ...uploadedUrls]);
    } catch (err: any) {
      console.error("Multi upload error:", err);
      setErrorMessage(err.message || "Gagal mengunggah foto. Silakan periksa koneksi dan coba lagi.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (indexToRemove: number) => {
    const updated = value.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-secondary-800">
          {label} ({value.length}/{maxFiles})
        </label>
        {value.length > 0 && (
          <span className="text-[11px] text-secondary-500 font-medium">
            {value.length} foto terpilih
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Uploaded Thumbnails */}
        {value.map((url, idx) => (
          <div
            key={idx}
            className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-secondary-100 border border-secondary-200"
          >
            <img
              src={url}
              alt={`Galeri ${idx + 1}`}
              className="w-full h-full object-cover transition group-hover:scale-105"
            />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-secondary-950/70 hover:bg-red-600 text-white transition shadow-sm"
              title="Hapus foto ini"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Add more trigger button */}
        {value.length < maxFiles && (
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className="rounded-2xl border-2 border-dashed border-secondary-300 hover:border-primary-500 bg-secondary-50/60 hover:bg-primary-50/30 flex flex-col items-center justify-center aspect-4/3 cursor-pointer transition p-3 text-center"
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary-500 mb-1" />
            ) : (
              <div className="p-2 rounded-xl bg-white border border-secondary-200 text-secondary-700 mb-1">
                <Plus className="w-4 h-4" />
              </div>
            )}
            <span className="text-[11px] font-bold text-secondary-800">
              {isUploading ? "Mengunggah..." : "Tambah Foto"}
            </span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_TYPES.join(",")}
        onChange={(e) => e.target.files && handleFilesUpload(e.target.files)}
        className="hidden"
        disabled={isUploading}
      />

      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
