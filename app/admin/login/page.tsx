"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Compass,
} from "lucide-react";
import ThemeToggle from "@/app/component/ui/themeToggle";

export default function AdminLoginPage() {
  const router = useRouter();
  const [from, setFrom] = useState("/admin/dashboard");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const fromUrl = p.get("from");
      if (fromUrl) setFrom(fromUrl);
    }
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Silakan masukkan email dan kata sandi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login gagal. Silakan periksa kredensial Anda.");
      }

      // Successful login -> redirect to destination
      router.push(from);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat masuk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Background with Ambient Glow */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-[1px] scale-105 pointer-events-none"
        style={{ backgroundImage: "url('/images/the-best-view-of-kawah.webp')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-secondary-950 via-secondary-950/85 to-secondary-950/70" />

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-sky-500/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-black text-white tracking-tight group transition"
          >
            <div className="w-10 h-10 rounded-2xl bg-primary-500 text-secondary-950 flex items-center justify-center font-black shadow-lg shadow-primary-500/30 group-hover:scale-105 transition">
              <Compass className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span>
              Ijen<span className="text-primary-500">Tour</span>
            </span>
          </Link>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-300 text-[11px] font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-400" />
            <span>Portal Administrator Resmi</span>
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-black text-white tracking-tight">
            Masuk ke Panel Admin
          </h2>
          <p className="mt-1 text-xs text-secondary-400">
            Kelola katalog tur, destinasi, ulasan, dan seluruh konten website Ijen Tour.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-7 sm:p-9 shadow-2xl border border-white/20 text-secondary-950">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span className="font-semibold leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-secondary-800 mb-1.5">
                Email Administrator
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ijentour.com"
                  className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-2xl text-xs sm:text-sm font-medium text-secondary-950 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-secondary-800 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-secondary-50 border border-secondary-200 rounded-2xl text-xs sm:text-sm font-medium text-secondary-950 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-secondary-400 hover:text-secondary-700 transition cursor-pointer"
                  title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-primary-500 hover:bg-primary-400 active:scale-[0.99] text-secondary-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-primary-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Kredensial...</span>
                  </>
                ) : (
                  <span>Masuk ke Dashboard Admin →</span>
                )}
              </button>
            </div>
          </form>

          {/* Security Disclaimer */}
          <div className="mt-6 pt-5 border-t border-secondary-100 text-center">
            <p className="text-[11px] text-secondary-500 leading-relaxed">
              Autentikasi dilindungi dengan sesi terenkripsi JWT (HttpOnly). Akses ini dikhususkan bagi staf administrator resmi Ijen Tour.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Website Publik</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
