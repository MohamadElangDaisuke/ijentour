"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Compass,
  TrendingUp,
  DollarSign,
  Users,
  Flame,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  Star,
  ExternalLink,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadData = async () => {
    try {
      const [resBookings, resTrips, resDestinations] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/trips"),
        fetch("/api/destinations"),
      ]);

      const dataBookings = await resBookings.json();
      const dataTrips = await resTrips.json();
      const dataDestinations = await resDestinations.json();

      if (dataBookings.success) setBookings(dataBookings.bookings || []);
      if (dataTrips.success) setPackages(dataTrips.packages || []);
      if (dataDestinations.success) setDestinations(dataDestinations.destinations || []);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status } : b))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Real statistics derived purely from database
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED");
  const pendingBookings = bookings.filter((b) => b.status === "PENDING");
  const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED");
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
  const totalTravelers = confirmedBookings.reduce((sum, b) => sum + (Number(b.numParticipants) || 1), 0);

  // Filter recent bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.packageName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate popular trips
  const popularTrips = [...packages].sort((a, b) => (b.rating || 5) - (a.rating || 5)).slice(0, 4);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
        <p className="text-xs text-secondary-500 font-medium">Memuat data analitik sistem...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Overview Sistem
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary-950 tracking-tight">
            Dashboard Manajemen Ijen Tour
          </h1>
          <p className="text-xs sm:text-sm text-secondary-600 mt-1">
            Data aktual dari database Supabase PostgreSQL: reservasi, wisatawan, omset, dan katalog tur.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/trips/create"
            className="px-4 py-2.5 rounded-2xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-xs transition shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Paket Tur</span>
          </Link>
          <Link
            href="/admin/bookings"
            className="px-4 py-2.5 rounded-2xl bg-secondary-950 hover:bg-secondary-900 text-white font-bold text-xs transition shadow-sm"
          >
            Semua Reservasi ({bookings.length})
          </Link>
        </div>
      </div>

      {/* STAT CARDS - 6 METRIC PRODUCTION GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Destinasi */}
        <div className="bg-white rounded-2xl p-5 border border-secondary-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-secondary-500 uppercase tracking-wider">
              Destinasi
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-secondary-950">{destinations.length}</p>
          <p className="text-[10px] text-secondary-500 font-semibold mt-1">Spot wisata Ijen</p>
        </div>

        {/* Total Trips */}
        <div className="bg-white rounded-2xl p-5 border border-secondary-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-secondary-500 uppercase tracking-wider">
              Total Trips
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-secondary-950">{packages.length}</p>
          <p className="text-[10px] text-sky-600 font-semibold mt-1">Paket aktif</p>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-2xl p-5 border border-secondary-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-secondary-500 uppercase tracking-wider">
              Total Bookings
            </span>
            <div className="w-8 h-8 rounded-xl bg-secondary-100 text-secondary-800 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-secondary-950">{bookings.length}</p>
          <p className="text-[10px] text-secondary-500 font-semibold mt-1">Semua status</p>
        </div>

        {/* Pending Bookings */}
        <div className="bg-white rounded-2xl p-5 border border-secondary-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-secondary-500 uppercase tracking-wider">
              Pending
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">{pendingBookings.length}</p>
          <p className="text-[10px] text-amber-700 font-semibold mt-1">Perlu konfirmasi</p>
        </div>

        {/* Confirmed Bookings */}
        <div className="bg-white rounded-2xl p-5 border border-secondary-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-secondary-500 uppercase tracking-wider">
              Confirmed
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">{confirmedBookings.length}</p>
          <p className="text-[10px] text-emerald-700 font-semibold mt-1">Siap jalan</p>
        </div>

        {/* Real Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-secondary-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-secondary-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-black text-secondary-950 truncate">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">✓ Omset riil</p>
        </div>
      </div>

      {/* POPULAR TRIPS + REVENUE SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Trips Section */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-secondary-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-primary-600 uppercase tracking-wider block">
                Katalog Unggulan
              </span>
              <h2 className="text-lg font-black text-secondary-950">Popular Trips</h2>
            </div>
            <Link
              href="/admin/trips"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
            >
              <span>Kelola Semua Paket</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {popularTrips.map((pkg) => (
              <div
                key={pkg.id}
                className="group flex gap-3.5 p-3 rounded-2xl border border-secondary-100 bg-secondary-50/50 hover:bg-white hover:border-primary-400 hover:shadow-xs transition"
              >
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-secondary-200">
                  <img
                    src={pkg.coverImage || pkg.image || "/images/pkg-bluefire.png"}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                <div className="flex flex-col justify-between min-w-0 flex-1">
                  <div>
                    <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider block">
                      {pkg.category} • {pkg.duration}
                    </span>
                    <h3 className="font-bold text-xs text-secondary-950 truncate mt-0.5" title={pkg.title}>
                      {pkg.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-black text-xs text-secondary-950">{pkg.price}</span>
                    <div className="flex items-center text-[10px] font-bold text-amber-500 gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{pkg.rating || 5.0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance & Travelers Insight */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-secondary-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider block mb-1">
              Statistik Wisatawan
            </span>
            <h2 className="text-lg font-black text-secondary-950 mb-4">Total Peserta Tur</h2>

            <div className="p-4 rounded-2xl bg-secondary-50 border border-secondary-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary-600 font-medium">Peserta Terkonfirmasi:</span>
                <span className="font-black text-secondary-950 text-base">{totalTravelers} Pax</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary-600 font-medium">Rata-rata Biaya / Pemesanan:</span>
                <span className="font-bold text-primary-600">
                  {confirmedBookings.length > 0
                    ? formatCurrency(Math.round(totalRevenue / confirmedBookings.length))
                    : "Rp 0"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary-600 font-medium">Tingkat Konfirmasi:</span>
                <span className="font-bold text-emerald-600">
                  {bookings.length > 0
                    ? `${Math.round((confirmedBookings.length / bookings.length) * 100)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-secondary-100 flex items-center justify-between text-xs">
            <span className="text-secondary-500">Kapasitas Maksimal Ijen</span>
            <span className="font-bold text-secondary-950">Kuota Resmi BBKSDA</span>
          </div>
        </div>
      </div>

      {/* RECENT BOOKINGS TABLE WITH FILTER & SEARCH */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-secondary-100 gap-4 mb-6">
          <div>
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider block">
              Transaksi Terkini
            </span>
            <h2 className="text-xl font-black text-secondary-950">Recent Bookings</h2>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-secondary-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kode / nama pemesan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-secondary-50 border border-secondary-200 text-xs text-secondary-950 outline-none focus:ring-2 focus:ring-primary-500 w-48 sm:w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-secondary-50 border border-secondary-200 text-xs font-bold text-secondary-800 outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Pending ({pendingBookings.length})</option>
              <option value="CONFIRMED">Confirmed ({confirmedBookings.length})</option>
              <option value="CANCELLED">Cancelled ({cancelledBookings.length})</option>
            </select>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="py-12 text-center text-secondary-400 text-xs">
            Tidak ada transaksi reservasi yang cocok dengan pencarian
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-secondary-100 text-[11px] font-bold text-secondary-500 uppercase tracking-wider">
                  <th className="pb-3">Kode / Pemesan</th>
                  <th className="pb-3">Paket Tur</th>
                  <th className="pb-3">Tanggal</th>
                  <th className="pb-3 text-center">Pax</th>
                  <th className="pb-3">Total Biaya</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {filteredBookings.slice(0, 8).map((b) => (
                  <tr key={b.id} className="hover:bg-secondary-50/70 transition">
                    <td className="py-3.5">
                      <div className="font-bold text-secondary-950">{b.customerName}</div>
                      <span className="font-mono text-[10px] text-primary-600">{b.bookingCode}</span>
                    </td>
                    <td className="py-3.5 font-medium text-secondary-800">{b.packageName}</td>
                    <td className="py-3.5 text-secondary-600">{b.departureDate}</td>
                    <td className="py-3.5 text-center font-bold text-secondary-950">{b.numParticipants}</td>
                    <td className="py-3.5 font-black text-primary-600">{formatCurrency(b.totalPrice)}</td>
                    <td className="py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-800"
                            : b.status === "COMPLETED"
                            ? "bg-blue-100 text-blue-800"
                            : b.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-1.5">
                      {b.status === "PENDING" && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, "CONFIRMED")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] cursor-pointer transition shadow-2xs"
                        >
                          Konfirmasi
                        </button>
                      )}
                      {b.status === "CONFIRMED" && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, "COMPLETED")}
                          className="px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10px] cursor-pointer transition shadow-2xs"
                        >
                          Selesai
                        </button>
                      )}
                      <Link
                        href={`/admin/bookings?search=${b.bookingCode}`}
                        className="px-2 py-1 rounded-lg bg-secondary-100 hover:bg-secondary-200 text-secondary-700 font-bold text-[10px] inline-flex items-center"
                        title="Lihat Rincian Lengkap"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
