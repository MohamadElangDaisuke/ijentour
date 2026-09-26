"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Phone, ArrowRight, AlertCircle, Crown, Compass } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mendaftarkan akun.");
      }

      if (role === "MITRA") {
        router.push("/mitra");
      } else {
        router.push("/customer");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Gagal membuat akun.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-secondary-50 text-secondary-950 min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 border border-secondary-200/90 shadow-xl relative text-secondary-950 my-8">
        <div className="text-center space-y-2 mb-8">
          <Link href="/" className="inline-block text-2xl font-black tracking-tight text-secondary-950 mb-1">
            Ijen<span className="text-primary-500 font-extrabold">Tour</span>
          </Link>
          <h1 className="text-2xl font-black text-secondary-950 tracking-tight">
            Buat Akun Penjelajah Baru
          </h1>
          <p className="text-xs text-secondary-600">
            Daftar untuk menikmati kemudahan reservasi dan diskon eksklusif.
          </p>
        </div>

        {error && (
          <div className="p-3.5 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Role selector */}
          <div>
            <label className="block text-xs font-bold text-secondary-800 mb-1.5">
              Pilih Jenis Akun
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole("CUSTOMER")}
                className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                  role === "CUSTOMER"
                    ? "border-primary-500 bg-primary-50 text-secondary-950 font-black shadow-xs"
                    : "border-secondary-200 bg-secondary-50 text-secondary-700 font-semibold text-xs"
                }`}
              >
                <User className="w-4 h-4 mx-auto mb-1 text-secondary-800" />
                <span className="text-xs">Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("CUSTOMER_PRO")}
                className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                  role === "CUSTOMER_PRO"
                    ? "border-primary-500 bg-primary-50 text-secondary-950 font-black shadow-xs"
                    : "border-secondary-200 bg-secondary-50 text-secondary-700 font-semibold text-xs"
                }`}
              >
                <Crown className="w-4 h-4 mx-auto mb-1 text-primary-600" />
                <span className="text-xs">Customer Pro</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("MITRA")}
                className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                  role === "MITRA"
                    ? "border-primary-500 bg-primary-50 text-secondary-950 font-black shadow-xs"
                    : "border-secondary-200 bg-secondary-50 text-secondary-700 font-semibold text-xs"
                }`}
              >
                <Compass className="w-4 h-4 mx-auto mb-1 text-secondary-800" />
                <span className="text-xs">Mitra Guide</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary-800 mb-1.5">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                Alamat Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                Nomor WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary-800 mb-1.5">
              Kata Sandi *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <span>{loading ? "MEMPROSES..." : "DAFTAR SEKARANG"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-secondary-600">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-bold underline">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
