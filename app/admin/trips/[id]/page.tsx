"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import PackageForm from "../PackageForm";
import { Skeleton } from "@/app/component/ui/skeleton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditTripPage({ params }: PageProps) {
  const resolved = use(params);
  const tripId = resolved.id;

  const [loading, setLoading] = useState(true);
  const [packageData, setPackageData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/trips/${tripId}?includeInactive=true`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.package) {
          setPackageData(data.package);
        } else {
          setError(data.error || "Paket wisata tidak ditemukan.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Gagal memuat detail paket wisata.");
      })
      .finally(() => setLoading(false));
  }, [tripId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        <div className="space-y-2 border-b border-secondary-200/80 pb-4">
          <Skeleton className="w-32 h-4" rounded="md" />
          <Skeleton className="w-72 h-8" rounded="lg" />
        </div>
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-xs space-y-6">
          <Skeleton className="w-full h-12" rounded="xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="w-full h-10" rounded="xl" />
            <Skeleton className="w-full h-10" rounded="xl" />
          </div>
          <Skeleton className="w-full h-32" rounded="2xl" />
        </div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-secondary-950 mb-2">Gagal Membuka Paket</h2>
        <p className="text-xs sm:text-sm text-secondary-600 mb-6">{error || "Data paket tidak tersedia."}</p>
        <Link
          href="/admin/trips"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-secondary-950 font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Paket</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PackageForm mode="edit" packageId={tripId} initialData={packageData} />
    </div>
  );
}
