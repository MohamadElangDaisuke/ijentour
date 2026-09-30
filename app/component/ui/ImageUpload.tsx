"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2, Image as ImageIcon, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: "trips" | "gallery" | "blog" | "destinations" | "avatars" | "general";
  label?: string;
  required?: boolean;
  aspectRatio?: "video" | "square" | "wide";
  helperText?: string;
}

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export default function ImageUpload({
  value,
  onChange,
  folder = "general",
  label = "Upload Foto",
  required = false,
  aspectRatio = "video",
  helperText = "Format JPG, PNG, atau WebP. Maksimum 5 MB.",
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return "Format gambar tidak didukung. Harap gunakan format JPG, JPEG, PNG, atau WebP.";
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File terlalu besar (${(file.size / (1024 * 1024)).toFixed(1)} MB). Batas maksimum adalah ${MAX_SIZE_MB} MB.`;
    }
    return null;
  };

  const handleFileUpload = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengunggah gambar ke server.");
      }

      onChange(data.url);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || "Terjadi kesalahan saat mengunggah gambar. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setErrorMessage(null);
  };

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "wide"
      ? "aspect-21/9"
      : "aspect-16/9";

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-secondary-800">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {value && !isUploading && (
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan
          </span>
        )}
      </div>

      {/* Upload Zone / Preview Card */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative overflow-hidden rounded-2xl border-2 transition-all cursor-pointer ${aspectClass} ${
          isDragging
            ? "border-primary-500 bg-primary-50/50 scale-[0.99]"
            : value
            ? "border-secondary-200 bg-secondary-900"
            : "border-dashed border-secondary-300 bg-secondary-50/60 hover:border-primary-500 hover:bg-primary-50/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {value ? (
          /* Preview state */
          <div className="relative w-full h-full">
            <img
              src={value}
              alt="Preview foto yang diunggah"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-secondary-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-3.5 py-2 rounded-xl bg-white/90 hover:bg-white text-secondary-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-primary-600" /> Ganti Foto
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition"
              >
                <X className="w-3.5 h-3.5" /> Hapus
              </button>
            </div>
          </div>
        ) : (
          /* Empty / Upload Prompt State */
          <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center">
            <div
              className={`p-3.5 rounded-2xl mb-3 transition-colors ${
                isDragging ? "bg-primary-500 text-secondary-950" : "bg-white text-primary-600 shadow-sm border border-secondary-200"
              }`}
            >
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-secondary-900 mb-1">
              {isDragging ? "Lepaskan file di sini" : "Klik untuk memilih file atau tarik ke sini"}
            </p>
            <p className="text-[11px] text-secondary-500 max-w-xs">{helperText}</p>
          </div>
        )}

        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-secondary-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400 mb-2" />
            <p className="text-xs font-bold tracking-wide">Mengunggah ke Supabase Storage...</p>
            <span className="text-[10px] text-secondary-300 mt-1">Mohon tunggu sebentar</span>
          </div>
        )}
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
