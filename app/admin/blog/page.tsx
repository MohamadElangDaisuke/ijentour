"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Plus, Trash2, Edit3, Eye, AlertCircle } from "lucide-react";
import { defaultArticles, Article } from "@/app/lib/articlesStorage";

export default function AdminBlogPage() {
  const [articles, setArticles] = useState<Article[]>(defaultArticles);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Panduan");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("/images/pkg-bluefire.png");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError("Judul artikel wajib diisi.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
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
      setTitle("");
      setExcerpt("");
      setContent("");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
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

      {/* New Article Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-xs">
        <h2 className="text-base font-black text-secondary-950 uppercase tracking-wider pb-3 border-b border-secondary-100 mb-6">
          Tulis Artikel Baru
        </h2>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateArticle} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-secondary-800 mb-1.5">Judul Artikel *</label>
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
                <option value="Kuliner">Kuliner</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-secondary-800 mb-1.5">Ringkasan / Excerpt</label>
              <input
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Ringkasan singkat 1-2 kalimat..."
                className="w-full px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary-800 mb-1.5">URL Gambar Sampul</label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/images/pkg-bluefire.png"
                className="w-full px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary-800 mb-1.5">Konten Artikel (Markdown didukung)</label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan isi artikel lengkap di sini..."
              className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? "Memublikasikan..." : "Publikasikan Artikel"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-xs">
        <h2 className="text-base font-black text-secondary-950 uppercase tracking-wider pb-3 border-b border-secondary-100 mb-6">
          Daftar Artikel ({articles.length})
        </h2>

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
              {articles.map((art) => (
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
                  <td className="py-3.5 text-right">
                    <Link
                      href="/blog"
                      target="_blank"
                      className="p-1.5 rounded-lg bg-secondary-100 hover:bg-secondary-200 text-secondary-800 inline-block"
                      title="Lihat di Blog"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
