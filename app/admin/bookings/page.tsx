"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Users,
  DollarSign,
  FileText,
  Save,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { formatCurrency } from "@/lib/utils";
import { AdminTableSkeleton } from "@/app/component/ui/skeleton";
import AdminBadge from "@/app/component/admin/AdminBadge";
import AdminPageHeader from "@/app/component/admin/AdminPageHeader";
import AdminStatsCard from "@/app/component/admin/AdminStatsCard";
import AdminDrawer from "@/app/component/admin/AdminDrawer";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState<"ALL" | "PACKAGE" | "CUSTOM">("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Drawer / Selection
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Editing state inside drawer
  const [editFinalPrice, setEditFinalPrice] = useState<string>("");
  const [editAdminNotes, setEditAdminNotes] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  const loadBookings = () => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBookings(data.bookings || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // Sync drawer fields when booking is selected
  useEffect(() => {
    if (selectedBooking) {
      setEditFinalPrice(
        selectedBooking.finalPrice !== null && selectedBooking.finalPrice !== undefined
          ? String(selectedBooking.finalPrice)
          : String(selectedBooking.totalPrice || selectedBooking.estimatedPrice || "")
      );
      setEditAdminNotes(selectedBooking.adminNotes || "");
    }
  }, [selectedBooking]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

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
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking((prev: any) => ({ ...prev, status }));
        }
        showToast(`Booking #${id.substring(0, 8)} status updated to ${status}.`);
      } else {
        alert("Failed to update status.");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating status.");
    }
  };

  const handleSavePriceAndNotes = async (newStatus?: string) => {
    if (!selectedBooking) return;
    setIsUpdating(true);

    try {
      const payload: any = { adminNotes: editAdminNotes.trim() };
      if (editFinalPrice) {
        payload.finalPrice = Number(editFinalPrice);
      }
      if (newStatus) {
        payload.status = newStatus;
      }

      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const updated = data.booking || {
          ...selectedBooking,
          finalPrice: Number(editFinalPrice),
          adminNotes: editAdminNotes.trim(),
          status: newStatus || selectedBooking.status,
        };
        setBookings((prev) =>
          prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b))
        );
        setSelectedBooking((prev: any) => ({ ...prev, ...updated }));
        showToast("Booking details successfully saved!");
      } else {
        alert("Failed to save changes.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error occurred.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this reservation?")) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
        if (selectedBooking?.id === id) setSelectedBooking(null);
        showToast("Reservation deleted successfully.");
      } else {
        alert("Failed to delete booking.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const pending = bookings.filter((b) => b.status === "PENDING").length;
    const confirmed = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED").length;
    const custom = bookings.filter((b) => b.bookingType === "CUSTOM").length;
    const revenue = bookings
      .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
      .reduce((sum, b) => sum + (Number(b.finalPrice ?? b.totalPrice ?? b.estimatedPrice) || 0), 0);

    return { total: bookings.length, pending, confirmed, custom, revenue };
  }, [bookings]);

  // Filtered list
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Tab filter
      if (activeTab === "PACKAGE" && b.bookingType === "CUSTOM") return false;
      if (activeTab === "CUSTOM" && b.bookingType !== "CUSTOM") return false;

      // Status filter
      if (statusFilter !== "ALL" && b.status !== statusFilter) return false;

      // Date filter
      if (dateFilter) {
        const bDate = b.travelDate ? String(b.travelDate).split("T")[0] : "";
        if (bDate !== dateFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = (b.bookingCode || "").toLowerCase().includes(q);
        const matchesName = (b.customerName || "").toLowerCase().includes(q);
        const matchesEmail = (b.customerEmail || "").toLowerCase().includes(q);
        const matchesPkg = (b.packageName || "").toLowerCase().includes(q);
        if (!matchesCode && !matchesName && !matchesEmail && !matchesPkg) return false;
      }

      return true;
    });
  }, [bookings, activeTab, statusFilter, dateFilter, searchQuery]);

  // WhatsApp quick quote URL generator
  const getWhatsAppQuoteUrl = (b: any) => {
    const phone = (b.customerPhone || "").replace(/[^0-9]/g, "");
    const cleanPhone = phone.startsWith("0") ? "62" + phone.slice(1) : phone;
    const priceStr = formatCurrency(Number(editFinalPrice || b.finalPrice || b.totalPrice || b.estimatedPrice || 0));

    const text = encodeURIComponent(
      `Hello ${b.customerName || "Traveler"}!\n\nRegarding your Mount Ijen inquiry (${b.packageName || "Custom Tour"} on ${
        b.travelDate ? String(b.travelDate).split("T")[0] : "your requested date"
      } for ${b.numParticipants || 1} Pax):\n\nOfficial Quote: ${priceStr}\n\nNotes from our trip organizer: ${
        editAdminNotes || "Licensed local guide, gas respirators, and private transfer included."
      }\n\nPlease let us know if you wish to confirm your expedition schedule!`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminTableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <AdminPageHeader
        title="Reservations & Bookings Desk"
        description="Review all customer reservations, handle custom itinerary quotes, and update departure statuses."
        badge={`${metrics.total} Total`}
        breadcrumbs={[{ label: "Bookings & Operations" }]}
      />

      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <AdminStatsCard
          label="All Reservations"
          value={metrics.total}
          icon={<Calendar className="w-4 h-4" />}
          subtitle="Full booking history"
          theme="slate"
        />
        <AdminStatsCard
          label="Pending Action"
          value={metrics.pending}
          icon={<Clock className="w-4 h-4" />}
          subtitle="Requires confirmation"
          theme="amber"
        />
        <AdminStatsCard
          label="Confirmed Trips"
          value={metrics.confirmed}
          icon={<CheckCircle2 className="w-4 h-4" />}
          subtitle="Ready for departure"
          theme="emerald"
        />
        <AdminStatsCard
          label="Custom Requests"
          value={metrics.custom}
          icon={<Sparkles className="w-4 h-4" />}
          subtitle="Tailored itineraries"
          theme="purple"
        />
        <AdminStatsCard
          label="Verified Revenue"
          value={formatCurrency(metrics.revenue)}
          icon={<DollarSign className="w-4 h-4" />}
          subtitle="Confirmed bookings"
          theme="teal"
        />
      </div>

      {/* Navigation Tabs + Search & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        {/* Tab switchers */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-black"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              All Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab("PACKAGE")}
              className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                activeTab === "PACKAGE"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-black"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              Tour Packages ({bookings.filter((b) => b.bookingType !== "CUSTOM").length})
            </button>
            <button
              onClick={() => setActiveTab("CUSTOM")}
              className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                activeTab === "CUSTOM"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-black"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              Custom Requests ({metrics.custom})
            </button>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-slate-900 dark:text-white">{filteredBookings.length}</strong> of {bookings.length} reservations
          </span>
        </div>

        {/* Filter controls row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer, code, or package..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-amber-500 transition cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Action</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Travel Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-amber-500 transition cursor-pointer"
              title="Filter by travel departure date"
            />

            {(searchQuery || statusFilter !== "ALL" || dateFilter) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setDateFilter("");
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Bookings Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-wider">
                <th className="py-3.5 pl-6">Code / Type</th>
                <th className="py-3.5">Customer</th>
                <th className="py-3.5">Tour Package</th>
                <th className="py-3.5">Travel Date</th>
                <th className="py-3.5">Pax</th>
                <th className="py-3.5">Total Price</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => {
                  const isCustom = b.bookingType === "CUSTOM";
                  const price = Number(b.finalPrice ?? b.totalPrice ?? b.estimatedPrice) || 0;

                  return (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedBooking(b)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer group"
                    >
                      <td className="py-4 pl-6">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          #{b.bookingCode || b.id.substring(0, 8)}
                        </div>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase mt-0.5 inline-block ${
                            isCustom
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                              : "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300"
                          }`}
                        >
                          {isCustom ? "Custom" : "Package"}
                        </span>
                      </td>

                      <td className="py-4">
                        <div className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                          {b.customerName || "Traveler"}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                          {b.customerPhone || b.customerEmail || "-"}
                        </div>
                      </td>

                      <td className="py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                          {b.packageName || "Custom Travel Itinerary"}
                        </div>
                        {b.pickupLocation && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate max-w-[180px]">
                            <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{b.pickupLocation}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                        {b.travelDate ? String(b.travelDate).split("T")[0] : "Flexible"}
                      </td>

                      <td className="py-4 font-bold text-slate-900 dark:text-white">
                        {b.numParticipants || 1} Pax
                      </td>

                      <td className="py-4 font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {formatCurrency(price)}
                      </td>

                      <td className="py-4">
                        <AdminBadge status={b.status || "PENDING"} />
                      </td>

                      <td className="py-4 pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(b);
                            }}
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Inspect Booking Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBooking(b.id);
                            }}
                            className="p-1.5 rounded-xl border border-rose-200 text-rose-600 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                            title="Delete Booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold">No reservations match the selected filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Inspection & Action Drawer */}
      <AdminDrawer
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={
          selectedBooking
            ? `Reservation #${selectedBooking.bookingCode || selectedBooking.id.substring(0, 8)}`
            : ""
        }
        subtitle={
          selectedBooking?.bookingType === "CUSTOM"
            ? "Custom Trip Request & Quote Management"
            : "Tour Package Booking Confirmation"
        }
        width="lg"
        footer={
          selectedBooking && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleSavePriceAndNotes()}
                disabled={isUpdating}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isUpdating ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          )
        }
      >
        {selectedBooking && (
          <div className="space-y-6 text-xs">
            {/* Quick Status Pill + Quick Change buttons */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-500 dark:text-slate-400">Status</span>
                <AdminBadge status={selectedBooking.status || "PENDING"} />
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedBooking.id, "CONFIRMED")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
                    selectedBooking.status === "CONFIRMED"
                      ? "bg-emerald-600 text-white font-black"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Trip</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedBooking.id, "COMPLETED")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
                    selectedBooking.status === "COMPLETED"
                      ? "bg-sky-600 text-white font-black"
                      : "bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300"
                  }`}
                >
                  <span>Mark Completed</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedBooking.id, "CANCELLED")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
                    selectedBooking.status === "CANCELLED"
                      ? "bg-rose-600 text-white font-black"
                      : "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300"
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-3">
              <h4 className="font-black uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                Customer & Contact Information
              </h4>
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Name</span>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {selectedBooking.customerName || "Traveler"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone / WhatsApp</span>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {selectedBooking.customerPhone || "-"}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Address</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {selectedBooking.customerEmail || "-"}
                  </p>
                </div>

                {selectedBooking.customerPhone && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <a
                      href={getWhatsAppQuoteUrl(selectedBooking)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition"
                    >
                      <FaWhatsapp className="w-4 h-4" />
                      <span>Chat & Send Quote on WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Expedition / Itinerary Details */}
            <div className="space-y-3">
              <h4 className="font-black uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                Trip Details & Logistics
              </h4>
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Travel Date</span>
                    <p className="font-extrabold text-slate-900 dark:text-white">
                      {selectedBooking.travelDate ? String(selectedBooking.travelDate).split("T")[0] : "Flexible"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Participants</span>
                    <p className="font-extrabold text-slate-900 dark:text-white">
                      {selectedBooking.numParticipants || 1} Person(s)
                    </p>
                  </div>
                </div>

                {selectedBooking.pickupLocation && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup Location</span>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {selectedBooking.pickupLocation}
                    </p>
                  </div>
                )}

                {selectedBooking.notes && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer Request & Notes</span>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-xs mt-1 leading-relaxed">
                      {selectedBooking.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price & Admin Notes Editable Form */}
            <div className="space-y-3">
              <h4 className="font-black uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                Pricing & Admin Notes
              </h4>
              <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Confirmed Final Price (IDR)
                  </label>
                  <input
                    type="number"
                    value={editFinalPrice}
                    onChange={(e) => setEditFinalPrice(e.target.value)}
                    placeholder="Enter final agreed price"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Formatted: {formatCurrency(Number(editFinalPrice) || 0)}
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Internal Admin & Guide Notes
                  </label>
                  <textarea
                    rows={3}
                    value={editAdminNotes}
                    onChange={(e) => setEditAdminNotes(e.target.value)}
                    placeholder="Add driver contact, meeting point details, guide assignment, or custom payment notes..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
}
