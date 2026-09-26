"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Mountain,
  LayoutDashboard,
  Compass,
  HelpCircle,
  BookOpen,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  Calendar,
  Image as ImageIcon,
  Users,
  Mail,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Kelola Reservasi", href: "/admin/bookings", icon: <Calendar className="h-5 w-5" /> },
  { label: "Kelola Paket Tur", href: "/admin/trips", icon: <Compass className="h-5 w-5" /> },
  { label: "Kelola Galeri", href: "/admin/gallery", icon: <ImageIcon className="h-5 w-5" /> },
  { label: "Kelola Pengguna & Role", href: "/admin/users", icon: <Users className="h-5 w-5" /> },
  { label: "Pusat Notifikasi", href: "/admin/notifications", icon: <Bell className="h-5 w-5" /> },
  { label: "Pesan Kontak Masuk", href: "/admin/contacts", icon: <Mail className="h-5 w-5" /> },
  { label: "Kelola Artikel Blog", href: "/admin/blog", icon: <BookOpen className="h-5 w-5" /> },
  { label: "Kelola Tanya Jawab (FAQ)", href: "/admin/faqs", icon: <HelpCircle className="h-5 w-5" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const loadNotifications = () => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (pathname === "/admin/login") return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [pathname]);

  // If on admin login page, don't show admin chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

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

  return (
    <div className="min-h-screen bg-secondary-50 text-secondary-950 flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-secondary-200 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl border border-secondary-200 text-secondary-700 hover:bg-secondary-100 lg:hidden cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/admin/dashboard" className="text-xl font-black tracking-tight text-secondary-950">
            Ijen<span className="text-primary-500">Tour</span> <span className="text-xs bg-primary-100 text-primary-800 font-bold px-2 py-0.5 rounded-full ml-1 uppercase">Admin CMS</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2.5 rounded-xl border border-secondary-200 text-secondary-700 hover:bg-secondary-100 hover:text-secondary-950 relative transition cursor-pointer"
              title="Notifikasi"
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
                    Notifikasi Terbaru
                  </span>
                  <span className="text-[10px] font-bold text-primary-700 bg-primary-100 px-2.5 py-0.5 rounded-full">
                    {unreadCount} Belum Dibaca
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-secondary-100">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((n) => (
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
                      Tidak ada notifikasi saat ini
                    </div>
                  )}
                </div>

                <Link
                  href="/admin/notifications"
                  onClick={() => setIsNotifOpen(false)}
                  className="block text-center py-3 text-xs font-black text-primary-600 hover:bg-secondary-50 border-t border-secondary-100 uppercase tracking-wider"
                >
                  Lihat Semua Notifikasi →
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-secondary-300 hover:border-primary-500 hover:bg-primary-50 text-secondary-800 font-bold text-xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ke Website</span>
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex grow">
        {/* Left Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-secondary-200 bg-white p-4 justify-between shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-400 px-3 py-2 block">
              Menu Navigasi
            </span>
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
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

          <div className="pt-4 border-t border-secondary-100">
            <div className="p-3 bg-secondary-50 rounded-2xl border border-secondary-200 text-xs">
              <span className="text-[10px] text-secondary-500 block uppercase font-bold">Logged as:</span>
              <p className="font-black text-secondary-950 truncate">Administrator Ijen</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary-200 text-primary-800">
                Super Admin
              </span>
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
              className="w-72 bg-white h-full p-5 flex flex-col justify-between"
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
                    const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
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

              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-2xl bg-red-50 text-red-700 font-bold text-xs flex items-center justify-center gap-2 border border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
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
