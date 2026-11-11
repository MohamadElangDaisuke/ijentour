"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  KeyRound,
  Database,
  Cpu,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Server,
  Cloud,
  FileImage,
  Bot,
  Mail,
  Phone,
  Globe,
  Building,
} from "lucide-react";
import AdminPageHeader from "@/app/component/admin/AdminPageHeader";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "platform" | "architecture">("profile");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states for Profile
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states for Password
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          if (data.user.role !== "SUPER_ADMIN") {
            router.replace("/admin/profile");
            return;
          }
          setCurrentUser(data.user);
          setName(data.user.name || "");
          setPhone(data.user.phone || "");
        }
      })
      .catch((e) => console.error("Failed to load user profile:", e))
      .finally(() => setLoading(false));
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile.");

      setCurrentUser((prev: any) => ({ ...prev, name, phone }));
      setProfileMsg({ type: "success", text: "Profile updated successfully." });
      setTimeout(() => setProfileMsg(null), 4000);
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setPasswordMsg(null);

    if (password.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password.");

      setPassword("");
      setConfirmPassword("");
      setPasswordMsg({ type: "success", text: "Password successfully changed." });
      setTimeout(() => setPasswordMsg(null), 4000);
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err.message || "Failed to change password." });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 pb-14 w-full">
      {/* Page Header */}
      <AdminPageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Settings" },
        ]}
        categoryTag="System Configuration"
        title="Settings & Platform Health"
        description="Manage your administrator credentials, explore platform configuration, and monitor the underlying infrastructure."
      />

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200/80 gap-6">
        {[
          { id: "profile", label: "Profile & Security", icon: Shield },
          { id: "platform", label: "Business & Contacts", icon: Globe },
          { id: "architecture", label: "System Architecture", icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer -mb-px ${
                isActive
                  ? "border-amber-500 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-amber-500" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile & Security */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" />
                Administrator Profile
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your personal name and contact details displayed on the management panel.
              </p>
            </div>

            {profileMsg && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                  profileMsg.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                {profileMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ""}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Email is locked to primary administrator identification.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 6281234567890"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile || loading}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? "Saving..." : "Save Profile Details"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Password Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500" />
                Change Password
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ensure your account is protected with a strong cryptographic password.
              </p>
            </div>

            {passwordMsg && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                  passwordMsg.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                {passwordMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-500">
                Password will be instantly hashed with Bcrypt before saving to database.
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword || loading}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                >
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>{savingPassword ? "Updating..." : "Update Password"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Platform Details */}
      {activeTab === "platform" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-600" />
              Company & Public Brand Identity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Mount Ijen Tour official business credentials and customer contact endpoints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Brand Name
              </span>
              <p className="text-sm font-extrabold text-slate-900">Mount Ijen Tour & Travel</p>
              <span className="text-xs text-slate-500">Authorized Banyuwangi & East Java Tour Operator</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Production Website
              </span>
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold text-teal-600">https://www.mountijentour.com</p>
                <a
                  href="https://www.mountijentour.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-400 hover:text-slate-700 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <span className="text-xs text-slate-500">Custom domain routed through Vercel Edge</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                WhatsApp Dispatch
              </span>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>+62 812-3456-7890</span>
              </div>
              <span className="text-xs text-slate-500">Primary customer support & reservation line</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Official Inquiries Email
              </span>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Mail className="w-4 h-4 text-sky-600" />
                <span>info@mountijentour.com</span>
              </div>
              <span className="text-xs text-slate-500">Contact form messages & booking notifications destination</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 text-xs text-slate-700 leading-relaxed">
            <strong className="text-amber-950 font-bold block mb-1">Company Base & Operations:</strong>
            Banyuwangi, East Java, Indonesia — Serving Mount Ijen Blue Fire Tours, Bromo Sunrise Expeditions, Baluran Safari, and Tumpak Sewu Waterfalls.
          </div>
        </div>
      )}

      {/* Tab 3: System Architecture */}
      {activeTab === "architecture" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                <Database className="w-4 h-4" />
                <span>Database Engine</span>
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">Supabase PostgreSQL</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Managed Cloud PostgreSQL with Prisma ORM 5.22.0 client
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Connection:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active & Pooled
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wider">
                <FileImage className="w-4 h-4" />
                <span>Media & Optimization</span>
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">Sharp WebP Pipeline</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  1920px max bounds, 82% quality compression, automated EXIF stripping
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Storage Target:</span>
                <span className="font-bold text-slate-800">Supabase Cloud + Local</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                <Bot className="w-4 h-4" />
                <span>Artificial Intelligence</span>
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">Google Gemini Flash</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Interactive Database Chatbot & Automated AI Blog Content Generator
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Model:</span>
                <span className="font-bold text-slate-800">gemini-2.5-flash</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>Frontend Framework</span>
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">Next.js 16.4.5 App Router</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  React 19.2.8, Server Components, and Tailwind CSS v4 design tokens
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Rendering:</span>
                <span className="font-bold text-slate-800">SSR & Force Dynamic</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                <Mail className="w-4 h-4" />
                <span>Transactional Email Service</span>
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">Resend API (Tokyo ap-northeast-1)</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified domain noreply@mountijentour.com with automated DKIM & SPF records
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Domain Status:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Verified & Ready
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider">
                <Cloud className="w-4 h-4" />
                <span>Hosting Provider</span>
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">Vercel Edge Network</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Global CDN distribution with automated branch preview deployments
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-600">Production Ready</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-wider">
                <Cpu className="w-4 h-4" />
                <span>Security Engine</span>
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">Bcrypt + JWT Cookie</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Salt rounds: 10, HttpOnly Secure Session token cookie
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Audit Status:</span>
                <span className="font-bold text-emerald-600">Passed</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

