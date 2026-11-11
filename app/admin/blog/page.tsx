"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Search,
  ExternalLink,
  Bold,
  Italic,
  Heading2,
  List,
  Quote,
  Code,
  Link2,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { defaultArticles, Article } from "@/app/lib/articlesStorage";
import ImageUpload from "@/app/component/ui/ImageUpload";
import GeminiBlogModal from "./GeminiBlogModal";
import MarkdownRenderer from "@/app/component/ui/MarkdownRenderer";
import { AdminTableSkeleton } from "@/app/component/ui/skeleton";
import AdminBadge from "@/app/component/admin/AdminBadge";
import AdminPageHeader from "@/app/component/admin/AdminPageHeader";
import AdminStatsCard from "@/app/component/admin/AdminStatsCard";

export default function AdminBlogPage() {
  const [articles, setArticles] = useState<Article[]>(defaultArticles);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Guide");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("/images/pkg-bluefire.png");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Editor View Mode: "edit" | "preview" | "split"
  const [contentViewMode, setContentViewMode] = useState<"edit" | "preview" | "split">("split");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // AI Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const handleInsertSyntax = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) {
      setContent((prev) => prev + (prev.endsWith("\n") || prev === "" ? "" : "\n") + prefix + suffix);
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = prefix + (selected || "text") + suffix;
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
    setCategory(art.category || "Guide");
    setExcerpt(art.excerpt || "");
    setContent(art.content || "");
    setImage(art.image || "/images/pkg-bluefire.png");
    setError("");
    setSuccessMessage("");
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setCategory("Guide");
    setExcerpt("");
    setContent("");
    setImage("/images/pkg-bluefire.png");
    setError("");
  };

  const handleDeleteArticle = async (id: string, articleTitle: string) => {
    if (!confirm(`Delete article "${articleTitle}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete article.");

      setArticles((prev) => prev.filter((a) => a.id !== id && a.slug !== id));
      setSuccessMessage("Article deleted successfully.");
      setTimeout(() => setSuccessMessage(""), 4000);
      if (editingId === id) handleCancelEdit();
    } catch (err: any) {
      alert(err.message || "Failed to delete article.");
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Article title is required.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      if (editingId) {
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
        if (!res.ok) throw new Error(data.error || "Failed to update article.");

        setArticles((prev) =>
          prev.map((a) => (a.id === editingId || a.slug === editingId ? data.article : a))
        );
        setSuccessMessage("Article updated successfully!");
        handleCancelEdit();
      } else {
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
        if (!res.ok) throw new Error(data.error || "Failed to create article.");

        setArticles((prev) => [data.article, ...prev]);
        setSuccessMessage("New article published successfully!");
        handleCancelEdit();
      }
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to save article.");
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const categories = new Set(articles.map((a) => a.category || "General")).size;
    return { total: articles.length, categories };
  }, [articles]);

  // Categories list
  const categoriesList = useMemo(() => {
    return Array.from(new Set(articles.map((a) => a.category || "Guide")));
  }, [articles]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      if (categoryFilter !== "ALL" && (a.category || "Guide") !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (a.title || "").toLowerCase().includes(q);
        const matchesExcerpt = (a.excerpt || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesExcerpt) return false;
      }
      return true;
    });
  }, [articles, categoryFilter, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminTableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Toast */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <AdminPageHeader
        title="Blog Articles & AI Content Studio"
        description="Write, curate, and generate SEO-optimized travel guides for Mount Ijen using our integrated Gemini AI assistant."
        badge={`${metrics.total} Articles`}
        breadcrumbs={[{ label: "Blog & Content" }]}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate with Gemini AI</span>
            </button>
            <button
              onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Write Manually</span>
            </button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <AdminStatsCard
          label="Total Articles"
          value={metrics.total}
          icon={<BookOpen className="w-4 h-4" />}
          subtitle="All published insights & guides"
          theme="slate"
        />
        <AdminStatsCard
          label="Content Categories"
          value={metrics.categories}
          icon={<Columns className="w-4 h-4" />}
          subtitle="Guides, gear, culture, itineraries"
          theme="teal"
        />
        <AdminStatsCard
          label="AI Writer Integration"
          value="Google Gemini"
          icon={<Sparkles className="w-4 h-4" />}
          subtitle="Official @google/genai SDK"
          theme="amber"
        />
      </div>

      {/* Published Articles List Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search published articles by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-amber-500 transition cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-wider">
                <th className="py-3.5 pl-6">Article</th>
                <th className="py-3.5">Category</th>
                <th className="py-3.5">Read Time</th>
                <th className="py-3.5">Date</th>
                <th className="py-3.5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredArticles.map((art) => (
                <tr key={art.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                  <td className="py-3.5 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                        <img
                          src={art.image || "/images/pkg-bluefire.png"}
                          alt={art.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 dark:text-white truncate max-w-[280px]">
                          {art.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[220px]">
                          /{art.slug || art.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {art.category || "Guide"}
                    </span>
                  </td>

                  <td className="py-3.5 text-slate-500 dark:text-slate-400 font-medium">
                    {art.readTime || "5 min read"}
                  </td>

                  <td className="py-3.5 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                    {art.date || "Recent"}
                  </td>

                  <td className="py-3.5 pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/blog/${art.slug || art.id}`}
                        target="_blank"
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-amber-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        title="View Live Article"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleStartEdit(art)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Edit Article"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(art.id, art.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Form Section */}
      <div
        ref={formRef}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              {editingId ? "Edit Mode" : "New Post Creation"}
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {editingId ? `Editing: ${title || "Untitled Article"}` : "Create Travel Guide / Article"}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveArticle}
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? "Publishing..." : editingId ? "Save Changes" : "Publish Article"}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-5 text-xs">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
                Article Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete 2026 Guide to Mount Ijen Blue Fire Expedition"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Guide">Trekking & Hiking Guide</option>
                <option value="Destinations">Destination Showcase</option>
                <option value="Preparation">Safety & Gear Preparation</option>
                <option value="Culture">Local Heritage & Miners</option>
                <option value="Tips">Travel Advice & Best Times</option>
              </select>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
              Short SEO Excerpt / Summary
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary appearing on blog index cards and Google search results..."
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
              Article Cover Image
            </label>
            <ImageUpload
              value={image}
              onChange={(url) => setImage(url)}
              folder="blog"
            />
          </div>

          {/* Markdown Content Studio */}
          <div className="space-y-2 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Markdown Article Body
              </label>

              {/* View mode toggle */}
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setContentViewMode("edit")}
                  className={`px-3 py-1 rounded-lg transition ${
                    contentViewMode === "edit"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                  }`}
                >
                  Write Only
                </button>
                <button
                  type="button"
                  onClick={() => setContentViewMode("split")}
                  className={`px-3 py-1 rounded-lg transition ${
                    contentViewMode === "split"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                  }`}
                >
                  Split View
                </button>
                <button
                  type="button"
                  onClick={() => setContentViewMode("preview")}
                  className={`px-3 py-1 rounded-lg transition ${
                    contentViewMode === "preview"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                  }`}
                >
                  Preview Only
                </button>
              </div>
            </div>

            {/* Markdown Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleInsertSyntax("**", "**")}
                className="p-1.5 rounded-lg hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleInsertSyntax("*", "*")}
                className="p-1.5 rounded-lg hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleInsertSyntax("## ", "")}
                className="p-1.5 rounded-lg hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                title="Heading 2"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleInsertSyntax("- ", "")}
                className="p-1.5 rounded-lg hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleInsertSyntax("> ", "")}
                className="p-1.5 rounded-lg hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                title="Blockquote"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleInsertSyntax("[Link Text](", ")")}
                className="p-1.5 rounded-lg hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                title="Link"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Split Editor / Preview */}
            <div className={`grid gap-4 ${contentViewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
              {contentViewMode !== "preview" && (
                <textarea
                  ref={textareaRef}
                  rows={16}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your markdown article here..."
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs leading-relaxed focus:outline-none focus:border-amber-500 custom-scrollbar"
                />
              )}

              {contentViewMode !== "edit" && (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-y-auto max-h-[380px] custom-scrollbar prose prose-sm dark:prose-invert">
                  {content.trim() ? (
                    <MarkdownRenderer content={content} />
                  ) : (
                    <p className="text-slate-400 italic text-xs">Article preview will render here...</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gemini AI Modal Integration */}
      <GeminiBlogModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyArticle={(gen) => {
          setTitle(gen.title);
          setCategory(gen.category);
          setExcerpt(gen.excerpt);
          setContent(gen.content);
          formRef.current?.scrollIntoView({ behavior: "smooth" });
          setSuccessMessage("Gemini AI article loaded into editor!");
          setTimeout(() => setSuccessMessage(""), 4000);
        }}
      />
    </div>
  );
}
