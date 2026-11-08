"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Globe,
  Sparkles,
  HelpCircle,
  Package,
  DollarSign,
  Image as ImageIcon,
  Calendar,
  ShieldCheck,
  Tag,
  Check,
  X,
} from "lucide-react";
import ImageUpload from "@/app/component/ui/ImageUpload";
import MultiImageUpload from "@/app/component/ui/MultiImageUpload";
import { createSlug, formatCurrency } from "@/lib/utils";

export interface PackageFormProps {
  initialData?: any;
  mode: "create" | "edit";
  packageId?: string;
}

export interface ItineraryItem {
  id?: string;
  day: string;
  startTime?: string;
  endTime?: string;
  title: string;
  desc: string;
  location?: string;
  note?: string;
}

export interface FacilityItem {
  item: string;
  desc?: string;
}

export interface PackingItem {
  item: string;
  note?: string;
  category?: string;
}

export interface FaqItem {
  q: string;
  a: string;
  category?: string;
}

export interface AddonItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  pricingUnit?: string;
  isActive: boolean;
}

type TabKey =
  | "general"
  | "pricing"
  | "media"
  | "itinerary"
  | "facilities"
  | "highlights_packing"
  | "faqs_addons"
  | "seo";

const TABS: { id: TabKey; label: string; short: string; icon: any }[] = [
  { id: "general", label: "Informasi Umum", short: "Umum", icon: Package },
  { id: "pricing", label: "Harga & Jadwal", short: "Harga", icon: DollarSign },
  { id: "media", label: "Media & Foto", short: "Media", icon: ImageIcon },
  { id: "itinerary", label: "Rencana Perjalanan", short: "Itinerary", icon: Calendar },
  { id: "facilities", label: "Fasilitas (Inklusi)", short: "Fasilitas", icon: ShieldCheck },
  { id: "highlights_packing", label: "Perlengkapan", short: "Checklist", icon: Sparkles },
  { id: "faqs_addons", label: "FAQ & Add-on", short: "FAQ & Addon", icon: HelpCircle },
  { id: "seo", label: "SEO & Publikasi", short: "Publikasi", icon: Globe },
];

