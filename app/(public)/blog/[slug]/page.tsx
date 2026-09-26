"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Check,
  Tag,
  BookOpen,
  ArrowRight,
  Sparkles,
  MapPin,
  Compass
} from "lucide-react";
import { defaultArticles, Article } from "@/app/lib/articlesStorage";
import { defaultPackages } from "@/app/lib/packagesStorage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogDetailPage({ params }: PageProps) {
  const resolved = use(params);
  const slug = resolved.slug;
  const router = useRouter();

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch current article from API
    fetch(`/api/articles/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.article) {
          setArticle(data.article);
        } else {
          // Fallback to local defaultArticles
          const found = defaultArticles.find(
            (a) => a.id === slug || a.title.toLowerCase().includes(slug.replace(/-/g, " ").toLowerCase())
          );
          if (found) setArticle(found);
        }
      })
      .catch(() => {
        const found = defaultArticles.find(
          (a) => a.id === slug || a.title.toLowerCase().includes(slug.replace(/-/g, " ").toLowerCase())
        );
        if (found) setArticle(found);
      })
      .finally(() => setLoading(false));

    // 2. Fetch other articles for sidebar / bottom suggestions
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.articles) {
          setRecentArticles(data.articles.filter((a: any) => (a.slug || a.id) !== slug).slice(0, 3));
        } else {
          setRecentArticles(defaultArticles.filter((a) => a.id !== slug).slice(0, 3));
        }
      })
      .catch(() => {
        setRecentArticles(defaultArticles.filter((a) => a.id !== slug).slice(0, 3));
      });
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      if (navigator.share && article) {
        navigator
          .share({
            title: article.title,
            text: article.excerpt || article.title,
            url: window.location.href,
          })
          .catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[70vh] bg-secondary-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-secondary-200 shadow-md">
          <BookOpen className="w-12 h-12 text-primary-500 mx-auto mb-3" />
          <h2 className="text-2xl font-black text-secondary-950 mb-2">Artikel Tidak Ditemukan</h2>
          <p className="text-secondary-600 text-xs sm:text-sm mb-6">
            Artikel yang Anda cari mungkin telah dipindahkan atau belum dipublikasikan.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary-500 text-secondary-950 font-bold text-xs hover:bg-primary-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Katalog Blog</span>
          </Link>
        </div>
      </div>
    );
  }

  // Parse raw text or markdown
  const articleContent = article.content || article.excerpt || "";

  return (
    <div className="bg-secondary-50 text-secondary-950 min-h-screen pb-24">
      {/* TOP HEADER / BREADCRUMB */}
      <section className="bg-white border-b border-secondary-200/80 pt-8 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary-600 hover:text-primary-600 transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Semua Artikel & Panduan</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-primary-500 text-secondary-950 uppercase tracking-wider shadow-2xs">
              {article.category || "Panduan"}
            </span>
            <span className="text-xs text-secondary-400 font-medium">•</span>
            <span className="text-xs text-secondary-600 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary-600" />
              {article.date || "Terbaru"}
            </span>
            <span className="text-xs text-secondary-400 font-medium">•</span>
            <span className="text-xs text-secondary-600 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary-600" />
              {article.readTime || "5 Menit Baca"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-secondary-950 tracking-tight leading-tight mb-6">
            {article.title}
          </h1>

          <div className="flex items-center justify-between border-t border-secondary-100 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-900 text-primary-400 font-bold flex items-center justify-center text-sm shadow-xs">
                {(article.author || "Ijen").charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-secondary-950">{article.author || "Tim Ekspedisi Ijen"}</p>
                <p className="text-[11px] text-secondary-500">Penulis & Spesialis Pariwisata Ijen</p>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl bg-secondary-100 hover:bg-secondary-200 text-secondary-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Bagikan artikel ini"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ARTICLE BODY & SIDEBAR */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        {/* Cover Photo */}
        <div className="relative aspect-16/9 rounded-3xl overflow-hidden mb-10 shadow-md border border-secondary-200/80 bg-secondary-100">
          <img
            src={article.image || "/images/HeroSection.webp"}
            alt={article.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/pkg-bluefire.png";
            }}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Body */}
        <article className="bg-white rounded-3xl p-8 sm:p-12 border border-secondary-200/80 shadow-xs mb-12">
          {article.excerpt && article.excerpt !== articleContent && (
            <div className="p-5 mb-8 rounded-2xl bg-primary-50/60 border-l-4 border-primary-500 text-secondary-800 italic text-sm sm:text-base leading-relaxed">
              "{article.excerpt}"
            </div>
          )}

          <div className="space-y-6 text-secondary-800 text-sm sm:text-base leading-relaxed">
            {articleContent.split("\n\n").map((para: string, idx: number) => {
              const trimmed = para.trim();
              if (trimmed.startsWith("### ")) {
                return (
                  <h3 key={idx} className="text-xl sm:text-2xl font-black text-secondary-950 pt-4">
                    {trimmed.replace("### ", "")}
                  </h3>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h2 key={idx} className="text-2xl sm:text-3xl font-black text-secondary-950 pt-6 pb-1 border-b border-secondary-100">
                    {trimmed.replace("## ", "")}
                  </h2>
                );
              }
              if (trimmed.startsWith("1. ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                return (
                  <ul key={idx} className="space-y-2.5 pl-6 list-disc text-secondary-700">
                    {trimmed.split("\n").map((item: string, i: number) => (
                      <li key={i} className="pl-1">
                        {item.replace(/^(\d+\.|\-|\*)\s+/, "")}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={idx} className="text-secondary-700">
                  {trimmed}
                </p>
              );
            })}
          </div>

          {/* Call to action inside article */}
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-secondary-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md">
            <div>
              <span className="text-xs font-bold text-primary-400 uppercase tracking-wider block mb-1">
                Ingin Mengalami Langsung?
              </span>
              <h4 className="text-xl sm:text-2xl font-black">
                Jelajahi Kawah Ijen Bersama Pemandu Profesional
              </h4>
              <p className="text-xs text-secondary-300 mt-1 max-w-lg">
                Dapatkan paket lengkap tiket resmi, masker gas berstandar internasional, dan penjemputan langsung di hotel Anda.
              </p>
            </div>
            <Link
              href="/packages"
              className="px-6 py-3 rounded-2xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-xs transition whitespace-nowrap shadow-sm text-center"
            >
              Lihat Paket Tur
            </Link>
          </div>
        </article>

        {/* RELATED ARTICLES */}
        {recentArticles.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600 block">
                  Bacaan Lainnya
                </span>
                <h3 className="text-2xl font-black text-secondary-950">Artikel Terkait</h3>
              </div>
              <Link
                href="/blog"
                className="text-xs font-bold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
              >
                <span>Semua Artikel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentArticles.map((item) => {
                const targetSlug = item.slug || item.id;
                return (
                  <Link
                    key={targetSlug}
                    href={`/blog/${targetSlug}`}
                    className="bg-white rounded-2xl border border-secondary-200/80 overflow-hidden shadow-xs hover:shadow-md transition group flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-16/10 overflow-hidden bg-secondary-100 relative">
                        <img
                          src={item.image || "/images/pkg-bluefire.png"}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-white/90 text-secondary-950 text-[10px] font-bold">
                          {item.category}
                        </span>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-sm text-secondary-950 line-clamp-2 group-hover:text-primary-600 transition mb-2">
                          {item.title}
                        </h4>
                        <p className="text-xs text-secondary-600 line-clamp-2">
                          {item.excerpt}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 pt-0 border-t border-secondary-100 flex items-center justify-between text-[11px] text-secondary-500 mt-2">
                      <span>{item.date}</span>
                      <span className="font-bold text-primary-600 flex items-center gap-1">
                        Baca <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
