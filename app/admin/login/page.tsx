"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mountain, Mail, Lock, ArrowRight, AlertCircle, Info, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@ijentour.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk sebagai administrator.");
      }

      if (data.user?.role !== "ADMIN") {
        throw new Error("Akun ini tidak memiliki hak akses administrator.");
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Email atau kata sandi admin tidak valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-400/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-secondary-900 border border-secondary-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-400 mb-2">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight font-heading">
            Admin Portal Login
          </h1>
          <p className="text-xs text-secondary-400">
            Masuk untuk mengelola reservasi, paket tur, galeri, dan pengguna.
          </p>
        </div>

        {error && (
          <div className="p-3.5 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-secondary-300 mb-1.5">
              Email Administrator
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ijentour.com"
                className="w-full pl-10 pr-4 py-3 bg-secondary-950 border border-secondary-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Mail className="w-4 h-4 text-secondary-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary-300 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-secondary-950 border border-secondary-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Lock className="w-4 h-4 text-secondary-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <span>{loading ? "MEMVERIFIKASI..." : "LOGIN KE ADMIN PANEL"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Demo Credentials Alert */}
        <div className="mt-6 p-3.5 bg-primary-500/10 border border-primary-500/20 rounded-2xl flex gap-3 text-xs text-primary-200">
          <Info className="h-4 w-4 text-primary-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-white mb-0.5">Kredensial Bawaan:</p>
            <p>Email: <code className="text-primary-400 font-mono">admin@ijentour.com</code></p>
            <p>Password: <code className="text-primary-400 font-mono">admin123</code></p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-secondary-400">
          <Link href="/" className="text-primary-400 hover:text-primary-300 font-bold">
            ← Kembali ke Website Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
