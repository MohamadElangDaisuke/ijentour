'use client';

import React, { useState, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Globe,
  Mail,
  Compass,
  Calendar,
  Users,
  MapPin,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Eye,
  Plus,
  Minus,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useBookingModal } from '@/lib/bookingModalStore';
import {
  getWhatsAppLink,
  createTourBookingWhatsAppMessage,
  TourBookingInquiryData,
} from '@/lib/whatsapp';

interface TourPackageOption {
  id: string;
  title: string;
  price?: string;
  duration?: string;
}

const DEFAULT_PACKAGE_OPTIONS: TourPackageOption[] = [
  { id: 'midnight', title: 'Midnight Expedition Blue Fire Ijen', duration: '1 Day' },
  { id: 'private-sunrise', title: 'Private Sunrise & Kawah Ijen Trekking', duration: '1 Day' },
  { id: '2d1n-heritage', title: '2D1N Banyuwangi & Mount Ijen Heritage', duration: '2D1N' },
  { id: 'baluran-safari', title: 'Ijen Crater & Baluran National Park Safari', duration: '2D1N' },
  { id: 'bromo-overland', title: 'Banyuwangi - Ijen - Bromo Volcano Overland', duration: '3D2N' },
  { id: 'custom-private', title: 'Custom Private Tour / Group Trip', duration: 'Flexible' },
];

const POPULAR_NATIONALITIES = [
  'Indonesia',
  'Singapore',
  'Malaysia',
  'France',
  'Germany',
  'Australia',
  'Netherlands',
  'United States',
];

const QUICK_PICKUPS = [
  'Hotel in Banyuwangi',
  'Banyuwangi Airport (BWX)',
  'Ketapang Train Station',
  'Banyuwangi Kota Station',
  'Ketapang Ferry Port (from Bali)',
];

