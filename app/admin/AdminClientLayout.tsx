"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/app/component/ui/themeToggle";
import {
  LayoutDashboard,
  Calendar,
  Compass,
  MapPin,
  Star,
  Image as ImageIcon,
  BookOpen,
  HelpCircle,
  UserCheck,
  Mail,
  Bell,
  Users,
  Settings,
  MailCheck,
  Menu,
  X,
  ExternalLink,
  LogOut,
  ChevronRight,
  Shield,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  Clock,
  User,
  Search,
  FileText,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: "unreadNotifications" | "pendingBookings";
  superAdminOnly?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { label: "Bookings", href: "/admin/bookings", icon: Calendar, badgeKey: "pendingBookings" },
    ],
  },
  {
    title: "CATALOG & CONTENT",
    items: [
      { label: "Tour Packages", href: "/admin/trips", icon: Compass },
      { label: "Destinations", href: "/admin/destinations", icon: MapPin },
      { label: "Staff & Guides", href: "/admin/staff", icon: UserCheck },
      { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
      { label: "Blog Articles", href: "/admin/blog", icon: BookOpen },
      { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
      { label: "Reviews", href: "/admin/reviews", icon: Star },
      { label: "Inbox Messages", href: "/admin/contacts", icon: Mail },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Notifications", href: "/admin/notifications", icon: Bell, badgeKey: "unreadNotifications" },
      { label: "Admin Accounts", href: "/admin/users", icon: Users, superAdminOnly: true },
      { label: "Email Settings", href: "/admin/email-settings", icon: MailCheck, superAdminOnly: true },
      { label: "Security & Hardening", href: "/admin/security", icon: Shield, superAdminOnly: true },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: FileText, superAdminOnly: true },
      { label: "System Settings", href: "/admin/settings", icon: Settings, superAdminOnly: true },
    ],
  },
];

// Map pathnames to human readable page titles
const PAGE_TITLES: Record<string, { title: string; category: string }> = {
  "/admin/dashboard": { title: "Dashboard Overview", category: "Overview" },
  "/admin/bookings": { title: "Reservations & Custom Trips", category: "Operations" },
  "/admin/trips": { title: "Tour Packages Catalog", category: "Catalog" },
  "/admin/trips/create": { title: "Create Tour Package", category: "Catalog" },
  "/admin/destinations": { title: "Destinations Management", category: "Catalog" },
  "/admin/destinations/create": { title: "Add New Destination", category: "Catalog" },
  "/admin/staff": { title: "Staff & Tour Guides", category: "Catalog" },
  "/admin/gallery": { title: "Media Gallery", category: "Catalog" },
  "/admin/blog": { title: "Blog Articles & AI Writer", category: "Content" },
  "/admin/faqs": { title: "Frequently Asked Questions", category: "Content" },
  "/admin/reviews": { title: "Customer Reviews", category: "Content" },
  "/admin/contacts": { title: "Inbox Messages", category: "Communication" },
  "/admin/notifications": { title: "System Notifications", category: "System" },
  "/admin/users": { title: "Admin & User Accounts", category: "System" },
  "/admin/email-settings": { title: "Email & Notification System", category: "System" },
  "/admin/security": { title: "Security Settings & Hardening", category: "System" },
  "/admin/audit-logs": { title: "Administrative Audit Trail", category: "System" },
  "/admin/settings": { title: "System Settings & Health", category: "System" },
  "/admin/profile": { title: "Personal Profile & Security", category: "Account" },
};

