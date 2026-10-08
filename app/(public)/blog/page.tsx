'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, Calendar, Clock, ArrowRight, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  defaultArticles,
  articleCategories,
  articlesStorageKey,
  type Article
} from '../../lib/articlesStorage';

export default function ArticlesPage() {
  const [articlesList, setArticlesList] = useState<Article[]>(defaultArticles);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 3;

  useEffect(() => {
    // 1. Fetch real blog posts from database
    fetch('/api/articles')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.articles && data.articles.length > 0) {
          setArticlesList(data.articles);
        }
      })
      .catch(() => {});

    // 2. Also check localStorage for local drafts
    const saved = window.localStorage.getItem(articlesStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setArticlesList((prev) => {
            const existingSlugs = new Set(prev.map((a: any) => a.slug || a.id));
            const newFromSaved = parsed.filter((p: any) => !existingSlugs.has(p.slug || p.id));
            return [...prev, ...newFromSaved];
          });
        }
      } catch (e) {
        console.error('Error loading articles from localStorage:', e);
      }
    }
  }, []);

  const featuredArticle = articlesList.find((a) => a.isFeatured) || articlesList[0];

  const filteredArticles = articlesList.filter((article) => {
    const matchesCategory =
      selectedCategory === 'Semua' || article.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      searchQuery === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Reset ke halaman 1 saat kategori atau pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / itemsPerPage));
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    const targetElement = document.getElementById('articles-grid-container');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="articles-page min-h-screen bg-secondary-50 text-secondary-950">

      {/* HERO SECTION */}
      <section aria-labelledby="articles-heading" className="relative flex h-[45vh] min-h-87.5 items-center justify-center text-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/HeroSection.webp')" }}
        >
          <div className="absolute inset-0 bg-secondary-950/70"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-16">
          <h1 id="articles-heading" className="mb-4 text-4xl font-black leading-tight text-white md:text-5xl">
            Artikel & Panduan Wisata
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Temukan inspirasi, tips perjalanan, dan cerita menarik seputar Kawah Ijen dan <span translate="no" className="notranslate">Banyuwangi</span>.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8 lg:text-left">

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-secondary-100 mb-12 gap-4">
          <div className="flex space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {articleCategories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-secondary-950 text-white shadow-sm"
                    : "bg-secondary-50 text-secondary-700 hover:bg-secondary-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari artikel..."
              className="w-full pl-10 pr-4 py-2 bg-secondary-50 border border-secondary-200 rounded-full text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400" />
          </div>
        </div>

        {/* FEATURED ARTICLE */}
        {featuredArticle && (() => {
          const featuredSlug = (featuredArticle as any).slug || featuredArticle.id;
          return (
            <article className="mb-16 flex flex-col overflow-hidden rounded-3xl border border-secondary-100 bg-white text-center shadow-sm lg:flex-row lg:text-left group">
              <Link href={`/blog/${featuredSlug}`} className="lg:w-1/2 relative h-64 lg:h-auto min-h-64 bg-secondary-100 block overflow-hidden">
                <img
                  src={featuredArticle.image}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/pkg-bluefire.png'; }}
                  alt={featuredArticle.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
              </Link>
              <div className="flex flex-col justify-center p-8 md:p-12 lg:w-1/2">
                <span className="mx-auto mb-4 w-max rounded-sm bg-primary-500 px-3 py-1 text-xs font-extrabold uppercase text-secondary-950 lg:mx-0">
                  Artikel Pilihan
                </span>
                <Link href={`/blog/${featuredSlug}`}>
                  <h2 className="text-2xl sm:text-3xl font-black text-secondary-950 mb-4 hover:text-primary-600 transition leading-tight">
                    {featuredArticle.title}
                  </h2>
                </Link>
                <p className="text-secondary-700 mb-6 leading-relaxed text-sm sm:text-base">
                  {featuredArticle.excerpt}
                </p>
                <div className="flex items-center text-sm text-secondary-500 mb-8 space-x-4 justify-center lg:justify-start">
                  <span className="flex items-center"><Calendar size={14} className="mr-1.5 text-primary-600" /> {featuredArticle.date}</span>
                  <span className="flex items-center"><Clock size={14} className="mr-1.5 text-primary-600" /> {featuredArticle.readTime}</span>
                </div>
                <Link
                  href={`/blog/${featuredSlug}`}
                  className="group mx-auto flex w-max items-center font-extrabold text-secondary-950 transition hover:text-primary-600 lg:mx-0"
                >
                  <span>Baca Selengkapnya</span>
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          );
        })()}

        {/* ARTICLES GRID */}
        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-secondary-200">
            <p className="text-secondary-500 font-medium">Tidak ada artikel yang sesuai dengan pencarian "{searchQuery}".</p>
          </div>
        ) : (
          <div id="articles-grid-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedArticles.map((article) => {
              const targetSlug = (article as any).slug || article.id;
              return (
                <article key={article.id || article.title} className="group flex flex-col overflow-hidden rounded-2xl border border-secondary-100 bg-white text-center shadow-sm transition duration-300 hover:shadow-md lg:text-left justify-between">
                  <div>
                    <Link href={`/blog/${targetSlug}`} className="relative aspect-video overflow-hidden bg-secondary-100 block">
                      <img
                        src={article.image}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/pkg-bluefire.png'; }}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-secondary-950 text-xs font-bold px-3 py-1.5 rounded-md shadow-xs">
                          {article.category}
                        </span>
                      </div>
                    </Link>
                    <div className="p-6 pb-2">
                      <div className="flex justify-between items-center text-xs text-secondary-500 mb-3">
                        <span>{article.date}</span>
                        <span className="flex items-center"><Clock size={12} className="mr-1" /> {article.readTime}</span>
                      </div>
                      <Link href={`/blog/${targetSlug}`}>
                        <h3 className="text-xl font-extrabold text-secondary-950 mb-3 line-clamp-2 group-hover:text-primary-600 transition leading-snug">
                          {article.title}
                        </h3>
                      </Link>
                      <p className="text-secondary-700 text-sm mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <Link
                      href={`/blog/${targetSlug}`}
                      className="group/btn inline-flex items-center text-sm font-extrabold text-secondary-950 transition hover:text-primary-600 cursor-pointer pt-2 border-t border-secondary-100 w-full"
                    >
                      <span>Baca Artikel</span>
                      <ArrowRight size={14} className="ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Dynamic Pagination */}
        {filteredArticles.length > 0 && totalPages > 1 && (
          <div className="flex flex-col items-center justify-center mt-12 gap-3">
            <div className="flex items-center justify-center space-x-2">
              {/* Tombol Sebelumnya */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Halaman sebelumnya"
                className={`flex items-center justify-center h-10 px-3 rounded-xl text-sm font-bold transition ${
                  currentPage === 1
                    ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed opacity-50'
                    : 'bg-white text-secondary-800 hover:bg-secondary-100 shadow-2xs cursor-pointer active:scale-95'
                }`}
              >
                <ChevronLeft size={16} className="mr-1" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Tombol Nomor Halaman */}
              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1;
                const isActive = currentPage === pageNumber;
                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => handlePageChange(pageNumber)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-secondary-950 text-white shadow-md scale-105'
                        : 'bg-white text-secondary-700 hover:bg-secondary-100 hover:text-secondary-950 shadow-2xs cursor-pointer active:scale-95'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              {/* Tombol Selanjutnya */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Halaman selanjutnya"
                className={`flex items-center justify-center h-10 px-3 rounded-xl text-sm font-bold transition ${
                  currentPage === totalPages
                    ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed opacity-50'
                    : 'bg-white text-secondary-800 hover:bg-secondary-100 shadow-2xs cursor-pointer active:scale-95'
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>

            <p className="text-xs text-secondary-500 font-medium">
              Menampilkan {paginatedArticles.length} dari {filteredArticles.length} artikel (Halaman {currentPage} dari {totalPages})
            </p>
          </div>
        )}

      </main>
    </div>
  );
}