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
  const [category, setCategory] = useState("Guide");
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

    // Smooth scroll to form
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
    if (!confirm(`Delete article "${articleTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete article.");

      setArticles((prev) => prev.filter((a) => a.id !== id && a.slug !== id));
      setSuccessMessage("Article deleted successfully.");
      setTimeout(() => setSuccessMessage(""), 4000);

      if (editingId === id) {
        handleCancelEdit();
      }
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
        if (!res.ok) throw new Error(data.error || "Failed to update article.");

        setArticles((prev) =>
          prev.map((a) => (a.id === editingId || a.slug === editingId ? data.article : a))
        );
        setSuccessMessage("Article updated successfully!");
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
        if (!res.ok) throw new Error(data.error || "Failed to create article.");

        setArticles([data.article, ...articles]);
        setSuccessMessage("New article published successfully!");
        handleCancelEdit();
      }

      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the article.");
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
      "✨ Gemini AI article successfully drafted! You can review, edit text, or update the cover image before publishing."
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
            Publishing & Education
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary-950 tracking-tight">
            Manage Articles & Travel News
          </h1>
          <p className="text-xs sm:text-sm text-secondary-600 mt-1">
            Publish trekking guides, safety advice, and Banyuwangi destination highlights.
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
              {editingId ? "Edit Article" : "Write New Article"}
            </h2>
            {editingId && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                Edit Mode
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
              <span>✨ {editingId ? "Rewrite with AI" : "Generate with Gemini"}</span>
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3 py-1.5 rounded-xl bg-secondary-100 hover:bg-secondary-200 text-secondary-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel Edit
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
                Article Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 5 Essential Tips to Safely Witness Ijen Blue Fire"
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
                <option value="Guide">Guide</option>
                <option value="Tips & Tricks">Tips & Tricks</option>
                <option value="Ijen Geology & Nature">Ijen Geology & Nature</option>
                <option value="Local Culture">Local Culture</option>
                <option value="Destinations">Destinations</option>
                <option value="Culinary">Culinary</option>
                {category && !["Guide", "Tips & Tricks", "Ijen Geology & Nature", "Local Culture", "Destinations", "Culinary"].includes(category) && (
                  <option value={category}>{category}</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                  Summary / Excerpt
                </label>
                <textarea
                  rows={4}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short 1-2 sentence summary for catalog preview..."
                  className="w-full px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <ImageUpload
                value={image}
                onChange={(url) => setImage(url)}
                folder="blog"
                label="Article Cover Image (Supabase Storage)"
                required
                aspectRatio="video"
                helperText="Upload the main banner image for the article (Max 5 MB)."
              />
            </div>
          </div>

          {/* Markdown Content Section with Editor & Preview */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-secondary-900">
                  Article Content (Markdown)
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
                  title="Show text editor only"
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
                  title="View rendered article preview"
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
                  title="Editor and preview side-by-side"
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
                  title="Heading 2 (Main Section)"
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
                  title="Bold text"
                >
                  **B**
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertSyntax("*", "*")}
                  className="px-2 py-1 rounded-md bg-white hover:bg-secondary-200/80 text-secondary-800 text-[11px] italic font-serif transition cursor-pointer shadow-2xs border border-secondary-200/50"
                  title="Italic text"
                >
                  *I*
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertSyntax("\n- ", "")}
                  className="px-2 py-1 rounded-md bg-white hover:bg-secondary-200/80 text-secondary-800 text-[11px] font-bold transition cursor-pointer shadow-2xs border border-secondary-200/50"
                  title="Bullet list (-)"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertSyntax("\n1. ", "")}
                  className="px-2 py-1 rounded-md bg-white hover:bg-secondary-200/80 text-secondary-800 text-[11px] font-bold transition cursor-pointer shadow-2xs border border-secondary-200/50"
                  title="Numbered list (1.)"
                >
                  1. Step
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertSyntax("\n> ", "\n")}
                  className="px-2 py-1 rounded-md bg-white hover:bg-secondary-200/80 text-secondary-800 text-[11px] font-bold transition cursor-pointer shadow-2xs border border-secondary-200/50"
                  title="Blockquote / Important note"
                >
                  "Quote"
                </button>
                <div className="ml-auto pr-2 text-[11px] text-secondary-400 font-medium">
                  {content.split(/\s+/).filter(Boolean).length} words
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
                    placeholder="Write the full article content here in Markdown format...&#10;&#10;Example:&#10;Mount Ijen is world-renowned for its surreal volcanic beauty and mesmerizing Blue Fire phenomenon.&#10;&#10;## The Allure of Ijen Crater&#10;The turquoise acidic crater lake presents a dramatic vista...&#10;&#10;### Essential Gear Checklist&#10;- Gas respirator mask&#10;- Warm jacket&#10;- Sturdy trekking boots"
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
                        <span>Live Preview (Visitor View)</span>
                      </span>
                      <span className="text-[10px] text-secondary-400 font-normal">
                        Auto-rendering
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
                          No content to preview yet
                        </p>
                        <p className="text-[11px] text-secondary-400 mt-1 max-w-xs">
                          Type Markdown text in the Editor tab or use the{" "}
                          <strong>✨ Generate with Gemini</strong> button to create an article automatically.
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
                Cancel
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
                  <span>{submitting ? "Saving Changes..." : "Save Changes"}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{submitting ? "Publishing..." : "Publish Article"}</span>
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
            Article List ({articles.length})
          </h2>
          <span className="text-xs text-secondary-400">
            Total {articles.length} registered articles
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-secondary-100 text-[11px] font-bold text-secondary-500 uppercase tracking-wider">
                <th className="pb-3">Article Title</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Author</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Actions</th>
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
                    <td className="py-3.5 text-secondary-600">{art.author || "Ijen Tour Team"}</td>
                    <td className="py-3.5 text-secondary-500">{art.date}</td>
                    <td className="py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {/* View on Blog */}
                      <Link
                        href={`/blog/${articleSlug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-secondary-100 hover:bg-secondary-200 text-secondary-800 inline-block transition"
                        title="View on Public Site"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(art)}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 inline-block transition cursor-pointer border border-amber-200/60"
                        title="Edit Article"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteArticle(art.id, art.title)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 inline-block transition cursor-pointer border border-red-200/60"
                        title="Delete Article"
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
