"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Send,
  ShieldCheck,
  ShieldAlert,
  Server,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Users,
  BellRing,
  KeyRound,
  Inbox,
  Sparkles,
} from "lucide-react";
import AdminPageHeader from "@/app/component/admin/AdminPageHeader";
import Link from "next/link";

export default function AdminEmailSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/email-settings");
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setAdmins(data.admins || []);
        if (data.config?.adminNotificationEmail && !data.config.adminNotificationEmail.includes("Not Set")) {
          setTestEmail(data.config.adminNotificationEmail);
        }
      }
    } catch (err) {
      console.error("Failed to load email settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim()) return;

    setSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/email-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_test_email",
          recipient: testEmail.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send test email.");
      }

      setTestResult({
        type: "success",
        message: data.message || "Test email sent successfully!",
      });
    } catch (err: any) {
      setTestResult({
        type: "error",
        message: err.message || "An unexpected error occurred sending the test email.",
      });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <AdminPageHeader
        title="Email & Notification Architecture"
        description="Configure Resend transactional delivery, monitor admin notification recipients, and test email delivery."
        breadcrumbs={[{ label: "System", href: "/admin/settings" }, { label: "Email Settings" }]}
      />

      {loading ? (
        <div className="flex items-center justify-center p-16">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Status Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Resend Connection */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Server className="w-6 h-6" />
                  </div>
                  {config?.isConfigured ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active & Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Simulation Mode
                    </span>
                  )}
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Resend API Provider</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Primary transactional engine for OTPs and notifications.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Secret Key</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{config?.maskedApiKey}</span>
                </div>
              </div>
            </div>

            {/* 2. Sender Identity */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200">
                    Sender Verified
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Verified Sender</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Official outgoing address for all customers & staff.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">From Header</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                    {config?.senderName} &lt;{config?.senderEmail}&gt;
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Admin Notification Inbox */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200">
                    Primary Inbox
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Admin Alert Inbox</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Receives high-priority reservations & security alerts.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Target Inbox</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                    {config?.adminNotificationEmail}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Test Email Dispatcher */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs">
            <div className="max-w-2xl">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-500" />
                <span>Test Email Delivery</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Dispatch an official test email to verify DNS DKIM/SPF alignment and ensure your inbox does not flag notifications as spam.
              </p>

              {testResult && (
                <div
                  className={`mt-4 p-4 rounded-2xl text-xs flex items-start gap-3 border ${testResult.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300"
                      : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-300"
                    }`}
                >
                  {testResult.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <form onSubmit={handleSendTestEmail} className="mt-5 flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-hidden focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={sendingTest || !testEmail}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{sendingTest ? "Dispatching..." : "Send Test Email"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Per-Admin Notification Matrix */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <BellRing className="w-5 h-5 text-amber-500" />
                  <span>Admin Event Notification Routing</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Super Admin controls which event categories regular Admins receive. Regular Admins cannot modify their own settings.
                </p>
              </div>

              <Link
                href="/admin/users"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
              >
                <Users className="w-4 h-4" />
                <span>Configure in Users &amp; Admins</span>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                    <th className="py-3 px-4">Administrator</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-center">Bookings</th>
                    <th className="py-3 px-4 text-center">Custom Trips</th>
                    <th className="py-3 px-4 text-center">Customer Reviews</th>
                    <th className="py-3 px-4 text-center">Contact Messages</th>
                    <th className="py-3 px-4 text-center">Security Alerts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {admins.map((u) => {
                    const isSuper = u.role === "SUPER_ADMIN";
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                          <div className="font-mono text-[11px] text-slate-400">{u.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${isSuper
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-300"
                              }`}
                          >
                            {isSuper ? "Super Admin" : "Admin"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isSuper || u.preferences?.booking
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-400"
                              }`}
                          >
                            {isSuper || u.preferences?.booking ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isSuper || u.preferences?.customTrip
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-400"
                              }`}
                          >
                            {isSuper || u.preferences?.customTrip ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isSuper || u.preferences?.review
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-400"
                              }`}
                          >
                            {isSuper || u.preferences?.review ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isSuper || u.preferences?.contact
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-400"
                              }`}
                          >
                            {isSuper || u.preferences?.contact ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isSuper
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-slate-100 text-slate-400"
                              }`}
                          >
                            {isSuper ? "Mandatory" : "No Access"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* DNS & Environment Variable Guide */}
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-8 shadow-xl">
            <h4 className="font-black text-base flex items-center gap-2 text-amber-400 mb-2">
              <KeyRound className="w-5 h-5" />
              <span>Production Setup &amp; DNS Verification Guide</span>
            </h4>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mb-6">
              To send production emails through <strong>noreply@mountijentour.com</strong>, the following settings must be configured in your Resend Dashboard and DNS provider (Hostinger / Cloudflare):
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-amber-400 font-bold block mb-2">Vercel &amp; Local Environment Variables</span>
                <p className="text-slate-400 text-[11px] font-sans mb-3">Add these secrets in Vercel Settings &rarr; Environment Variables:</p>
                <div className="space-y-1 text-slate-300">
                  <div>RESEND_API_KEY=&quot;re_...&quot;</div>
                  <div>EMAIL_FROM=&quot;Mount Ijen Tour &lt;noreply@mountijentour.com&gt;&quot;</div>
                  <div>ADMIN_NOTIFICATION_EMAIL=&quot;your_gmail@gmail.com&quot;</div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-amber-400 font-bold block mb-2">Domain DNS Records (mountijentour.com)</span>
                <p className="text-slate-400 text-[11px] font-sans mb-3">Add in your domain DNS manager for 100% deliverability:</p>
                <div className="space-y-1 text-slate-300">
                  <div>TXT @ &quot;v=spf1 include:resend.com ~all&quot;</div>
                  <div>DKIM (resend._domainkey) provided in Resend</div>
                  <div>DMARC (_dmarc) &quot;v=DMARC1; p=none;&quot;</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
