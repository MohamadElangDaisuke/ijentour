"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mountain, Mail, Lock, ArrowRight, AlertCircle, Info, Sparkles, User, ShieldCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        throw new Error(data.error || "Gagal melakukan login.");
      }

      // Check role redirection
      const userRole = data.user?.role;
      if (from && from !== "/") {
        router.push(from);
      } else if (userRole === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (userRole === "MITRA") {
        router.push("/mitra");
      } else {
        router.push("/customer");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Email atau password tidak sesuai.");
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="bg-secondary-50 text-secondary-950 min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-secondary-200/90 shadow-xl relative text-secondary-950">
        <div className="text-center space-y-2 mb-8">
          <Link href="/" className="inline-block text-2xl font-black tracking-tight text-secondary-950 mb-2">
            Ijen<span className="text-primary-500 font-extrabold">Tour</span>
          </Link>
          <h1 className="text-2xl font-black text-secondary-950 tracking-tight">
            Masuk ke Akun Anda
          </h1>
          <p className="text-xs text-secondary-600">
            Akses dashboard pemesanan, tiket resmi, dan layanan eksklusif.
          </p>
        </div>

        {error && (
          <div className="p-3.5 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-secondary-800 mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Mail className="w-4 h-4 text-secondary-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary-800 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Lock className="w-4 h-4 text-secondary-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <span>{loading ? "MEMVERIFIKASI..." : "MASUK SEKARANG"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="mt-8 pt-6 border-t border-secondary-100">
          <p className="text-[11px] font-bold text-secondary-500 uppercase tracking-wider mb-2.5 text-center">
            Pilihan Akun Demo (Uji Coba Cepat):
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => setDemoAccount("admin@ijentour.com", "admin123")}
              className="p-2 rounded-xl bg-secondary-50 hover:bg-primary-50 border border-secondary-200 hover:border-primary-400 font-bold text-secondary-800 transition text-left cursor-pointer"
            >
              👑 Admin Panel
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount("pro@ijentour.com", "customer123")}
              className="p-2 rounded-xl bg-secondary-50 hover:bg-primary-50 border border-secondary-200 hover:border-primary-400 font-bold text-secondary-800 transition text-left cursor-pointer"
            >
              ⭐ Customer Pro
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount("john@example.com", "customer123")}
              className="p-2 rounded-xl bg-secondary-50 hover:bg-primary-50 border border-secondary-200 hover:border-primary-400 font-bold text-secondary-800 transition text-left cursor-pointer"
            >
              🎒 Customer
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount("mitra@ijentour.com", "mitra123")}
              className="p-2 rounded-xl bg-secondary-50 hover:bg-primary-50 border border-secondary-200 hover:border-primary-400 font-bold text-secondary-800 transition text-left cursor-pointer"
            >
              🧭 Mitra Guide
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-secondary-600">
          Belum memiliki akun?{" "}
          <Link href="/register" className="text-primary-600 hover:text-primary-700 font-bold underline">
            Daftar di sini
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
