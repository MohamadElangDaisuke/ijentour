"use client";

import { useState, useEffect } from "react";
import {
  Calendar, Check, X, Trash2, Search, Filter, Phone, Eye, User, MapPin, AlertCircle
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { formatCurrency, safeJsonParse } from "@/lib/utils";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

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
        alert("Gagal memperbarui status.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Hapus reservasi dengan kode ${code}?`)) return;
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
    const matchesSearch =
      b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.packageName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Transaksi Masuk
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary-950 tracking-tight">
            Kelola Reservasi & Pemesanan
          </h1>
          <p className="text-xs sm:text-sm text-secondary-600 mt-1">
            Konfirmasi slot perjalanan, ubah status keberangkatan, dan koordinasi dengan wisatawan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-primary-100 text-primary-800 px-3.5 py-1.5 rounded-full">
            Total {bookings.length} Reservasi
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-secondary-200 shadow-xs">
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "Semua", val: "ALL" },
            { label: "Pending", val: "PENDING" },
            { label: "Confirmed", val: "CONFIRMED" },
            { label: "Completed", val: "COMPLETED" },
            { label: "Cancelled", val: "CANCELLED" },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setStatusFilter(tab.val)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === tab.val
                  ? "bg-secondary-950 text-white shadow-2xs"
                  : "bg-secondary-50 text-secondary-700 hover:bg-secondary-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode, nama, tur..."
            className="w-full pl-9 pr-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="w-3.5 h-3.5 text-secondary-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-secondary-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-xs text-secondary-500">
            Tidak ada reservasi yang cocok dengan kriteria pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-secondary-50 border-b border-secondary-100 text-[11px] font-bold text-secondary-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Kode & Pemesan</th>
                  <th className="py-4 px-6">Paket Wisata</th>
                  <th className="py-4 px-6">Jadwal</th>
                  <th className="py-4 px-6 text-center">Pax</th>
                  <th className="py-4 px-6">Total Biaya</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Ubah Status / Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {filtered.map((b) => (
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
                    <td className="py-4 px-6 font-medium text-secondary-800">
                      {b.packageName}
                    </td>
                    <td className="py-4 px-6 text-secondary-600">
                      {b.departureDate}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-secondary-950">
                      {b.numParticipants}
                    </td>
                    <td className="py-4 px-6 font-black text-primary-600 text-sm">
                      {formatCurrency(b.totalPrice)}
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
                          Konfirmasi
                        </button>
                      )}
                      {b.status === "CONFIRMED" && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, "COMPLETED")}
                          className="px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-[10px] transition cursor-pointer"
                        >
                          Selesai
                        </button>
                      )}
                      {b.status !== "CANCELLED" && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, "CANCELLED")}
                          className="px-2.5 py-1.5 bg-secondary-100 hover:bg-red-50 hover:text-red-600 text-secondary-700 rounded-lg font-bold text-[10px] transition cursor-pointer"
                        >
                          Batal
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="p-1.5 rounded-lg bg-secondary-100 hover:bg-secondary-200 text-secondary-800 transition cursor-pointer inline-block"
                        title="Lihat Detail Lengkap"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id, b.bookingCode)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer inline-block"
                        title="Hapus Reservasi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 bg-secondary-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-secondary-200 shadow-2xl relative text-secondary-950 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-secondary-100 mb-4">
              <div>
                <span className="text-[10px] font-bold text-secondary-500 uppercase tracking-wider block">
                  Detail Rincian Reservasi
                </span>
                <h3 className="text-xl font-black text-secondary-950">{selectedBooking.bookingCode}</h3>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-1.5 rounded-full hover:bg-secondary-100">
                <X className="w-5 h-5 text-secondary-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-secondary-50 rounded-2xl space-y-1">
                <p className="font-bold text-sm text-secondary-950">{selectedBooking.packageName}</p>
                <p className="text-secondary-600">Jadwal: {selectedBooking.departureDate} • {selectedBooking.numParticipants} Orang</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-secondary-50 rounded-2xl">
                  <span className="text-secondary-500 block mb-0.5">Pemesan</span>
                  <p className="font-bold text-secondary-950">{selectedBooking.customerName}</p>
                  <p className="text-secondary-600">{selectedBooking.customerEmail || "-"}</p>
                </div>
                <div className="p-3 bg-secondary-50 rounded-2xl">
                  <span className="text-secondary-500 block mb-0.5">WhatsApp</span>
                  <p className="font-bold text-emerald-700">{selectedBooking.whatsappNumber}</p>
                </div>
              </div>

              <div className="p-3 bg-secondary-50 rounded-2xl">
                <span className="text-secondary-500 block mb-0.5">Titik Penjemputan</span>
                <p className="font-bold text-secondary-950">{selectedBooking.pickupLocation || "Belum ditentukan"}</p>
              </div>

              {selectedBooking.specialRequests && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
                  <span className="font-bold block mb-0.5">Permintaan Khusus:</span>
                  <p>{selectedBooking.specialRequests}</p>
                </div>
              )}

              <div className="p-3.5 bg-primary-50 rounded-2xl border border-primary-200 flex justify-between items-baseline">
                <span className="font-bold text-secondary-900">Total Pembayaran:</span>
                <span className="text-base font-black text-primary-700">{formatCurrency(selectedBooking.totalPrice)}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-secondary-100 flex justify-end gap-2">
              <a
                href={`https://wa.me/${selectedBooking.whatsappNumber}?text=${encodeURIComponent(
                  `Halo ${selectedBooking.customerName}, kami dari Ijen Tour ingin mengonfirmasi jadwal pemesanan Anda (${selectedBooking.bookingCode}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center gap-1.5"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>Chat Pelanggan</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
