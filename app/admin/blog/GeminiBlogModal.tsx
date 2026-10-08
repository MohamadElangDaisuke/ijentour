"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  X,
  RefreshCw,
  Check,
  FileText,
  Search,
  HelpCircle,
  Copy,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Tag,
  Key,
  Compass,
  Target,
  Plus,
  Layers,
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
  initialCategory?: string;
}

const SYSTEM_CATEGORIES = [
  "Panduan",
  "Tips & Trik",
  "Edukasi Ijen",
  "Budaya Lokal",
  "Destinasi",
  "Kuliner",
];

const PRESET_AUDIENCES = [
  "International Travelers",
  "First-Time Visitors",
  "Beginner Hikers",
  "Adventure Travelers",
  "Couples",
  "Solo Travelers",
  "Family Travelers",
  "Backpackers",
  "Photography Enthusiasts",
  "General Travelers",
];

const PRESET_PURPOSES = [
  { label: "Travel Guide", desc: "Panduan Perjalanan Lengkap" },
  { label: "Safety Guide", desc: "Panduan Keselamatan & Kesehatan" },
  { label: "How-To Guide", desc: "Langkah Praktis / Persiapan" },
  { label: "Packing Guide", desc: "Daftar Perlengkapan Wajib" },
  { label: "Transportation Guide", desc: "Panduan Akses & Rute" },
  { label: "Destination Guide", desc: "Eksplorasi Keindahan & Fakta" },
  { label: "Informational", desc: "Edukatif & Faktual" },
  { label: "Booking-Oriented", desc: "Konversi Minat Booking Tur" },
];

