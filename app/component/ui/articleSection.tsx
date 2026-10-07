'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { defaultArticles, articlesStorageKey, type Article } from '../../lib/articlesStorage';

export default function ArticleSection() {
  const [articles, setArticles] = useState<Article[]>(defaultArticles);

  useEffect(() => {
    fetch('/api/articles')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.articles && data.articles.length > 0) {
          setArticles(data.articles);
        }
      })
      .catch(() => {});

    const saved = window.localStorage.getItem(articlesStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setArticles((prev) => {
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

  const displayArticles = articles.slice(0, 3);

  return (
    <section id="articles" aria-labelledby="articles-heading" className="relative w-full overflow-hidden bg-white px-5 py-20 md:px-10 md:py-28">
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:items-end sm:text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600">Travel journal</p>
            <h2 id="articles-heading" className="mt-3 text-3xl font-black leading-tight text-secondary-950 md:text-5xl">Cerita dan panduan perjalanan.</h2>
          </div>
          <Link href="/blog" className="inline-flex items-center gap-2 rounded-full border border-secondary-300 px-5 py-3 text-sm font-bold text-secondary-800 transition hover:border-primary-500 hover:bg-primary-500 hover:text-secondary-950">
            Lihat semua artikel <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {displayArticles.map((article, index) => {
            const targetSlug = (article as any).slug || article.id;
            return (
              <motion.article
                key={article.id || article.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -6 }}
                className="overflow-hidden rounded-3xl border border-secondary-100 bg-secondary-50 shadow-sm group"
              >
                <Link href={`/blog/${targetSlug}`} className="block">
                  <div className="aspect-16/10 overflow-hidden bg-secondary-100">
                    <img
                      src={article.image}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/pkg-bluefire.png'; }}
                      alt={`${article.title} - artikel wisata Banyuwangi`}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5 text-center sm:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-600">{article.category}</p>
                    <h3 className="mt-2 text-lg font-extrabold leading-snug text-secondary-950 group-hover:text-primary-600 transition">{article.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-secondary-700 line-clamp-2">{article.excerpt}</p>
                    <div className="mt-5 flex items-center justify-between text-xs text-secondary-500">
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {article.readTime}</span>
                      <span className="font-bold text-primary-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">Baca →</span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
