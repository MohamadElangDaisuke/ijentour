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
        throw new Error(data.error || "Failed to load security configuration status.");
      }
      setSecurityData(data.config);
    } catch (err: any) {
      console.error("Security load error:", err);
      setErrorMsg(err.message || "Failed to load configuration.");
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
            <span>Scan Security Status</span>
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
          title="JWT Authentication"
          value="HS256"
          icon={<KeyRound className="w-5 h-5" />}
          subtitle="jose library / HttpOnly Cookie"
          theme="gold"
        />
        <AdminStatsCard
          title="Password Hashing"
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
          title="Rate Limiter Architecture"
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
                    Authentication & Cryptographic Secrets Configuration
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    JWT token signing standards and administrator login credential protection.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Meets Security Standards</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Signing Algorithm</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{securityData.authentication.algorithm}</p>
                <p className="text-[11px] text-slate-500">Powered by the modern jose encryption library (Zero Dependencies).</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Active Session Duration</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{securityData.authentication.sessionDuration}</p>
                <p className="text-[11px] text-slate-500">Token is refreshed when OTP verification completes.</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Token Storage Method</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{securityData.authentication.tokenType}</p>
                <p className="text-[11px] text-slate-500">Policy: HttpOnly=true, SameSite=Lax, Secure=Auto</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">JWT_SECRET Key Strength</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {securityData.authentication.secretStatus.currentLength} Characters
                  </span>
                  <span className="text-[10px] text-slate-400">(Minimum 32 characters)</span>
                </div>
                <p className="text-[11px] text-slate-500">Key is protected server-side and never exposed to browsers.</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Password Hashing</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {securityData.authentication.passwordHashing.algorithm} ({securityData.authentication.passwordHashing.costFactor})
                </p>
                <p className="text-[11px] text-slate-500">Resistant to dictionary and brute-force attacks.</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Server Environment</span>
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
                    Email OTP Verification Architecture
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    One-time verification code system bound directly to PostgreSQL.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                <span>Distributed Persistent</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Format & Expiration</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{securityData.otpSystem.format}</p>
                <p className="text-[11px] text-slate-500">Automatically expires in {securityData.otpSystem.ttlMinutes} minutes.</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Resend Cooldown Interval</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{securityData.otpSystem.resendCooldownSeconds} Seconds Cooldown</p>
                <p className="text-[11px] text-slate-500">Prevents repeated email spamming to the same address.</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Maximum Attempt Limit</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{securityData.otpSystem.maxAttemptsPerOtp} Attempts</p>
                <p className="text-[11px] text-slate-500">Code is immediately invalidated after 5 consecutive wrong attempts.</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Storage Medium & Status</span>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">{securityData.otpSystem.storage}</p>
                <p className="text-[11px] text-slate-500">Hashed via Bcrypt, persistent across Vercel instances.</p>
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
                    Request Rate Limiting Matrix
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Threshold specifications protecting against denial-of-service and brute-force attacks.
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Defense-in-Depth Layer</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Feature / Endpoint</th>
                    <th className="py-2.5 px-3">Maximum Limit</th>
                    <th className="py-2.5 px-3">Storage Architecture</th>
                    <th className="py-2.5 px-3">Response on Limit Exceeded</th>
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
              <span>Personal Data Protection & Access Control Principles</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Customer Review Privacy (Data Minimization)</span>
                <p className="text-[11px] text-slate-500">
                  {securityData.dataProtection.customerEmailPrivacy}. Customer emails are never forwarded to public browsers.
                </p>
              </div>

              <div className="p-3.5 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Customer Badge Integrity</span>
                <p className="text-[11px] text-slate-500">
                  {securityData.dataProtection.reviewCustomerBadge}. Prevents claiming verified badges without an actual booking.
                </p>
              </div>

              <div className="p-3.5 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Administrative Audit Trail</span>
                <p className="text-[11px] text-slate-500">
                  {securityData.dataProtection.auditTrail}. Tracks creation, profile edits, and deletions of staff/admin accounts.
                </p>
              </div>

              <div className="p-3.5 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Strict Role Access Hierarchy</span>
                <p className="text-[11px] text-slate-500">
                  {securityData.dataProtection.roleHierarchy}. Regular admins are blocked from settings, audit logs, or admin account management.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

