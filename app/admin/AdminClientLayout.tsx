"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/app/component/ui/themeToggle";
import {
  LayoutDashboard,
  Compass,
  HelpCircle,
  BookOpen,
  Menu,
  X,
  Bell,
  Calendar,
  Image as ImageIcon,
  Mail,
  ArrowLeft,
  MapPin,
  Star,
  Users,
  LogOut,
  UserCheck,
} from "lucide-react";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
  { label: "Manage Reservations", href: "/admin/bookings", icon: <Calendar className="h-4.5 w-4.5" /> },
  { label: "Manage Tour Packages", href: "/admin/trips", icon: <Compass className="h-4.5 w-4.5" /> },
  { label: "Manage Destinations", href: "/admin/destinations", icon: <MapPin className="h-4.5 w-4.5" /> },
  { label: "Manage Reviews", href: "/admin/reviews", icon: <Star className="h-4.5 w-4.5" /> },
  { label: "Manage Gallery", href: "/admin/gallery", icon: <ImageIcon className="h-4.5 w-4.5" /> },
  { label: "Notification Center", href: "/admin/notifications", icon: <Bell className="h-4.5 w-4.5" /> },
  { label: "Inbox Messages", href: "/admin/contacts", icon: <Mail className="h-4.5 w-4.5" /> },
  { label: "Manage Blog Articles", href: "/admin/blog", icon: <BookOpen className="h-4.5 w-4.5" /> },
  { label: "Manage FAQs", href: "/admin/faqs", icon: <HelpCircle className="h-4.5 w-4.5" /> },
  { label: "Manage Admin Accounts", href: "/admin/users", icon: <Users className="h-4.5 w-4.5" /> },
];

export default function AdminClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  // Load current admin profile
  useEffect(() => {
    if (isLoginPage) return;
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push(`/admin/login?from=${encodeURIComponent(pathname)}`);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success && data.user) {
          setCurrentAdmin(data.user);
        }
      })
      .catch(() => {});
  }, [pathname, router, isLoginPage]);

  // Fetch notifications
  const loadNotifications = useCallback(() => {
    if (isLoginPage) return;
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      })
      .catch(() => {});
  }, [isLoginPage]);

  useEffect(() => {
    if (isLoginPage) return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 20000);
    return () => clearInterval(interval);
  }, [pathname, isLoginPage, loadNotifications]);

  // If on login page, render clean layout without admin chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  const handleMarkAsRead = async (id: string, link?: string) => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setIsNotifOpen(false);
    if (link) router.push(link);
  };

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to log out from the admin panel?")) return;
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error("Logout error:", e);
      router.push("/admin/login");
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 text-secondary-950 flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-secondary-200 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl border border-secondary-200 text-secondary-700 hover:bg-secondary-100 lg:hidden cursor-pointer"
            aria-label="Open admin navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/admin/dashboard" className="text-xl font-black tracking-tight text-secondary-950 flex items-center gap-1.5">
            <span>Ijen<span className="text-primary-500">Tour</span></span>
            <span className="text-[10px] bg-primary-100 text-primary-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Admin CMS
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2.5 rounded-xl border border-secondary-200 text-secondary-700 hover:bg-secondary-100 hover:text-secondary-950 relative transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-secondary-200 rounded-3xl shadow-2xl z-50 overflow-hidden text-secondary-950">
                <div className="px-5 py-3.5 bg-secondary-50 border-b border-secondary-200 flex justify-between items-center">
                  <span className="text-xs font-black text-secondary-950 uppercase tracking-wider">
                    Recent Notifications
                  </span>
                  <span className="text-[10px] font-bold text-primary-700 bg-primary-100 px-2.5 py-0.5 rounded-full">
                    {unreadCount} Unread
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-secondary-100">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 6).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkAsRead(n.id, n.link)}
                        className={`p-4 hover:bg-secondary-50 transition cursor-pointer text-left ${
                          n.unread ? "bg-primary-50/40" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-xs text-secondary-950 truncate">{n.title}</p>
                          <span className="text-[10px] text-secondary-400">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-secondary-600 line-clamp-2 leading-relaxed">
                          {n.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-secondary-400">
                      No notifications at this time
                    </div>
                  )}
                </div>

                <Link
                  href="/admin/notifications"
                  onClick={() => setIsNotifOpen(false)}
                  className="block text-center py-3 text-xs font-black text-primary-600 hover:bg-secondary-50 border-t border-secondary-100 uppercase tracking-wider"
                >
                  View All Notifications →
                </Link>
              </div>
            )}
          </div>

          {/* Current Admin Tag */}
          {currentAdmin && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary-100 border border-secondary-200 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-primary-600" />
              <span className="font-bold text-secondary-900 truncate max-w-[140px]">
                {currentAdmin.name}
              </span>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Log out of Admin"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-secondary-300 hover:border-primary-500 hover:bg-primary-50 text-secondary-800 font-bold text-xs transition"
            title="Open Public Website in New Tab"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Website</span>
          </Link>
        </div>
      </header>

      <div className="flex grow">
        {/* Left Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-secondary-200 bg-white p-4 justify-between shrink-0">
          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-400 px-3 py-2 block">
              Menu Pengelolaan
            </span>
            {SIDEBAR_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-primary-500 text-secondary-950 shadow-sm"
                      : "text-secondary-700 hover:bg-secondary-100 hover:text-secondary-950"
                  }`}
                >
                  <span className={isActive ? "text-secondary-950" : "text-secondary-500"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-secondary-100 mt-2">
            <div className="p-3 bg-secondary-50 rounded-2xl border border-secondary-200 text-xs">
              <span className="text-[10px] text-secondary-500 block uppercase font-bold">Admin Aktif:</span>
              <p className="font-black text-secondary-950 truncate">
                {currentAdmin?.name || "Administrator"}
              </p>
              <p className="text-[11px] text-secondary-500 truncate mt-0.5">
                {currentAdmin?.email || "admin@mountijentour.com"}
              </p>
              <div className="mt-2 pt-2 border-t border-secondary-200/80 flex items-center justify-between">
                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                  Role: ADMIN
                </span>
                <button
                  onClick={handleLogout}
                  className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-secondary-950/70 backdrop-blur-sm lg:hidden flex"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div
              className="w-72 bg-white h-full p-5 flex flex-col justify-between overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-secondary-200 mb-4">
                  <span className="font-black text-base text-secondary-950">Menu Admin</span>
                  <button onClick={() => setIsSidebarOpen(false)}>
                    <X className="w-5 h-5 text-secondary-500" />
                  </button>
                </div>
                <div className="space-y-1">
                  {SIDEBAR_ITEMS.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                          isActive
                            ? "bg-primary-500 text-secondary-950 shadow-sm"
                            : "text-secondary-700 hover:bg-secondary-100"
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-secondary-200 space-y-2">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-2xl bg-red-50 text-red-600 font-bold text-xs flex items-center justify-center gap-2 border border-red-200 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Admin</span>
                </button>
                <Link
                  href="/"
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-full py-2.5 rounded-2xl bg-secondary-100 text-secondary-800 font-bold text-xs flex items-center justify-center gap-2 border border-secondary-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Website</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main Admin Content Body */}
        <main className="grow p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
