"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Calendar, Mail, User, Sparkles, ExternalLink } from "lucide-react";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = () => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNotifications(data.notifications || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Pusat Pesan & Log
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary-950 tracking-tight">
            Notifikasi Sistem Real-time
          </h1>
          <p className="text-xs sm:text-sm text-secondary-600 mt-1">
            Pemberitahuan otomatis saat terjadi reservasi baru, pertanyaan kontak, atau registrasi pengguna.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 rounded-2xl bg-secondary-100 hover:bg-secondary-200 text-secondary-800 font-bold text-xs transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <CheckCheck className="w-4 h-4 text-emerald-600" />
          <span>Tandai Semua Sudah Dibaca</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-xs">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center text-xs text-secondary-400">
            Belum ada notifikasi tercatat.
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  n.unread
                    ? "bg-primary-50/50 border-primary-200"
                    : "bg-secondary-50/60 border-secondary-200/70"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      n.type === "booking"
                        ? "bg-amber-100 text-amber-700"
                        : n.type === "contact"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {n.type === "booking" && <Calendar className="w-4 h-4" />}
                    {n.type === "contact" && <Mail className="w-4 h-4" />}
                    {n.type !== "booking" && n.type !== "contact" && <User className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-secondary-950">{n.title}</h3>
                      {n.unread && (
                        <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-xs text-secondary-600 mt-0.5 leading-relaxed">{n.description}</p>
                    <span className="text-[10px] text-secondary-400 block mt-1">{n.time}</span>
                  </div>
                </div>

                {n.link && (
                  <Link
                    href={n.link}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-secondary-300 hover:border-primary-500 text-secondary-800 text-xs font-bold transition flex items-center gap-1 self-start sm:self-center shrink-0 shadow-2xs"
                  >
                    <span>Buka Rincian</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
