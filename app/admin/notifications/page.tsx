"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Calendar,
  Mail,
  User,
  ExternalLink,
  Filter,
  Check,
  Clock,
  Sparkles,
} from "lucide-react";
import AdminPageHeader from "@/app/component/admin/AdminPageHeader";
import AdminStatsCard from "@/app/component/admin/AdminStatsCard";
import { AdminCardListSkeleton } from "@/app/component/ui/skeleton";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  description: string;
  link?: string;
  unread: boolean;
  time: string;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"all" | "unread" | "booking" | "contact" | "user">("all");
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error("Failed to load notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    } catch (e) {
      console.error("Failed to mark all as read:", e);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
      );
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
    }
  };

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (typeFilter === "unread") return n.unread;
      if (typeFilter === "booking") return n.type === "booking";
      if (typeFilter === "contact") return n.type === "contact";
      if (typeFilter === "user") return n.type === "user" || n.type === "system";
      return true;
    });
  }, [notifications, typeFilter]);

  // Metric counts
  const totalCount = notifications.length;
  const unreadCount = notifications.filter((n) => n.unread).length;
  const bookingCount = notifications.filter((n) => n.type === "booking").length;
  const contactCount = notifications.filter((n) => n.type === "contact").length;

  return (
    <div className="space-y-6 pb-14 w-full">
      {/* Page Header */}
      <AdminPageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Notifications" },
        ]}
        categoryTag="Realtime Operations"
        title="Notification Center"
        description="Monitor system events, incoming booking alerts, customer inquiries, and staff activity in real time."
        action={
          unreadCount > 0 ? (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs tracking-wide shadow-sm hover:shadow transition disabled:opacity-60 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>{markingAll ? "Marking all..." : "Mark All as Read"}</span>
            </button>
          ) : undefined
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          title="Total Events"
          value={totalCount}
          subtitle="System recorded"
          theme="slate"
          icon={<Bell className="w-5 h-5" />}
        />
        <AdminStatsCard
          title="Unread Alerts"
          value={unreadCount}
          subtitle={unreadCount > 0 ? "Requires review" : "All caught up"}
          theme={unreadCount > 0 ? "amber" : "emerald"}
          icon={<Clock className="w-5 h-5" />}
        />
        <AdminStatsCard
          title="Reservations"
          value={bookingCount}
          subtitle="Booking inquiries"
          theme="teal"
          icon={<Calendar className="w-5 h-5" />}
        />
        <AdminStatsCard
          title="Inquiries"
          value={contactCount}
          subtitle="Customer messages"
          theme="sky"
          icon={<Mail className="w-5 h-5" />}
        />
      </div>

      {/* Filter Tabs Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-2 px-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {[
            { id: "all", label: "All Events", count: totalCount },
            { id: "unread", label: "Unread", count: unreadCount },
            { id: "booking", label: "Bookings", count: bookingCount },
            { id: "contact", label: "Inquiries", count: contactCount },
            { id: "user", label: "Staff & System", count: totalCount - bookingCount - contactCount },
          ].map((tab) => {
            const isActive = typeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/70"
                  }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredNotifications.length}</span> items
        </div>
      </div>

      {/* Main Notification List Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <AdminCardListSkeleton count={5} />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No notifications found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {typeFilter === "unread"
                ? "You're all caught up! There are no unread notifications right now."
                : "No system events matched your current filter criteria."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((n) => {
              const isBooking = n.type === "booking";
              const isContact = n.type === "contact";

              const badgeColor = isBooking
                ? "bg-amber-100 text-amber-800 border-amber-200"
                : isContact
                  ? "bg-sky-100 text-sky-800 border-sky-200"
                  : "bg-purple-100 text-purple-800 border-purple-200";

              const iconBg = isBooking
                ? "bg-amber-500/10 text-amber-600 border-amber-200"
                : isContact
                  ? "bg-sky-500/10 text-sky-600 border-sky-200"
                  : "bg-purple-500/10 text-purple-600 border-purple-200";

              return (
                <div
                  key={n.id}
                  className={`p-4 sm:p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${n.unread
                      ? "bg-amber-500/[0.03] hover:bg-amber-500/[0.06] border-l-4 border-l-amber-500"
                      : "hover:bg-slate-50/70 border-l-4 border-l-transparent"
                    }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${iconBg}`}
                    >
                      {isBooking && <Calendar className="w-4 h-4" />}
                      {isContact && <Mail className="w-4 h-4" />}
                      {!isBooking && !isContact && <User className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeColor}`}
                        >
                          {n.type}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 tracking-tight">
                          {n.title}
                        </h4>
                        {n.unread && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse"></span>
                            New
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {n.description}
                      </p>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium pt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          {n.createdAt
                            ? new Date(n.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            : n.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    {n.unread && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Read</span>
                      </button>
                    )}

                    {n.link && (
                      <Link
                        href={n.link}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Open Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
