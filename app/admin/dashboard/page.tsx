"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Compass,
  DollarSign,
  Clock,
  Users,
  Eye,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Ticket,
  ArrowUpRight,
  Sparkles,
  Info,
} from "lucide-react";
import { formatCurrency, formatCompactRupiah } from "@/lib/utils";
import { AdminDashboardSkeleton } from "@/app/component/ui/skeleton";
import AdminBadge from "@/app/component/admin/AdminBadge";
import AdminDrawer from "@/app/component/admin/AdminDrawer";

interface BarPoint {
  label: string;
  subLabel?: string;
  currentCount: number;
  previousCount: number;
  currentRevenue: number;
  previousRevenue: number;
  currentDateRange: string;
  previousDateRange: string;
}

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Timeframe filter for Booking Analytics Chart: "weekly" | "monthly" | "yearly"
  const [analyticsPeriod, setAnalyticsPeriod] = useState<"weekly" | "monthly" | "yearly">("weekly");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Mini Calendar Navigation
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // Quick detail drawer for selected booking
  const [activeBooking, setActiveBooking] = useState<any | null>(null);

  const loadData = async () => {
    try {
      const [resBookings, resTrips, resDestinations, resReviews, resMe] =
        await Promise.all([
          fetch("/api/bookings"),
          fetch("/api/trips?includeInactive=true"),
          fetch("/api/destinations"),
          fetch("/api/reviews?all=true"),
          fetch("/api/auth/me"),
        ]);

      const [dataBookings, dataTrips, dataDestinations, dataReviews, dataMe] =
        await Promise.all([
          resBookings.json(),
          resTrips.json(),
          resDestinations.json(),
          resReviews.json(),
          resMe.json(),
        ]);

      if (dataBookings.success) setBookings(dataBookings.bookings || []);
      if (dataTrips.success) setPackages(dataTrips.packages || []);
      if (dataDestinations.success) setDestinations(dataDestinations.destinations || []);
      if (dataReviews.success) setReviews(dataReviews.reviews || []);
      if (dataMe.success && dataMe.user) setCurrentAdmin(dataMe.user);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // Core Statistics Calculation
  const stats = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED");
    const pending = bookings.filter((b) => b.status === "PENDING");
    const completed = bookings.filter((b) => b.status === "COMPLETED");
    const cancelled = bookings.filter((b) => b.status === "CANCELLED");

    const totalRevenue = confirmed.reduce(
      (sum, b) => sum + (Number(b.finalPrice ?? b.totalPrice ?? b.estimatedPrice) || 0),
      0
    );

    // Calculate completion rate (Confirmed + Completed) / Total Bookings
    const completionRate =
      bookings.length > 0 ? Math.round((confirmed.length / bookings.length) * 100) : 0;

    return {
      totalBookings: bookings.length,
      totalRevenue,
      pendingBookings: pending.length,
      confirmedBookings: confirmed.length,
      completedBookings: completed.length,
      cancelledBookings: cancelled.length,
      completionRate,
      totalPackages: packages.length,
      totalDestinations: destinations.length,
    };
  }, [bookings, packages, destinations]);

  // Sparkline data for Top 3 Cards
  const sparklines = useMemo(() => {
    const now = new Date();
    const bookingsTrend: number[] = [];
    const revenueTrend: number[] = [];
    const pendingTrend: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      const matches = bookings.filter((b) => b.createdAt && b.createdAt.startsWith(dateStr));
      bookingsTrend.push(matches.length);

      const rev = matches
        .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
        .reduce((sum, b) => sum + (Number(b.finalPrice ?? b.totalPrice) || 0), 0);
      revenueTrend.push(rev);

      const pend = matches.filter((b) => b.status === "PENDING").length;
      pendingTrend.push(pend);
    }

    const renderPath = (data: number[], width = 72, height = 24, strokeColor = "#FBA102") => {
      const max = Math.max(...data, 1);
      const pts = data.map((val, idx) => {
        const x = (idx / Math.max(data.length - 1, 1)) * width;
        const y = height - (val / max) * (height - 6) - 3;
        return `${x},${y}`;
      });
      return pts.join(" ");
    };

    return {
      bookingsPath: renderPath(bookingsTrend, 72, 24, "#FBA102"),
      revenuePath: renderPath(revenueTrend, 72, 24, "#0D9488"),
      pendingPath: renderPath(pendingTrend, 72, 24, "#E07A00"),
    };
  }, [bookings]);

  // Dual-series Booking Analytics Data (Current Period vs Previous Period)
  const analyticsData: BarPoint[] = useMemo(() => {
    const now = new Date();
    const points: BarPoint[] = [];

    if (analyticsPeriod === "weekly") {
      // 7 Days: Current 7 days vs Previous 7 days
      for (let i = 6; i >= 0; i--) {
        const curDate = new Date(now);
        curDate.setDate(curDate.getDate() - i);
        const curDateStr = curDate.toISOString().split("T")[0];
        const dayLabel = curDate.toLocaleDateString("en-US", { weekday: "short" });

        const prevDate = new Date(now);
        prevDate.setDate(prevDate.getDate() - (i + 7));
        const prevDateStr = prevDate.toISOString().split("T")[0];

        const curMatches = bookings.filter((b) => b.createdAt && b.createdAt.startsWith(curDateStr));
        const prevMatches = bookings.filter((b) => b.createdAt && b.createdAt.startsWith(prevDateStr));

        const curRev = curMatches
          .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
          .reduce((sum, b) => sum + (Number(b.finalPrice ?? b.totalPrice) || 0), 0);

        const prevRev = prevMatches
          .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
          .reduce((sum, b) => sum + (Number(b.finalPrice ?? b.totalPrice) || 0), 0);

        points.push({
          label: dayLabel,
          currentCount: curMatches.length,
          previousCount: prevMatches.length,
          currentRevenue: curRev,
          previousRevenue: prevRev,
          currentDateRange: curDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          previousDateRange: prevDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        });
      }
    } else if (analyticsPeriod === "monthly") {
      // 4 Weeks: Current 4 weeks vs Previous 4 weeks
      for (let i = 3; i >= 0; i--) {
        const curStart = new Date(now);
        curStart.setDate(curStart.getDate() - (i + 1) * 7);
        const curEnd = new Date(now);
        curEnd.setDate(curEnd.getDate() - i * 7);

        const prevStart = new Date(now);
        prevStart.setDate(prevStart.getDate() - (i + 5) * 7);
        const prevEnd = new Date(now);
        prevEnd.setDate(prevEnd.getDate() - (i + 4) * 7);

        const curMatches = bookings.filter((b) => {
          if (!b.createdAt) return false;
          const d = new Date(b.createdAt);
          return d >= curStart && d <= curEnd;
        });

        const prevMatches = bookings.filter((b) => {
          if (!b.createdAt) return false;
          const d = new Date(b.createdAt);
          return d >= prevStart && d <= prevEnd;
        });

        const curRev = curMatches
          .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
          .reduce((sum, b) => sum + (Number(b.finalPrice ?? b.totalPrice) || 0), 0);

        const prevRev = prevMatches
          .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
          .reduce((sum, b) => sum + (Number(b.finalPrice ?? b.totalPrice) || 0), 0);

        points.push({
          label: `Week ${4 - i}`,
          currentCount: curMatches.length,
          previousCount: prevMatches.length,
          currentRevenue: curRev,
          previousRevenue: prevRev,
          currentDateRange: `${curStart.getDate()} - ${curEnd.getDate()} ${curEnd.toLocaleDateString("en-US", { month: "short" })}`,
          previousDateRange: `${prevStart.getDate()} - ${prevEnd.getDate()} ${prevEnd.toLocaleDateString("en-US", { month: "short" })}`,
        });
      }
    } else {
      // 12 Months: Current 12 months vs Previous 12 months
      for (let i = 11; i >= 0; i--) {
        const curD = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const curYearMonth = `${curD.getFullYear()}-${String(curD.getMonth() + 1).padStart(2, "0")}`;
        const label = curD.toLocaleDateString("en-US", { month: "short" });

        const prevD = new Date(now.getFullYear() - 1, now.getMonth() - i, 1);
        const prevYearMonth = `${prevD.getFullYear()}-${String(prevD.getMonth() + 1).padStart(2, "0")}`;

        const curMatches = bookings.filter((b) => b.createdAt && b.createdAt.startsWith(curYearMonth));
        const prevMatches = bookings.filter((b) => b.createdAt && b.createdAt.startsWith(prevYearMonth));

        const curRev = curMatches
          .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
          .reduce((sum, b) => sum + (Number(b.finalPrice ?? b.totalPrice) || 0), 0);

        const prevRev = prevMatches
          .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
          .reduce((sum, b) => sum + (Number(b.finalPrice ?? b.totalPrice) || 0), 0);

        points.push({
          label,
          currentCount: curMatches.length,
          previousCount: prevMatches.length,
          currentRevenue: curRev,
          previousRevenue: prevRev,
          currentDateRange: curD.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          previousDateRange: prevD.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        });
      }
    }

    return points;
  }, [bookings, analyticsPeriod]);

  const maxBarCount = useMemo(() => {
    const maxVal = Math.max(
      ...analyticsData.map((p) => Math.max(p.currentCount, p.previousCount)),
      0
    );
    return Math.max(maxVal, 4);
  }, [analyticsData]);

  // Recent 5 bookings
  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  }, [bookings]);

  // Mini Calendar Calculations
  const calendarMonthData = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const monthName = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
      calendarDate
    );

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    // Map bookings by travelDate string (YYYY-MM-DD)
    const bookingsByDate: Record<string, any[]> = {};
    bookings.forEach((b) => {
      if (!b.travelDate) return;
      const dateKey = String(b.travelDate).split("T")[0];
      if (!bookingsByDate[dateKey]) bookingsByDate[dateKey] = [];
      bookingsByDate[dateKey].push(b);
    });

    const days: {
      dayNumber: number;
      dateKey: string;
      isCurrentMonth: boolean;
      hasBookings: boolean;
      bookingCount: number;
      isToday: boolean;
    }[] = [];

    const todayStr = new Date().toISOString().split("T")[0];

    // Padding for previous month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({
        dayNumber: 0,
        dateKey: `pad-${i}`,
        isCurrentMonth: false,
        hasBookings: false,
        bookingCount: 0,
        isToday: false,
      });
    }

    // Days of current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayBookings = bookingsByDate[dateKey] || [];
      days.push({
        dayNumber: d,
        dateKey,
        isCurrentMonth: true,
        hasBookings: dayBookings.length > 0,
        bookingCount: dayBookings.length,
        isToday: dateKey === todayStr,
      });
    }

    return { monthName, days, bookingsByDate };
  }, [calendarDate, bookings]);

  // Filter upcoming departures for calendar list
  const upcomingToursList = useMemo(() => {
    if (selectedCalendarDate && calendarMonthData.bookingsByDate[selectedCalendarDate]) {
      return calendarMonthData.bookingsByDate[selectedCalendarDate].slice(0, 3);
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const upcoming = bookings
      .filter((b) => b.travelDate && String(b.travelDate).split("T")[0] >= todayStr)
      .sort(
        (a, b) =>
          new Date(a.travelDate || 0).getTime() - new Date(b.travelDate || 0).getTime()
      );

    if (upcoming.length > 0) {
      return upcoming.slice(0, 3);
    }

    // Fallback to top recent bookings if all past
    return bookings.slice(0, 3);
  }, [bookings, selectedCalendarDate, calendarMonthData]);

  // Top/Popular Destinations based on actual bookings reference
  const popularDestinations = useMemo(() => {
    return destinations
      .map((d) => {
        const destNameLower = d.name.toLowerCase();
        const matchesCount = bookings.filter((b) => {
          const pkg = (b.packageName || "").toLowerCase();
          const details = (b.customDetails || "").toLowerCase();
          return pkg.includes(destNameLower) || details.includes(destNameLower);
        }).length;
        return {
          ...d,
          bookingCount: matchesCount,
        };
      })
      .sort((a, b) => b.bookingCount - a.bookingCount || a.sortOrder - b.sortOrder)
      .slice(0, 4);
  }, [destinations, bookings]);

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  const activeHoveredBar =
    hoveredBarIndex !== null && analyticsData[hoveredBarIndex]
      ? analyticsData[hoveredBarIndex]
      : null;

  return (
    <div className="space-y-6 pb-12 w-full antialiased text-slate-800">
      {/* ======================================================== */}
      {/* 2-COLUMN MAIN CONTENT (Travelia Layout)                  */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ====================================================== */}
        {/* LEFT COLUMN: ~68% (Cards, Dual Bar Chart, Table)       */}
        {/* ====================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* A. TOP 3 HORIZONTAL STATISTICS CARDS (Travelia Style) */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {/* 1. Total Bookings */}
            <Link
              href="/admin/bookings"
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-400/60 transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#FBA102] flex items-center justify-center shrink-0">
                  <Ticket className="w-5 h-5" />
                </div>
                {/* Mini Sparkline */}
                <svg className="w-20 h-6 overflow-visible" viewBox="0 0 72 24">
                  <polyline
                    fill="none"
                    stroke="#FBA102"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={sparklines.bookingsPath}
                  />
                </svg>
              </div>

              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-[#E07A00] transition">
                  {stats.totalBookings}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-slate-400">
                    Total Bookings
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> Active
                  </span>
                </div>
              </div>
            </Link>

            {/* 2. Total Revenue */}
            <Link
              href="/admin/bookings"
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-400/60 transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                {/* Mini Sparkline */}
                <svg className="w-20 h-6 overflow-visible" viewBox="0 0 72 24">
                  <polyline
                    fill="none"
                    stroke="#0D9488"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={sparklines.revenuePath}
                  />
                </svg>
              </div>

              <div>
                <p
                  className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-teal-700 transition truncate"
                  title={formatCurrency(stats.totalRevenue)}
                >
                  {formatCompactRupiah(stats.totalRevenue)}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-slate-400">
                    Total Revenue
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    IDR Verified
                  </span>
                </div>
              </div>
            </Link>

            {/* 3. Pending Bookings */}
            <Link
              href="/admin/bookings"
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-400/60 transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-[#E07A00] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                {/* Mini Sparkline */}
                <svg className="w-20 h-6 overflow-visible" viewBox="0 0 72 24">
                  <polyline
                    fill="none"
                    stroke="#E07A00"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={sparklines.pendingPath}
                  />
                </svg>
              </div>

              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-[#E07A00] transition">
                  {stats.pendingBookings}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-slate-400">
                    Pending Bookings
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                    {stats.pendingBookings > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    )}
                    {stats.pendingBookings > 0 ? "Needs Review" : "Clear"}
                  </span>
                </div>
              </div>
            </Link>
          </section>

          {/* B. BOOKING ANALYTICS DUAL-SERIES BAR CHART */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            {/* Header: Title, Legends & Period Toggles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Booking Analytics
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparison between Current and Previous Period
                </p>
              </div>

              {/* Legends & Period Tabs */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Legends */}
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-teal-500" />
                    <span className="text-slate-600">Previous</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#FBA102]" />
                    <span className="text-slate-900 font-bold">Current</span>
                  </div>
                </div>

                {/* Period Selector Tabs (Weekly, Monthly, Yearly) */}
                <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 text-xs font-bold border border-slate-200/70">
                  {(["weekly", "monthly", "yearly"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setAnalyticsPeriod(mode);
                        setHoveredBarIndex(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg transition capitalize cursor-pointer text-xs ${
                        analyticsPeriod === mode
                          ? "bg-white text-slate-950 font-black shadow-xs border border-slate-200/60"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dual Bar Chart Area */}
            <div className="relative pt-6 pb-2 w-full">
              {/* Interactive Tooltip */}
              {activeHoveredBar && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs shadow-xl border border-slate-700 pointer-events-none animate-in fade-in duration-100 flex items-center gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                      {activeHoveredBar.label} ({activeHoveredBar.currentDateRange})
                    </span>
                    <span className="text-amber-400 font-black text-sm">
                      Current: {activeHoveredBar.currentCount} Bookings
                    </span>
                    <span className="text-[10px] text-slate-300 block">
                      {formatCurrency(activeHoveredBar.currentRevenue)}
                    </span>
                  </div>
                  <div className="border-l border-slate-700 pl-3">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                      Previous ({activeHoveredBar.previousDateRange})
                    </span>
                    <span className="text-teal-400 font-black text-sm">
                      Previous: {activeHoveredBar.previousCount} Bookings
                    </span>
                    <span className="text-[10px] text-slate-300 block">
                      {formatCurrency(activeHoveredBar.previousRevenue)}
                    </span>
                  </div>
                </div>
              )}

              {/* The SVG & Flex Bar Columns */}
              <div className="h-56 w-full flex items-end justify-between gap-2 sm:gap-4 px-2 pt-8">
                {analyticsData.map((pt, idx) => {
                  const prevHeightPct = (pt.previousCount / maxBarCount) * 100;
                  const curHeightPct = (pt.currentCount / maxBarCount) * 100;
                  const isHovered = hoveredBarIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      {/* Dual Bar Column */}
                      <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full pb-1">
                        {/* 1. Previous Period Bar (Teal) */}
                        <div
                          style={{ height: `${Math.max(prevHeightPct, 6)}%` }}
                          className={`w-3.5 sm:w-5 max-w-[20px] rounded-t-md transition-all duration-200 ${
                            pt.previousCount > 0
                              ? "bg-teal-500/80 group-hover:bg-teal-500"
                              : "bg-slate-200/80"
                          } ${isHovered ? "ring-2 ring-teal-400/40" : ""}`}
                        />

                        {/* 2. Current Period Bar (Orange/Gold) */}
                        <div
                          style={{ height: `${Math.max(curHeightPct, 6)}%` }}
                          className={`w-3.5 sm:w-5 max-w-[20px] rounded-t-md transition-all duration-200 ${
                            pt.currentCount > 0
                              ? "bg-[#FBA102] group-hover:bg-[#E07A00]"
                              : "bg-slate-200"
                          } ${isHovered ? "ring-2 ring-amber-400/50 shadow-sm" : ""}`}
                        />
                      </div>

                      {/* X-Axis Label */}
                      <span
                        className={`text-[11px] mt-2 font-bold transition truncate max-w-full text-center ${
                          isHovered ? "text-[#E07A00] font-black" : "text-slate-400"
                        }`}
                      >
                        {pt.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* C. RECENT BOOKINGS TABLE (Travelia Style) */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Recent Bookings
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Latest customer tour reservations & schedules
                </p>
              </div>
              <Link
                href="/admin/bookings"
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-slate-700 hover:text-amber-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Table Responsive Wrapper */}
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                    <th className="pb-3 pl-2">Booking ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Tour Package</th>
                    <th className="pb-3">Travel Date</th>
                    <th className="pb-3">Pax</th>
                    <th className="pb-3">Total Price</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((b) => {
                      const customerInitials = b.customerName
                        ? b.customerName
                            .split(" ")
                            .map((n: string) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()
                        : "TR";

                      const bookingPrice = Number(
                        b.finalPrice ?? b.totalPrice ?? b.estimatedPrice
                      ) || 0;

                      return (
                        <tr
                          key={b.id}
                          className="hover:bg-slate-50/80 transition cursor-pointer group"
                          onClick={() => setActiveBooking(b)}
                        >
                          {/* Booking ID */}
                          <td className="py-3.5 pl-2 font-mono font-bold text-slate-900 group-hover:text-[#E07A00] transition">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px]">
                              {b.bookingCode || `#${b.id.substring(0, 7)}`}
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 text-[10px] font-black flex items-center justify-center shrink-0">
                                {customerInitials}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate max-w-[130px]">
                                  {b.customerName || "Traveler"}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                                  {b.customerEmail || b.customerPhone || "Direct booking"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Tour Package */}
                          <td className="py-3.5 font-medium text-slate-700">
                            <div className="truncate max-w-[150px] font-semibold flex items-center gap-1.5">
                              <Compass className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              <span className="truncate">{b.packageName || "Custom Tour"}</span>
                            </div>
                          </td>

                          {/* Travel Date */}
                          <td className="py-3.5 text-slate-600 font-medium whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>
                                {b.travelDate
                                  ? String(b.travelDate).split("T")[0]
                                  : "Flexible"}
                              </span>
                            </div>
                          </td>

                          {/* Participants */}
                          <td className="py-3.5 font-bold text-slate-900">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-slate-400" />
                              <span>{b.numParticipants || 1} Pax</span>
                            </div>
                          </td>

                          {/* Total Price (Compact Rupiah) */}
                          <td className="py-3.5 font-extrabold text-slate-900">
                            <span title={formatCurrency(bookingPrice)}>
                              {formatCompactRupiah(bookingPrice)}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5">
                            <AdminBadge status={b.status || "PENDING"} size="sm" />
                          </td>

                          {/* Action */}
                          <td className="py-3.5 pr-2 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveBooking(b);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                              title="Inspect Booking Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">
                        No reservations recorded in the database yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* ====================================================== */}
        {/* RIGHT COLUMN: ~32% (Calendar, Completion, Destinations) */}
        {/* ====================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* CARD A. UPCOMING TOUR DATES (Mini Calendar like Event Dates) */}
          <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Upcoming Tour Dates
              </h3>
              <Link
                href="/admin/bookings"
                className="text-xs font-bold text-[#E07A00] hover:text-[#FBA102] transition"
              >
                See All
              </Link>
            </div>

            {/* Mini Calendar Header with Prev/Next Controls */}
            <div className="flex items-center justify-between py-2 text-xs font-bold">
              <span className="text-slate-800 text-sm font-black">
                {calendarMonthData.monthName}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setCalendarDate(
                      new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1)
                    )
                  }
                  className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCalendarDate(
                      new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1)
                    )
                  }
                  className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Calendar Days of Week Header */}
            <div className="grid grid-cols-7 text-center text-[10px] font-black text-slate-400 py-1">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>

            {/* Calendar Grid Days */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs py-1">
              {calendarMonthData.days.map((item, idx) => {
                if (!item.isCurrentMonth) {
                  return <div key={idx} className="h-7 w-7" />;
                }

                const isSelected = selectedCalendarDate === item.dateKey;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setSelectedCalendarDate(isSelected ? null : item.dateKey)
                    }
                    className={`h-7 w-7 mx-auto rounded-lg text-[11px] font-bold flex flex-col items-center justify-center relative transition cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-xs"
                        : item.hasBookings
                        ? "bg-amber-100 text-amber-900 font-extrabold hover:bg-amber-200"
                        : item.isToday
                        ? "border border-amber-400 text-amber-600 font-extrabold"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                    title={
                      item.hasBookings
                        ? `${item.bookingCount} tours on ${item.dateKey}`
                        : item.dateKey
                    }
                  >
                    <span>{item.dayNumber}</span>
                    {item.hasBookings && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-[#E07A00] absolute bottom-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Upcoming Departure List Below Calendar */}
            <div className="pt-3 border-t border-slate-100 mt-3 space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                {selectedCalendarDate
                  ? `Departures on ${selectedCalendarDate}`
                  : "Next Upcoming Departures"}
              </span>

              {upcomingToursList.length > 0 ? (
                upcomingToursList.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setActiveBooking(t)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-100 hover:border-amber-200 transition cursor-pointer flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {t.packageName || "Ijen Tour"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {t.customerName} • {t.numParticipants || 1} Pax
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono font-bold text-slate-700 block">
                        {t.travelDate ? String(t.travelDate).split("T")[0] : "Flexible"}
                      </span>
                      <AdminBadge status={t.status || "PENDING"} size="sm" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">
                  No tours scheduled for this date.
                </div>
              )}
            </div>
          </section>

          {/* CARD B. BOOKING PERFORMANCE (Circular Gauge like Monthly Increased Amount) */}
          <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block">
                Performance Metric
              </span>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Booking Completion Rate
              </h3>
            </div>

            {/* Circular Gauge / Progress */}
            <div className="py-5 flex flex-col items-center justify-center relative">
              <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="62"
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="16"
                />
                {/* Active Progress Segment (Teal + Orange Gradient) */}
                <circle
                  cx="80"
                  cy="80"
                  r="62"
                  fill="transparent"
                  stroke="#FBA102"
                  strokeWidth="16"
                  strokeDasharray={`${(stats.completionRate / 100) * 389.55} 389.55`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>

              {/* Centered Number */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {stats.completionRate}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Confirmed
                </span>
              </div>
            </div>

            {/* Breakdown Legend Beneath Gauge */}
            <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="flex items-center gap-2 text-slate-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Confirmed & Completed
                </span>
                <span className="font-extrabold text-slate-900">
                  {stats.confirmedBookings + stats.completedBookings}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/60 border border-amber-200/40">
                <span className="flex items-center gap-2 text-amber-950 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#FBA102] animate-pulse" />
                  Pending Confirmation
                </span>
                <span className="font-extrabold text-amber-950">
                  {stats.pendingBookings}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="flex items-center gap-2 text-slate-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Cancelled / Refunded
                </span>
                <span className="font-extrabold text-slate-900">
                  {stats.cancelledBookings}
                </span>
              </div>
            </div>
          </section>

          {/* CARD C. POPULAR DESTINATIONS (like Cities We Will Visit in Travelia) */}
          <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-[#E07A00] uppercase tracking-wider block">
                  Catalog Highlight
                </span>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Popular Destinations
                </h3>
              </div>
              <Link
                href="/admin/destinations"
                className="text-xs font-bold text-[#E07A00] hover:text-[#FBA102] transition"
              >
                View All
              </Link>
            </div>

            {/* Destination List Items */}
            <div className="space-y-3">
              {popularDestinations.length > 0 ? (
                popularDestinations.map((dest) => (
                  <div
                    key={dest.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Image Thumbnail */}
                      <div className="w-11 h-11 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                        {dest.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={dest.image}
                            alt={dest.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <MapPin className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900 truncate">
                          {dest.name}
                        </p>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          {dest.tag || "Banyuwangi Destination"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 border border-amber-500/30">
                        {dest.bookingCount > 0 ? `${dest.bookingCount} Tours` : "Top Spot"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">
                  No destinations created yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. BOOKING DETAIL SLIDE-OVER DRAWER                      */}
      {/* ======================================================== */}
      <AdminDrawer
        isOpen={!!activeBooking}
        onClose={() => setActiveBooking(null)}
        title={
          activeBooking
            ? `Booking #${activeBooking.bookingCode || activeBooking.id.substring(0, 8)}`
            : ""
        }
        subtitle={activeBooking?.packageName || "Tour Reservation"}
        footer={
          activeBooking && (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => setActiveBooking(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Close
              </button>
              <Link
                href="/admin/bookings"
                className="px-4 py-2 rounded-xl bg-[#FBA102] hover:bg-[#E07A00] text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open Full Booking Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )
        }
      >
        {activeBooking && (
          <div className="space-y-5 text-xs">
            {/* Status & Price Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Reservation Status:</span>
                <AdminBadge status={activeBooking.status || "PENDING"} />
              </div>
              <div className="flex justify-between items-center font-bold pt-2 border-t border-slate-200/60">
                <span className="text-slate-500">Full Price Nominal:</span>
                <span className="text-sm font-black text-emerald-600">
                  {formatCurrency(
                    Number(
                      activeBooking.finalPrice ??
                        activeBooking.totalPrice ??
                        activeBooking.estimatedPrice
                    ) || 0
                  )}
                </span>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-2.5">
              <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                Customer Information
              </h4>
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl border border-slate-200/80 bg-white">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Full Name
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">{activeBooking.customerName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    WhatsApp / Phone
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {activeBooking.customerPhone || "-"}
                  </p>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Email Address
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {activeBooking.customerEmail || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Travel Details */}
            <div className="space-y-2.5">
              <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                Travel Schedule & Logistics
              </h4>
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl border border-slate-200/80 bg-white">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Departure Date
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {activeBooking.travelDate
                      ? String(activeBooking.travelDate).split("T")[0]
                      : "Flexible"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Group Size
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {activeBooking.numParticipants || 1} Pax
                  </p>
                </div>
                {activeBooking.pickupLocation && (
                  <div className="col-span-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Meeting / Pickup Location
                    </span>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {activeBooking.pickupLocation}
                    </p>
                  </div>
                )}
                {activeBooking.notes && (
                  <div className="col-span-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Guest Notes / Special Requests
                    </span>
                    <p className="font-medium text-slate-800 mt-0.5">{activeBooking.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
}
