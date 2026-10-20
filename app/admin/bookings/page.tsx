"use client";

import { useState, useEffect } from "react";
import {
  X, Trash2, Search, Eye, Sparkles, Edit3
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { formatCurrency } from "@/lib/utils";
import { AdminTableSkeleton } from "@/app/component/ui/skeleton";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Modal Editing States
  const [editFinalPrice, setEditFinalPrice] = useState<string>("");
  const [editAdminNotes, setEditAdminNotes] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

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

  // Sync modal edit fields when a booking is selected
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
      } else {
        alert("Failed to update status.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePriceAndNotes = async (newStatus?: string) => {
    if (!selectedBooking) return;
    setIsUpdating(true);

    try {
      const payload: any = {
        finalPrice: Number(editFinalPrice) || selectedBooking.totalPrice,
        adminNotes: editAdminNotes.trim(),
      };
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
        const updated = data.booking;
        setBookings((prev) =>
          prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b))
        );
        setSelectedBooking((prev: any) => ({ ...prev, ...updated }));
        alert(newStatus ? `Booking status set to ${newStatus} with confirmed price.` : "Price and coordinator notes updated.");
      } else {
        alert("Failed to update booking price.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving updates.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete reservation with code ${code}?`)) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
        if (selectedBooking?.id === id) setSelectedBooking(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    const matchesType =
      typeFilter === "ALL" ||
      (typeFilter === "CUSTOM" && b.bookingType === "CUSTOM") ||
      (typeFilter === "REGULAR" && b.bookingType !== "CUSTOM");
    const matchesSearch =
      b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.packageName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Incoming Bookings
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary-950 tracking-tight">
            Manage Reservations & Bookings
          </h1>
          <p className="text-xs sm:text-sm text-secondary-600 mt-1">
            Confirm regular packages, review custom trip itineraries, adjust final quotes, and coordinate with travelers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-primary-100 text-primary-800 px-3.5 py-1.5 rounded-full">
            Total {bookings.length} Reservations
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-secondary-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { label: "All Status", val: "ALL" },
              { label: "Pending", val: "PENDING" },
              { label: "Confirmed", val: "CONFIRMED" },
              { label: "Completed", val: "COMPLETED" },
              { label: "Cancelled", val: "CANCELLED" },
            ].map((tab) => (
              <button
                key={tab.val}
                onClick={() => setStatusFilter(tab.val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  statusFilter === tab.val
                    ? "bg-secondary-950 text-white shadow-2xs"
                    : "bg-secondary-50 text-secondary-700 hover:bg-secondary-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-secondary-200 hidden sm:block" />

          {/* Type Tabs */}
          <div className="flex gap-1">
            {[
              { label: "All Types", val: "ALL" },
              { label: "Regular", val: "REGULAR" },
              { label: "Custom Trips", val: "CUSTOM" },
            ].map((tab) => (
              <button
                key={tab.val}
                onClick={() => setTypeFilter(tab.val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  typeFilter === tab.val
                    ? "bg-purple-950 text-white shadow-2xs"
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code, name, tour..."
            className="w-full pl-9 pr-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="w-3.5 h-3.5 text-secondary-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <AdminTableSkeleton columns={7} rows={6} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-secondary-200/80 shadow-xs overflow-hidden py-20 text-center text-xs text-secondary-500">
          No reservations match your search criteria.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-secondary-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-secondary-50 border-b border-secondary-100 text-[11px] font-bold text-secondary-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Code & Customer</th>
                  <th className="py-4 px-6">Tour Package / Type</th>
                  <th className="py-4 px-6">Schedule</th>
                  <th className="py-4 px-6 text-center">Pax</th>
                  <th className="py-4 px-6">Pricing</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Update Status / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {filtered.map((b) => {
                  const isCustom = b.bookingType === "CUSTOM";
                  return (
                    <tr key={b.id} className="hover:bg-secondary-50/60 transition">
                      <td className="py-4 px-6">
                        <div className="font-bold text-secondary-950 text-sm">{b.customerName}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-primary-700 bg-primary-50 px-2 py-0.5 rounded font-bold">
                            {b.bookingCode}
                          </span>
                          <a
                            href={`https://wa.me/${b.whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-1 text-[11px]"
                          >
                            <FaWhatsapp className="w-3 h-3" />
                            <span>{b.whatsappNumber}</span>
                          </a>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-secondary-800 max-w-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isCustom ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-extrabold text-[10px] uppercase">
                              <Sparkles className="w-3 h-3" />
                              Custom Trip
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-secondary-100 text-secondary-700 font-bold text-[10px] uppercase">
                              Regular
                            </span>
                          )}
                          <span className="line-clamp-1">{b.packageName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-secondary-600 whitespace-nowrap">
                        {b.departureDate}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-secondary-950">
                        {b.numParticipants}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {isCustom && !b.finalPrice ? (
                          <div>
                            <span className="font-black text-amber-700 text-sm block">
                              {formatCurrency(b.estimatedPrice || b.totalPrice)}
                            </span>
                            <span className="text-[10px] text-amber-600 font-bold">Estimated</span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-black text-primary-600 text-sm block">
                              {formatCurrency(b.finalPrice || b.totalPrice)}
                            </span>
                            {isCustom && (
                              <span className="text-[10px] text-emerald-600 font-bold">Confirmed</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
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
                      <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                        {b.status === "PENDING" && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, "CONFIRMED")}
                            className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-[10px] transition cursor-pointer"
                          >
                            Confirm
                          </button>
                        )}
                        {b.status === "CONFIRMED" && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, "COMPLETED")}
                            className="px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-[10px] transition cursor-pointer"
                          >
                            Complete
                          </button>
                        )}
                        {b.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, "CANCELLED")}
                            className="px-2.5 py-1.5 bg-secondary-100 hover:bg-red-50 hover:text-red-600 text-secondary-700 rounded-lg font-bold text-[10px] transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 rounded-lg bg-secondary-100 hover:bg-secondary-200 text-secondary-800 transition cursor-pointer inline-block"
                          title="View Full Details & Manage Pricing"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id, b.bookingCode)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer inline-block"
                          title="Delete Reservation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL & PRICING MODAL */}
      {selectedBooking && (() => {
        const isCustom = selectedBooking.bookingType === "CUSTOM";
        let parsedCustom: any = null;
        if (selectedBooking.customDetails) {
          try {
            parsedCustom =
              typeof selectedBooking.customDetails === "string"
                ? JSON.parse(selectedBooking.customDetails)
                : selectedBooking.customDetails;
          } catch {}
        }

        return (
          <div
            className="fixed inset-0 z-50 bg-secondary-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedBooking(null)}
          >
            <div
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-secondary-200 shadow-2xl relative text-secondary-950 text-xs my-auto max-h-[92vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-secondary-100 mb-4 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-secondary-500 uppercase tracking-wider block">
                      Reservation Details
                    </span>
                    {isCustom && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-extrabold text-[10px] uppercase">
                        Custom Trip
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-secondary-950">
                    {selectedBooking.bookingCode}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1.5 rounded-full hover:bg-secondary-100 cursor-pointer"
                >
                  <X className="w-5 h-5 text-secondary-500" />
                </button>
              </div>

              {/* Modal Scroll Content */}
              <div className="space-y-4 overflow-y-auto grow custom-scrollbar pr-1">
                <div className="p-3.5 bg-secondary-50 rounded-2xl space-y-1">
                  <p className="font-bold text-sm text-secondary-950">
                    {selectedBooking.packageName}
                  </p>
                  <p className="text-secondary-600">
                    Schedule: {selectedBooking.departureDate} • {selectedBooking.numParticipants} Guests
                  </p>
                </div>

                {/* Custom Itinerary Details Breakdown */}
                {parsedCustom && (
                  <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200/80 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 block">
                      Customized Expedition Logistics
                    </span>

                    {parsedCustom.destinations && (
                      <div>
                        <span className="text-secondary-500 text-[10px] block mb-1">
                          Destinations Chosen:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {parsedCustom.destinations.map((d: any, idx: number) => (
                            <span
                              key={idx}
                              className="bg-white border border-purple-200 text-purple-950 font-bold px-2 py-0.5 rounded-lg text-xs"
                            >
                              📍 {d.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-purple-200/60">
                      <div>
                        <span className="text-secondary-500 block text-[10px]">Duration:</span>
                        <span className="font-bold text-secondary-900">
                          {parsedCustom.durationName || "1 Day"}
                        </span>
                      </div>
                      <div>
                        <span className="text-secondary-500 block text-[10px]">Vehicle:</span>
                        <span className="font-bold text-secondary-900">
                          {parsedCustom.transportName || "Standard Vehicle"}
                        </span>
                      </div>
                      <div>
                        <span className="text-secondary-500 block text-[10px]">Guide:</span>
                        <span className="font-bold text-secondary-900">
                          {parsedCustom.guideName || "Certified Guide"}
                        </span>
                      </div>
                      <div>
                        <span className="text-secondary-500 block text-[10px]">Gear Add-ons:</span>
                        <span className="font-bold text-secondary-900">
                          {parsedCustom.addonsList?.length > 0
                            ? parsedCustom.addonsList.map((a: any) => a.name).join(", ")
                            : "None"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Contact */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-secondary-50 rounded-2xl">
                    <span className="text-secondary-500 block mb-0.5">Customer</span>
                    <p className="font-bold text-secondary-950">{selectedBooking.customerName}</p>
                    <p className="text-secondary-600">{selectedBooking.customerEmail || "-"}</p>
                  </div>
                  <div className="p-3 bg-secondary-50 rounded-2xl">
                    <span className="text-secondary-500 block mb-0.5">WhatsApp</span>
                    <p className="font-bold text-emerald-700">{selectedBooking.whatsappNumber}</p>
                  </div>
                </div>

                <div className="p-3 bg-secondary-50 rounded-2xl">
                  <span className="text-secondary-500 block mb-0.5">Pickup Location</span>
                  <p className="font-bold text-secondary-950">
                    {selectedBooking.pickupLocation || "Not specified"}
                  </p>
                </div>

                {selectedBooking.specialRequests && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
                    <span className="font-bold block mb-0.5">Special Requests / Notes:</span>
                    <p className="whitespace-pre-line">{selectedBooking.specialRequests}</p>
                  </div>
                )}

                {/* PRICING & ADMIN APPROVAL SECTION */}
                <div className="p-4 bg-primary-50/80 rounded-2xl border border-primary-200 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-secondary-900">
                      {isCustom ? "Estimated Price:" : "Total Price:"}
                    </span>
                    <span className="text-base font-black text-primary-700">
                      {formatCurrency(selectedBooking.estimatedPrice || selectedBooking.totalPrice)}
                    </span>
                  </div>

                  {/* Final Price Input for Admin */}
                  <div className="pt-2 border-t border-primary-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-secondary-950 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-primary-600" />
                        <span>Final Approved Price (IDR):</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setEditFinalPrice(
                            String(selectedBooking.estimatedPrice || selectedBooking.totalPrice)
                          )
                        }
                        className="text-[10px] text-primary-700 hover:underline font-bold"
                      >
                        Reset to Estimated
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-secondary-400">
                        Rp
                      </span>
                      <input
                        type="number"
                        value={editFinalPrice}
                        onChange={(e) => setEditFinalPrice(e.target.value)}
                        placeholder="e.g. 1650000"
                        className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-bold bg-white border border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {/* Admin Notes */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-secondary-800">
                      Coordinator Internal Notes / Confirmation terms:
                    </label>
                    <textarea
                      rows={2}
                      value={editAdminNotes}
                      onChange={(e) => setEditAdminNotes(e.target.value)}
                      placeholder="e.g. Verified with driver; pickup confirmed at Ketapang port."
                      className="w-full p-2.5 rounded-xl text-xs bg-white border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Save Price / Confirm Buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleSavePriceAndNotes()}
                      className="grow py-2 px-3 rounded-xl bg-secondary-950 hover:bg-secondary-800 text-white font-bold text-xs transition cursor-pointer disabled:opacity-60"
                    >
                      Save Price & Notes
                    </button>
                    {selectedBooking.status === "PENDING" && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleSavePriceAndNotes("CONFIRMED")}
                        className="grow py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-60"
                      >
                        Approve & Confirm
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer / WhatsApp Contact */}
              <div className="mt-4 pt-4 border-t border-secondary-100 flex justify-between items-center gap-2 shrink-0">
                <span className="text-[10px] text-secondary-500">
                  Status: <strong>{selectedBooking.status}</strong>
                </span>

                <a
                  href={`https://wa.me/${selectedBooking.whatsappNumber}?text=${encodeURIComponent(
                    isCustom
                      ? `Hello ${selectedBooking.customerName}! We from Ijen Tour have reviewed your custom expedition request (${selectedBooking.bookingCode}). We would like to confirm your itinerary and the final price quote.`
                      : `Hello ${selectedBooking.customerName}, we from Ijen Tour would like to confirm your booking schedule (${selectedBooking.bookingCode}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <FaWhatsapp className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