export default function PackageForm({ initialData, mode, packageId }: PackageFormProps) {
  const router = useRouter();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<TabKey>("general");

  // Form states - General
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [autoSlug, setAutoSlug] = useState(mode === "create");
  const [category, setCategory] = useState(initialData?.category || "midnight");
  const [packageType, setPackageType] = useState(initialData?.packageType || "Open Trip");
  const [duration, setDuration] = useState(initialData?.duration || "1 Hari (Midnight)");
  const [durationDays, setDurationDays] = useState<number>(initialData?.durationDays ?? 1);
  const [durationNights, setDurationNights] = useState<number>(initialData?.durationNights ?? 0);
  const [minParticipants, setMinParticipants] = useState<number>(initialData?.minParticipants ?? 1);
  const [maxParticipants, setMaxParticipants] = useState<number>(initialData?.maxParticipants ?? 15);
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "Sedang (Trekking 3 Km)");
  const [altitude, setAltitude] = useState(initialData?.altitude || "2.769 mdpl");
  const [meetingPoint, setMeetingPoint] = useState(initialData?.meetingPoint || "Banyuwangi (Hotel / Stasiun / Bandara)");
  const [pickupArea, setPickupArea] = useState(initialData?.pickupArea || "Banyuwangi City Area & Surrounds");
  const [departureTime, setDepartureTime] = useState(initialData?.departureTime || "00:00 - 00:30 WIB Dini Hari");
  const [recommendedAge, setRecommendedAge] = useState(initialData?.recommendedAge || "7 - 65 Tahun");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [safetyInfo, setSafetyInfo] = useState(initialData?.safetyInfo || "");
  const [importantNotes, setImportantNotes] = useState(initialData?.importantNotes || "");

  // Pricing
  const [basePrice, setBasePrice] = useState<number>(initialData?.basePrice ?? 750000);
  const [price, setPrice] = useState(initialData?.price || "Rp 750.000");
  const [currency, setCurrency] = useState(initialData?.currency || "IDR");
  const [pricingUnit, setPricingUnit] = useState(initialData?.pricingUnit || "per orang");
  const [discountPrice, setDiscountPrice] = useState<string>(
    initialData?.discountPrice !== null && initialData?.discountPrice !== undefined
      ? String(initialData.discountPrice)
      : ""
  );
  const [groupDiscountPercent, setGroupDiscountPercent] = useState<number>(
    initialData?.groupDiscountPercent ?? 10
  );
  const [priceNotes, setPriceNotes] = useState(initialData?.priceNotes || "");

  // Media
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || initialData?.image || "/images/pkg-bluefire.png");
  const [galleryImages, setGalleryImages] = useState<string[]>(() => {
    if (Array.isArray(initialData?.gallery)) return initialData.gallery;
    if (Array.isArray(initialData?.galleryImages)) {
      return initialData.galleryImages.map((g: any) => (typeof g === "string" ? g : g?.url || ""));
    }
    return ["/images/pkg-bluefire.png", "/images/the-best-view-of-kawah.webp", "/images/pkg-crater.png"];
  });

  // Itinerary
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(() => {
    const raw = initialData?.itinerary || initialData?.itineraries;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw;
    }
    return [
      {
        day: "00:00 WIB",
        startTime: "00:00",
        endTime: "01:30",
        title: "Penjemputan di Hotel / Stasiun",
        desc: "Driver kami akan menjemput Anda di hotel atau stasiun area Banyuwangi dengan armada nyaman ber-AC.",
        location: "Banyuwangi City Area",
        note: "Harap bersiap 15 menit sebelum waktu penjemputan.",
      },
      {
        day: "01:30 WIB",
        startTime: "01:30",
        endTime: "02:00",
        title: "Tiba di Basecamp Paltuding & Briefing",
        desc: "Briefing keselamatan dari guide lokal, pembagian masker respirator gas belerang dan senter kepala.",
        location: "Pos Paltuding",
        note: "Cek kelengkapan masker dan headlamp.",
      },
      {
        day: "02:00 WIB",
        startTime: "02:00",
        endTime: "03:45",
        title: "Mulai Pendakian Jalur Kawah Ijen",
        desc: "Trekking santai sejauh 3 km menuju bibir kawah di bawah keindahan langit malam bertabur bintang.",
        location: "Jalur Trekking Ijen",
        note: "Jalur awal menanjak, atur ritme langkah dengan santai.",
      },
      {
        day: "03:45 WIB",
        startTime: "03:45",
        endTime: "05:15",
        title: "Eksplorasi Fenomena Blue Fire",
        desc: "Turun ke dasar kawah didampingi guide untuk mengagumi nyala api biru yang langka dan magis.",
        location: "Dasar Kawah Ijen",
        note: "Gunakan masker respirator dengan benar saat mendekati area solfatara.",
      },
      {
        day: "05:15 WIB",
        startTime: "05:15",
        endTime: "07:00",
        title: "Golden Sunrise & Danau Kawah Toska",
        desc: "Menyaksikan matahari terbit yang menyinari danau asam terbesar di dunia.",
        location: "Bibir Kawah Ijen",
        note: "Spot foto terbaik bersama pemandu.",
      },
      {
        day: "07:00 WIB",
        startTime: "07:00",
        endTime: "08:30",
        title: "Kembali ke Basecamp & Refreshment",
        desc: "Perjalanan turun santai, rehat sejenak menikmati minuman hangat dan kudapan.",
        location: "Pos Paltuding",
      },
      {
        day: "08:30 WIB",
        startTime: "08:30",
        endTime: "10:00",
        title: "Transfer Kembali ke Penginapan / Stasiun",
        desc: "Perjalanan pulang menuju hotel atau titik drop-off yang telah disepakati.",
        location: "Banyuwangi",
        note: "Tour selesai dengan sejuta kenangan indah.",
      },
    ];
  });

  // Facilities (Inclusions & Exclusions)
  const [inclusions, setInclusions] = useState<FacilityItem[]>(() => {
    const raw = initialData?.included || initialData?.includedItems || initialData?.inclusions;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((item: any) =>
        typeof item === "string" ? { item } : { item: item.item || "", desc: item.desc || "" }
      );
    }
    return [
      { item: "Transportasi AC PP dari Hotel/Stasiun Banyuwangi" },
      { item: "Tiket Masuk Resmi BKSDA / Kawah Ijen & Asuransi Pengunjung" },
      { item: "Pemandu Lokal Berlisensi (Former Sulfur Miner)" },
      { item: "Masker Gas Respirator Medis Standar Belerang" },
      { item: "Headlamp / Senter Kepala Penerangan" },
      { item: "Air Mineral & Snack Hangat" },
      { item: "P3K Dasar Standar Gunung" },
    ];
  });

  const [exclusions, setExclusions] = useState<FacilityItem[]>(() => {
    const raw = initialData?.excluded || initialData?.excludedItems || initialData?.exclusions;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((item: any) =>
        typeof item === "string" ? { item } : { item: item.item || "", desc: item.desc || "" }
      );
    }
    return [
      { item: "Pengeluaran Pribadi di Luar Paket" },
      { item: "Taksi Troly Dorong Kawah (Opsional jika lelah)" },
      { item: "Makan Berat Tambahan" },
      { item: "Tip Sukarela untuk Guide / Driver" },
    ];
  });

  // Highlights
  const [highlights, setHighlights] = useState<string[]>(() => {
    if (Array.isArray(initialData?.highlights) && initialData.highlights.length > 0) {
      return initialData.highlights;
    }
    return [
      "Berangkat Jam 00:00 Dini Hari dari Banyuwangi",
      "Guide Penambang Belerang Lokal Berlisensi",
      "Masker Respirator Standar Keamanan & Senter Kepala",
      "Spot Foto Sunrise & Danau Asam Terbesar di Dunia",
      "Antar-Jemput Privat Armada Ber-AC",
    ];
  });

  // Packing List
  const [packingList, setPackingList] = useState<PackingItem[]>(() => {
    if (Array.isArray(initialData?.packingList) && initialData.packingList.length > 0) {
      return initialData.packingList;
    }
    return [
      { item: "Jaket Tebal / Windbreaker", note: "Suhu puncak dini hari bisa mencapai 6°C - 10°C", category: "Pakaian" },
      { item: "Sepatu Trekking / Sneakers Anti-Slip", note: "Jalur berpasir dan menanjak", category: "Alas Kaki" },
      { item: "Celana Panjang & Kaos Kaki Tebal", note: "Melindungi dari hawa dingin dan debu", category: "Pakaian" },
      { item: "Kamera / Smartphone & Powerbank", note: "Untuk mengabadikan momen Blue Fire & Sunrise", category: "Elektronik" },
      { item: "Uang Tunai Secukupnya", note: "Untuk cinderamata belerang atau minuman hangat di pos", category: "Dokumen & Uang" },
      { item: "Obat-obatan Pribadi", note: "Khusus bagi yang memiliki riwayat asma atau alergi dingin", category: "Kesehatan" },
    ];
  });

  // FAQs
  const [faqs, setFaqs] = useState<FaqItem[]>(() => {
    if (Array.isArray(initialData?.faqs) && initialData.faqs.length > 0) {
      return initialData.faqs;
    }
    return [
      {
        q: "Apakah pemula atau anak-anak bisa mengikuti tour ini?",
        a: "Sangat bisa! Jalur pendakian cukup lebar dan jelas. Jika merasa lelah, tersedia jasa troli dorong lokal (trolley taxi) yang siap mengantar sampai ke puncak.",
      },
      {
        q: "Kapan waktu terbaik melihat Blue Fire?",
        a: "Waktu terbaik adalah antara pukul 03:00 hingga 04:30 WIB saat langit masih gelap pekat. Kami mengatur jadwal agar Anda tiba tepat waktu di spot terbaik.",
      },
      {
        q: "Apakah bau gas belerang berbahaya?",
        a: "Kami menyediakan masker respirator khusus berfilter aktif yang aman menyaring asap belerang. Guide kami juga selalu memantau arah angin demi keamanan Anda.",
      },
      {
        q: "Bagaimana sistem pembayaran dan pembatalan?",
        a: "Pemesanan dikonfirmasi dengan deposit fleksibel melalui transfer bank / QRIS. Reschedule gratis dapat dilakukan hingga 48 jam sebelum jadwal keberangkatan.",
      },
    ];
  });

  // Addons
  const [addons, setAddons] = useState<AddonItem[]>(() => {
    if (Array.isArray(initialData?.addons) && initialData.addons.length > 0) {
      return initialData.addons;
    }
    return [
      {
        id: "trolley",
        name: "Kawah Ijen Trolley Taxi (PP)",
        description: "Layanan becak dorong tradisional oleh penambang lokal untuk tamu yang ingin menghemat tenaga fisik",
        price: 800000,
        currency: "IDR",
        pricingUnit: "per troli",
        isActive: true,
      },
      {
        id: "drone",
        name: "Dokumentasi Drone & Kamera 4K",
        description: "Video sinematik highlight + puluhan foto resolusi tinggi berlatar Blue Fire & Sunrise",
        price: 650000,
        currency: "IDR",
        pricingUnit: "per grup",
        isActive: true,
      },
      {
        id: "pickup",
        name: "Antar-Jemput Bandara Juanda Surabaya / Malang",
        description: "Private car transfer via tol antar kota langsung ke hotel Banyuwangi",
        price: 600000,
        currency: "IDR",
        pricingUnit: "per mobil",
        isActive: true,
      },
    ];
  });

  // SEO & Status
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");
  const [ogImage, setOgImage] = useState(initialData?.ogImage || "");
  const [isActive, setIsActive] = useState<boolean>(initialData?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured ?? true);
  const [isTrending, setIsTrending] = useState<boolean>(initialData?.isTrending ?? true);
  const [isRecent, setIsRecent] = useState<boolean>(initialData?.isRecent ?? true);
  const [sortOrder, setSortOrder] = useState<number>(initialData?.sortOrder ?? 0);
  const [badge, setBadge] = useState(initialData?.badge || "Best Seller");

  // Feedback states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoSlug) {
      setSlug(createSlug(val));
    }
  };

  const handleBasePriceChange = (val: number) => {
    setBasePrice(val);
    setPrice(formatCurrency(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Nama paket wisata wajib diisi.");
      setActiveTab("general");
      return;
    }
    if (!description.trim()) {
      setError("Deskripsi paket wajib diisi.");
      setActiveTab("general");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || createSlug(title),
        category,
        packageType,
        duration: duration.trim(),
        durationDays: Number(durationDays) || 1,
        durationNights: Number(durationNights) || 0,
        minParticipants: Number(minParticipants) || 1,
        maxParticipants: Number(maxParticipants) || 15,
        difficulty,
        altitude,
        meetingPoint,
        pickupArea,
        departureTime,
        recommendedAge,
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        safetyInfo: safetyInfo.trim(),
        importantNotes: importantNotes.trim(),
        basePrice: Number(basePrice) || 0,
        price: price.trim() || formatCurrency(basePrice),
        currency,
        pricingUnit,
        discountPrice: discountPrice ? Number(discountPrice) : null,
        groupDiscountPercent: Number(groupDiscountPercent) || 0,
        priceNotes: priceNotes.trim(),
        coverImage,
        galleryImages,
        itinerary,
        inclusions: inclusions.map((i) => i.item).filter(Boolean),
        exclusions: exclusions.map((e) => e.item).filter(Boolean),
        highlights: highlights.filter((h) => h.trim() !== ""),
        packingList,
        faqs,
        addons,
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
        ogImage: ogImage.trim() || coverImage,
        isActive,
        isFeatured,
        isTrending,
        isRecent,
        sortOrder: Number(sortOrder) || 0,
        badge,
      };

      const url = mode === "create" ? "/api/trips" : `/api/trips/${packageId || initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan paket wisata.");
      }

      setSuccessMessage(mode === "create" ? "Paket wisata berhasil dibuat!" : "Perubahan paket berhasil disimpan!");
      setTimeout(() => {
        router.push("/admin/trips");
        router.refresh();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat menyimpan paket.");
    } finally {
      setSubmitting(false);
    }
  };

  // Itinerary helpers
  const addItineraryItem = () => {
    const nextIdx = itinerary.length + 1;
    setItinerary([
      ...itinerary,
      {
        day: `Hari ${nextIdx}`,
        startTime: "08:00",
        endTime: "10:00",
        title: "Aktivitas Perjalanan Baru",
        desc: "Deskripsi kegiatan perjalanan dan hal menarik yang akan disaksikan wisatawan.",
        location: "Kawah Ijen / Banyuwangi",
      },
    ]);
  };

  const updateItineraryItem = (index: number, field: keyof ItineraryItem, val: string) => {
    const updated = [...itinerary];
    updated[index] = { ...updated[index], [field]: val };
    setItinerary(updated);
  };

  const removeItineraryItem = (index: number) => {
    setItinerary(itinerary.filter((_, i) => i !== index));
  };

  const moveItineraryItem = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === itinerary.length - 1)) return;
    const target = direction === "up" ? index - 1 : index + 1;
    const updated = [...itinerary];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setItinerary(updated);
  };

  // Inclusions helpers
  const addInclusion = () => {
    setInclusions([...inclusions, { item: "" }]);
  };
  const updateInclusion = (index: number, text: string) => {
    const updated = [...inclusions];
    updated[index].item = text;
    setInclusions(updated);
  };
  const removeInclusion = (index: number) => {
    setInclusions(inclusions.filter((_, i) => i !== index));
  };

  // Exclusions helpers
  const addExclusion = () => {
    setExclusions([...exclusions, { item: "" }]);
  };
  const updateExclusion = (index: number, text: string) => {
    const updated = [...exclusions];
    updated[index].item = text;
    setExclusions(updated);
  };
  const removeExclusion = (index: number) => {
    setExclusions(exclusions.filter((_, i) => i !== index));
  };

  // Highlights helpers
  const addHighlight = () => {
    setHighlights([...highlights, ""]);
  };
  const updateHighlight = (index: number, text: string) => {
    const updated = [...highlights];
    updated[index] = text;
    setHighlights(updated);
  };
  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  // Packing list helpers
  const addPackingItem = () => {
    setPackingList([...packingList, { item: "", note: "", category: "Peralatan" }]);
  };
  const updatePackingItem = (index: number, field: keyof PackingItem, val: string) => {
    const updated = [...packingList];
    updated[index] = { ...updated[index], [field]: val };
    setPackingList(updated);
  };
  const removePackingItem = (index: number) => {
    setPackingList(packingList.filter((_, i) => i !== index));
  };

  // FAQ helpers
  const addFaq = () => {
    setFaqs([...faqs, { q: "", a: "" }]);
  };
  const updateFaq = (index: number, field: "q" | "a", val: string) => {
    const updated = [...faqs];
    updated[index][field] = val;
    setFaqs(updated);
  };
  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  // Addon helpers
  const addAddon = () => {
    const id = `addon-${Date.now().toString(36)}`;
    setAddons([
      ...addons,
      {
        id,
        name: "Layanan Ekstra Tambahan",
        description: "Deskripsi fasilitas ekstra atau kenyamanan perjalanan",
        price: 150000,
        currency: "IDR",
        pricingUnit: "per orang",
        isActive: true,
      },
    ]);
  };
  const updateAddon = (index: number, field: keyof AddonItem, val: any) => {
    const updated = [...addons];
    updated[index] = { ...updated[index], [field]: val };
    setAddons(updated);
  };
  const removeAddon = (index: number) => {
    setAddons(addons.filter((_, i) => i !== index));
  };

  // Current tab index for previous / next navigation
  const currentTabIndex = TABS.findIndex((t) => t.id === activeTab);
  const prevTab = currentTabIndex > 0 ? TABS[currentTabIndex - 1] : null;
  const nextTab = currentTabIndex < TABS.length - 1 ? TABS[currentTabIndex + 1] : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-16">
      {/* PAGE HEADER: Actions & Title (In Normal Document Flow) */}
      <div className="pb-5 border-b border-secondary-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/trips"
            className="w-10 h-10 rounded-xl border border-secondary-200 hover:bg-secondary-100 text-secondary-600 transition inline-flex items-center justify-center shrink-0"
            title="Kembali ke Daftar Paket"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black text-secondary-950 truncate">
              {mode === "create" ? "Tambah Paket Wisata Baru" : `Sunting Paket: ${title || "Tour Package"}`}
            </h1>
            <div className="flex items-center gap-2 text-xs text-secondary-500 font-mono truncate mt-0.5">
              <span>Slug: /packages/{slug || "url-paket"}</span>
              <span>•</span>
              <span className={`font-bold ${isActive ? "text-emerald-600" : "text-amber-600"}`}>
                {isActive ? "● Published" : "○ Draft Mode"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
          {/* Quick Publish / Draft Toggle */}
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition inline-flex items-center justify-center gap-1.5 cursor-pointer ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
            }`}
            title="Klik untuk mengubah status Draft / Published"
          >
            <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-amber-500"}`} />
            <span className="hidden sm:inline">{isActive ? "Status: Publik" : "Status: Draft"}</span>
            <span className="sm:hidden">{isActive ? "Publik" : "Draft"}</span>
          </button>

          {/* Cancel button */}
          <Link
            href="/admin/trips"
            className="px-3.5 py-2 rounded-xl border border-secondary-200 hover:bg-secondary-100 text-secondary-700 font-bold text-xs transition inline-flex items-center justify-center"
          >
            Batal
          </Link>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-xs transition shadow-sm inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>{submitting ? "Menyimpan..." : mode === "create" ? "Buat Paket" : "Simpan Perubahan"}</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK ALERTS */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span className="font-semibold leading-relaxed">{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-bold leading-relaxed">{successMessage}</span>
        </div>
      )}

      {/* TAB NAVIGATION HEADER (RESPONSIVE HORIZONTAL SCROLL) */}
      <div className="border-b border-secondary-200/80 w-full overflow-x-auto no-scrollbar">
        <div className="flex gap-1 sm:gap-2 pb-px min-w-max">
          {TABS.map((tab) => {
            const isCurrent = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2.5 text-xs font-bold transition-all border-b-2 rounded-t-xl cursor-pointer inline-flex items-center gap-2 shrink-0 ${
                  isCurrent
                    ? "border-primary-500 text-secondary-950 bg-white font-extrabold shadow-2xs"
                    : "border-transparent text-secondary-600 hover:text-secondary-950 hover:bg-secondary-100/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? "text-primary-600" : "text-secondary-400"}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: GENERAL INFORMATION */}
      {activeTab === "general" && (
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-secondary-200/80 shadow-xs space-y-6">
          <div className="border-b border-secondary-100 pb-4">
            <h3 className="text-lg font-black text-secondary-950">1. Informasi & Spesifikasi Paket</h3>
            <p className="text-xs text-secondary-500 mt-0.5">
              Atur nama wisata, tautan slug unik, deskripsi naratif, serta parameter perjalanan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Package Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Nama / Judul Paket Wisata *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Contoh: Midnight Expedition Blue Fire Ijen"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs sm:text-sm font-bold text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            {/* Slug URL */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider">
                  Slug URL Unik (Tautan Detail Paket) *
                </label>
                <button
                  type="button"
                  onClick={() => setAutoSlug(!autoSlug)}
                  className="text-[11px] font-bold text-primary-700 hover:underline cursor-pointer"
                >
                  {autoSlug ? "✓ Auto-generate aktif" : "Kustom manual"}
                </button>
              </div>
              <div className="flex items-center rounded-xl bg-secondary-50 border border-secondary-200 px-3 py-2 text-xs">
                <span className="text-secondary-500 font-mono select-none">/packages/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  disabled={autoSlug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                  placeholder="midnight-expedition-blue-fire"
                  className="w-full bg-transparent font-mono text-secondary-950 focus:outline-none px-1"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Kategori Utama *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              >
                <option value="midnight">Midnight Expedition (Dini Hari)</option>
                <option value="regular">Regular Tour (Tur Reguler Santai)</option>
                <option value="private">Private Exclusive Tour (Privat)</option>
              </select>
            </div>

            {/* Package Type */}
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Tipe Paket Tour</label>
              <select
                value={packageType}
                onChange={(e) => setPackageType(e.target.value)}
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              >
                <option value="Open Trip">Open Trip (Gabungan)</option>
                <option value="Private Tour">Private Tour (Eksklusif)</option>
                <option value="Midnight Expedition">Midnight Expedition</option>
                <option value="Family / Group">Family / Corporate Group</option>
              </select>
            </div>

            {/* Duration Display String */}
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Durasi Tampilan *</label>
              <input
                type="text"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="1 Hari (Midnight) atau 2H1M"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            {/* Duration Days & Nights */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Hari (Days)</label>
                <input
                  type="number"
                  min={1}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Malam (Nights)</label>
                <input
                  type="number"
                  min={0}
                  value={durationNights}
                  onChange={(e) => setDurationNights(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Min & Max Participants */}
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Min Peserta</label>
              <input
                type="number"
                min={1}
                value={minParticipants}
                onChange={(e) => setMinParticipants(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Max Peserta</label>
              <input
                type="number"
                min={1}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            {/* Difficulty & Altitude */}
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Tingkat Kesulitan Trekking</label>
              <input
                type="text"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                placeholder="Sedang (Trekking 3 Km / 2 Jam)"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Ketinggian Puncak (Altitude)</label>
              <input
                type="text"
                value={altitude}
                onChange={(e) => setAltitude(e.target.value)}
                placeholder="2.769 mdpl"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            {/* Meeting Point & Departure Time */}
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Titik Kumpul (Meeting Point)</label>
              <input
                type="text"
                value={meetingPoint}
                onChange={(e) => setMeetingPoint(e.target.value)}
                placeholder="Banyuwangi (Hotel / Stasiun / Bandara)"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Area Penjemputan (Pickup Area)</label>
              <input
                type="text"
                value={pickupArea}
                onChange={(e) => setPickupArea(e.target.value)}
                placeholder="Banyuwangi City Area & Surrounds"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Waktu Keberangkatan (Departure)</label>
              <input
                type="text"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                placeholder="00:00 - 00:30 WIB Dini Hari"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Usia yang Direkomendasikan</label>
              <input
                type="text"
                value={recommendedAge}
                onChange={(e) => setRecommendedAge(e.target.value)}
                placeholder="7 - 65 Tahun"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            {/* Short Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Ringkasan Singkat (Short Summary)
              </label>
              <textarea
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Ringkasan 1-2 kalimat pemikat untuk kartu paket di halaman beranda..."
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs sm:text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            {/* Full Narrative Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Deskripsi Lengkap Tur (Full Overview) *
              </label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tuliskan pengalaman menyeluruh yang akan dirasakan wisatawan..."
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs sm:text-sm text-secondary-950 leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            {/* Safety & Important Notes */}
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Informasi Keselamatan (Safety Info)
              </label>
              <textarea
                rows={3}
                value={safetyInfo}
                onChange={(e) => setSafetyInfo(e.target.value)}
                placeholder="Peringatan gas belerang, batasan peserta dengan riwayat asma/jantung..."
                className="w-full px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Catatan Penting (Important Notes)
              </label>
              <textarea
                rows={3}
                value={importantNotes}
                onChange={(e) => setImportantNotes(e.target.value)}
                placeholder="Syarat surat keterangan sehat, jam buka loket BKSDA..."
                className="w-full px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRICING & AVAILABILITY */}
      {activeTab === "pricing" && (
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-secondary-200/80 shadow-xs space-y-6">
          <div className="border-b border-secondary-100 pb-4">
            <h3 className="text-lg font-black text-secondary-950">2. Struktur Harga & Skema Diskon</h3>
            <p className="text-xs text-secondary-500 mt-0.5">
              Atur harga dasar untuk kalkulasi reservasi, mata uang, potongan harga, dan ketentuan biaya tambahan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Base Price Numeric */}
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Harga Dasar Numerik (Base Price) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-secondary-400">Rp</span>
                <input
                  type="number"
                  required
                  min={0}
                  step={5000}
                  value={basePrice}
                  onChange={(e) => handleBasePriceChange(Number(e.target.value))}
                  placeholder="750000"
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs font-bold text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
                />
              </div>
              <span className="text-[10px] text-secondary-500 mt-1 block">
                Digunakan untuk kalkulator booking otomatis di halaman publik.
              </span>
            </div>

            {/* Price Display String */}
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Teks Display Harga (Label Publik) *
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Rp 750.000"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs font-bold text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            {/* Currency & Unit */}
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Mata Uang (Currency)</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="IDR"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Satuan Penetapan Harga</label>
              <select
                value={pricingUnit}
                onChange={(e) => setPricingUnit(e.target.value)}
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              >
                <option value="per orang">per orang (Per Person)</option>
                <option value="per grup">per grup (Per Group)</option>
                <option value="per booking">per reservasi (Per Booking)</option>
                <option value="per mobil">per mobil (Private Vehicle)</option>
              </select>
            </div>

            {/* Discount Price */}
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Harga Promo / Coret (Opsional)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-secondary-400">Rp</span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="Kosongkan jika tidak ada promo"
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Group Discount Percent */}
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Diskon Rombongan (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={groupDiscountPercent}
                onChange={(e) => setGroupDiscountPercent(Number(e.target.value))}
                placeholder="10"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            {/* Price Notes */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Catatan Ketentuan Harga (Price Notes)
              </label>
              <textarea
                rows={3}
                value={priceNotes}
                onChange={(e) => setPriceNotes(e.target.value)}
                placeholder="Contoh: Harga sudah termasuk tiket masuk wisatawan domestik. Tambahan biaya tiket WNA berlaku sesuai regulasi BKSDA..."
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MEDIA & GALLERY */}
      {activeTab === "media" && (
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-secondary-200/80 shadow-xs space-y-6">
          <div className="border-b border-secondary-100 pb-4">
            <h3 className="text-lg font-black text-secondary-950">3. Foto Cover & Galeri Wisata</h3>
            <p className="text-xs text-secondary-500 mt-0.5">
              Unggah cover beresolusi tinggi dan beberapa foto galeri pendukung (terhubung langsung ke Supabase Storage).
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-secondary-950 uppercase tracking-wider mb-2">
                Foto Sampul Utama (Cover Image) *
              </label>
              <ImageUpload
                value={coverImage}
                onChange={(url) => setCoverImage(url)}
                folder="trips"
                label="Unggah Cover Utama"
                aspectRatio="video"
                required
                helperText="Format JPG, PNG, atau WebP resolusi tinggi (Maks. 5 MB)."
              />
            </div>

            <div className="pt-4 border-t border-secondary-100">
              <label className="block text-xs font-black text-secondary-950 uppercase tracking-wider mb-2">
                Galeri Foto Pendukung (Multi-Image Gallery)
              </label>
              <MultiImageUpload
                value={galleryImages}
                onChange={(urls) => setGalleryImages(urls)}
                folder="trips"
                maxFiles={8}
                label="Unggah Foto Galeri"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ITINERARY */}
      {activeTab === "itinerary" && (
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-secondary-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-secondary-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-secondary-950">4. Rencana Perjalanan (Itinerary)</h3>
              <p className="text-xs text-secondary-500 mt-0.5">
                Kelola urutan aktivitas perjalanan, waktu, nama agenda, deskripsi, lokasi, dan catatan operasional.
              </p>
            </div>
            <button
              type="button"
              onClick={addItineraryItem}
              className="px-4 py-2 rounded-xl bg-secondary-950 hover:bg-secondary-900 text-white font-bold text-xs transition inline-flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Tambah Aktivitas</span>
            </button>
          </div>

          {itinerary.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-secondary-200 rounded-3xl p-6">
              <p className="text-xs font-bold text-secondary-500 mb-3">Belum ada item itinerary untuk paket ini.</p>
              <button
                type="button"
                onClick={addItineraryItem}
                className="px-4 py-2 rounded-xl bg-primary-500 text-secondary-950 font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Tambah Aktivitas Pertama</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {itinerary.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl border border-secondary-200 bg-secondary-50/50 space-y-3 relative transition hover:border-primary-400"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-secondary-200/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary-500 text-secondary-950 font-black text-xs inline-flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-black text-secondary-950">Aktivitas #{idx + 1}</span>
                    </div>

                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveItineraryItem(idx, "up")}
                        disabled={idx === 0}
                        className="w-8 h-8 rounded-xl border border-secondary-200 hover:bg-white text-secondary-600 disabled:opacity-30 inline-flex items-center justify-center transition shrink-0 cursor-pointer"
                        title="Geser ke Atas"
                      >
                        <ChevronUp className="w-4 h-4 shrink-0" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItineraryItem(idx, "down")}
                        disabled={idx === itinerary.length - 1}
                        className="w-8 h-8 rounded-xl border border-secondary-200 hover:bg-white text-secondary-600 disabled:opacity-30 inline-flex items-center justify-center transition shrink-0 cursor-pointer"
                        title="Geser ke Bawah"
                      >
                        <ChevronDown className="w-4 h-4 shrink-0" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItineraryItem(idx)}
                        className="w-8 h-8 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 inline-flex items-center justify-center transition shrink-0 cursor-pointer ml-1"
                        title="Hapus Aktivitas Ini"
                      >
                        <Trash2 className="w-4 h-4 shrink-0" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Day / Time Label */}
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-bold text-secondary-700 uppercase tracking-wider mb-1">
                        Label Waktu / Hari (e.g. 00:00 WIB / Hari 1)
                      </label>
                      <input
                        type="text"
                        value={item.day}
                        onChange={(e) => updateItineraryItem(idx, "day", e.target.value)}
                        placeholder="00:00 WIB atau Hari 1"
                        className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-xl text-xs text-secondary-950 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    {/* Activity Title */}
                    <div className="sm:col-span-8">
                      <label className="block text-[11px] font-bold text-secondary-700 uppercase tracking-wider mb-1">Judul Aktivitas *</label>
                      <input
                        type="text"
                        required
                        value={item.title}
                        onChange={(e) => updateItineraryItem(idx, "title", e.target.value)}
                        placeholder="Contoh: Fenomena Blue Fire Elektrik"
                        className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-xl text-xs text-secondary-950 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-12">
                      <label className="block text-[11px] font-bold text-secondary-700 uppercase tracking-wider mb-1">Deskripsi Kegiatan</label>
                      <textarea
                        rows={2}
                        value={item.desc}
                        onChange={(e) => updateItineraryItem(idx, "desc", e.target.value)}
                        placeholder="Jelaskan detail aktivitas yang dilakukan wisatawan..."
                        className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    {/* Location & Note */}
                    <div className="sm:col-span-6">
                      <label className="block text-[11px] font-bold text-secondary-700 uppercase tracking-wider mb-1">Lokasi (Opsional)</label>
                      <input
                        type="text"
                        value={item.location || ""}
                        onChange={(e) => updateItineraryItem(idx, "location", e.target.value)}
                        placeholder="Dasar Kawah Ijen / Basecamp Paltuding"
                        className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label className="block text-[11px] font-bold text-secondary-700 uppercase tracking-wider mb-1">Catatan Khusus (Opsional)</label>
                      <input
                        type="text"
                        value={item.note || ""}
                        onChange={(e) => updateItineraryItem(idx, "note", e.target.value)}
                        placeholder="Gunakan masker gas & senter kepala"
                        className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: INCLUSIONS & EXCLUSIONS */}
      {activeTab === "facilities" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inclusions Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-emerald-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-black inline-flex items-center justify-center text-xs shrink-0">
                  ✓
                </span>
                <div>
                  <h4 className="text-base font-black text-secondary-950">Termasuk (Inclusions)</h4>
                  <p className="text-[11px] text-emerald-700 font-medium">Fasilitas yang disediakan oleh pengelola</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addInclusion}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition inline-flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Tambah</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {inclusions.map((inc, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold text-xs shrink-0">✓</span>
                  <input
                    type="text"
                    value={inc.item}
                    onChange={(e) => updateInclusion(i, e.target.value)}
                    placeholder="Contoh: Masker Gas Respirator Medis"
                    className="w-full px-3.5 py-2 bg-emerald-50/40 border border-emerald-200 rounded-xl text-xs font-semibold text-secondary-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeInclusion(i)}
                    className="w-8 h-8 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 inline-flex items-center justify-center transition shrink-0 cursor-pointer"
                    title="Hapus Item"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Exclusions Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-rose-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 font-black inline-flex items-center justify-center text-xs shrink-0">
                  ✕
                </span>
                <div>
                  <h4 className="text-base font-black text-secondary-950">Tidak Termasuk (Exclusions)</h4>
                  <p className="text-[11px] text-rose-700 font-medium">Biaya opsional di luar tanggungan paket</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addExclusion}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition inline-flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Tambah</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {exclusions.map((exc, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-rose-500 font-bold text-xs shrink-0">✕</span>
                  <input
                    type="text"
                    value={exc.item}
                    onChange={(e) => updateExclusion(i, e.target.value)}
                    placeholder="Contoh: Taksi Troli Dorong Kawah"
                    className="w-full px-3.5 py-2 bg-rose-50/40 border border-rose-200 rounded-xl text-xs font-semibold text-secondary-950 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeExclusion(i)}
                    className="w-8 h-8 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 inline-flex items-center justify-center transition shrink-0 cursor-pointer"
                    title="Hapus Item"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: HIGHLIGHTS & PACKING LIST */}
      {activeTab === "highlights_packing" && (
        <div className="space-y-6">
          {/* Highlights Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-secondary-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-secondary-100 pb-3">
              <div>
                <h4 className="text-base font-black text-secondary-950">Keunggulan Utama (Package Highlights)</h4>
                <p className="text-xs text-secondary-500">Poin jual utama yang tampil mencolok di halaman detail paket</p>
              </div>
              <button
                type="button"
                onClick={addHighlight}
                className="px-3.5 py-1.5 rounded-xl bg-secondary-950 text-white text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Tambah Poin</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {highlights.map((h, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-secondary-50 p-2.5 rounded-2xl border border-secondary-200">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-800 font-bold text-xs inline-flex items-center justify-center shrink-0">
                    ★
                  </span>
                  <input
                    type="text"
                    value={h}
                    onChange={(e) => updateHighlight(idx, e.target.value)}
                    placeholder="Contoh: Spot Foto Sunrise & Danau Asam Terbesar"
                    className="w-full bg-transparent text-xs font-bold text-secondary-950 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeHighlight(idx)}
                    className="w-8 h-8 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 inline-flex items-center justify-center transition shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Packing List Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-secondary-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-secondary-100 pb-3">
              <div>
                <h4 className="text-base font-black text-secondary-950">Daftar Barang Bawaan (Packing List)</h4>
                <p className="text-xs text-secondary-500">Panduan perlengkapan yang disarankan untuk dibawa wisatawan</p>
              </div>
              <button
                type="button"
                onClick={addPackingItem}
                className="px-3.5 py-1.5 rounded-xl bg-secondary-950 text-white text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Tambah Barang</span>
              </button>
            </div>

            <div className="space-y-3">
              {packingList.map((p, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-secondary-50 rounded-2xl border border-secondary-200 items-center">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={p.item}
                      onChange={(e) => updatePackingItem(idx, "item", e.target.value)}
                      placeholder="Nama Barang (e.g. Jaket Hangat)"
                      className="w-full px-3 py-1.5 bg-white border border-secondary-200 rounded-xl text-xs font-bold text-secondary-950"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={p.category || ""}
                      onChange={(e) => updatePackingItem(idx, "category", e.target.value)}
                      placeholder="Kategori (Pakaian / Alas Kaki)"
                      className="w-full px-3 py-1.5 bg-white border border-secondary-200 rounded-xl text-xs text-secondary-950"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={p.note || ""}
                      onChange={(e) => updatePackingItem(idx, "note", e.target.value)}
                      placeholder="Catatan suhu atau spesifikasi"
                      className="w-full px-3 py-1.5 bg-white border border-secondary-200 rounded-xl text-xs text-secondary-600"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removePackingItem(idx)}
                      className="w-8 h-8 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 inline-flex items-center justify-center transition shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: FAQS & ADD-ONS */}
      {activeTab === "faqs_addons" && (
        <div className="space-y-6">
          {/* Add-ons Section */}
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-secondary-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-secondary-100 pb-3">
              <div>
                <h4 className="text-base font-black text-secondary-950">Layanan Tambahan (Tour Add-ons)</h4>
                <p className="text-xs text-secondary-500">
                  Layanan opsional berbayar yang dapat dipilih tamu saat checkout (Taksi Troli, Dokumentasi Drone, dll)
                </p>
              </div>
              <button
                type="button"
                onClick={addAddon}
                className="px-4 py-2 rounded-xl bg-secondary-950 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Tambah Add-on Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addons.map((ad, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-secondary-50 border border-secondary-200 space-y-3 relative">
                  <div className="flex items-center justify-between border-b border-secondary-200/80 pb-2">
                    <span className="text-xs font-black text-secondary-950">Opsi Add-on #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeAddon(idx)}
                      className="w-8 h-8 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 inline-flex items-center justify-center transition shrink-0 cursor-pointer"
                      title="Hapus Add-on"
                    >
                      <Trash2 className="w-4 h-4 shrink-0" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold text-secondary-700 uppercase tracking-wider mb-1">Nama Layanan *</label>
                      <input
                        type="text"
                        value={ad.name}
                        onChange={(e) => updateAddon(idx, "name", e.target.value)}
                        placeholder="Contoh: Taksi Troli Kawah Ijen PP"
                        className="w-full px-3 py-1.5 bg-white border border-secondary-200 rounded-xl text-xs font-bold text-secondary-950"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-secondary-700 uppercase tracking-wider mb-1">Harga Tambahan (IDR)</label>
                        <input
                          type="number"
                          min={0}
                          step={10000}
                          value={ad.price}
                          onChange={(e) => updateAddon(idx, "price", Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-white border border-secondary-200 rounded-xl text-xs font-bold text-secondary-950"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-secondary-700 uppercase tracking-wider mb-1">Satuan Harga</label>
                        <input
                          type="text"
                          value={ad.pricingUnit || "per orang"}
                          onChange={(e) => updateAddon(idx, "pricingUnit", e.target.value)}
                          placeholder="per orang / per troli"
                          className="w-full px-3 py-1.5 bg-white border border-secondary-200 rounded-xl text-xs text-secondary-950"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-secondary-700 uppercase tracking-wider mb-1">Deskripsi Fasilitas</label>
                      <textarea
                        rows={2}
                        value={ad.description || ""}
                        onChange={(e) => updateAddon(idx, "description", e.target.value)}
                        placeholder="Uraikan detail fasilitas ekstra ini..."
                        className="w-full px-3 py-1.5 bg-white border border-secondary-200 rounded-xl text-xs text-secondary-950"
                      />
                    </div>

                    <div className="pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ad.isActive}
                          onChange={(e) => updateAddon(idx, "isActive", e.target.checked)}
                          className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-xs font-bold text-secondary-800">Status Aktif (Tampil di Booking)</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs Section */}
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-secondary-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-secondary-100 pb-3">
              <div>
                <h4 className="text-base font-black text-secondary-950">Pertanyaan Umum Khusus Paket (FAQ)</h4>
                <p className="text-xs text-secondary-500">
                  Pertanyaan yang sering ditanyakan tamu seputar medan, masker gas, atau durasi tur ini
                </p>
              </div>
              <button
                type="button"
                onClick={addFaq}
                className="px-4 py-2 rounded-xl bg-secondary-950 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Tambah FAQ</span>
              </button>
            </div>

            <div className="space-y-4">
              {faqs.map((f, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-secondary-50 border border-secondary-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-secondary-950">Pertanyaan #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeFaq(idx)}
                      className="w-8 h-8 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 inline-flex items-center justify-center transition shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={f.q}
                      onChange={(e) => updateFaq(idx, "q", e.target.value)}
                      placeholder="Pertanyaan (e.g. Apakah anak-anak aman mendaki?)"
                      className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-xl text-xs font-bold text-secondary-950"
                    />
                  </div>
                  <div>
                    <textarea
                      rows={2}
                      value={f.a}
                      onChange={(e) => updateFaq(idx, "a", e.target.value)}
                      placeholder="Jawaban informatif dan ramah..."
                      className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-xl text-xs text-secondary-950"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: SEO & PUBLISHING */}
      {activeTab === "seo" && (
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-secondary-200/80 shadow-xs space-y-6">
          <div className="border-b border-secondary-100 pb-4">
            <h3 className="text-lg font-black text-secondary-950">8. Optimasi Mesin Pencari (SEO) & Publikasi</h3>
            <p className="text-xs text-secondary-500 mt-0.5">
              Atur meta title, meta description untuk snippet Google, serta status visibilitas paket.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Meta Title (Judul Tab & Google)
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Midnight Expedition Blue Fire Ijen - Tour Resmi Banyuwangi"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-[10px] text-secondary-500 mt-1 block">
                Disarankan antara 50 - 60 karakter agar tidak terpotong di Google.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Badge Promosi (Stiker Tag)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Best Seller / Paling Populer / Midnight"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Meta Description (Deskripsi Cuplikan Google)
              </label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Deskripsi rangkuman 150-160 karakter untuk Google search snippet..."
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Urutan Tampil (Sort Order)
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Open Graph Image URL (Opsional)
              </label>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder="URL gambar untuk share media sosial (otomatis pakai cover jika kosong)"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Status Toggles */}
            <div className="md:col-span-2 pt-4 border-t border-secondary-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-secondary-200 bg-secondary-50 cursor-pointer hover:bg-primary-50/30 transition">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <span className="text-xs font-bold text-secondary-950 block">Publikasikan Paket</span>
                  <span className="text-[10px] text-secondary-500">Tampil di halaman publik</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-secondary-200 bg-secondary-50 cursor-pointer hover:bg-primary-50/30 transition">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <span className="text-xs font-bold text-secondary-950 block">Featured Package</span>
                  <span className="text-[10px] text-secondary-500">Sorotan beranda utama</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-secondary-200 bg-secondary-50 cursor-pointer hover:bg-primary-50/30 transition">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <span className="text-xs font-bold text-secondary-950 block">Trending Tour</span>
                  <span className="text-[10px] text-secondary-500">Badge paling diminati</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-secondary-200 bg-secondary-50 cursor-pointer hover:bg-primary-50/30 transition">
                <input
                  type="checkbox"
                  checked={isRecent}
                  onChange={(e) => setIsRecent(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <span className="text-xs font-bold text-secondary-950 block">Paket Terbaru</span>
                  <span className="text-[10px] text-secondary-500">Tandai update terbaru</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* STEP NAVIGATION BETWEEN TABS & GLOBAL ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 border-t border-secondary-200">
        <div className="flex items-center gap-2">
          {prevTab ? (
            <button
              type="button"
              onClick={() => setActiveTab(prevTab.id)}
              className="px-4 py-2 rounded-xl border border-secondary-200 bg-white hover:bg-secondary-100 text-secondary-700 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span>Kembali ke: {prevTab.label}</span>
            </button>
          ) : (
            <Link
              href="/admin/trips"
              className="px-4 py-2 rounded-xl border border-secondary-200 bg-white hover:bg-secondary-100 text-secondary-700 font-bold text-xs inline-flex items-center justify-center transition"
            >
              Batal & Kembali ke Daftar
            </Link>
          )}

          {nextTab && (
            <button
              type="button"
              onClick={() => setActiveTab(nextTab.id)}
              className="px-4 py-2 rounded-xl border border-secondary-300 bg-secondary-100 hover:bg-secondary-200 text-secondary-950 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>Lanjut ke: {nextTab.label}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
          <Link
            href="/admin/trips"
            className="hidden sm:inline-flex px-4 py-2.5 rounded-xl border border-secondary-200 text-secondary-700 hover:bg-secondary-100 font-bold text-xs items-center justify-center transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-xs transition shadow-md inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>{submitting ? "Menyimpan Data..." : mode === "create" ? "Buat Paket Wisata" : "Simpan Seluruh Perubahan"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
