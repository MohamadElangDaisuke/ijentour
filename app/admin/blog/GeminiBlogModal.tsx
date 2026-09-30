"use client";

import { useState } from "react";
import {
  Sparkles,
  X,
  RefreshCw,
  Check,
  FileText,
  Search,
  Globe,
  HelpCircle,
  Copy,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sliders,
  ChevronDown,
} from "lucide-react";
import { GeneratedBlogResponse } from "@/app/api/ai/generate-blog/route";
import MarkdownRenderer from "@/app/component/ui/MarkdownRenderer";

interface GeminiBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyArticle: (data: {
    title: string;
    category: string;
    excerpt: string;
    content: string;
    slug?: string;
    readTime?: string;
  }) => void;
}

export default function GeminiBlogModal({
  isOpen,
  onClose,
  onApplyArticle,
}: GeminiBlogModalProps) {
  // Input form state
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState<"English" | "Indonesian">("English");
  const [writingStyle, setWritingStyle] = useState<
    "Travel Blog" | "Informative" | "Promotional" | "Storytelling"
  >("Travel Blog");
  const [articleLength, setArticleLength] = useState<
    "500 words" | "800 words" | "1200 words" | "1500 words"
  >("800 words");

  // SEO Checkboxes
  const [generateTitle, setGenerateTitle] = useState(true);
  const [generateMetaDesc, setGenerateMetaDesc] = useState(true);
  const [generateSlug, setGenerateSlug] = useState(true);
  const [generateKeywords, setGenerateKeywords] = useState(true);
  const [generateFaq, setGenerateFaq] = useState(true);

  // CTA Checkbox
  const [includeCta, setIncludeCta] = useState(true);

  // Generator & UI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [generatedResult, setGeneratedResult] = useState<GeneratedBlogResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "seo" | "markdown">("preview");
  const [copiedRaw, setCopiedRaw] = useState(false);

  // Topic suggestions / Inspiration chips
  const topicSuggestions = [
    "Best Time to Visit Mount Ijen for Blue Fire",
    "Complete Packing List & Safety Gear for Kawah Ijen Night Hike",
    "Is Kawah Ijen Safe for Beginners & Solo Travelers?",
    "Mount Ijen Blue Flame: The Science Behind the World Wonder",
    "How to Travel from Bali to Mount Ijen (Ferry & Transport Guide)",
  ];

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setErrorMessage("Silakan masukkan topik artikel terlebih dahulu.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/ai/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          language,
          writingStyle,
          articleLength,
          seoOptions: {
            generateTitle,
            generateMetaDescription: generateMetaDesc,
            generateSlug,
            generateKeywords,
            generateFaq,
          },
          includeCta,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menghasilkan artikel.");
      }

      setGeneratedResult(data.data);
      setActiveTab("preview");
    } catch (err: any) {
      setErrorMessage(
        err.message ||
        "Terjadi gangguan saat menghubungi Gemini AI. Pastikan GEMINI_API_KEY sudah dikonfigurasi."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsertIntoEditor = () => {
    if (!generatedResult) return;

    // Combine markdown content with FAQ if present so it persists in the article
    // Pass clean markdown directly without appending FAQ (as FAQ is separate structured data)
    onApplyArticle({
      title: generatedResult.title,
      category: generatedResult.category || "Panduan",
      excerpt: generatedResult.excerpt || generatedResult.metaDescription,
      content: generatedResult.content.trim(),
      slug: generatedResult.slug,
      readTime: generatedResult.readTime,
    });

    onClose();
  };

  const handleCopyMarkdown = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult.content);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-secondary-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-secondary-200/90 overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-secondary-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-primary-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-secondary-950 tracking-tight">
                  Gemini AI Blog Generator
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider">
                  Official Google GenAI
                </span>
              </div>
              <p className="text-xs text-secondary-500">
                Tulis artikel wisata Mount Ijen otomatis, terstruktur, & SEO-optimized dalam hitungan detik.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-secondary-400 hover:text-secondary-800 hover:bg-secondary-100 transition cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Gagal Membuat Artikel:</p>
                <p>{errorMessage}</p>
                {errorMessage.includes("GEMINI_API_KEY") && (
                  <p className="text-[11px] text-red-700 font-mono mt-1 bg-red-100/70 p-2 rounded-lg">
                    Tambahkan baris berikut di file .env.local:
                    <br />
                    GEMINI_API_KEY=AQ.Ab8RN6J_9bCpGV8XjxZ8cg3zopIHjKfOFyAT1OrWZKFiMHSkQQ
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Generator Form Section */}
          {!generatedResult || isGenerating ? (
            <div className="space-y-6">
              {/* 1. TOPIC INPUT */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-secondary-800">
                    1. Topik Artikel *
                  </label>
                  <span className="text-[11px] text-secondary-400">{topic.length}/300</span>
                </div>
                <input
                  type="text"
                  maxLength={300}
                  disabled={isGenerating}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Best Time to Visit Mount Ijen for Blue Fire"
                  className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-2xl text-xs sm:text-sm font-medium text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                />

                {/* Quick Topic Ideas */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-secondary-400">Inspirasi Topik:</span>
                  {topicSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => setTopic(item)}
                      className="px-2.5 py-1 rounded-lg bg-secondary-100 hover:bg-primary-100 hover:text-secondary-950 text-secondary-600 text-[11px] font-medium transition cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2 & 3. LANGUAGE & WRITING STYLE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Language */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-secondary-800 mb-1.5">
                    2. Bahasa Artikel
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => setLanguage("English")}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${language === "English"
                          ? "bg-secondary-950 text-white border-secondary-950 shadow-2xs"
                          : "bg-secondary-50 text-secondary-700 border-secondary-200 hover:bg-secondary-100"
                        }`}
                    >
                      <Globe className="w-3.5 h-3.5 text-primary-400" />
                      <span>English</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-primary-400 text-secondary-950 font-black">
                        Utama
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => setLanguage("Indonesian")}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${language === "Indonesian"
                          ? "bg-secondary-950 text-white border-secondary-950 shadow-2xs"
                          : "bg-secondary-50 text-secondary-700 border-secondary-200 hover:bg-secondary-100"
                        }`}
                    >
                      <span>Indonesian</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-secondary-400 mt-1">
                    Bahasa Inggris diprioritaskan untuk menjangkau wisatawan mancanegara.
                  </p>
                </div>

                {/* Writing Style */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-secondary-800 mb-1.5">
                    3. Gaya Penulisan
                  </label>
                  <select
                    disabled={isGenerating}
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs font-bold text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Travel Blog">Travel Blog (Natural & Eksploratif)</option>
                    <option value="Informative">Informative (Faktual & Praktis)</option>
                    <option value="Promotional">Promotional (Menarik Minat Booking)</option>
                    <option value="Storytelling">Storytelling (Narasi Pengalaman)</option>
                  </select>
                </div>
              </div>

              {/* 4. ARTICLE LENGTH */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-secondary-800 mb-1.5">
                  4. Estimasi Panjang Artikel
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "500 kata", sub: "Ringkas (Short)", val: "500 words" },
                    { label: "800 kata", sub: "Standar (Medium)", val: "800 words" },
                    { label: "1200 kata", sub: "Mendalam (Long)", val: "1200 words" },
                    { label: "1500 kata", sub: "Pilar SEO (Comprehensive)", val: "1500 words" },
                  ].map((len) => (
                    <button
                      key={len.val}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => setArticleLength(len.val as any)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${articleLength === len.val
                          ? "bg-primary-500/10 border-primary-500 text-secondary-950 font-bold"
                          : "bg-secondary-50 border-secondary-200 text-secondary-600 hover:bg-secondary-100"
                        }`}
                    >
                      <div className="text-xs font-black">{len.label}</div>
                      <div className="text-[10px] text-secondary-400 font-medium">{len.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. SEO CHECKBOXES */}
              <div className="p-4 rounded-2xl bg-secondary-50 border border-secondary-200/80 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-secondary-200">
                  <Search className="w-4 h-4 text-primary-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-secondary-900">
                    5. Optimasi SEO & Metadata
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-secondary-800 select-none">
                    <input
                      type="checkbox"
                      checked={generateTitle}
                      onChange={(e) => setGenerateTitle(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 accent-primary-500 cursor-pointer"
                    />
                    <span>Generate SEO Title</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-secondary-800 select-none">
                    <input
                      type="checkbox"
                      checked={generateMetaDesc}
                      onChange={(e) => setGenerateMetaDesc(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 accent-primary-500 cursor-pointer"
                    />
                    <span>Generate Meta Description</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-secondary-800 select-none">
                    <input
                      type="checkbox"
                      checked={generateSlug}
                      onChange={(e) => setGenerateSlug(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 accent-primary-500 cursor-pointer"
                    />
                    <span>Generate Slug URL</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-secondary-800 select-none">
                    <input
                      type="checkbox"
                      checked={generateKeywords}
                      onChange={(e) => setGenerateKeywords(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 accent-primary-500 cursor-pointer"
                    />
                    <span>Generate Keywords & Tags</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-secondary-800 select-none">
                    <input
                      type="checkbox"
                      checked={generateFaq}
                      onChange={(e) => setGenerateFaq(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 accent-primary-500 cursor-pointer"
                    />
                    <span>Generate FAQ (3-5 items)</span>
                  </label>
                </div>
              </div>

              {/* 6. CTA CHECKBOX */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-300/40">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeCta}
                    onChange={(e) => setIncludeCta(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-amber-600 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-black text-secondary-950 block">
                      6. Sertakan Ajakan Pemesanan (Ijen Tour Booking CTA)
                    </span>
                    <span className="text-[11px] text-secondary-500 block mt-0.5">
                      Menambahkan ajakan natural dan terpercaya di akhir artikel untuk memesan paket tur resmi Mount Ijen.
                    </span>
                  </div>
                </label>
              </div>

              {/* Loading State Banner */}
              {isGenerating && (
                <div className="p-6 rounded-2xl bg-secondary-950 text-white flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
                    <Sparkles className="w-5 h-5 text-primary-400 absolute inset-0 m-auto" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      Gemini AI Sedang Menulis Artikel...
                    </h4>
                    <p className="text-xs text-secondary-400 mt-1 max-w-md">
                      Menyusun struktur konten yang mendalam, riset data Kawah Ijen, optimasi kata kunci SEO, dan FAQ terverifikasi.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Result Preview Section */
            <div className="space-y-6">
              {/* Result Summary Bar */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-emerald-950">
                      Artikel Berhasil Dibuat oleh Gemini AI!
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      Tinjau hasil di bawah ini. Anda dapat memasukkannya langsung ke form editor untuk diperiksa dan diedit.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setGeneratedResult(null)}
                    className="px-3 py-1.5 rounded-xl border border-secondary-300 bg-white hover:bg-secondary-100 text-secondary-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Ubah Input / Regenerate</span>
                  </button>
                </div>
              </div>

              {/* Preview Tabs */}
              <div className="flex border-b border-secondary-200 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`pb-3 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${activeTab === "preview"
                      ? "border-primary-500 text-secondary-950"
                      : "border-transparent text-secondary-400 hover:text-secondary-700"
                    }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Pratinjau Artikel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("seo")}
                  className={`pb-3 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${activeTab === "seo"
                      ? "border-primary-500 text-secondary-950"
                      : "border-transparent text-secondary-400 hover:text-secondary-700"
                    }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>SEO & Metadata ({generatedResult.keywords?.length || 0} Keywords)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("markdown")}
                  className={`pb-3 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${activeTab === "markdown"
                      ? "border-primary-500 text-secondary-950"
                      : "border-transparent text-secondary-400 hover:text-secondary-700"
                    }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Raw Markdown</span>
                </button>
              </div>

              {/* Tab 1: Preview Artikel */}
              {activeTab === "preview" && (
                <div className="space-y-6 bg-secondary-50/60 p-6 rounded-2xl border border-secondary-200/80">
                  {/* Category & Read Time */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary-500 text-secondary-950 font-black text-[10px] uppercase tracking-wider">
                      {generatedResult.category || "Panduan"}
                    </span>
                    <span className="text-[11px] text-secondary-400 font-medium">•</span>
                    <span className="text-[11px] text-secondary-600 font-semibold">
                      {generatedResult.readTime || "5 Menit Baca"}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl sm:text-2xl font-black text-secondary-950 leading-snug">
                    {generatedResult.title}
                  </h2>

                  {/* Excerpt */}
                  {generatedResult.excerpt && (
                    <div className="p-4 rounded-xl bg-white border-l-4 border-primary-500 text-secondary-700 italic text-xs sm:text-sm leading-relaxed shadow-2xs">
                      "{generatedResult.excerpt}"
                    </div>
                  )}

                  {/* Rendered Markdown Body */}
                  <div className="bg-white p-6 rounded-2xl border border-secondary-200/80 shadow-2xs">
                    <MarkdownRenderer content={generatedResult.content} />
                  </div>

                  {/* FAQ Preview */}
                  {generatedResult.faq && generatedResult.faq.length > 0 && (
                    <div className="bg-white p-6 rounded-2xl border border-secondary-200/80 space-y-4 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-primary-600" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-secondary-950">
                          Frequently Asked Questions (FAQ)
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {generatedResult.faq.map((item, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-secondary-50 border border-secondary-100 space-y-1">
                            <p className="text-xs font-bold text-secondary-950">Q: {item.question}</p>
                            <p className="text-xs text-secondary-600">A: {item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: SEO & Meta */}
              {activeTab === "seo" && (
                <div className="space-y-4 bg-secondary-50/60 p-6 rounded-2xl border border-secondary-200/80">
                  <div className="bg-white p-5 rounded-xl border border-secondary-200/80 space-y-3 shadow-2xs">
                    <div>
                      <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block mb-1">
                        SEO Title
                      </span>
                      <p className="text-xs font-bold text-secondary-950">{generatedResult.title}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block mb-1">
                        URL Slug
                      </span>
                      <p className="text-xs font-mono text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md inline-block">
                        /blog/{generatedResult.slug}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block mb-1">
                        Meta Description ({generatedResult.metaDescription?.length || 0} karakter)
                      </span>
                      <p className="text-xs text-secondary-700 leading-relaxed">
                        {generatedResult.metaDescription}
                      </p>
                    </div>
                  </div>

                  {/* Keywords & Tags */}
                  <div className="bg-white p-5 rounded-xl border border-secondary-200/80 space-y-4 shadow-2xs">
                    <div>
                      <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block mb-2">
                        Target Keywords
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {generatedResult.keywords && generatedResult.keywords.length > 0 ? (
                          generatedResult.keywords.map((kw, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-secondary-100 text-secondary-800 text-[11px] font-semibold"
                            >
                              #{kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-secondary-400 italic">Tidak ada keyword</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block mb-2">
                        Tags
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {generatedResult.tags && generatedResult.tags.length > 0 ? (
                          generatedResult.tags.map((tg, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-200"
                            >
                              {tg}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-secondary-400 italic">Tidak ada tags</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Raw Markdown */}
              {activeTab === "markdown" && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCopyMarkdown}
                      className="px-3 py-1.5 rounded-xl bg-secondary-100 hover:bg-secondary-200 text-secondary-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedRaw ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Tersalin ke Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Markdown</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 bg-secondary-950 text-secondary-100 rounded-2xl text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-96">
                    {generatedResult.content}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-secondary-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-secondary-50/50">
          <div className="text-[11px] text-secondary-400">
            {generatedResult ? (
              <span>Hasil AI akan masuk ke form sebagai <strong>Draft</strong>. Anda dapat mengedit sebelum memublikasikan.</span>
            ) : (
              <span>Didukung oleh Google Gemini 2.5 Flash dengan sistem prompt khusus Ijen Tour.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-secondary-100 text-secondary-700 border border-secondary-200 font-bold text-xs transition cursor-pointer"
            >
              Batal
            </button>

            {!generatedResult ? (
              <button
                type="button"
                disabled={isGenerating || !topic.trim()}
                onClick={handleGenerate}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-primary-500 hover:from-amber-400 hover:to-primary-400 text-secondary-950 font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menghasilkan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Artikel dengan AI</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleInsertIntoEditor}
                className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Gunakan Hasil & Masukkan ke Editor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
