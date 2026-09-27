"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, Calendar, Compass, ShieldCheck, DollarSign, CheckCircle2, Clock, LogOut, ArrowRight
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function MitraDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || !data.user) {
          router.push("/login?from=/mitra");
          return;
        }
        if (data.user.role !== "MITRA" && data.user.role !== "ADMIN") {
          router.push("/");
          return;
        }
        setUser(data.user);
      })
      .catch(() => {
        router.push("/login?from=/mitra");
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

  const assignedTrips = [
    {
      id: "assign-1",
      title: "Midnight Expedition Blue Fire Ijen",
      date: "Besok Dini Hari, 26 Sept 2026 (00:00 WIB)",
      pax: 4,
      leader: "Mr. David (Australia)",
      pickup: "Hotel Ketapang Indah Banyuwangi",
      status: "READY",
      payout: 450000,
    },
    {
      id: "assign-2",
      title: "Private Crater Lake & Waterfall Tour",
      date: "Minggu, 28 Sept 2026 (00:30 WIB)",
      pax: 2,
      leader: "Ibu Ratna (Surabaya)",
      pickup: "Hotel Santika Banyuwangi",
      status: "SCHEDULED",
      payout: 550000,
    },
  ];

  return (
    <div className="bg-secondary-50 text-secondary-950 min-h-screen pb-24">
      {/* HEADER BANNER */}
      <section className="bg-secondary-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-secondary-900 border border-secondary-800 flex items-center justify-center text-2xl font-black text-primary-400 shadow-md">
              <Compass className="w-8 h-8 text-primary-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{user.name}</h1>
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black bg-primary-500 text-secondary-950 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" /> MITRA GUIDE RESMI
                </span>
              </div>
              <p className="text-xs text-secondary-300 font-medium">
                Pemandu Lokal Berlisensi HPI Banyuwangi • {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/6282268177188?text=Halo%20Admin%20Operasional,%20saya%20siap%20bertugas."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-primary-500 hover:bg-primary-400 text-secondary-950 font-bold text-xs transition shadow-sm"
            >
              Lapor Kesiapan Guide
            </a>
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

      {/* STATS OVERVIEW */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 border border-secondary-200 shadow-sm">
            <span className="text-xs font-bold text-secondary-500 uppercase tracking-wider block mb-1">
              Jadwal Tur Aktif
            </span>
            <span className="text-3xl font-black text-secondary-950">2 Perjalanan</span>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Siap bertugas minggu ini</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-secondary-200 shadow-sm">
            <span className="text-xs font-bold text-secondary-500 uppercase tracking-wider block mb-1">
              Total Peserta Dipandu
            </span>
            <span className="text-3xl font-black text-primary-600">6 Wisatawan</span>
            <p className="text-xs text-secondary-500 mt-1">Grup privat & open trip</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-secondary-200 shadow-sm">
            <span className="text-xs font-bold text-secondary-500 uppercase tracking-wider block mb-1">
              Estimasi Honor Pandu
            </span>
            <span className="text-3xl font-black text-emerald-600">{formatCurrency(1000000)}</span>
            <p className="text-xs text-secondary-500 mt-1">Siap dicairkan usai ekspedisi</p>
          </div>
        </div>

        {/* ASSIGNED TRIPS SCHEDULE */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-6 border-b border-secondary-100 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600 block">
                Penugasan Pemandu
              </span>
              <h2 className="text-2xl font-black text-secondary-950">Jadwal Tugas Lapangan</h2>
            </div>
            <span className="text-xs font-bold bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full">
              Musim Pendakian 2026
            </span>
          </div>

          <div className="space-y-4">
            {assignedTrips.map((trip) => (
              <div
                key={trip.id}
                className="p-5 sm:p-6 rounded-2xl bg-secondary-50 border border-secondary-200/80 hover:border-primary-400 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {trip.status}
                    </span>
                    <span className="text-xs text-secondary-500 font-semibold">{trip.date}</span>
                  </div>

                  <h3 className="text-lg font-bold text-secondary-950">{trip.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-secondary-600">
                    <span>Pemimpin Rombongan: <strong className="text-secondary-900">{trip.leader}</strong></span>
                    <span>Jumlah: <strong className="text-secondary-900">{trip.pax} Pax</strong></span>
                    <span>Titik Jemput: <strong className="text-secondary-900">{trip.pickup}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-secondary-200">
                  <div>
                    <span className="text-[10px] text-secondary-500 block md:text-right">Honor Pemandu</span>
                    <span className="text-base font-black text-emerald-600">
                      {formatCurrency(trip.payout)}
                    </span>
                  </div>

                  <a
                    href={`https://wa.me/6282268177188?text=${encodeURIComponent(
                      `Halo Admin, saya konfirmasi siap bertugas memandu rombongan ${trip.leader} (${trip.title}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-secondary-950 hover:bg-primary-500 hover:text-secondary-950 text-white text-xs font-bold transition shadow-xs"
                  >
                    Konfirmasi Siap
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
