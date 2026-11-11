"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Mail,
  KeyRound,
  ArrowRight,
} from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load current admin session info
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success && data.user) {
          setCurrentUser(data.user);
          // If already verified, redirect to dashboard immediately
          if (data.user.emailVerified) {
            router.push("/admin/dashboard");
          }
        }
      })
      .catch(() => router.push("/admin/login"))
      .finally(() => setLoadingUser(false));
  }, [router]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async () => {
    if (!currentUser?.email) return;
    setSendingOtp(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/users/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          userId: currentUser.id,
          email: currentUser.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirimkan kode OTP.");

      setSuccessMsg(
        data.devCode
          ? `[Simulasi Dev: ${data.devCode}] Kode OTP 6 digit berhasil dibuat. Berlaku 10 menit.`
          : `Kode OTP verifikasi telah dikirimkan ke email ${currentUser.email}.`
      );
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || "Gagal memproses permintaan OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || otpCode.trim().length !== 6) {
      setError("Silakan masukkan 6 digit kode OTP verifikasi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          userId: currentUser.id,
          email: currentUser.email,
          code: otpCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kode OTP salah atau telah kedaluwarsa.");

      setSuccessMsg("Verifikasi berhasil! Mengalihkan ke dashboard admin...");
      setTimeout(() => {
        router.push("/admin/dashboard");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Verifikasi OTP gagal.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 filter blur-[1px] pointer-events-none"
        style={{ backgroundImage: "url('/images/the-best-view-of-kawah.webp')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/70" />

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 text-slate-900 dark:text-white">
        {/* Header Icon */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner">
            <KeyRound className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {currentUser?.role === "SUPER_ADMIN" ? "Super Admin Onboarding" : "Aktivasi Akun Admin"}
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-2.5">
              Verifikasi Email Administrator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Akun Anda telah terdaftar namun belum melewati verifikasi email. Hak akses administratif terkunci hingga verifikasi OTP selesai.
            </p>
          </div>
        </div>

        {/* Account Info Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-[11px]">
            <span>Username:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              @{currentUser?.username || "admin"}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-[11px]">
            <span>Email Terdaftar:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
              {currentUser?.email}
            </span>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Kode OTP (6 Digit)
            </label>
            <input
              type="text"
              maxLength={6}
              autoFocus
              required
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              className="w-full text-center tracking-[0.5em] text-2xl font-black py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              disabled={sendingOtp || cooldown > 0}
              onClick={handleSendOtp}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 cursor-pointer disabled:opacity-50"
            >
              {sendingOtp ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengirimkan OTP...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{cooldown > 0 ? `Kirim ulang (${cooldown}d)` : "Kirim Kode OTP ke Email"}</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Kode OTP...</span>
                </>
              ) : (
                <>
                  <span>Verifikasi & Aktifkan Akses Penuh</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Sign Out Option */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-500 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar dari Akun Ini</span>
          </button>
        </div>
      </div>
    </div>
  );
}

