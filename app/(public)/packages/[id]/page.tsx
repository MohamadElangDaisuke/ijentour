'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Star,
  Clock,
  MapPin,
  Calendar,
  Users,
  Compass,
  Check,
  X,
  Share2,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Camera,
  ArrowRight,
  PhoneCall,
  Flame,
  Maximize2
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import {
  TourPackage,
  defaultPackages,
  packagesStorageKey,
  getPackageByIdFromList
} from '../../../lib/packagesStorage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PackageDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const packageId = resolvedParams.id;
  const router = useRouter();

  const [packagesData, setPackagesData] = useState<TourPackage[]>(defaultPackages);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'facilities' | 'packing' | 'faq'>('overview');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Booking Calculator State
  const [selectedPax, setSelectedPax] = useState<number>(2);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<{ [key: string]: boolean }>({
    trolley: false,
    drone: false,
    pickup: false
  });

  // Online Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Area Kota Banyuwangi');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Load from API and fallback to localStorage / defaultPackages
  useEffect(() => {
    // 1. Fetch package detail from real DB
    fetch(`/api/trips/${packageId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.package) {
          setPackagesData((prev) => {
            const index = prev.findIndex((p) => p.id === data.package.id || p.id === packageId);
            if (index >= 0) {
              const copy = [...prev];
              copy[index] = data.package;
              return copy;
            }
            return [data.package, ...prev];
          });
        }
      })
      .catch(() => { });

    // 2. Load from localStorage if present
    const saved = window.localStorage.getItem(packagesStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPackagesData((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newFromSaved = parsed.filter((p: any) => !existingIds.has(p.id));
            return [...prev, ...newFromSaved];
          });
        }
      } catch (e) {
        console.error('Failed to load packages from localStorage:', e);
      }
    }

    // 3. Check if user is logged in to prefill form
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCustomerName(data.user.name || '');
          setCustomerEmail(data.user.email || '');
          if (data.user.phone) setWhatsappNumber(data.user.phone);
        }
      })
      .catch(() => { });
  }, [packageId]);

  // Set default tomorrow date for booking
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setSelectedDate(dateStr);
  }, []);

  const currentPkg = getPackageByIdFromList(packagesData, packageId);

  if (!currentPkg) {
    return (
      <div className="min-h-screen bg-secondary-50 text-secondary-950 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-secondary-200/80 max-w-md w-full">
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black mb-2 text-secondary-950">Paket Tidak Ditemukan</h1>
          <p className="text-secondary-600 text-sm mb-6 leading-relaxed">
            Maaf, paket wisata yang Anda cari tidak tersedia atau telah dipindahkan.
          </p>
          <Link
            href="/packages"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-bold transition-all shadow-md"
          >
            Lihat Semua Paket <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Parse base price into integer
  const cleanPrice = parseInt(currentPkg.price.replace(/[^0-9]/g, ''), 10) || 750000;

  // Addon prices
  const ADDONS = [
    { id: 'trolley', name: 'Sewa Troli Kawah Ijen PP (Trolley Taxi)', price: 800000, note: 'Bagi peserta yang ingin hemat tenaga' },
    { id: 'drone', name: 'Dokumentasi Drone & Kamera 4K', price: 650000, note: 'Video cinematic + foto resolusi tinggi' },
    { id: 'pickup', name: 'Antar-Jemput Bandara Juanda/Surabaya/Malang', price: 600000, note: 'Mobil privat PP tol luar kota' }
  ];

  let calculatedAddonTotal = 0;
  ADDONS.forEach((addon) => {
    if (selectedAddons[addon.id]) {
      calculatedAddonTotal += addon.price;
    }
  });

  const totalPrice = cleanPrice * selectedPax + calculatedAddonTotal;

  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(totalPrice);

  const galleryList = currentPkg.gallery && currentPkg.gallery.length > 0
    ? currentPkg.gallery
    : [
      currentPkg.image || '/images/pkg-bluefire.png',
      '/images/the-best-view-of-kawah.webp',
      '/images/pkg-crater.png',
      '/images/pkg-waterfall.png'
    ];

  const activePhoto = galleryList[activeImageIndex] || galleryList[0];

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: currentPkg.title,
          text: `Cek paket ${currentPkg.title} di Ijen Tour Banyuwangi!`,
          url: window.location.href
        }).catch(() => { });
      } else {
        navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    }
  };

  const handleWhatsAppBooking = () => {
    const selectedAddonNames = ADDONS
      .filter((a) => selectedAddons[a.id])
      .map((a) => a.name)
      .join(', ');

    const message = `Halo Admin Ijen Tour, saya ingin memesan paket wisata:
*${currentPkg.title}*

📅 *Tanggal*: ${selectedDate || 'Segera'}
👥 *Jumlah Peserta*: ${selectedPax} Orang
🏷️ *Estimasi Total*: ${formattedTotal}
${selectedAddonNames ? `✨ *Add-on Tambahan*: ${selectedAddonNames}\n` : ''}
Mohon info ketersediaan slot guide dan armadanya. Terima kasih!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/6282268177188?text=${encoded}`, '_blank');
  };

  const handleOnlineBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !whatsappNumber) {
      setBookingError('Silakan lengkapi nama Anda dan nomor WhatsApp.');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    try {
      const activeAddonsList = ADDONS
        .filter((a) => selectedAddons[a.id])
        .map((a) => ({ id: a.id, name: a.name, price: a.price }));

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripPackageId: currentPkg.id,
          packageName: currentPkg.title,
          customerName,
          customerEmail,
          whatsappNumber,
          customerPhone: whatsappNumber,
          departureDate: selectedDate,
          numParticipants: selectedPax,
          basePrice: cleanPrice,
          addons: activeAddonsList,
          pickupLocation,
          specialRequests,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses reservasi.');
      }

      setConfirmedBooking(data.booking);
      setIsBookingModalOpen(false);
    } catch (err: any) {
      setBookingError(err.message || 'Terjadi kesalahan sistem, silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const relatedPackages = packagesData.filter((p) => p.id !== currentPkg.id).slice(0, 3);

  return (
    <div className="bg-secondary-50 text-secondary-950 min-h-screen pb-24 selection:bg-primary-500 selection:text-secondary-950">

      {/* BREADCRUMBS & TOP ACTION BAR */}
      <div className="border-b border-secondary-200/80 bg-white/70 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <nav className="flex items-center space-x-2 text-xs sm:text-sm text-secondary-600 font-medium overflow-x-auto whitespace-nowrap py-1">
            <Link href="/" className="hover:text-primary-600 transition-colors">Beranda</Link>
            <ChevronRight className="w-3.5 h-3.5 text-secondary-400 shrink-0" />
            <Link href="/packages" className="hover:text-primary-600 transition-colors">Paket Tour</Link>
            <ChevronRight className="w-3.5 h-3.5 text-secondary-400 shrink-0" />
            <span className="text-secondary-950 font-bold truncate max-w-50 sm:max-w-xs">{currentPkg.title}</span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border border-secondary-300 hover:border-primary-500 hover:bg-primary-50 text-secondary-800 transition-all cursor-pointer shadow-2xs"
              title="Bagikan paket ini"
            >
              <Share2 className="w-3.5 h-3.5 text-primary-600" />
              <span>{copiedLink ? 'Link Tersalin! ✓' : 'Bagikan'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">

        {/* PACKAGE HEADER TITLE & BADGES */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary-500 text-secondary-950 shadow-sm">
              <Flame className="w-3.5 h-3.5" />
              {currentPkg.badge || 'Paket Rekomendasi'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-secondary-100 text-secondary-800 border border-secondary-200 capitalize">
              {currentPkg.category === 'midnight' ? '🌙 Midnight Trip' : currentPkg.category === 'private' ? '👑 Private Tour' : '🎒 Regular Tour'}
            </span>
            {currentPkg.isTrending && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                🔥 Paling Banyak Diminati
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-secondary-950 tracking-tight leading-tight mb-4">
            {currentPkg.title}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm text-secondary-700 font-medium">
            <div className="flex items-center gap-1 text-primary-500 font-black">
              {[0, 1, 2, 3, 4].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star < Math.round(currentPkg.rating || 5) ? 'fill-primary-500 text-primary-500' : 'text-secondary-300'}`}
                />
              ))}
              <span className="text-secondary-950 font-bold ml-1">{(currentPkg.rating || 5.0).toFixed(1)}</span>
              <span className="text-secondary-500 font-normal">({currentPkg.savedCount || '4.1K+'} ulasan & favorit)</span>
            </div>
            <span className="hidden sm:inline text-secondary-300">•</span>
            <div className="flex items-center gap-1.5 text-secondary-700">
              <Clock className="w-4 h-4 text-primary-600" />
              <span>Durasi: <strong>{currentPkg.duration}</strong></span>
            </div>
            <span className="hidden sm:inline text-secondary-300">•</span>
            <div className="flex items-center gap-1.5 text-secondary-700">
              <MapPin className="w-4 h-4 text-primary-600" />
              <span>Kawah Ijen, Banyuwangi</span>
            </div>
          </div>
        </div>

        {/* HERO MEDIA GALLERY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10">
          {/* Main Large Image */}
          <div className="lg:col-span-8 relative aspect-16/10 rounded-3xl overflow-hidden bg-secondary-900 border border-secondary-200 shadow-xl group">
            <img
              src={activePhoto}
              alt={`${currentPkg.title} - Foto utama`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary-950/70 via-transparent to-black/20 pointer-events-none" />

            {/* Expand Image Button */}
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-secondary-950/80 hover:bg-secondary-950 text-white backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg hover:scale-105"
            >
              <Maximize2 className="w-4 h-4 text-primary-400" />
              <span>Lihat Foto Penuh</span>
            </button>

            {/* Quick Tag */}
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-black text-secondary-950 shadow-md">
              Mulai {currentPkg.price} / orang
            </div>
          </div>

          {/* Side Thumbnail List */}
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3.5">
            {galleryList.slice(0, 4).map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative aspect-16/9 lg:aspect-auto lg:h-27 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all shadow-sm ${activeImageIndex === idx
                    ? 'border-primary-500 ring-3 ring-primary-500/30 scale-[1.02]'
                    : 'border-white/80 hover:border-secondary-300 opacity-80 hover:opacity-100'
                  }`}
              >
                <img
                  src={imgUrl}
                  alt={`Galeri ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-secondary-950/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                  Foto {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK SPECIFICATIONS MATRIX */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-12">
          {[
            { label: 'Durasi', value: currentPkg.duration, icon: Clock },
            { label: 'Ketinggian', value: currentPkg.altitude || '2.769 mdpl', icon: Compass },
            { label: 'Tingkat Fisik', value: currentPkg.difficulty || 'Sedang (3 Km)', icon: Sparkles },
            { label: 'Waktu Mulai', value: currentPkg.departureTime || '00:00 WIB', icon: Calendar },
            { label: 'Grup', value: currentPkg.groupSize || 'Privat & Terbuka', icon: Users },
            { label: 'Bahasa', value: (currentPkg.languages || ['ID', 'EN']).join(' / '), icon: ShieldCheck }
          ].map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 border border-secondary-200/80 shadow-2xs flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-2 text-primary-600">
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-secondary-500">{item.label}</span>
                </div>
                <p className="text-xs sm:text-sm font-extrabold text-secondary-950 leading-snug">{item.value}</p>
              </div>
            );
          })}
        </div>

        {/* MAIN BODY: LEFT CONTENT (TABS & SECTIONS) & RIGHT BOOKING STICKY SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* LEFT 8 COLUMNS: INTERACTIVE TABS & CONTENT */}
          <div className="lg:col-span-8 space-y-8">

            {/* TABS SELECTOR */}
            <div className="flex items-center gap-2 border-b border-secondary-200/80 overflow-x-auto pb-px">
              {[
                { id: 'overview', label: '✨ Ringkasan' },
                { id: 'itinerary', label: '🗺️ Itinerary' },
                { id: 'facilities', label: '✅ Fasilitas' },
                { id: 'packing', label: '🎒 Perlengkapan' },
                { id: 'faq', label: '❓ Tanya Jawab' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 text-xs sm:text-sm font-extrabold transition-all border-b-2 whitespace-nowrap cursor-pointer ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-700 bg-primary-50/50 rounded-t-xl'
                      : 'border-transparent text-secondary-600 hover:text-secondary-950 hover:border-secondary-300'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: OVERVIEW & HIGHLIGHTS */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fadeIn">
                {/* Description Narrative */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-sm space-y-4">
                  <h3 className="text-xl sm:text-2xl font-black text-secondary-950">
                    Tentang Perjalanan Ini
                  </h3>
                  <p className="text-secondary-700 text-sm sm:text-base leading-relaxed">
                    {currentPkg.description ||
                      `Nikmati pengalaman petualangan tak tertandingi di Kawah Ijen bersama ${currentPkg.title}. Kami mengutamakan kenyamanan, keamanan berstandar tinggi, serta pemandu lokal penambang belerang asli yang siap mengantar Anda menembus keajaiban alam Banyuwangi.`}
                  </p>
                  <p className="text-secondary-700 text-sm sm:text-base leading-relaxed">
                    Mulai dari titik penjemputan hingga kepulangan, seluruh aspek logistik, tiket masuk, asuransi, dan peralatan proteksi telah disiapkan secara profesional demi liburan yang berkesan seumur hidup.
                  </p>
                </div>

                {/* Key Highlights Grid */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-sm">
                  <div className="flex items-center gap-2 text-primary-600 font-bold text-xs uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4" /> Keunggulan Terpilih
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-secondary-950 mb-6">
                    Highlight Wisata Ini
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentPkg.highlights.map((highlight, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3.5 p-4 rounded-2xl bg-secondary-50 border border-secondary-200/60 hover:border-primary-400 hover:bg-primary-50/20 transition-all"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 mt-0.5 font-black text-xs">
                          ✓
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-secondary-900 leading-snug">
                          {highlight}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety & Meeting Point Card */}
                <div className="bg-linear-to-br from-primary-500/10 via-white to-secondary-100 rounded-3xl p-6 sm:p-8 border border-primary-200/80 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-500 text-secondary-950 flex items-center justify-center shrink-0 shadow-md">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-secondary-950 mb-1">
                        Standar Keselamatan & Kenyamanan Terbaik
                      </h4>
                      <p className="text-xs sm:text-sm text-secondary-700 leading-relaxed">
                        Setiap peserta dilengkapi masker gas respirator khusus standar BKSDA untuk menyaring gas asam kawah. Pemandu kami bersertifikat dan dibekali tabung oksigen darurat serta P3K.
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-bold text-secondary-800">
                        <span className="flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600" /> Free Pickup Area Banyuwangi
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600" /> Asuransi Perjalanan Termasuk
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ITINERARY TIMELINE */}
            {activeTab === 'itinerary' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-sm animate-fadeIn">
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-600">Rencana Perjalanan</span>
                  <h3 className="text-xl sm:text-2xl font-black text-secondary-950 mt-1">
                    Jadwal & Rute Lengkap (Itinerary)
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary-600 mt-1">
                    Jadwal bersifat fleksibel dan dapat disesuaikan dengan kondisi cuaca serta ritme peserta.
                  </p>
                </div>

                <div className="relative border-l-2 border-primary-400/50 ml-4 sm:ml-6 space-y-8 pl-6 sm:pl-8 py-2">
                  {currentPkg.itinerary.map((item, idx) => (
                    <div key={idx} className="relative group">
                      {/* Timeline Dot Icon */}
                      <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-5 h-5 rounded-full bg-primary-500 ring-4 ring-white shadow-md flex items-center justify-center text-[10px] font-bold text-secondary-950" />

                      <div className="bg-secondary-50 p-4 sm:p-5 rounded-2xl border border-secondary-200/70 hover:border-primary-400 transition-all">
                        <div className="inline-block px-3 py-1 rounded-lg bg-primary-100 text-primary-800 text-xs font-black mb-2">
                          {item.day}
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-secondary-950 mb-1.5">
                          {item.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-secondary-700 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: FACILITIES (INCLUSIONS & EXCLUSIONS) */}
            {activeTab === 'facilities' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                {/* Included Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200/80 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-emerald-100">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-secondary-950">Termasuk (Included)</h4>
                      <p className="text-[11px] text-emerald-700 font-bold">Fasilitas yang kami siapkan untuk Anda</p>
                    </div>
                  </div>

                  <ul className="space-y-3.5">
                    {(currentPkg.included || [
                      'Transportasi AC PP dari Hotel/Stasiun Banyuwangi',
                      'Tiket Masuk Resmi BKSDA & Asuransi Wisata',
                      'Pemandu Lokal Berlisensi',
                      'Masker Gas Respirator Medis Standar',
                      'Headlamp / Senter Kepala',
                      'Air Mineral & Snack Hangat',
                      'P3K Dasar'
                    ]).map((inc, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-secondary-800">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Excluded Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200/80 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-rose-100">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                      ✕
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-secondary-950">Tidak Termasuk (Excluded)</h4>
                      <p className="text-[11px] text-rose-600 font-bold">Biaya opsional & keperluan pribadi</p>
                    </div>
                  </div>

                  <ul className="space-y-3.5">
                    {(currentPkg.excluded || [
                      'Pengeluaran Pribadi di Luar Program',
                      'Taksi Troli Dorong Kawah (Opsional jika lelah)',
                      'Makan Berat Tambahan di Luar Paket',
                      'Tip Sukarela untuk Guide / Driver'
                    ]).map((exc, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-secondary-700">
                        <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 4: PACKING LIST */}
            {activeTab === 'packing' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-sm animate-fadeIn space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-600">Persiapan Pendakian</span>
                  <h3 className="text-xl sm:text-2xl font-black text-secondary-950 mt-1">
                    Checklist Perlengkapan yang Wajib Dibawa
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary-600 mt-1">
                    Agar pendakian Anda nyaman dan aman dari udara dingin kawah Ijen (suhu berkisar 6°C - 12°C).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(currentPkg.packingList || [
                    { item: 'Jaket Tebal / Windbreaker', note: 'Suhu puncak dini hari bisa mencapai 6°C - 10°C' },
                    { item: 'Sepatu Trekking / Sneakers Anti-Slip', note: 'Jalur berpasir dan menanjak' },
                    { item: 'Celana Panjang & Kaos Kaki Tebal', note: 'Menjaga kehangatan kaki dan tubuh' },
                    { item: 'Kamera / Smartphone & Powerbank', note: 'Untuk mengabadikan momen Blue Fire & Sunrise' },
                    { item: 'Uang Tunai Secukupnya', note: 'Untuk membeli cinderamata belerang atau minuman hangat' },
                    { item: 'Obat-obatan Pribadi', note: 'Jika memiliki riwayat asma atau alergi dingin' }
                  ]).map((pack, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-secondary-50 border border-secondary-200/70 flex items-start gap-3"
                    >
                      <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-black text-xs mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <h5 className="font-black text-sm text-secondary-950">{pack.item}</h5>
                        <p className="text-xs text-secondary-600 mt-0.5">{pack.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: FAQ */}
            {activeTab === 'faq' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-sm animate-fadeIn space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-600">Bantuan & Informasi</span>
                  <h3 className="text-xl sm:text-2xl font-black text-secondary-950 mt-1">
                    Pertanyaan yang Sering Diajukan (FAQ)
                  </h3>
                </div>

                <div className="space-y-3 pt-2">
                  {(currentPkg.faqs || [
                    { q: 'Apakah pemula atau anak-anak bisa mengikuti tour ini?', a: 'Sangat bisa! Jalur pendakian cukup lebar dan jelas. Jika merasa lelah, tersedia jasa troli dorong lokal (trolley taxi) yang siap mengantar sampai ke puncak.' },
                    { q: 'Kapan waktu terbaik melihat Blue Fire?', a: 'Waktu terbaik adalah antara pukul 03:00 hingga 04:30 WIB saat langit masih gelap pekat. Kami mengatur jadwal agar Anda tiba tepat waktu di spot terbaik.' },
                    { q: 'Apakah bau gas belerang berbahaya?', a: 'Kami menyediakan masker respirator khusus berfilter aktif yang aman menyaring asap belerang. Guide kami juga selalu memantau arah angin demi keamanan Anda.' },
                    { q: 'Bagaimana sistem pembayaran dan pembatalan?', a: 'Pemesanan dapat dikonfirmasi dengan DP fleksibel melalui transfer bank / QRIS. Reschedule gratis dapat dilakukan H-2 keberangkatan.' }
                  ]).map((faq, idx) => {
                    const isOpen = openFaq === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-secondary-200 overflow-hidden transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? null : idx)}
                          className="w-full text-left p-4 sm:p-5 bg-secondary-50/50 hover:bg-secondary-100 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-secondary-950 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-primary-600 shrink-0" />
                            {faq.q}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-secondary-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="p-4 sm:p-5 bg-white border-t border-secondary-200 text-xs sm:text-sm text-secondary-700 leading-relaxed">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VERIFIED CUSTOMER REVIEWS */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-secondary-100">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-secondary-950">Ulasan Wisatawan</h3>
                  <p className="text-xs sm:text-sm text-secondary-600 mt-0.5">Pengalaman nyata para penjelajah bersama Ijen Tour</p>
                </div>
                <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 px-4 py-2 rounded-2xl">
                  <Star className="w-5 h-5 fill-primary-500 text-primary-500" />
                  <span className="text-lg font-black text-secondary-950">{(currentPkg.rating || 5.0).toFixed(1)}</span>
                  <span className="text-xs text-secondary-600 font-medium">/ 5.0</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    name: 'Dimas Pratama',
                    origin: 'Jakarta',
                    comment: 'Pengalaman luar biasa! Guide-nya ramah banget mantan penambang belerang jadi tahu spot foto terbaik tanpa antre panjang.',
                    rating: 5,
                    date: 'September 2026'
                  },
                  {
                    name: 'Sarah & Michael',
                    origin: 'Australia',
                    comment: 'The midnight tour was fantastic! Clear sky, breathtaking blue fire, and the gas masks provided were top quality.',
                    rating: 5,
                    date: 'Agustus 2026'
                  }
                ].map((review, i) => (
                  <div key={i} className="p-4 sm:p-5 rounded-2xl bg-secondary-50 border border-secondary-200/70">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-500 text-secondary-950 flex items-center justify-center font-bold text-xs">
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-secondary-950">{review.name}</p>
                          <p className="text-[10px] text-secondary-500">{review.origin} • {review.date}</p>
                        </div>
                      </div>
                      <div className="flex text-primary-500">
                        {[...Array(review.rating)].map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-primary-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-secondary-700 italic leading-relaxed">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT 4 COLUMNS: INTERACTIVE BOOKING CALCULATOR (STICKY) */}
          <div className="lg:col-span-4 sticky top-28">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-secondary-200/90 shadow-xl space-y-6">

              {/* Price Banner */}
              <div className="pb-4 border-b border-secondary-100">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-secondary-500 block mb-1">
                  Harga Resmi Paket
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-primary-600">{currentPkg.price}</span>
                  <span className="text-xs font-semibold text-secondary-600">/ orang</span>
                </div>
                <p className="text-[11px] text-emerald-600 font-bold mt-1">✓ Termasuk tiket & pemandu resmi</p>
              </div>

              {/* Form Input: Date Picker */}
              <div>
                <label className="block text-xs font-extrabold text-secondary-950 uppercase tracking-wider mb-2">
                  1. Pilih Tanggal Keberangkatan
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 bg-secondary-50 text-secondary-950 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Form Input: Number of Pax Selector */}
              <div>
                <label className="block text-xs font-extrabold text-secondary-950 uppercase tracking-wider mb-2">
                  2. Jumlah Peserta (Pax)
                </label>
                <div className="flex items-center justify-between bg-secondary-50 border border-secondary-200 rounded-xl p-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPax((prev) => Math.max(1, prev - 1))}
                    className="w-10 h-10 rounded-lg bg-white border border-secondary-300 hover:bg-secondary-100 text-secondary-950 font-black text-lg flex items-center justify-center transition cursor-pointer"
                  >
                    -
                  </button>
                  <div className="text-center">
                    <span className="text-lg font-black text-secondary-950">{selectedPax}</span>
                    <span className="text-xs text-secondary-500 font-medium block">Orang</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPax((prev) => prev + 1)}
                    className="w-10 h-10 rounded-lg bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-lg flex items-center justify-center transition cursor-pointer shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add-ons Checklist */}
              <div>
                <label className="block text-xs font-extrabold text-secondary-950 uppercase tracking-wider mb-2">
                  3. Opsi Tambahan (Add-ons)
                </label>
                <div className="space-y-2.5">
                  {ADDONS.map((addon) => (
                    <label
                      key={addon.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${selectedAddons[addon.id]
                          ? 'border-primary-500 bg-primary-50/30'
                          : 'border-secondary-200/80 bg-white hover:border-secondary-300'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!selectedAddons[addon.id]}
                        onChange={(e) =>
                          setSelectedAddons((prev) => ({
                            ...prev,
                            [addon.id]: e.target.checked
                          }))
                        }
                        className="mt-1 w-4 h-4 accent-primary-600 rounded cursor-pointer"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-secondary-950 leading-tight">{addon.name}</p>
                        <p className="text-[11px] text-primary-700 font-black mt-0.5">
                          +Rp {addon.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Total Calculation Display */}
              <div className="bg-secondary-100 p-4 rounded-2xl border border-secondary-200">
                <div className="flex justify-between text-xs text-secondary-600 mb-1">
                  <span>{cleanPrice.toLocaleString('id-ID')} x {selectedPax} orang</span>
                  <span>Rp {(cleanPrice * selectedPax).toLocaleString('id-ID')}</span>
                </div>
                {calculatedAddonTotal > 0 && (
                  <div className="flex justify-between text-xs text-secondary-600 mb-1">
                    <span>Add-ons Tambahan</span>
                    <span>Rp {calculatedAddonTotal.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="border-t border-secondary-300/60 pt-2 mt-2 flex justify-between items-baseline">
                  <span className="font-black text-xs uppercase tracking-wider text-secondary-950">Total Estimasi</span>
                  <span className="text-xl font-black text-primary-600">{formattedTotal}</span>
                </div>
              </div>

              {/* CTA Booking Buttons */}
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full py-4 px-6 rounded-2xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-sm tracking-wide shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-5 h-5 text-secondary-950" />
                <span>PESAN SEKARANG (ONLINE BOOKING)</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppBooking}
                className="w-full py-3 px-6 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-[#128C7E] font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaWhatsapp className="w-4 h-4 text-[#25D366]" />
                <span>KONSULTASI LANGSUNG VIA WA</span>
              </button>

              <p className="text-[11px] text-center text-secondary-500 leading-tight">
                🔒 Tanpa biaya tersembunyi. Dapatkan kode reservasi resmi dan konfirmasi slot langsung.
              </p>
            </div>
          </div>

        </div>

        {/* RELATED PACKAGES SECTION */}
        {relatedPackages.length > 0 && (
          <div className="mt-20 pt-12 border-t border-secondary-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600">Pilihan Lainnya</span>
                <h3 className="text-2xl sm:text-3xl font-black text-secondary-950 mt-1">Paket Wisata Terkait</h3>
              </div>
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 transition"
              >
                Lihat Semua Paket <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-3xl border border-secondary-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-16/10 overflow-hidden bg-secondary-100">
                      <img
                        src={pkg.image || '/images/pkg-bluefire.png'}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-secondary-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                        {pkg.duration}
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-1 text-primary-500 text-xs mb-2 font-bold">
                        <Star className="w-3.5 h-3.5 fill-primary-500" />
                        <span>{(pkg.rating || 4.9).toFixed(1)}</span>
                      </div>
                      <h4 className="font-extrabold text-base text-secondary-950 group-hover:text-primary-600 transition leading-snug line-clamp-2 mb-2">
                        {pkg.title}
                      </h4>
                      <p className="text-xs text-secondary-600 line-clamp-2">
                        {pkg.highlights.join(' • ')}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-secondary-100 mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-secondary-500 block">Mulai dari</span>
                      <span className="text-sm font-black text-primary-600">{pkg.price}</span>
                    </div>
                    <Link
                      href={`/packages/${pkg.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary-950 hover:bg-primary-500 hover:text-secondary-950 text-white text-xs font-bold transition-all"
                    >
                      <span>Detail</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-secondary-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="flex items-center justify-between text-white max-w-7xl mx-auto w-full">
            <span className="text-sm font-bold">{currentPkg.title} - Foto {activeImageIndex + 1} dari {galleryList.length}</span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div
            className="relative max-w-5xl max-h-[75vh] mx-auto w-full flex items-center justify-center my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activePhoto}
              alt="Lightbox photo"
              className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl"
            />
          </div>

          <div className="flex items-center justify-center gap-3 overflow-x-auto py-2" onClick={(e) => e.stopPropagation()}>
            {galleryList.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIndex(i)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition cursor-pointer ${activeImageIndex === i ? 'border-primary-500 scale-110' : 'border-white/40 opacity-60'
                  }`}
              >
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ONLINE BOOKING FORM MODAL */}
      {isBookingModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-secondary-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsBookingModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-secondary-200 shadow-2xl relative animate-scale-in my-8 text-secondary-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-secondary-100 mb-6">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-primary-600 block">
                  Konfirmasi Reservasi
                </span>
                <h3 className="text-xl font-black text-secondary-950">{currentPkg.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="p-2 rounded-full hover:bg-secondary-100 text-secondary-500 hover:text-secondary-950 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingError && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Summary preview */}
            <div className="bg-secondary-50 p-4 rounded-2xl border border-secondary-200/80 mb-6 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-secondary-600">Tanggal Keberangkatan:</span>
                <span className="font-bold text-secondary-950">{selectedDate || 'Segera'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Jumlah Peserta:</span>
                <span className="font-bold text-secondary-950">{selectedPax} Orang</span>
              </div>
              <div className="flex justify-between border-t border-secondary-200 pt-1.5 font-bold">
                <span>Total Estimasi:</span>
                <span className="text-primary-600 text-sm">{formattedTotal}</span>
              </div>
            </div>

            <form onSubmit={handleOnlineBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                  Nama Lengkap Pemesan *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                  Titik Penjemputan di Banyuwangi
                </label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="Contoh: Hotel Santika Banyuwangi / Stasiun Banyuwangi Kota"
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                  Catatan / Permintaan Khusus
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Permintaan makanan khusus, ukuran masker anak, dsb."
                  className="w-full px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>MEMPROSES DATA...</span>
                  ) : (
                    <span>SELESAIKAN BOOKING SEKARANG</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMED BOOKING SUCCESS MODAL */}
      {confirmedBooking && (
        <div
          className="fixed inset-0 z-50 bg-secondary-950/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setConfirmedBooking(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-secondary-200 shadow-2xl text-center animate-scale-in text-secondary-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 block mb-1">
              Reservasi Berhasil Dicatat!
            </span>
            <h3 className="text-2xl font-black text-secondary-950 mb-2">Kode Reservasi Anda</h3>

            <div className="bg-primary-50 border-2 border-dashed border-primary-400 p-3 rounded-2xl mb-4 font-mono text-xl font-black text-primary-700 tracking-wider">
              {confirmedBooking.bookingCode}
            </div>

            <p className="text-xs text-secondary-600 leading-relaxed mb-6">
              Data pemesanan untuk <span className="font-bold text-secondary-950">{confirmedBooking.customerName}</span> ({confirmedBooking.numParticipants} Orang) telah tersimpan di sistem kami.
            </p>

            <div className="space-y-3">
              <a
                href={`https://wa.me/6282268177188?text=${encodeURIComponent(
                  `Halo Admin Ijen Tour! Saya sudah melakukan reservasi dengan Kode Booking: *${confirmedBooking.bookingCode}* untuk paket *${confirmedBooking.packageName}* tanggal ${confirmedBooking.departureDate}. Mohon konfirmasi ketersediaan armadanya. Terima kasih!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <FaWhatsapp className="w-5 h-5" />
                <span>KONFIRMASI KE WHATSAPP ADMIN</span>
              </a>

              <Link
                href="/customer"
                className="block w-full py-3 px-6 rounded-2xl bg-secondary-100 hover:bg-secondary-200 text-secondary-800 font-bold text-xs transition"
              >
                Lihat di Dashboard Traveler
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