export default function GeminiBlogModal({
  isOpen,
  onClose,
  onApplyArticle,
  initialCategory = "Panduan",
}: GeminiBlogModalProps) {
  // 1. Topic
  const [topic, setTopic] = useState("");

  // 2. Category
  const [categoryMode, setCategoryMode] = useState<"select" | "ai" | "manual">("select");
  const [category, setCategory] = useState(initialCategory || "Panduan");
  const [customCategory, setCustomCategory] = useState("");

  // 3. Focus / Angle
  const [focusMode, setFocusMode] = useState<"manual" | "ai">("manual");
  const [focus, setFocus] = useState("");

  // 4. Target Audience
  const [audienceMode, setAudienceMode] = useState<"ai" | "manual" | "custom">("ai");
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([
    "International Travelers",
    "First-Time Visitors",
  ]);
  const [customAudienceInput, setCustomAudienceInput] = useState("");

  // 5. Purpose
  const [purposeMode, setPurposeMode] = useState<"ai" | "manual">("manual");
  const [purpose, setPurpose] = useState("Travel Guide");

  // 6. Writing Style
  const [writingStyle, setWritingStyle] = useState<
    "Travel Blog" | "Informative" | "Promotional" | "Storytelling"
  >("Travel Blog");

  // 7. Length
  const [articleLength, setArticleLength] = useState<
    "500 words" | "800 words" | "1200 words" | "1500 words"
  >("800 words");

  // 8. Primary Keyword
  const [primaryKeywordMode, setPrimaryKeywordMode] = useState<"ai" | "manual">("ai");
  const [primaryKeyword, setPrimaryKeyword] = useState("");

  // 9. Secondary Keywords
  const [secondaryKeywordMode, setSecondaryKeywordMode] = useState<"ai" | "manual">("ai");
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [manualKeywordInput, setManualKeywordInput] = useState("");

  // 10. Additional SEO & CTA Checkboxes
  const [generateTitle, setGenerateTitle] = useState(true);
  const [generateMetaDesc, setGenerateMetaDesc] = useState(true);
  const [generateSlug, setGenerateSlug] = useState(true);
  const [generateKeywords, setGenerateKeywords] = useState(true);
  const [generateFaq, setGenerateFaq] = useState(true);
  const [includeCta, setIncludeCta] = useState(true);

  // Suggestions state & local cache
  const [suggestionsCache, setSuggestionsCache] = useState<Record<string, string[]>>({});
  const [loadingSuggestionType, setLoadingSuggestionType] = useState<string | null>(null);
  const [suggestionError, setSuggestionError] = useState<{ [key: string]: string }>({});

  // Active suggestions lists currently visible for each section
  const [activeSuggestions, setActiveSuggestions] = useState<{
    topics?: string[];
    categories?: string[];
    focus?: string[];
    audiences?: string[];
    purposes?: string[];
    primaryKeywords?: string[];
    secondaryKeywords?: string[];
  }>({});

  // Generation & Result states
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [generatedResult, setGeneratedResult] = useState<GeneratedBlogResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "seo" | "markdown">("preview");
  const [copiedRaw, setCopiedRaw] = useState(false);

  // Helper to fetch suggestions with caching
  const fetchSuggestion = async (
    type:
      | "topics"
      | "categories"
      | "focus"
      | "audiences"
      | "purposes"
      | "primaryKeywords"
      | "secondaryKeywords",
    forceRefresh: boolean = false
  ) => {
    // Generate context key
    const contextObj = {
      topic: topic.trim(),
      category: categoryMode === "manual" ? customCategory.trim() : category,
      focus: focus.trim(),
      targetAudience: selectedAudiences,
      purpose,
      primaryKeyword: primaryKeyword.trim(),
    };
    const cacheKey = `${type}__${JSON.stringify(contextObj)}`;

    if (!forceRefresh && suggestionsCache[cacheKey] && suggestionsCache[cacheKey].length > 0) {
      setActiveSuggestions((prev) => ({
        ...prev,
        [type]: suggestionsCache[cacheKey],
      }));
      return;
    }

    setLoadingSuggestionType(type);
    setSuggestionError((prev) => ({ ...prev, [type]: "" }));

    try {
      const res = await fetch("/api/ai/blog-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          context: contextObj,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to generate suggestions. Please try again.");
      }

      const list: string[] = data.suggestions || [];
      setSuggestionsCache((prev) => ({
        ...prev,
        [cacheKey]: list,
      }));
      setActiveSuggestions((prev) => ({
        ...prev,
        [type]: list,
      }));
    } catch (err: any) {
      setSuggestionError((prev) => ({
        ...prev,
        [type]: "Unable to generate suggestions. Please try again.",
      }));
    } finally {
      setLoadingSuggestionType(null);
    }
  };

  // Toggle or add audience
  const handleToggleAudience = (aud: string) => {
    setSelectedAudiences((prev) =>
      prev.includes(aud) ? prev.filter((a) => a !== aud) : [...prev, aud]
    );
  };

  const handleAddCustomAudience = () => {
    const val = customAudienceInput.trim();
    if (val && !selectedAudiences.includes(val)) {
      setSelectedAudiences((prev) => [...prev, val]);
      setCustomAudienceInput("");
    }
  };

  // Add / remove secondary keyword
  const handleToggleSecondaryKeyword = (kw: string) => {
    const clean = kw.trim();
    if (!clean) return;
    setSecondaryKeywords((prev) =>
      prev.includes(clean) ? prev.filter((k) => k !== clean) : [...prev, clean]
    );
  };

  const handleAddManualKeyword = () => {
    const val = manualKeywordInput.trim();
    if (val && !secondaryKeywords.includes(val)) {
      setSecondaryKeywords((prev) => [...prev, val]);
      setManualKeywordInput("");
    }
  };

  // Final Generate Article
  const handleGenerate = async () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setErrorMessage("Silakan masukkan topik artikel terlebih dahulu.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");

    const resolvedCategory =
      categoryMode === "manual" && customCategory.trim()
        ? customCategory.trim()
        : category;

    try {
      const res = await fetch("/api/ai/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: trimmedTopic,
          category: resolvedCategory,
          focus: focus.trim(),
          targetAudience: selectedAudiences,
          purpose,
          writingStyle,
          articleLength,
          primaryKeyword: primaryKeyword.trim(),
          secondaryKeywords,
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
          "Terjadi gangguan saat menghubungi Gemini AI. Pastikan konfigurasi GEMINI_API_KEY sudah sesuai."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsertIntoEditor = () => {
    if (!generatedResult) return;

    const resolvedCategory =
      categoryMode === "manual" && customCategory.trim()
        ? customCategory.trim()
        : generatedResult.category || category;

    onApplyArticle({
      title: generatedResult.title,
      category: resolvedCategory,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-secondary-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl border border-secondary-200/90 overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-secondary-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-primary-500/10 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center shadow-2xs">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-secondary-950 tracking-tight">
                  Gemini AI Blog Assistant
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider">
                  Admin Assisted
                </span>
              </div>
              <p className="text-xs text-secondary-500">
                AI memberikan rekomendasi ide & sudut pandang. Anda memegang kendali penuh atas artikel akhir.
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

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Gagal Membuat Artikel:</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {!generatedResult || isGenerating ? (
            <div className="space-y-6">
              {/* Top Assistant Guide Note */}
              <div className="p-3.5 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-start gap-2.5 text-xs text-secondary-800">
                <Compass className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Konsep Kerja:</strong> Masukkan topik atau minta rekomendasi AI. Pilih opsi yang paling sesuai di setiap langkah, lalu klik <strong>Generate Article</strong> untuk membuat draft lengkap.
                </p>
              </div>

              {/* 1. TOPIK ARTIKEL */}
              <div className="p-4 rounded-2xl bg-secondary-50/70 border border-secondary-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-secondary-900 flex items-center gap-1.5">
                    <span>1. Topik Artikel *</span>
                  </label>
                  <button
                    type="button"
                    disabled={loadingSuggestionType === "topics" || isGenerating}
                    onClick={() => fetchSuggestion("topics", true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 border border-amber-300/80 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer disabled:opacity-50"
                  >
                    {loadingSuggestionType === "topics" ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
                        <span>Finding relevant suggestions...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                        <span>✨ Suggest Topics with AI</span>
                      </>
                    )}
                  </button>
                </div>

                <input
                  type="text"
                  maxLength={300}
                  disabled={isGenerating}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Best Time to Visit Mount Ijen for Blue Fire"
                  className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl text-xs sm:text-sm font-medium text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                />

                {/* AI Suggested Topics Drawer / Box */}
                {activeSuggestions.topics && activeSuggestions.topics.length > 0 && (
                  <div className="mt-2.5 p-3.5 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>AI Suggested Topics (Klik untuk memilih)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveSuggestions((prev) => ({ ...prev, topics: undefined }))
                        }
                        className="text-[10px] text-secondary-400 hover:text-secondary-700 cursor-pointer"
                      >
                        Tutup
                      </button>
                    </div>

                    <div className="divide-y divide-secondary-100 rounded-lg border border-secondary-100 overflow-hidden">
                      {activeSuggestions.topics.map((t, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTopic(t)}
                          className={`w-full text-left px-3 py-2 text-xs transition flex items-center justify-between gap-2 cursor-pointer ${
                            topic === t
                              ? "bg-amber-50 font-bold text-amber-950"
                              : "hover:bg-secondary-50 text-secondary-800"
                          }`}
                        >
                          <span className="truncate">{t}</span>
                          <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded bg-secondary-100 text-secondary-700">
                            {topic === t ? "Terpilih ✓" : "Pilih"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {suggestionError.topics && (
                  <p className="text-[11px] text-red-600">{suggestionError.topics}</p>
                )}
              </div>

              {/* 2. KATEGORI */}
              <div className="p-4 rounded-2xl bg-secondary-50/70 border border-secondary-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-secondary-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary-600" />
                    <span>2. Kategori</span>
                  </label>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-1 bg-secondary-200/60 p-0.5 rounded-lg text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setCategoryMode("select")}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                        categoryMode === "select"
                          ? "bg-white text-secondary-950 shadow-2xs"
                          : "text-secondary-600 hover:text-secondary-950"
                      }`}
                    >
                      Pilih Kategori
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryMode("ai");
                        if (!activeSuggestions.categories) fetchSuggestion("categories");
                      }}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                        categoryMode === "ai"
                          ? "bg-white text-secondary-950 shadow-2xs"
                          : "text-secondary-600 hover:text-secondary-950"
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Saran dari AI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryMode("manual")}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                        categoryMode === "manual"
                          ? "bg-white text-secondary-950 shadow-2xs"
                          : "text-secondary-600 hover:text-secondary-950"
                      }`}
                    >
                      Input Manual / Lainnya
                    </button>
                  </div>
                </div>

                {/* Mode: Dropdown Preset */}
                {categoryMode === "select" && (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl text-xs font-bold text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {SYSTEM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}

                {/* Mode: AI Suggestions */}
                {categoryMode === "ai" && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-secondary-500">
                        Kategori terpilih:{" "}
                        <strong className="text-secondary-950">{category || "Belum dipilih"}</strong>
                      </span>
                      <button
                        type="button"
                        disabled={loadingSuggestionType === "categories" || isGenerating}
                        onClick={() => fetchSuggestion("categories", true)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        {loadingSuggestionType === "categories" ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-amber-700" />
                            <span>Finding relevant suggestions...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-amber-700" />
                            <span>✨ Get AI Suggestions</span>
                          </>
                        )}
                      </button>
                    </div>

                    {activeSuggestions.categories && activeSuggestions.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 p-3 bg-white rounded-xl border border-secondary-200">
                        {activeSuggestions.categories.map((cat, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                              category === cat
                                ? "bg-amber-500 text-secondary-950 border-amber-600 shadow-2xs"
                                : "bg-secondary-50 text-secondary-700 border-secondary-200 hover:bg-secondary-100"
                            }`}
                          >
                            ○ {cat} {category === cat && "✓"}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-white rounded-xl border border-dashed border-secondary-200 text-center text-xs text-secondary-500">
                        Klik tombol <strong>✨ Get AI Suggestions</strong> untuk mendapatkan rekomendasi kategori yang relevan dengan topik Anda.
                      </div>
                    )}

                    {suggestionError.categories && (
                      <p className="text-[11px] text-red-600">{suggestionError.categories}</p>
                    )}
                  </div>
                )}

                {/* Mode: Manual Input */}
                {categoryMode === "manual" && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Ketik kategori manual... (misal: Ekowisata, Vulkanologi)"
                    className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl text-xs font-medium text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                )}
              </div>

              {/* 3. FOKUS / SUDUT ARTIKEL */}
              <div className="p-4 rounded-2xl bg-secondary-50/70 border border-secondary-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-secondary-900 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-primary-600" />
                    <span>3. Fokus / Sudut Artikel</span>
                  </label>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-1 bg-secondary-200/60 p-0.5 rounded-lg text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setFocusMode("manual")}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                        focusMode === "manual"
                          ? "bg-white text-secondary-950 shadow-2xs"
                          : "text-secondary-600 hover:text-secondary-950"
                      }`}
                    >
                      Manual
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFocusMode("ai");
                        if (!activeSuggestions.focus) fetchSuggestion("focus");
                      }}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                        focusMode === "ai"
                          ? "bg-white text-secondary-950 shadow-2xs"
                          : "text-secondary-600 hover:text-secondary-950"
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Saran dari AI</span>
                    </button>
                  </div>
                </div>

                {focusMode === "ai" && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-secondary-500">
                        Pilih saran di bawah untuk dimasukkan ke teks fokus:
                      </span>
                      <button
                        type="button"
                        disabled={loadingSuggestionType === "focus" || isGenerating}
                        onClick={() => fetchSuggestion("focus", true)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        {loadingSuggestionType === "focus" ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-amber-700" />
                            <span>Finding relevant suggestions...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-amber-700" />
                            <span>✨ Get AI Suggestions</span>
                          </>
                        )}
                      </button>
                    </div>

                    {activeSuggestions.focus && activeSuggestions.focus.length > 0 ? (
                      <div className="grid grid-cols-1 gap-1.5 p-3 bg-white rounded-xl border border-secondary-200">
                        {activeSuggestions.focus.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFocus(item)}
                            className={`text-left px-3 py-2 rounded-lg text-xs transition cursor-pointer flex items-center justify-between gap-2 border ${
                              focus === item
                                ? "bg-amber-50 font-bold text-amber-950 border-amber-300"
                                : "hover:bg-secondary-50 text-secondary-800 border-transparent"
                            }`}
                          >
                            <span>○ {item}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-secondary-100 text-secondary-700 shrink-0">
                              {focus === item ? "Terpilih ✓" : "Gunakan"}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-white rounded-xl border border-dashed border-secondary-200 text-center text-xs text-secondary-500">
                        Tekan <strong>✨ Get AI Suggestions</strong> untuk mendapatkan rekomendasi sudut pandang unik Mount Ijen.
                      </div>
                    )}

                    {suggestionError.focus && (
                      <p className="text-[11px] text-red-600">{suggestionError.focus}</p>
                    )}
                  </div>
                )}

                <textarea
                  rows={2}
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="Contoh: Fokus pada wisatawan asing yang pertama kali mengunjungi Mount Ijen dan membutuhkan panduan perlengkapan malam hari..."
                  className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-xl text-xs font-medium text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* 4. TARGET AUDIENCE */}
              <div className="p-4 rounded-2xl bg-secondary-50/70 border border-secondary-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-secondary-900 flex items-center gap-1.5">
                    <span>4. Target Audience</span>
                  </label>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-1 bg-secondary-200/60 p-0.5 rounded-lg text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setAudienceMode("ai");
                        if (!activeSuggestions.audiences) fetchSuggestion("audiences");
                      }}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                        audienceMode === "ai"
                          ? "bg-white text-secondary-950 shadow-2xs"
                          : "text-secondary-600 hover:text-secondary-950"
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Saran dari AI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudienceMode("manual")}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                        audienceMode === "manual"
                          ? "bg-white text-secondary-950 shadow-2xs"
                          : "text-secondary-600 hover:text-secondary-950"
                      }`}
                    >
                      Pilih Manual
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudienceMode("custom")}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                        audienceMode === "custom"
                          ? "bg-white text-secondary-950 shadow-2xs"
                          : "text-secondary-600 hover:text-secondary-950"
                      }`}
                    >
                      Input Manual / Lainnya
                    </button>
                  </div>
                </div>

                {/* Selected Audiences Display */}
                <div className="flex flex-wrap items-center gap-1.5 min-h-[32px] p-2 bg-white rounded-xl border border-secondary-200">
                  <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider px-1">
                    Audience Terpilih:
                  </span>
                  {selectedAudiences.length > 0 ? (
                    selectedAudiences.map((aud, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-primary-100 text-secondary-950 text-xs font-bold inline-flex items-center gap-1 border border-primary-300/60 shadow-2xs"
                      >
                        <span>{aud}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleAudience(aud)}
                          className="hover:text-red-700 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-secondary-400 italic">
                      Belum ada audience dipilih (klik opsi di bawah)
                    </span>
                  )}
                </div>

                {/* Mode AI */}
                {audienceMode === "ai" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-secondary-500">
                        Rekomendasi kontekstual berdasarkan topik:
                      </span>
                      <button
                        type="button"
                        disabled={loadingSuggestionType === "audiences" || isGenerating}
                        onClick={() => fetchSuggestion("audiences", true)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        {loadingSuggestionType === "audiences" ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-amber-700" />
                            <span>Finding relevant suggestions...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-amber-700" />
                            <span>✨ Get AI Suggestions</span>
                          </>
                        )}
                      </button>
                    </div>

                    {activeSuggestions.audiences && activeSuggestions.audiences.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 p-3 bg-white rounded-xl border border-secondary-200">
                        {activeSuggestions.audiences.map((aud, idx) => {
                          const isSelected = selectedAudiences.includes(aud);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleToggleAudience(aud)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                                isSelected
                                  ? "bg-primary-500 text-secondary-950 border-primary-600 shadow-2xs"
                                  : "bg-secondary-50 text-secondary-700 border-secondary-200 hover:bg-secondary-100"
                              }`}
                            >
                              {isSelected ? "☑" : "○"} {aud}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3 bg-white rounded-xl border border-dashed border-secondary-200 text-center text-xs text-secondary-500">
                        Tekan <strong>✨ Get AI Suggestions</strong> untuk mendapatkan target audience yang paling relevan.
                      </div>
                    )}
                  </div>
                )}

                {/* Mode Manual Preset */}
                {audienceMode === "manual" && (
                  <div className="flex flex-wrap gap-1.5 p-3 bg-white rounded-xl border border-secondary-200">
                    {PRESET_AUDIENCES.map((aud, idx) => {
                      const isSelected = selectedAudiences.includes(aud);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleToggleAudience(aud)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                            isSelected
                              ? "bg-primary-500 text-secondary-950 border-primary-600 shadow-2xs"
                              : "bg-secondary-50 text-secondary-700 border-secondary-200 hover:bg-secondary-100"
                          }`}
                        >
                          {isSelected ? "☑" : "○"} {aud}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Mode Custom Input */}
                {audienceMode === "custom" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customAudienceInput}
                      onChange={(e) => setCustomAudienceInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCustomAudience()}
                      placeholder="Ketik target audience kustom lalu tekan Tambah..."
                      className="flex-1 px-4 py-2 bg-white border border-secondary-200 rounded-xl text-xs font-medium text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomAudience}
                      className="px-4 py-2 rounded-xl bg-secondary-900 hover:bg-secondary-800 text-white font-bold text-xs transition cursor-pointer"
                    >
                      Tambah
                    </button>
                  </div>
                )}
              </div>

              {/* 5. TUJUAN ARTIKEL */}
              <div className="p-4 rounded-2xl bg-secondary-50/70 border border-secondary-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-secondary-900 flex items-center gap-1.5">
                    <span>5. Tujuan Artikel</span>
                  </label>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-1 bg-secondary-200/60 p-0.5 rounded-lg text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPurposeMode("manual")}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                        purposeMode === "manual"
                          ? "bg-white text-secondary-950 shadow-2xs"
                          : "text-secondary-600 hover:text-secondary-950"
                      }`}
                    >
                      Manual
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPurposeMode("ai");
                        if (!activeSuggestions.purposes) fetchSuggestion("purposes");
                      }}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                        purposeMode === "ai"
                          ? "bg-white text-secondary-950 shadow-2xs"
                          : "text-secondary-600 hover:text-secondary-950"
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Saran dari AI</span>
                    </button>
                  </div>
                </div>

                {purposeMode === "manual" && (
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl text-xs font-bold text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {PRESET_PURPOSES.map((p) => (
                      <option key={p.label} value={p.label}>
                        {p.label} — {p.desc}
                      </option>
                    ))}
                  </select>
                )}

                {purposeMode === "ai" && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-secondary-500">
                        Tujuan terpilih:{" "}
                        <strong className="text-secondary-950">{purpose}</strong>
                      </span>
                      <button
                        type="button"
                        disabled={loadingSuggestionType === "purposes" || isGenerating}
                        onClick={() => fetchSuggestion("purposes", true)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        {loadingSuggestionType === "purposes" ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-amber-700" />
                            <span>Finding relevant suggestions...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-amber-700" />
                            <span>✨ Get AI Suggestions</span>
                          </>
                        )}
                      </button>
                    </div>

                    {activeSuggestions.purposes && activeSuggestions.purposes.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 p-3 bg-white rounded-xl border border-secondary-200">
                        {activeSuggestions.purposes.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setPurpose(p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                              purpose === p
                                ? "bg-primary-500 text-secondary-950 border-primary-600 shadow-2xs"
                                : "bg-secondary-50 text-secondary-700 border-secondary-200 hover:bg-secondary-100"
                            }`}
                          >
                            ○ {p} {purpose === p && "✓"}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-white rounded-xl border border-dashed border-secondary-200 text-center text-xs text-secondary-500">
                        Tekan <strong>✨ Get AI Suggestions</strong> untuk rekomendasi tujuan artikel.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 6 & 7. GAYA PENULISAN & PANJANG ARTIKEL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gaya Penulisan */}
                <div className="p-4 rounded-2xl bg-secondary-50/70 border border-secondary-200/80 space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-secondary-900">
                    6. Gaya Penulisan *
                  </label>
                  <select
                    disabled={isGenerating}
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl text-xs font-bold text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Travel Blog">Travel Blog — Natural & Eksploratif</option>
                    <option value="Informative">Informative — Faktual & Praktis</option>
                    <option value="Promotional">Promotional — Menarik Minat Booking</option>
                    <option value="Storytelling">Storytelling — Narasi Pengalaman</option>
                  </select>
                </div>

                {/* Panjang Artikel */}
                <div className="p-4 rounded-2xl bg-secondary-50/70 border border-secondary-200/80 space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-secondary-900">
                    7. Panjang Artikel *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Short", count: "~500 words", val: "500 words" },
                      { label: "Medium", count: "~800 words", val: "800 words" },
                      { label: "Long", count: "~1200 words", val: "1200 words" },
                      { label: "Comprehensive", count: "~1500 words", val: "1500 words" },
                    ].map((len) => (
                      <button
                        key={len.val}
                        type="button"
                        onClick={() => setArticleLength(len.val as any)}
                        className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                          articleLength === len.val
                            ? "bg-primary-500/15 border-primary-500 text-secondary-950 font-bold shadow-2xs"
                            : "bg-white border-secondary-200 text-secondary-700 hover:bg-secondary-100"
                        }`}
                      >
                        <div className="text-[11px] font-black">{len.label}</div>
                        <div className="text-[10px] text-secondary-400">{len.count}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 8. PRIMARY KEYWORD */}
              <div className="p-4 rounded-2xl bg-secondary-50/70 border border-secondary-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-secondary-900 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-primary-600" />
                    <span>8. Primary Keyword</span>
                  </label>

                  <div className="flex items-center gap-1 bg-secondary-200/60 p-0.5 rounded-lg text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setPrimaryKeywordMode("ai");
                        if (!activeSuggestions.primaryKeywords) fetchSuggestion("primaryKeywords");
                      }}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                        primaryKeywordMode === "ai"
                          ? "bg-white text-secondary-950 shadow-2xs"
                          : "text-secondary-600 hover:text-secondary-950"
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Saran dari AI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrimaryKeywordMode("manual")}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                        primaryKeywordMode === "manual"
                          ? "bg-white text-secondary-950 shadow-2xs"
                          : "text-secondary-600 hover:text-secondary-950"
                      }`}
                    >
                      Manual
                    </button>
                  </div>
                </div>

                {primaryKeywordMode === "ai" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-secondary-500">
                        Rekomendasi kata kunci utama berdasarkan topik & konteks:
                      </span>
                      <button
                        type="button"
                        disabled={loadingSuggestionType === "primaryKeywords" || isGenerating}
                        onClick={() => fetchSuggestion("primaryKeywords", true)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        {loadingSuggestionType === "primaryKeywords" ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-amber-700" />
                            <span>Finding relevant suggestions...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-amber-700" />
                            <span>✨ Get AI Suggestions</span>
                          </>
                        )}
                      </button>
                    </div>

                    {activeSuggestions.primaryKeywords && activeSuggestions.primaryKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 p-3 bg-white rounded-xl border border-secondary-200">
                        {activeSuggestions.primaryKeywords.map((kw, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setPrimaryKeyword(kw)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                              primaryKeyword === kw
                                ? "bg-amber-500 text-secondary-950 border-amber-600 shadow-2xs"
                                : "bg-secondary-50 text-secondary-700 border-secondary-200 hover:bg-secondary-100"
                            }`}
                          >
                            ○ {kw} {primaryKeyword === kw && "✓"}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-white rounded-xl border border-dashed border-secondary-200 text-center text-xs text-secondary-500">
                        Tekan <strong>✨ Get AI Suggestions</strong> untuk menghasilkan saran kata kunci SEO utama.
                      </div>
                    )}
                  </div>
                )}

                <input
                  type="text"
                  value={primaryKeyword}
                  onChange={(e) => setPrimaryKeyword(e.target.value)}
                  placeholder="Contoh: Mount Ijen blue fire safety (dapat diedit manual)"
                  className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl text-xs font-medium text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* 9. SECONDARY KEYWORDS */}
              <div className="p-4 rounded-2xl bg-secondary-50/70 border border-secondary-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-secondary-900 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-primary-600" />
                    <span>9. Secondary Keywords & LSI</span>
                  </label>

                  <div className="flex items-center gap-1 bg-secondary-200/60 p-0.5 rounded-lg text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setSecondaryKeywordMode("ai");
                        if (!activeSuggestions.secondaryKeywords)
                          fetchSuggestion("secondaryKeywords");
                      }}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                        secondaryKeywordMode === "ai"
                          ? "bg-white text-secondary-950 shadow-2xs"
                          : "text-secondary-600 hover:text-secondary-950"
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Saran dari AI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSecondaryKeywordMode("manual")}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                        secondaryKeywordMode === "manual"
                          ? "bg-white text-secondary-950 shadow-2xs"
                          : "text-secondary-600 hover:text-secondary-950"
                      }`}
                    >
                      Input Manual
                    </button>
                  </div>
                </div>

                {/* Secondary Keywords Active List */}
                <div className="flex flex-wrap items-center gap-1.5 min-h-[36px] p-2 bg-white rounded-xl border border-secondary-200">
                  <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider px-1">
                    Keywords Aktif ({secondaryKeywords.length}):
                  </span>
                  {secondaryKeywords.length > 0 ? (
                    secondaryKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-secondary-100 text-secondary-800 text-xs font-semibold inline-flex items-center gap-1 border border-secondary-200"
                      >
                        <span>#{kw}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleSecondaryKeyword(kw)}
                          className="hover:text-red-700 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-secondary-400 italic">
                      Belum ada secondary keywords dipilih.
                    </span>
                  )}
                </div>

                {secondaryKeywordMode === "ai" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-secondary-500">
                        Klik kata kunci untuk menambah / menghapus dari daftar:
                      </span>
                      <button
                        type="button"
                        disabled={loadingSuggestionType === "secondaryKeywords" || isGenerating}
                        onClick={() => fetchSuggestion("secondaryKeywords", true)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        {loadingSuggestionType === "secondaryKeywords" ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-amber-700" />
                            <span>Finding relevant suggestions...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-amber-700" />
                            <span>✨ Get AI Suggestions</span>
                          </>
                        )}
                      </button>
                    </div>

                    {activeSuggestions.secondaryKeywords &&
                    activeSuggestions.secondaryKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 p-3 bg-white rounded-xl border border-secondary-200">
                        {activeSuggestions.secondaryKeywords.map((kw, idx) => {
                          const isSelected = secondaryKeywords.includes(kw);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleToggleSecondaryKeyword(kw)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                                isSelected
                                  ? "bg-secondary-900 text-white border-secondary-950 shadow-2xs"
                                  : "bg-secondary-50 text-secondary-700 border-secondary-200 hover:bg-secondary-100"
                              }`}
                            >
                              {isSelected ? "☑" : "○"} #{kw}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3 bg-white rounded-xl border border-dashed border-secondary-200 text-center text-xs text-secondary-500">
                        Tekan <strong>✨ Get AI Suggestions</strong> untuk mendapatkan ide secondary keywords.
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={manualKeywordInput}
                    onChange={(e) => setManualKeywordInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddManualKeyword()}
                    placeholder="Tambah keyword manual lalu tekan Tambah..."
                    className="flex-1 px-4 py-2 bg-white border border-secondary-200 rounded-xl text-xs font-medium text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualKeyword}
                    className="px-4 py-2 rounded-xl bg-secondary-900 hover:bg-secondary-800 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>
              </div>

              {/* 10. SEO OPTIONS & BOOKING CTA */}
              <div className="p-4 rounded-2xl bg-secondary-50/70 border border-secondary-200/80 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-secondary-200">
                  <Search className="w-4 h-4 text-primary-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-secondary-900">
                    10. Optimasi Tambahan & CTA
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
                    <span>SEO Title</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-secondary-800 select-none">
                    <input
                      type="checkbox"
                      checked={generateMetaDesc}
                      onChange={(e) => setGenerateMetaDesc(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 accent-primary-500 cursor-pointer"
                    />
                    <span>Meta Description</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-secondary-800 select-none">
                    <input
                      type="checkbox"
                      checked={generateSlug}
                      onChange={(e) => setGenerateSlug(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 accent-primary-500 cursor-pointer"
                    />
                    <span>Slug URL</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-secondary-800 select-none">
                    <input
                      type="checkbox"
                      checked={generateKeywords}
                      onChange={(e) => setGenerateKeywords(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 accent-primary-500 cursor-pointer"
                    />
                    <span>Keywords & Tags</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-secondary-800 select-none">
                    <input
                      type="checkbox"
                      checked={generateFaq}
                      onChange={(e) => setGenerateFaq(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 accent-primary-500 cursor-pointer"
                    />
                    <span>FAQ Section (3-5 items)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-secondary-800 select-none">
                    <input
                      type="checkbox"
                      checked={includeCta}
                      onChange={(e) => setIncludeCta(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                    />
                    <span className="text-amber-900 font-bold">Booking CTA (Ijen Tour)</span>
                  </label>
                </div>
              </div>

              {/* Cover Image Notice Card */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-300/50 flex items-center justify-between text-xs text-amber-950">
                <div className="flex items-center gap-2">
                  <span className="font-black text-amber-800 uppercase tracking-wider text-[10px]">
                    Cover Image
                  </span>
                  <span>
                    Upload gambar sampul sepenuhnya dikontrol Admin melalui Supabase Storage pada form editor setelah draft dihasilkan.
                  </span>
                </div>
              </div>

              {/* Generating Animation State */}
              {isGenerating && (
                <div className="p-6 rounded-2xl bg-secondary-950 text-white flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
                    <Sparkles className="w-5 h-5 text-primary-400 absolute inset-0 m-auto" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      Gemini AI Sedang Menulis Artikel Sesuai Preferensi Anda...
                    </h4>
                    <p className="text-xs text-secondary-400 mt-1 max-w-md">
                      Menerapkan sudut pandang "{focus || topic}", mengoptimalkan kata kunci #{primaryKeyword || "Mount Ijen"}, menyusun markdown terstruktur dan FAQ.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Result Preview Section */
            <div className="space-y-6">
              {/* Summary Bar */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-emerald-950">
                      Draft Artikel Berhasil Dibuat!
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      Tinjau hasil di bawah ini. Anda dapat memasukkannya langsung ke form editor untuk diperiksa dan diedit.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setGeneratedResult(null)}
                  className="px-3 py-1.5 rounded-xl border border-secondary-300 bg-white hover:bg-secondary-100 text-secondary-700 text-xs font-bold transition flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Ubah Parameter / Regenerate</span>
                </button>
              </div>

              {/* Preview Tabs */}
              <div className="flex border-b border-secondary-200 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`pb-3 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "preview"
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
                  className={`pb-3 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "seo"
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
                  className={`pb-3 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "markdown"
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
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary-500 text-secondary-950 font-black text-[10px] uppercase tracking-wider">
                      {generatedResult.category || category}
                    </span>
                    <span className="text-[11px] text-secondary-400 font-medium">•</span>
                    <span className="text-[11px] text-secondary-600 font-semibold">
                      {generatedResult.readTime || "5 Menit Baca"}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-secondary-950 leading-snug">
                    {generatedResult.title}
                  </h2>

                  {generatedResult.excerpt && (
                    <div className="p-4 rounded-xl bg-white border-l-4 border-primary-500 text-secondary-700 italic text-xs sm:text-sm leading-relaxed shadow-2xs">
                      "{generatedResult.excerpt}"
                    </div>
                  )}

                  <div className="bg-white p-6 rounded-2xl border border-secondary-200/80 shadow-2xs">
                    <MarkdownRenderer content={generatedResult.content} />
                  </div>

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
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-secondary-50 border border-secondary-100 space-y-1"
                          >
                            <p className="text-xs font-bold text-secondary-950">
                              Q: {item.question}
                            </p>
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

                  <div className="bg-white p-5 rounded-xl border border-secondary-200/80 space-y-4 shadow-2xs">
                    <div>
                      <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block mb-2">
                        Keywords Terpilih
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
        <div className="px-5 sm:px-6 py-4 border-t border-secondary-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-secondary-50/50 shrink-0">
          <div className="text-[11px] text-secondary-500">
            {generatedResult ? (
              <span>
                Hasil AI akan dimasukkan ke form sebagai <strong>Draft</strong>. Anda dapat mengedit teks & memilih gambar sebelum memublikasikan.
              </span>
            ) : (
              <span>
                Admin menentukan → AI menyarankan → Admin memilih → Generate draft artikel.
              </span>
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
                    <span>Menghasilkan Draft...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>✨ Generate Article</span>
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
