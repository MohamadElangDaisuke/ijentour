"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  KeyRound,
  Clock,
  Server,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Terminal,
  Activity,
  Cpu,
  Globe,
  Database,
  ExternalLink,
  Info,
  Sliders,
} from "lucide-react";
import AdminPageHeader from "@/app/component/admin/AdminPageHeader";
import AdminStatsCard from "@/app/component/admin/AdminStatsCard";

export default function AdminSecurityPage() {
  const [loading, setLoading] = useState(true);
  const [securityData, setSecurityData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const loadSecurityConfig = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch("/api/admin/security");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal memuat status konfigurasi keamanan.");
      }
      setSecurityData(data.config);
    } catch (err: any) {
      console.error("Security load error:", err);
      setErrorMsg(err.message || "Gagal memuat konfigurasi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityConfig();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      <AdminPageHeader
        title="Security Settings & Hardening"
        description="Inspect cryptographic parameters, session defenses, active rate-limiting tiers, and security audit integrity."
        breadcrumbs={[{ label: "System", href: "/admin/settings" }, { label: "Security" }]}
        action={
          <button
            onClick={() => loadSecurityConfig()}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Pindai Status Keamanan</span>
          </button>
        }
      />

      {errorMsg ? (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      ) : null}

      {/* Top Security Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          title="Autentikasi JWT"
          value="HS256"
          icon={<KeyRound className="w-5 h-5" />}
          subtitle="jose library / HttpOnly Cookie"
          theme="gold"
        />
        <AdminStatsCard
          title="Hashing Password"
          value="Bcrypt 10"
          icon={<Lock className="w-5 h-5" />}
          subtitle="2^10 cost factor iterations"
          theme="teal"
        />
        <AdminStatsCard
          title="OTP Verification"
          value="6 Digits"
          icon={<ShieldCheck className="w-5 h-5" />}
          subtitle="PostgreSQL distributed persistent"
          theme="emerald"
        />
        <AdminStatsCard
          title="Arsitektur Rate Limiter"
          value="Hybrid Tier"
          icon={<Activity className="w-5 h-5" />}
          subtitle="In-Memory + Database Defense"
          theme="amber"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-44 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
      ) : securityData ? (
        <div className="space-y-8 text-xs">
          {/* Section 1: Authentication & Secret Status */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Konfigurasi Autentikasi & Rahasia Kriptografi
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Standar penandatanganan token JWT dan proteksi kredensial login administrator.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Memenuhi Standar Keamanan</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Algoritma Penandatanganan</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{securityData.authentication.algorithm}</p>
                <p className="text-[11px] text-slate-500">Menggunakan library terenkripsi modern jose (Zero Dependencies).</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Durasi Sesi Sesi Aktif</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{securityData.authentication.sessionDuration}</p>
                <p className="text-[11px] text-slate-500">Token diperbarui saat verifikasi OTP selesai.</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Metode Penyimpanan Token</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{securityData.authentication.tokenType}</p>
                <p className="text-[11px] text-slate-500">Kebijakan: HttpOnly=true, SameSite=Lax, Secure=Auto</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Kekuatan Kunci JWT_SECRET</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {securityData.authentication.secretStatus.currentLength} Karakter
                  </span>
                  <span className="text-[10px] text-slate-400">(Minimal 32 karakter)</span>
                </div>
                <p className="text-[11px] text-slate-500">Kunci terlindungi dan tidak dibocorkan ke browser.</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Hashing Kata Sandi</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {securityData.authentication.passwordHashing.algorithm} ({securityData.authentication.passwordHashing.costFactor})
                </p>
                <p className="text-[11px] text-slate-500">Tahan terhadap serangan kamus (*dictionary*) dan brute-force.</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Lingkungan Server</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {securityData.environment.serverlessPlatform}
                </p>
                <p className="text-[11px] text-slate-500">Node.js {securityData.environment.nodeEnv} Environment</p>
              </div>
            </div>
          </div>

          {/* Section 2: OTP Verification Security */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Arsitektur Verifikasi Email OTP
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Sistem kode verifikasi sekali pakai yang terikat langsung ke database PostgreSQL.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                <span>Distributed Persistent</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Format & Masa Berlaku</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{securityData.otpSystem.format}</p>
                <p className="text-[11px] text-slate-500">Kedaluwarsa otomatis dalam {securityData.otpSystem.ttlMinutes} menit.</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Jeda Permintaan Ulang (Cooldown)</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{securityData.otpSystem.resendCooldownSeconds} Detik Cooldown</p>
                <p className="text-[11px] text-slate-500">Mencegah spam email bertubi-tubi ke alamat yang sama.</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Batas Percobaan Maksimal</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{securityData.otpSystem.maxAttemptsPerOtp} Kali Kesempatan</p>
                <p className="text-[11px] text-slate-500">Kode langsung dihanguskan bila salah 5 kali berturut-turut.</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Media Penyimpanan & Status</span>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">{securityData.otpSystem.storage}</p>
                <p className="text-[11px] text-slate-500">Hashed via Bcrypt, persisten lintas instansi Vercel.</p>
              </div>
            </div>
          </div>

          {/* Section 3: Rate Limiting Matrix */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Matriks Pembatasan Laju Permintaan (Rate Limiting)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Spesifikasi ambang batas perlindungan terhadap serangan denial-of-service dan brute-force.
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Defense-in-Depth Layer</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Fitur / Endpoint</th>
                    <th className="py-2.5 px-3">Batas Maksimum</th>
                    <th className="py-2.5 px-3">Arsitektur Penyimpanan</th>
                    <th className="py-2.5 px-3">Respons Saat Melampaui Batas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                  {securityData.rateLimiting.limits.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-800 dark:text-slate-200">
                        {item.name}
                      </td>
                      <td className="py-2.5 px-3 text-amber-700 dark:text-amber-400 font-semibold">
                        {item.limit}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {item.storage}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-500 text-[11px]">
                        {item.actionOnLimit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] flex items-start gap-2.5">
              <Info className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
              <span>{securityData.rateLimiting.serverlessNote}</span>
            </div>
          </div>

          {/* Section 4: Data Protection & Privacy Principles */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-primary-500" />
              <span>Prinsip Perlindungan Data Pribadi & Hak Akses</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Privasi Ulasan Pelanggan (Data Minimization)</span>
                <p className="text-[11px] text-slate-500">
                  {securityData.dataProtection.customerEmailPrivacy}. Email pelanggan tidak pernah diteruskan ke browser publik.
                </p>
              </div>

              <div className="p-3.5 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Integritas Lencana Customer</span>
                <p className="text-[11px] text-slate-500">
                  {securityData.dataProtection.reviewCustomerBadge}. Mencegah klaim lencana verifikasi tanpa transaksi nyata.
                </p>
              </div>

              <div className="p-3.5 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Jejak Audit Administratif</span>
                <p className="text-[11px] text-slate-500">
                  {securityData.dataProtection.auditTrail}. Melacak riwayat pembuatan, perubahan profil, dan penghapusan akun staf/admin.
                </p>
              </div>

              <div className="p-3.5 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Hierarki Hak Akses Ketat</span>
                <p className="text-[11px] text-slate-500">
                  {securityData.dataProtection.roleHierarchy}. Admin biasa dilarang mengakses halaman pengaturan, log audit, atau akun admin.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

