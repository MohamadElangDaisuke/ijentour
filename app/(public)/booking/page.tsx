"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Calendar, MapPin, CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { formatCurrency } from "@/lib/utils";

export default function BookingLookupPage() {
  const [bookingCode, setBookingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState("");

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCode.trim()) return;

    setLoading(true);
    setError("");
    setBooking(null);

    try {
      const res = await fetch(`/api/bookings/${bookingCode.trim()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Kode reservasi tidak ditemukan.");
      }
      setBooking(data.booking);
    } catch (err: any) {
      setError(err.message || "Gagal menemukan reservasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-secondary-50 text-secondary-950 min-h-screen pb-24">
      {/* HERO */}
      <section className="relative h-[35vh] min-h-64 flex items-center justify-center text-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/the-best-view-of-kawah.webp')" }}
        >
          <div className="absolute inset-0 bg-secondary-950/75"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 mt-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-400 mb-2">
            Layanan Pelanggan
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Cek Status Reservasi Anda
          </h1>
          <p className="text-sm text-secondary-200 mt-2">
            Masukkan kode booking Anda untuk melihat rincian pemesanan dan jadwal perjalanan.
          </p>
        </div>
      </section>

      {/* SEARCH BOX */}
      <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-secondary-200">
          <form onSubmit={handleLookup} className="space-y-4">
            <label className="block text-xs font-black text-secondary-950 uppercase tracking-wider">
              Masukkan Kode Booking Resmi
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                placeholder="Contoh: IJN-20260925-B101"
                className="grow px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-2xl text-sm font-mono font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-sm rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? "Mencari..." : "Lacak Booking"}</span>
              </button>
            </div>
          </form>

          {/* Quick Demo Codes */}
          <div className="mt-6 pt-4 border-t border-secondary-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-secondary-500 font-medium">Contoh Kode Demo:</span>
            <button
              type="button"
              onClick={() => setBookingCode("IJN-20260925-B101")}
              className="px-2.5 py-1 rounded-lg bg-secondary-100 hover:bg-primary-100 font-mono font-bold text-secondary-800 transition cursor-pointer"
            >
              IJN-20260925-B101
            </button>
            <button
              type="button"
              onClick={() => setBookingCode("IJN-20260925-C202")}
              className="px-2.5 py-1 rounded-lg bg-secondary-100 hover:bg-primary-100 font-mono font-bold text-secondary-800 transition cursor-pointer"
            >
              IJN-20260925-C202
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* NEW RESERVATION CTA WHEN NO SEARCH PERFORMED */}
      {!booking && (
        <div className="max-w-2xl mx-auto px-4 mt-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-secondary-200 text-center space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600">
              Belum Memiliki Reservasi?
            </span>
            <h2 className="text-lg font-black text-secondary-950">
              Mulai Petualangan Menuju Api Biru Sekarang
            </h2>
            <p className="text-xs text-secondary-600 max-w-md mx-auto">
              Pilih dari beragam paket pendakian Midnight, Private Tour keluarga, atau paket overland Bali return.
            </p>
            <div className="pt-2">
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-secondary-950 hover:bg-primary-500 hover:text-secondary-950 text-white font-bold text-xs transition shadow-sm"
              >
                <span>Lihat Katalog Paket Wisata</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH RESULTS */}
      {booking && (
        <div className="max-w-3xl mx-auto px-4 mt-10">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-secondary-100 gap-4 mb-6">
              <div>
                <span className="text-[11px] font-bold text-secondary-500 uppercase tracking-wider block">
                  Detail Reservasi Terkonfirmasi
                </span>
                <h3 className="text-2xl font-black text-secondary-950">{booking.packageName}</h3>
                <span className="text-xs font-mono font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-md inline-block mt-2">
                  {booking.bookingCode}
                </span>
              </div>
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${booking.status === "CONFIRMED"
                      ? "bg-emerald-100 text-emerald-800"
                      : booking.status === "COMPLETED"
                        ? "bg-blue-100 text-blue-800"
                        : booking.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                    }`}
                >
                  {booking.status === "CONFIRMED" && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {booking.status === "PENDING" && <Clock className="w-3.5 h-3.5" />}
                  {booking.status === "CANCELLED" && <XCircle className="w-3.5 h-3.5" />}
                  Status: {booking.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6">
              <div className="p-4 rounded-2xl bg-secondary-50 space-y-1">
                <span className="text-secondary-500 block">Nama Pemesan:</span>
                <p className="font-bold text-secondary-950 text-sm">{booking.customerName}</p>
                <p className="text-secondary-600">WhatsApp: {booking.whatsappNumber}</p>
              </div>

              <div className="p-4 rounded-2xl bg-secondary-50 space-y-1">
                <span className="text-secondary-500 block">Jadwal Keberangkatan:</span>
                <p className="font-bold text-secondary-950 text-sm">{booking.departureDate}</p>
                <p className="text-secondary-600">Jumlah Peserta: {booking.numParticipants} Orang</p>
              </div>

              <div className="p-4 rounded-2xl bg-secondary-50 space-y-1">
                <span className="text-secondary-500 block">Titik Penjemputan:</span>
                <p className="font-bold text-secondary-950 text-sm">{booking.pickupLocation || "Area Banyuwangi"}</p>
              </div>

              <div className="p-4 rounded-2xl bg-secondary-50 space-y-1">
                <span className="text-secondary-500 block">Total Biaya Perjalanan:</span>
                <p className="font-black text-primary-600 text-base">{formatCurrency(booking.totalPrice)}</p>
                <p className="text-secondary-500">Status Pembayaran: {booking.paymentStatus}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-secondary-100 flex flex-col sm:flex-row gap-3 justify-end">
              <a
                href={`https://wa.me/6282268177188?text=${encodeURIComponent(
                  `Halo Admin Ijen Tour! Saya menanyakan update reservasi dengan Kode Booking: *${booking.bookingCode}*. Terima kasih.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>Hubungi Admin Terkait Booking Ini</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