export default function AdminClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentPath = pathname || "";
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isLoginPage = currentPath === "/admin/login" || currentPath === "/admin/verify-email";

  // Check saved sidebar collapse preference
  useEffect(() => {
    try {
      const savedCollapse = localStorage.getItem("mountijentour-admin-collapse");
      if (savedCollapse === "true") {
        setIsSidebarCollapsed(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("mountijentour-admin-collapse", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  // Close menus on path change
  useEffect(() => {
    setIsSidebarOpen(false);
    setIsNotifOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  // Lock background scroll & close on Escape while mobile admin drawer is open
  useEffect(() => {
    if (!isSidebarOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen]);

  // Load current admin profile
  useEffect(() => {
    if (isLoginPage) return;
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push(`/admin/login?from=${encodeURIComponent(currentPath)}`);
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
  }, [pathname, router, isLoginPage, currentPath]);

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
    const interval = setInterval(loadNotifications, 25000);
    return () => clearInterval(interval);
  }, [pathname, isLoginPage, loadNotifications]);

  const currentPageInfo = useMemo(() => {
    if (PAGE_TITLES[currentPath]) return PAGE_TITLES[currentPath];
    for (const [prefix, val] of Object.entries(PAGE_TITLES)) {
      if (currentPath.startsWith(prefix) && prefix !== "/admin/dashboard") {
        return val;
      }
    }
    return { title: "Admin Console", category: "Management" };
  }, [currentPath]);

  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    if (hour < 18) return "Afternoon";
    return "Evening";
  }, []);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex antialiased">
      {/* 1. DESKTOP STICKY SIDEBAR */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 shrink-0 z-30 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-2.5 transition-opacity ${
              isSidebarCollapsed ? "justify-center w-full" : ""
            }`}
            title="Mount Ijen Tour Management"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-base shadow-sm shrink-0">
              IJ
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  Ijen<span className="text-amber-500">Tour</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                  Admin System
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 select-none custom-scrollbar">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              {!isSidebarCollapsed ? (
                <p className="px-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-400 mb-2">
                  {group.title}
                </p>
              ) : (
                <div className="h-2" />
              )}
              {group.items.map((item) => {
                if (item.superAdminOnly && currentAdmin?.role !== "SUPER_ADMIN") {
                  return null;
                }
                const IconComponent = item.icon;
                const isActive =
                  currentPath === item.href ||
                  (item.href !== "/admin/dashboard" && currentPath.startsWith(item.href));

                const hasBadge =
                  item.badgeKey === "unreadNotifications" && unreadCount > 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group ${
                      isActive
                        ? "bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20 font-extrabold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                    } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                  >
                    <IconComponent
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                        isActive
                          ? "text-slate-950"
                          : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                      }`}
                    />
                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}

                    {hasBadge && (
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? "bg-slate-950 text-amber-400"
                            : "bg-amber-500 text-slate-950"
                        } ${isSidebarCollapsed ? "absolute top-1.5 right-1.5 w-2 h-2 p-0 rounded-full" : ""}`}
                      >
                        {!isSidebarCollapsed && unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer with Collapse Toggle & Profile */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
          {/* Collapse toggle */}
          <button
            onClick={toggleSidebarCollapse}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronsRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronsLeft className="w-4 h-4" />
                <span className="text-[11px] font-bold">Collapse Sidebar</span>
              </>
            )}
          </button>

          {/* User profile card */}
          <div
            className={`flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 ${
              isSidebarCollapsed ? "justify-center p-2" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
              {currentAdmin?.name ? currentAdmin.name.substring(0, 2).toUpperCase() : "AD"}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentAdmin?.name || "Administrator"}
                </p>
                <div className="mt-0.5">
                  <span
                    className={`inline-block text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                      currentAdmin?.role === "SUPER_ADMIN"
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        : "text-slate-400"
                    }`}
                  >
                    {currentAdmin?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MAIN APP CONTAINER (FULL-WIDTH) */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left section: mobile hamburger + breadcrumb / page title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
              aria-label="Open mobile navigation"
              aria-expanded={isSidebarOpen}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex flex-col min-w-0">
              {currentPath === "/admin/dashboard" ? (
                <>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider leading-none">
                    Overview
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                    Good {timeGreeting}, {currentAdmin?.name ? currentAdmin.name.split(" ")[0] : "Admin"} 👋
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider leading-none">
                    {currentPageInfo.category}
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {currentPageInfo.title}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Center search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Quick search bookings, tours..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Right section: Website Link + Theme + Notifications + User Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* View live public site */}
            <Link
              href="/"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition"
              title="Open public website in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
              <span>Public Website</span>
            </Link>

            <ThemeToggle />

            {/* Notification Bell with Popover */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition cursor-pointer"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Notifications
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full">
                      {unreadCount} Unread
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkAsRead(n.id, n.link)}
                          className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer text-left ${
                            n.unread ? "bg-amber-50/50 dark:bg-amber-950/20" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {n.title}
                            </p>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                              {n.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {n.description}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No notifications at this time
                      </div>
                    )}
                  </div>

                  <Link
                    href="/admin/notifications"
                    onClick={() => setIsNotifOpen(false)}
                    className="block text-center py-2.5 text-xs font-black text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 uppercase tracking-wider"
                  >
                    View All Notifications →
                  </Link>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 sm:p-1.5 pr-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="User profile menu"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                  {currentAdmin?.name ? currentAdmin.name.substring(0, 1).toUpperCase() : "A"}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-none truncate max-w-[100px]">
                    {currentAdmin?.name || "Admin"}
                  </span>
                  <span
                    className={`text-[9px] font-bold leading-none mt-1 ${
                      currentAdmin?.role === "SUPER_ADMIN" ? "text-amber-500 font-extrabold" : "text-slate-400"
                    }`}
                  >
                    {currentAdmin?.role === "SUPER_ADMIN" ? "Super Admin" : "Administrator"}
                  </span>
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150 text-xs font-bold">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="font-extrabold text-slate-900 dark:text-white truncate">
                      {currentAdmin?.name || "Administrator"}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate font-medium">
                      {currentAdmin?.email || "admin@mountijentour.com"}
                    </p>
                  </div>
                  <Link
                    href="/admin/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>
                  {currentAdmin?.role === "SUPER_ADMIN" && (
                    <>
                      <Link
                        href="/admin/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>System Settings</span>
                      </Link>
                      <Link
                        href="/admin/users"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>Manage Accounts</span>
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. RESPONSIVE FULL-WIDTH MAIN CONTENT */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>

      {/* 4. MOBILE DRAWER NAVIGATION */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={closeSidebar}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Admin Mobile Navigation"
            className="relative z-10 w-72 max-w-[calc(100vw-2.5rem)] sm:w-80 bg-white dark:bg-slate-900 h-full p-5 flex flex-col justify-between overflow-y-auto overscroll-contain border-r border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-left duration-200"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm">
                    IJ
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white leading-none">
                      Ijen<span className="text-amber-500">Tour</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      Admin Console
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeSidebar}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  aria-label="Close mobile navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {NAV_GROUPS.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {group.title}
                    </p>
                    {group.items.map((item) => {
                      if (item.superAdminOnly && currentAdmin?.role !== "SUPER_ADMIN") {
                        return null;
                      }
                      const IconComponent = item.icon;
                      const isActive =
                        currentPath === item.href ||
                        (item.href !== "/admin/dashboard" && currentPath.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeSidebar}
                          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                            isActive
                              ? "bg-amber-500 text-slate-950 font-extrabold shadow-sm"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <IconComponent className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-2 mt-6">
              <Link
                href="/"
                target="_blank"
                onClick={closeSidebar}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ExternalLink className="w-4 h-4 text-amber-500" />
                <span>Visit Public Site</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-800/50 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
