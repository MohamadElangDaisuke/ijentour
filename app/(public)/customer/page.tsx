"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Crown, Calendar, MapPin, CheckCircle2, Clock, XCircle, LogOut, Sparkles, AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get current logged in user
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || !data.user) {
          router.push("/login?from=/customer");
          return;
        }
        setUser(data.user);

        // 2. Fetch bookings for this user
        return fetch(`/api/bookings?userId=${data.user.id}`)
          .then((bRes) => bRes.json())
          .then((bData) => {
            if (bData.success) {
              setBookings(bData.bookings || []);
            }
          });
      })
      .catch(() => {
        router.push("/login?from=/customer");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center text-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) return null;

  const isPro = user.role === "CUSTOMER_PRO";

  return (
    <div className="bg-secondary-50 text-secondary-950 min-h-screen pb-24">
      {/* HEADER BANNER */}
      <section className="bg-secondary-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-secondary-900 border border-secondary-800 flex items-center justify-center text-2xl font-black text-primary-400 shadow-md">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{user.name}</h1>
                {isPro && (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black bg-primary-500 text-secondary-950 shadow-sm">
                    <Crown className="w-3.5 h-3.5" /> PRO VIP
                  </span>
                )}
              </div>
              <p className="text-xs text-secondary-300 font-medium">
                {user.email} • {user.phone || "No phone registered"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/packages"
              className="px-5 py-2.5 rounded-full bg-primary-500 hover:bg-primary-400 text-secondary-950 font-bold text-xs transition shadow-sm"
            >
              + Pesan Tur Baru
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </section>

      {/* DASHBOARD CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* PRO MEMBER PERKS BANNER */}
        {isPro ? (
          <div className="bg-gradient-to-r from-primary-500 via-primary-400 to-amber-300 rounded-3xl p-6 sm:p-8 text-secondary-950 shadow-xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider mb-1 text-secondary-950/80">
                <Crown className="w-4 h-4" /> Member Eksklusif Customer Pro Aktif
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                Diskon 10% Otomatis & Prioritas Penjemputan di Setiap Tur!
              </h2>
              <p className="text-xs sm:text-sm mt-1 text-secondary-950/90 font-medium">
                Nikmati fasilitas VIP pemandu lokal pilihan, gratis minuman hangat di Paltuding, dan layanan darurat 24 jam.
              </p>
            </div>
            <Link
              href="/packages"
              className="px-6 py-3 rounded-2xl bg-secondary-950 text-white font-black text-xs hover:bg-secondary-900 transition whitespace-nowrap shadow-md text-center"
            >
              Gunakan Promo Pro
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-secondary-200 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-primary-600 uppercase tracking-wider block">
                Upgrade Status Akun
              </span>
              <h3 className="text-lg font-black text-secondary-950">Ingin Diskon Ekstra 10% di Setiap Tur?</h3>
              <p className="text-xs text-secondary-600 mt-0.5">
                Hubungi admin kami untuk mengaktifkan status Customer Pro dan raih fasilitas VIP penjelajah Ijen.
              </p>
            </div>
            <a
              href="https://wa.me/6282268177188?text=Halo%20Admin%20Ijen%20Tour,%20saya%20ingin%20upgrade%20akun%20menjadi%20Customer%20Pro"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-secondary-100 hover:bg-primary-500 hover:text-secondary-950 text-secondary-800 font-bold text-xs transition whitespace-nowrap text-center"
            >
              Info Customer Pro
            </a>
          </div>
        )}

        {/* BOOKINGS LIST */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-6 border-b border-secondary-100 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600 block">
                Riwayat Perjalanan
              </span>
              <h2 className="text-2xl font-black text-secondary-950">Reservasi Tur Anda</h2>
            </div>
            <span className="text-xs font-bold bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full">
              {bookings.length} Reservasi
            </span>
          </div>

          {bookings.length === 0 ? (
            <div className="py-16 text-center">
              <Calendar className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-secondary-800 mb-1">Belum Ada Riwayat Reservasi</h3>
              <p className="text-xs text-secondary-500 max-w-sm mx-auto mb-6">
                Anda belum memesan paket tur. Mulai petualangan ke Kawah Ijen sekarang juga!
              </p>
              <Link
                href="/packages"
                className="px-6 py-3 rounded-full bg-primary-500 hover:bg-primary-400 text-secondary-950 font-bold text-xs inline-flex items-center gap-2 shadow-sm transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Eksplorasi Paket Wisata</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-5 sm:p-6 rounded-2xl bg-secondary-50 border border-secondary-200/80 hover:border-primary-400 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-primary-700 bg-primary-100 px-2.5 py-0.5 rounded-md">
                        {booking.bookingCode}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${booking.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-800"
                            : booking.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-800"
                              : booking.status === "CANCELLED"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-secondary-950">{booking.packageName}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-secondary-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary-600" />
                        Tanggal: {booking.departureDate}
                      </span>
                      <span>Peserta: {booking.numParticipants} Orang</span>
                      <span>Jemput: {booking.pickupLocation || "Banyuwangi"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-secondary-200">
                    <div>
                      <span className="text-[10px] text-secondary-500 block md:text-right">Total Biaya</span>
                      <span className="text-base font-black text-primary-600">
                        {formatCurrency(booking.totalPrice)}
                      </span>
                    </div>

                    <a
                      href={`https://wa.me/6282268177188?text=${encodeURIComponent(
                        `Halo Admin Ijen Tour, saya ingin menanyakan reservasi ${booking.bookingCode} atas nama ${user.name}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-white border border-secondary-300 hover:border-primary-500 text-secondary-800 text-xs font-bold transition shadow-2xs"
                    >
                      Hubungi Admin
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
