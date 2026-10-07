"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Eye,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  X,
  Save,
  Columns,
} from "lucide-react";
import { defaultArticles, Article } from "@/app/lib/articlesStorage";
import ImageUpload from "@/app/component/ui/ImageUpload";
import GeminiBlogModal from "./GeminiBlogModal";
import MarkdownRenderer from "@/app/component/ui/MarkdownRenderer";

export default function AdminBlogPage() {
  const [articles, setArticles] = useState<Article[]>(defaultArticles);
  const [loading, setLoading] = useState(true);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Panduan");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("/images/pkg-bluefire.png");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Editor View Mode: "edit" | "preview" | "split"
  const [contentViewMode, setContentViewMode] = useState<"edit" | "preview" | "split">("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // AI Modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  const handleInsertSyntax = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) {
      setContent((prev) => prev + (prev.endsWith("\n") || prev === "" ? "" : "\n") + prefix + suffix);
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = prefix + (selected || "teks") + suffix;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected ? selected.length : 4)
      );
    }, 10);
  };

  const loadArticles = () => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.articles) {
          setArticles(data.articles);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleStartEdit = (art: Article) => {
    setEditingId(art.id);
    setTitle(art.title);
    setCategory(art.category || "Panduan");
    setExcerpt(art.excerpt || "");
    setContent(art.content || "");
    setImage(art.image || "/images/pkg-bluefire.png");
    setError("");
    setSuccessMessage("");

    // Smooth scroll to form
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setCategory("Panduan");
    setExcerpt("");
    setContent("");
    setImage("/images/pkg-bluefire.png");
    setError("");
  };

  const handleDeleteArticle = async (id: string, articleTitle: string) => {
    if (!confirm(`Hapus artikel "${articleTitle}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus artikel.");

      setArticles((prev) => prev.filter((a) => a.id !== id && a.slug !== id));
      setSuccessMessage("Artikel berhasil dihapus.");
      setTimeout(() => setSuccessMessage(""), 4000);

      if (editingId === id) {
        handleCancelEdit();
      }
    } catch (err: any) {
      alert(err.message || "Gagal menghapus artikel.");
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Judul artikel wajib diisi.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      if (editingId) {
        // Edit mode (PUT)
        const res = await fetch(`/api/articles/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            category,
            excerpt,
            content,
            image,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memperbarui artikel.");

        setArticles((prev) =>
          prev.map((a) => (a.id === editingId || a.slug === editingId ? data.article : a))
        );
        setSuccessMessage("Artikel berhasil diperbarui!");
        handleCancelEdit();
      } else {
        // Create mode (POST)
        const res = await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            category,
            excerpt,
            content,
            image,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal membuat artikel.");

        setArticles([data.article, ...articles]);
        setSuccessMessage("Artikel baru berhasil dipublikasikan!");
        handleCancelEdit();
      }

      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan artikel.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyAiArticle = (data: {
    title: string;
    category: string;
    excerpt: string;
    content: string;
    slug?: string;
    readTime?: string;
  }) => {
    setTitle(data.title);
    setCategory(data.category || category);
    setExcerpt(data.excerpt);
    setContent(data.content);
    setContentViewMode("split");

    setSuccessMessage(
      "✨ Artikel dari Gemini AI berhasil dimasukkan ke form editor (Draft)! Anda dapat meninjau, mengedit teks, atau mengubah gambar sebelum memublikasikan."
    );

    // Scroll to form so admin can inspect the drafted content
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Publikasi & Edukasi
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary-950 tracking-tight">
            Kelola Artikel & Berita Wisata
          </h1>
          <p className="text-xs sm:text-sm text-secondary-600 mt-1">
            Publikasikan panduan mendaki, tips keselamatan, dan rekomendasi kuliner Banyuwangi.
          </p>
        </div>

        {/* Global AI Generator Button */}
        <button
          type="button"
          onClick={() => setIsAiModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-primary-500 hover:from-amber-400 hover:to-primary-400 text-secondary-950 font-black text-xs transition shadow-md inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>✨ Generate with Gemini</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage("")}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Article Form (Create or Edit) */}
      <div
        ref={formRef}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-xs relative"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-secondary-100 mb-6 gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-black text-secondary-950 uppercase tracking-wider">
              {editingId ? "Edit Artikel" : "Tulis Artikel Baru"}
            </h2>
            {editingId && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                Mode Edit
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-950 border border-amber-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>✨ {editingId ? "Tulis Ulang dengan AI" : "Generate with Gemini"}</span>
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3 py-1.5 rounded-xl bg-secondary-100 hover:bg-secondary-200 text-secondary-700 text-xs font-bold transition cursor-pointer"
              >
                Batal Edit
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSaveArticle} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                Judul Artikel *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: 5 Tips Melihat Api Biru Ijen dengan Aman"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary-800 mb-1.5">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Panduan">Panduan</option>
                <option value="Tips & Trik">Tips & Trik</option>
                <option value="Edukasi Ijen">Edukasi Ijen</option>
                <option value="Budaya Lokal">Budaya Lokal</option>
                <option value="Destinasi">Destinasi</option>
                <option value="Kuliner">Kuliner</option>
                {category && !["Panduan", "Tips & Trik", "Edukasi Ijen", "Budaya Lokal", "Destinasi", "Kuliner"].includes(category) && (
                  <option value={category}>{category}</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                  Ringkasan / Excerpt
                </label>
                <textarea
                  rows={4}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Ringkasan singkat 1-2 kalimat untuk preview di katalog..."
                  className="w-full px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <ImageUpload
                value={image}
                onChange={(url) => setImage(url)}
                folder="blog"
                label="Gambar Sampul Artikel (Supabase Storage)"
                required
                aspectRatio="video"
                helperText="Upload gambar utama untuk banner artikel (Maks. 5 MB)."
              />
            </div>
          </div>

          {/* Markdown Content Section with Editor & Preview */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-secondary-900">
                  Konten Artikel (Markdown)
                </label>
                <span className="px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-700 text-[10px] font-bold">
                  ## H2, ### H3, - List, 1. Step, **Bold**
                </span>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-1 bg-secondary-100/80 p-1 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setContentViewMode("edit")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    contentViewMode === "edit"
                      ? "bg-white text-secondary-950 shadow-xs"
                      : "text-secondary-600 hover:text-secondary-950"
                  }`}
                  title="Tampilkan hanya editor teks"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContentViewMode("preview")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    contentViewMode === "preview"
                      ? "bg-white text-secondary-950 shadow-xs"
                      : "text-secondary-600 hover:text-secondary-950"
                  }`}
                  title="Lihat hasil rendering artikel"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContentViewMode("split")}
                  className={`hidden sm:flex px-3 py-1 rounded-lg text-xs font-bold transition items-center gap-1.5 cursor-pointer ${
                    contentViewMode === "split"
                      ? "bg-white text-secondary-950 shadow-xs"
                      : "text-secondary-600 hover:text-secondary-950"
                  }`}
                  title="Editor dan Preview berdampingan"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Split View</span>
                </button>
              </div>
            </div>

            {/* Quick Markdown Toolbar (Only visible in edit or split mode) */}
            {contentViewMode !== "preview" && (
              <div className="flex flex-wrap items-center gap-1 p-1.5 bg-secondary-100/60 rounded-xl border border-secondary-200/60 text-xs">
                <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider px-2 hidden sm:inline">
                  Format:
                </span>
                <button
                  type="button"
                  onClick={() => handleInsertSyntax("\n## ", "\n")}
                  className="px-2 py-1 rounded-md bg-white hover:bg-secondary-200/80 text-secondary-800 text-[11px] font-bold transition cursor-pointer shadow-2xs border border-secondary-200/50"
                  title="Heading 2 (Section Utama)"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertSyntax("\n### ", "\n")}
                  className="px-2 py-1 rounded-md bg-white hover:bg-secondary-200/80 text-secondary-800 text-[11px] font-bold transition cursor-pointer shadow-2xs border border-secondary-200/50"
                  title="Heading 3 (Sub-section)"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertSyntax("**", "**")}
                  className="px-2 py-1 rounded-md bg-white hover:bg-secondary-200/80 text-secondary-800 text-[11px] font-bold transition cursor-pointer shadow-2xs border border-secondary-200/50"
                  title="Teks Tebal (Bold)"
                >
                  **B**
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertSyntax("*", "*")}
                  className="px-2 py-1 rounded-md bg-white hover:bg-secondary-200/80 text-secondary-800 text-[11px] italic font-serif transition cursor-pointer shadow-2xs border border-secondary-200/50"
                  title="Teks Miring (Italic)"
                >
                  *I*
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertSyntax("\n- ", "")}
                  className="px-2 py-1 rounded-md bg-white hover:bg-secondary-200/80 text-secondary-800 text-[11px] font-bold transition cursor-pointer shadow-2xs border border-secondary-200/50"
                  title="Bullet Point (-)"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertSyntax("\n1. ", "")}
                  className="px-2 py-1 rounded-md bg-white hover:bg-secondary-200/80 text-secondary-800 text-[11px] font-bold transition cursor-pointer shadow-2xs border border-secondary-200/50"
                  title="Numbered List (1.)"
                >
                  1. Step
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertSyntax("\n> ", "\n")}
                  className="px-2 py-1 rounded-md bg-white hover:bg-secondary-200/80 text-secondary-800 text-[11px] font-bold transition cursor-pointer shadow-2xs border border-secondary-200/50"
                  title="Kutipan / Catatan Penting"
                >
                  "Quote"
                </button>
                <div className="ml-auto pr-2 text-[11px] text-secondary-400 font-medium">
                  {content.split(/\s+/).filter(Boolean).length} kata
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div
              className={
                contentViewMode === "split"
                  ? "grid grid-cols-1 lg:grid-cols-2 gap-4"
                  : "w-full"
              }
            >
              {/* Textarea Editor */}
              {(contentViewMode === "edit" || contentViewMode === "split") && (
                <div className="flex flex-col">
                  {contentViewMode === "split" && (
                    <div className="text-[11px] font-bold uppercase tracking-wider text-secondary-500 mb-1.5 flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-secondary-600" />
                      <span>Markdown Editor</span>
                    </div>
                  )}
                  <textarea
                    ref={textareaRef}
                    rows={14}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tuliskan isi artikel lengkap di sini dengan format Markdown...&#10;&#10;Contoh:&#10;Gunung Ijen terkenal dengan keindahan kawah vulkanik dan fenomena Blue Fire.&#10;&#10;## Pesona Kawah Ijen&#10;Danau kawah memiliki warna toska yang menakjubkan...&#10;&#10;### Perlengkapan Wajib&#10;- Masker respirator gas&#10;- Jaket hangat&#10;- Sepatu tracking"
                    className="w-full flex-1 min-h-[360px] px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-2xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono leading-relaxed"
                  ></textarea>
                </div>
              )}

              {/* Rendered Markdown Preview */}
              {(contentViewMode === "preview" || contentViewMode === "split") && (
                <div className="flex flex-col">
                  {contentViewMode === "split" && (
                    <div className="text-[11px] font-bold uppercase tracking-wider text-secondary-500 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-primary-600" />
                        <span>Live Preview (Tampilan User)</span>
                      </span>
                      <span className="text-[10px] text-secondary-400 font-normal">
                        Rendering otomatis
                      </span>
                    </div>
                  )}
                  <div className="w-full flex-1 min-h-[360px] max-h-[500px] overflow-y-auto p-5 sm:p-6 bg-white border border-secondary-200 rounded-2xl shadow-2xs">
                    {content.trim() ? (
                      <MarkdownRenderer content={content} />
                    ) : (
                      <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 text-secondary-400">
                        <BookOpen className="w-8 h-8 mb-2 text-secondary-300 stroke-[1.5]" />
                        <p className="text-xs font-semibold text-secondary-600">
                          Belum ada konten untuk dipratinjau
                        </p>
                        <p className="text-[11px] text-secondary-400 mt-1 max-w-xs">
                          Ketik teks Markdown di tab Editor atau gunakan tombol{" "}
                          <strong>✨ Generate with Gemini</strong> untuk membuat artikel otomatis.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2.5 rounded-xl border border-secondary-200 bg-white hover:bg-secondary-100 text-secondary-700 font-bold text-xs transition cursor-pointer"
              >
                Batal
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {editingId ? (
                <>
                  <Save className="w-4 h-4" />
                  <span>{submitting ? "Menyimpan Perubahan..." : "Simpan Perubahan"}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{submitting ? "Memublikasikan..." : "Publikasikan Artikel"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-secondary-100 mb-6">
          <h2 className="text-base font-black text-secondary-950 uppercase tracking-wider">
            Daftar Artikel ({articles.length})
          </h2>
          <span className="text-xs text-secondary-400">
            Total {articles.length} artikel terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-secondary-100 text-[11px] font-bold text-secondary-500 uppercase tracking-wider">
                <th className="pb-3">Judul Artikel</th>
                <th className="pb-3">Kategori</th>
                <th className="pb-3">Penulis</th>
                <th className="pb-3">Tanggal</th>
                <th className="pb-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {articles.map((art) => {
                const articleSlug = art.slug || art.id;
                return (
                  <tr key={art.id} className="hover:bg-secondary-50/70 transition">
                    <td className="py-3.5 font-bold text-secondary-950 max-w-xs truncate">
                      {art.title}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-secondary-100 text-secondary-800 text-[10px] font-bold">
                        {art.category}
                      </span>
                    </td>
                    <td className="py-3.5 text-secondary-600">{art.author || "Tim Ijen"}</td>
                    <td className="py-3.5 text-secondary-500">{art.date}</td>
                    <td className="py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {/* Lihat di Blog */}
                      <Link
                        href={`/blog/${articleSlug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-secondary-100 hover:bg-secondary-200 text-secondary-800 inline-block transition"
                        title="Lihat di Halaman Publik"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(art)}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 inline-block transition cursor-pointer border border-amber-200/60"
                        title="Edit Artikel"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteArticle(art.id, art.title)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 inline-block transition cursor-pointer border border-red-200/60"
                        title="Hapus Artikel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gemini AI Blog Generator Modal */}
      <GeminiBlogModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyArticle={handleApplyAiArticle}
        initialCategory={category}
      />
    </div>
  );
}