export default function BookingModal() {
  const { isOpen, initialData, closeBookingModal } = useBookingModal();

  // Form states
  const [fullName, setFullName] = useState('');
  const [nationality, setNationality] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [tourDate, setTourDate] = useState('');
  const [participants, setParticipants] = useState<number | string>(2);
  const [pickupLocation, setPickupLocation] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Packages list state (fetched or default)
  const [packageOptions, setPackageOptions] = useState<TourPackageOption[]>(DEFAULT_PACKAGE_OPTIONS);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState('');

  // Unique IDs for accessibility
  const formId = useId();

  // Today's date in YYYY-MM-DD format for min date
  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch package list if available
  useEffect(() => {
    fetch('/api/trips')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.packages) && data.packages.length > 0) {
          const mapped = data.packages.map((pkg: any) => ({
            id: pkg.id || pkg.slug,
            title: pkg.title,
            price: pkg.price,
            duration: pkg.duration,
          }));
          // Combine and preserve custom tour option
          const combined = [
            ...mapped,
            { id: 'custom-private', title: 'Custom Private Tour / Group Trip', duration: 'Flexible' },
          ];
          setPackageOptions(combined);
        }
      })
      .catch(() => {
        // Fallback already set
      });
  }, []);

  // Sync initialData when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPackage(prev => initialData.packageName || prev || '');

      if (initialData.tourDate) {
        setTourDate(initialData.tourDate);
      }
      if (initialData.participants) {
        setParticipants(initialData.participants);
      }
      if (initialData.pickupLocation) {
        setPickupLocation(initialData.pickupLocation);
      }
      if (initialData.fullName) {
        setFullName(initialData.fullName);
      }
      if (initialData.nationality) {
        setNationality(initialData.nationality);
      }
      if (initialData.email) {
        setEmail(initialData.email);
      }
      if (initialData.whatsapp) {
        setWhatsapp(initialData.whatsapp);
      }
      if (initialData.specialRequests) {
        setSpecialRequests(initialData.specialRequests);
      }

      setErrors({});
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen, initialData]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeBookingModal();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeBookingModal]);

  // Format date helper: converts YYYY-MM-DD to readable dd/mm/yyyy / localized
  const getFormattedDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
      }
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Preview message generator
  const currentWhatsAppMessage = createTourBookingWhatsAppMessage({
    fullName: fullName || '(Your full name)',
    nationality: nationality || '(Nationality)',
    email: email || '(Email address)',
    whatsapp: whatsapp || '(WhatsApp number)',
    packageName: selectedPackage || '(Tour Package)',
    tourDate: getFormattedDateDisplay(tourDate) || '(dd/mm/yyyy)',
    participants: participants || 1,
    pickupLocation: pickupLocation || '(Pickup location)',
    specialRequests: specialRequests || '',
  });

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }
    if (!nationality.trim()) {
      newErrors.nationality = 'Nationality is required.';
    }
    if (!email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Invalid email address format.';
    }
    if (!whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp Number is required.';
    } else if (whatsapp.replace(/[^0-9]/g, '').length < 8) {
      newErrors.whatsapp = 'WhatsApp number must be at least 8 digits.';
    }
    if (!selectedPackage.trim()) {
      newErrors.selectedPackage = 'Please select a tour package.';
    }
    if (!tourDate) {
      newErrors.tourDate = 'Tour Date is required.';
    }
    if (!participants || Number(participants) < 1) {
      newErrors.participants = 'Number of participants must be at least 1.';
    }
    if (!pickupLocation.trim()) {
      newErrors.pickupLocation = 'Pickup Location is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Stepper helper for participants
  const handlePaxChange = (delta: number) => {
    const current = typeof participants === 'number' ? participants : parseInt(participants as string) || 1;
    const next = Math.max(1, current + delta);
    setParticipants(next);
  };

  // Handle submit and redirect to WhatsApp
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Find first error and scroll if needed
      return;
    }

    setIsSubmitting(true);

    const bookingData: TourBookingInquiryData = {
      fullName: fullName.trim(),
      nationality: nationality.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      packageName: selectedPackage,
      tourDate: getFormattedDateDisplay(tourDate),
      participants,
      pickupLocation: pickupLocation.trim(),
      specialRequests: specialRequests.trim(),
    };

    const finalMessage = createTourBookingWhatsAppMessage(bookingData);
    const waUrl = getWhatsAppLink(finalMessage);
    setLastWhatsAppUrl(waUrl);

    // Asynchronously record lead to backend if API exists (non-blocking)
    try {
      fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageName: selectedPackage,
          customerName: fullName.trim(),
          customerEmail: email.trim(),
          whatsappNumber: whatsapp.trim(),
          departureDate: tourDate,
          numParticipants: Number(participants) || 1,
          pickupLocation: pickupLocation.trim(),
          specialRequests: `Nationality: ${nationality.trim()}\n${specialRequests.trim()}`,
        }),
      }).catch(() => {
        // ignore background logging errors so user experience is never blocked
      });
    } catch {
      // ignore
    }

    // Direct redirect to WhatsApp
    setIsSuccess(true);
    setIsSubmitting(false);

    // Open WhatsApp in new tab / window
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 sm:py-8 overflow-y-auto">
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeBookingModal}
            className="fixed inset-0 bg-secondary-950/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-white dark:bg-secondary-900 rounded-3xl sm:rounded-4xl shadow-2xl border border-secondary-200/90 dark:border-secondary-800 my-auto overflow-hidden z-10 max-h-[92vh] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${formId}-title`}
          >
            {/* Top Accent Gradient Bar */}
            <div className="h-2 w-full bg-linear-to-r from-primary-400 via-[#25D366] to-secondary-500 shrink-0" />

            {/* Modal Header */}
            <div className="px-5 sm:px-8 pt-5 pb-4 border-b border-secondary-100 dark:border-secondary-800 flex items-start justify-between gap-4 shrink-0 bg-white dark:bg-secondary-900 sticky top-0 z-20">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366]/10 text-[#128C7E] dark:text-[#25D366] text-[11px] font-extrabold tracking-wide uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                  <FaWhatsapp className="w-3.5 h-3.5" />
                  <span>Instant WhatsApp Confirmation</span>
                </div>
                <h2
                  id={`${formId}-title`}
                  className="text-2xl sm:text-3xl font-black tracking-tight text-secondary-950 dark:text-white"
                >
                  Book Your Tour
                </h2>
                <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">
                  Fill in the details below to reserve directly with the Ijen Tour guide and coordinator team.
                </p>
              </div>

              <button
                type="button"
                onClick={closeBookingModal}
                aria-label="Close booking form"
                className="p-2 sm:p-2.5 rounded-2xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-500 hover:text-secondary-950 dark:hover:text-white transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Scrollable Content */}
            <div className="px-5 sm:px-8 py-5 overflow-y-auto grow custom-scrollbar space-y-6">
              {isSuccess ? (
                /* SUCCESS STATE */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center space-y-5"
                >
                  <div className="w-20 h-20 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>

                  <div className="space-y-2 max-w-md mx-auto">
                    <h3 className="text-2xl font-black text-secondary-950 dark:text-white">
                      Opening WhatsApp...
                    </h3>
                    <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">
                      Your adventure details for{' '}
                      <strong className="text-secondary-950 dark:text-white">{fullName}</strong> have been prepared.
                      If WhatsApp does not open automatically, please click the button below.
                    </p>
                  </div>

                  <div className="bg-secondary-50 dark:bg-secondary-800/60 p-4 rounded-2xl border border-secondary-200/80 dark:border-secondary-700 text-left max-w-md mx-auto text-xs space-y-1.5 font-sans">
                    <p className="font-bold text-secondary-900 dark:text-white flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-primary-500" />
                      <span>{selectedPackage}</span>
                    </p>
                    <p className="text-secondary-600 dark:text-secondary-300">
                      📅 Date: {getFormattedDateDisplay(tourDate)} • 👥 {participants} Participants
                    </p>
                    <p className="text-secondary-600 dark:text-secondary-300">
                      📍 Pickup: {pickupLocation}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                    <a
                      href={lastWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5b] text-white font-extrabold text-sm shadow-lg shadow-[#25D366]/25 transition"
                    >
                      <FaWhatsapp className="w-5 h-5" />
                      <span>Open WhatsApp Again</span>
                    </a>
                    <button
                      type="button"
                      onClick={closeBookingModal}
                      className="px-6 py-3.5 rounded-2xl border border-secondary-300 dark:border-secondary-700 hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-700 dark:text-secondary-200 font-bold text-sm transition cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* MAIN FORM */
                <form id={formId} onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* FIELD 1: Full Name */}
                  <div>
                    <label
                      htmlFor={`${formId}-fullName`}
                      className="block text-xs font-black uppercase tracking-wider text-secondary-800 dark:text-secondary-200 mb-1.5"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id={`${formId}-fullName`}
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                        }}
                        placeholder="Your full name"
                        className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium bg-secondary-50 dark:bg-secondary-800/80 border text-secondary-950 dark:text-white placeholder:text-secondary-400 focus:outline-none focus:ring-2 transition-all ${
                          errors.fullName
                            ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                            : 'border-secondary-200 dark:border-secondary-700 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.fullName}</span>
                      </p>
                    )}
                  </div>

                  {/* FIELD 2: Nationality */}
                  <div>
                    <label
                      htmlFor={`${formId}-nationality`}
                      className="block text-xs font-black uppercase tracking-wider text-secondary-800 dark:text-secondary-200 mb-1.5"
                    >
                      Nationality <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-400">
                        <Globe className="w-4 h-4" />
                      </div>
                      <input
                        id={`${formId}-nationality`}
                        type="text"
                        required
                        value={nationality}
                        onChange={(e) => {
                          setNationality(e.target.value);
                          if (errors.nationality) setErrors((prev) => ({ ...prev, nationality: '' }));
                        }}
                        placeholder="e.g. French, Singaporean"
                        className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium bg-secondary-50 dark:bg-secondary-800/80 border text-secondary-950 dark:text-white placeholder:text-secondary-400 focus:outline-none focus:ring-2 transition-all ${
                          errors.nationality
                            ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                            : 'border-secondary-200 dark:border-secondary-700 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                      />
                    </div>
                    {/* Nationality Quick Click Pills */}
                    <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[11px] text-secondary-500 mr-1 font-medium">Quick selection:</span>
                      {POPULAR_NATIONALITIES.map((nation) => (
                        <button
                          key={nation}
                          type="button"
                          onClick={() => {
                            setNationality(nation);
                            if (errors.nationality) setErrors((prev) => ({ ...prev, nationality: '' }));
                          }}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                            nationality === nation
                              ? 'bg-primary-500 text-secondary-950 border-primary-500 font-bold'
                              : 'bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-300 hover:border-primary-400'
                          }`}
                        >
                          {nation}
                        </button>
                      ))}
                    </div>
                    {errors.nationality && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.nationality}</span>
                      </p>
                    )}
                  </div>

                  {/* FIELD 3 & 4: Email Address & WhatsApp Number (Side by side on tablet/desktop) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {/* FIELD 3: Email Address */}
                    <div>
                      <label
                        htmlFor={`${formId}-email`}
                        className="block text-xs font-black uppercase tracking-wider text-secondary-800 dark:text-secondary-200 mb-1.5"
                      >
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          id={`${formId}-email`}
                          type="email"
                          required
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                          }}
                          placeholder="Your email address"
                          className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium bg-secondary-50 dark:bg-secondary-800/80 border text-secondary-950 dark:text-white placeholder:text-secondary-400 focus:outline-none focus:ring-2 transition-all ${
                            errors.email
                              ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                              : 'border-secondary-200 dark:border-secondary-700 focus:ring-primary-500 focus:border-primary-500'
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>

                    {/* FIELD 4: WhatsApp Number */}
                    <div>
                      <label
                        htmlFor={`${formId}-whatsapp`}
                        className="block text-xs font-black uppercase tracking-wider text-secondary-800 dark:text-secondary-200 mb-1.5"
                      >
                        WhatsApp Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-400">
                          <FaWhatsapp className="w-4 h-4 text-[#25D366]" />
                        </div>
                        <input
                          id={`${formId}-whatsapp`}
                          type="tel"
                          required
                          value={whatsapp}
                          onChange={(e) => {
                            setWhatsapp(e.target.value);
                            if (errors.whatsapp) setErrors((prev) => ({ ...prev, whatsapp: '' }));
                          }}
                          placeholder="e.g. +62 812..."
                          className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium bg-secondary-50 dark:bg-secondary-800/80 border text-secondary-950 dark:text-white placeholder:text-secondary-400 focus:outline-none focus:ring-2 transition-all ${
                            errors.whatsapp
                              ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                              : 'border-secondary-200 dark:border-secondary-700 focus:ring-primary-500 focus:border-primary-500'
                          }`}
                        />
                      </div>
                      {errors.whatsapp && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.whatsapp}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* FIELD 5: Select Tour Package */}
                  <div>
                    <label
                      htmlFor={`${formId}-package`}
                      className="block text-xs font-black uppercase tracking-wider text-secondary-800 dark:text-secondary-200 mb-1.5"
                    >
                      Select Tour Package <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-400">
                        <Compass className="w-4 h-4 text-primary-500" />
                      </div>
                      <select
                        id={`${formId}-package`}
                        required
                        value={selectedPackage}
                        onChange={(e) => {
                          setSelectedPackage(e.target.value);
                          if (errors.selectedPackage) setErrors((prev) => ({ ...prev, selectedPackage: '' }));
                        }}
                        className={`w-full pl-10 pr-10 py-3 rounded-2xl text-sm font-semibold bg-secondary-50 dark:bg-secondary-800/80 border text-secondary-950 dark:text-white focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${
                          errors.selectedPackage
                            ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                            : 'border-secondary-200 dark:border-secondary-700 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                      >
                        <option value="" disabled className="text-secondary-400">
                          -- Select Your Adventure --
                        </option>
                        {packageOptions.map((pkg) => (
                          <option key={pkg.id} value={pkg.title} className="text-secondary-950 dark:text-white">
                            {pkg.title} {pkg.duration ? `(${pkg.duration})` : ''}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-secondary-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                    {errors.selectedPackage && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.selectedPackage}</span>
                      </p>
                    )}
                  </div>

                  {/* FIELD 6 & 7: Tour Date & Participants */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {/* FIELD 6: Tour Date */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor={`${formId}-tourDate`}
                          className="block text-xs font-black uppercase tracking-wider text-secondary-800 dark:text-secondary-200"
                        >
                          Tour Date <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[11px] font-mono text-secondary-500 dark:text-secondary-400">
                          dd/mm/yyyy
                        </span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <input
                          id={`${formId}-tourDate`}
                          type="date"
                          required
                          min={todayStr}
                          value={tourDate}
                          onChange={(e) => {
                            setTourDate(e.target.value);
                            if (errors.tourDate) setErrors((prev) => ({ ...prev, tourDate: '' }));
                          }}
                          placeholder="dd/mm/yyyy"
                          className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium bg-secondary-50 dark:bg-secondary-800/80 border text-secondary-950 dark:text-white placeholder:text-secondary-400 focus:outline-none focus:ring-2 transition-all ${
                            errors.tourDate
                              ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                              : 'border-secondary-200 dark:border-secondary-700 focus:ring-primary-500 focus:border-primary-500'
                          }`}
                        />
                      </div>
                      {tourDate && (
                        <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Format: {getFormattedDateDisplay(tourDate)}
                        </p>
                      )}
                      {errors.tourDate && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.tourDate}</span>
                        </p>
                      )}
                    </div>

                    {/* FIELD 7: Participants */}
                    <div>
                      <label
                        htmlFor={`${formId}-participants`}
                        className="block text-xs font-black uppercase tracking-wider text-secondary-800 dark:text-secondary-200 mb-1.5"
                      >
                        Participants <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-400 z-10">
                          <Users className="w-4 h-4" />
                        </div>
                        <input
                          id={`${formId}-participants`}
                          type="number"
                          min="1"
                          max="50"
                          required
                          value={participants}
                          onChange={(e) => {
                            setParticipants(e.target.value);
                            if (errors.participants) setErrors((prev) => ({ ...prev, participants: '' }));
                          }}
                          placeholder="Number of people"
                          className={`w-full pl-10 pr-20 py-3 rounded-2xl text-sm font-semibold bg-secondary-50 dark:bg-secondary-800/80 border text-secondary-950 dark:text-white placeholder:text-secondary-400 focus:outline-none focus:ring-2 transition-all ${
                            errors.participants
                              ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                              : 'border-secondary-200 dark:border-secondary-700 focus:ring-primary-500 focus:border-primary-500'
                          }`}
                        />
                        {/* Quick +/- Steppers */}
                        <div className="absolute right-1.5 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handlePaxChange(-1)}
                            className="w-7 h-7 rounded-xl bg-secondary-200/80 dark:bg-secondary-700 hover:bg-secondary-300 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-200 flex items-center justify-center transition cursor-pointer"
                            aria-label="Decrease participants"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePaxChange(1)}
                            className="w-7 h-7 rounded-xl bg-secondary-200/80 dark:bg-secondary-700 hover:bg-secondary-300 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-200 flex items-center justify-center transition cursor-pointer"
                            aria-label="Increase participants"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {errors.participants && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.participants}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* FIELD 8: Pickup Location */}
                  <div>
                    <label
                      htmlFor={`${formId}-pickup`}
                      className="block text-xs font-black uppercase tracking-wider text-secondary-800 dark:text-secondary-200 mb-1.5"
                    >
                      Pickup Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-400">
                        <MapPin className="w-4 h-4 text-red-500" />
                      </div>
                      <input
                        id={`${formId}-pickup`}
                        type="text"
                        required
                        value={pickupLocation}
                        onChange={(e) => {
                          setPickupLocation(e.target.value);
                          if (errors.pickupLocation) setErrors((prev) => ({ ...prev, pickupLocation: '' }));
                        }}
                        placeholder="Hotel or Airport name"
                        className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium bg-secondary-50 dark:bg-secondary-800/80 border text-secondary-950 dark:text-white placeholder:text-secondary-400 focus:outline-none focus:ring-2 transition-all ${
                          errors.pickupLocation
                            ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                            : 'border-secondary-200 dark:border-secondary-700 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                      />
                    </div>
                    {/* Quick Pickup Pills */}
                    <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[11px] text-secondary-500 mr-1 font-medium">Quick selection:</span>
                      {QUICK_PICKUPS.map((spot) => (
                        <button
                          key={spot}
                          type="button"
                          onClick={() => {
                            setPickupLocation(spot);
                            if (errors.pickupLocation) setErrors((prev) => ({ ...prev, pickupLocation: '' }));
                          }}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                            pickupLocation === spot
                              ? 'bg-secondary-950 text-white dark:bg-white dark:text-secondary-950 border-secondary-950 font-bold'
                              : 'bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-300 hover:border-secondary-400'
                          }`}
                        >
                          {spot}
                        </button>
                      ))}
                    </div>
                    {errors.pickupLocation && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.pickupLocation}</span>
                      </p>
                    )}
                  </div>

                  {/* FIELD 9: Special Requests */}
                  <div>
                    <label
                      htmlFor={`${formId}-requests`}
                      className="block text-xs font-black uppercase tracking-wider text-secondary-800 dark:text-secondary-200 mb-1.5"
                    >
                      Special Requests
                      <span className="text-secondary-400 dark:text-secondary-500 font-normal lowercase ml-1">
                        (optional)
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute top-3.5 left-3.5 pointer-events-none text-secondary-400">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <textarea
                        id={`${formId}-requests`}
                        rows={3}
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Dietary restrictions or questions?"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium bg-secondary-50 dark:bg-secondary-800/80 border border-secondary-200 dark:border-secondary-700 text-secondary-950 dark:text-white placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* LIVE WHATSAPP PREVIEW TOGGLE (Accordion) */}
                  <div className="rounded-2xl border border-secondary-200 dark:border-secondary-800 overflow-hidden bg-secondary-50/60 dark:bg-secondary-800/40">
                    <button
                      type="button"
                      onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-secondary-700 dark:text-secondary-300 hover:text-secondary-950 dark:hover:text-white transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Eye className="w-3.5 h-3.5 text-[#25D366]" />
                        <span>Preview WhatsApp Message</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isPreviewOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isPreviewOpen && (
                      <div className="px-4 pb-4 pt-1 border-t border-secondary-200/80 dark:border-secondary-700/80">
                        <div className="bg-[#EFEAE2] dark:bg-secondary-950 p-3.5 rounded-xl font-mono text-[11px] text-secondary-900 dark:text-secondary-200 whitespace-pre-wrap leading-relaxed shadow-inner border border-secondary-300/40 dark:border-secondary-800">
                          {currentWhatsAppMessage}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TRUST BADGE & SAFETY NOTE */}
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-secondary-100/70 dark:bg-secondary-800/50 text-[11px] text-secondary-600 dark:text-secondary-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Your information is safe. Click below to connect directly with official Ijen Tour WhatsApp support.
                    </span>
                  </div>

                  {/* ACTION SUBMIT BUTTON */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5b] active:scale-[0.99] text-white font-black text-sm tracking-wide shadow-xl shadow-[#25D366]/30 hover:shadow-2xl hover:shadow-[#25D366]/40 transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70 group"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>PREPARING WHATSAPP...</span>
                        </>
                      ) : (
                        <>
                          <FaWhatsapp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span>CONTINUE TO WHATSAPP</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
