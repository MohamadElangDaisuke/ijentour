"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  Car,
  ShieldCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Copy,
  Plus,
  Minus,
  Mail,
  User,
  Globe,
  DollarSign,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import {
  CustomDestinationItem,
  DURATION_OPTIONS,
  TRANSPORT_OPTIONS,
  GUIDE_OPTIONS,
  ADDON_OPTIONS,
  calculateCustomTourEstimate,
  CustomTourPriceBreakdown,
  DESTINATION_PRICING_MAP,
  DEFAULT_DESTINATION_TICKET_PRICE,
} from "@/lib/customTour";
import { formatCurrency } from "@/lib/utils";
import { defaultDestinations } from "@/app/lib/destinationsStorage";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { CustomTripDestinationsSkeleton } from "@/app/component/ui/skeleton";

const POPULAR_NATIONALITIES = [
  "Indonesia",
  "Singapore",
  "Malaysia",
  "France",
  "Germany",
  "Australia",
  "Netherlands",
  "United States",
];

const QUICK_PICKUPS = [
  "Hotel in Banyuwangi Area",
  "Banyuwangi Airport (BWX)",
  "Ketapang Train Station",
  "Banyuwangi Kota Train Station",
  "Ketapang Ferry Port (from Bali)",
];

function CustomPackageBuilderContent() {
  const searchParams = useSearchParams();
  const [loadedFromAssistant, setLoadedFromAssistant] = useState<boolean>(false);

  // Wizard Step (1: Destinations, 2: Journey Parameters, 3: Pricing Breakdown, 4: Contact & Review, 5: Success)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Database destinations list
  const [destinations, setDestinations] = useState<CustomDestinationItem[]>([]);
  const [destinationsLoading, setDestinationsLoading] = useState(true);

  // Step 1: Selected Destinations
  const [selectedDestIds, setSelectedDestIds] = useState<string[]>([]);

  // Step 2: Journey Options
  const [departureDate, setDepartureDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [numParticipants, setNumParticipants] = useState<number>(2);
  const [selectedDurationId, setSelectedDurationId] = useState<string>("1d");
  const [selectedTransportId, setSelectedTransportId] = useState<string>("mpv");
  const [selectedGuideId, setSelectedGuideId] = useState<string>("certified-guide");
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([
    "gasmask-headlamp",
    "thermal-jacket",
  ]);
  const [specialRequests, setSpecialRequests] = useState<string>("");

  // Step 4: Contact Information
  const [fullName, setFullName] = useState<string>("");
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [nationality, setNationality] = useState<string>("Indonesia");
  const [pickupLocation, setPickupLocation] = useState<string>("Hotel in Banyuwangi Area");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submittedBooking, setSubmittedBooking] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split("T")[0];

  // Load destinations from API
  useEffect(() => {
    fetch("/api/destinations")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.destinations) && data.destinations.length > 0) {
          const mapped: CustomDestinationItem[] = data.destinations.map((d: any) => ({
            id: d.id,
            name: d.name,
            slug: d.slug,
            description: d.description,
            image: d.image,
            tag: d.tag || "Must Visit",
            ticketPrice:
              DESTINATION_PRICING_MAP[d.slug] ??
              DESTINATION_PRICING_MAP[d.id] ??
              DEFAULT_DESTINATION_TICKET_PRICE,
          }));
          setDestinations(mapped);
          // Default select Mount Ijen if available
          const ijen = mapped.find(
            (d) => d.slug?.includes("ijen") || d.name.toLowerCase().includes("ijen")
          );
          if (ijen) {
            setSelectedDestIds([ijen.id]);
          } else if (mapped[0]) {
            setSelectedDestIds([mapped[0].id]);
          }
        } else {
          // Fallback to default destinations
          const fallbackMapped: CustomDestinationItem[] = defaultDestinations.map((d) => ({
            id: d.id,
            name: d.name,
            slug: d.id,
            description: d.description,
            image: d.image,
            tag: d.tag || "Highlight",
            ticketPrice: DESTINATION_PRICING_MAP[d.id] ?? DEFAULT_DESTINATION_TICKET_PRICE,
          }));
          setDestinations(fallbackMapped);
          setSelectedDestIds([fallbackMapped[0].id]);
        }
      })
      .catch(() => {
        const fallbackMapped: CustomDestinationItem[] = defaultDestinations.map((d) => ({
          id: d.id,
          name: d.name,
          slug: d.id,
          description: d.description,
          image: d.image,
          tag: d.tag || "Highlight",
          ticketPrice: DESTINATION_PRICING_MAP[d.id] ?? DEFAULT_DESTINATION_TICKET_PRICE,
        }));
        setDestinations(fallbackMapped);
        setSelectedDestIds([fallbackMapped[0].id]);
      })
      .finally(() => setDestinationsLoading(false));
  }, []);

  // Prefill options from URL search params (e.g. from AI Travel Assistant)
  useEffect(() => {
    if (destinations.length === 0) return;

    const paramDests = searchParams.get("destinations");
    const paramDuration = searchParams.get("duration");
    const paramDate = searchParams.get("date");
    const paramPax = searchParams.get("pax");
    const paramTransport = searchParams.get("transport");
    const paramGuide = searchParams.get("guide");
    const paramAddons = searchParams.get("addons");
    const paramRequests = searchParams.get("requests");

    let hasPrefill = false;

    if (paramDests) {
      const slugsOrIds = paramDests.split(",").map((s) => s.trim().toLowerCase());
      const matched = destinations.filter(
        (d) =>
          slugsOrIds.includes(d.id.toLowerCase()) ||
          (d.slug && slugsOrIds.includes(d.slug.toLowerCase())) ||
          slugsOrIds.some((s) => d.name.toLowerCase().includes(s))
      );
      if (matched.length > 0) {
        setSelectedDestIds(matched.map((m) => m.id));
        hasPrefill = true;
      }
    }

    if (paramDuration && DURATION_OPTIONS.some((d) => d.id === paramDuration)) {
      setSelectedDurationId(paramDuration);
      hasPrefill = true;
    }

    if (paramDate && /^\d{4}-\d{2}-\d{2}$/.test(paramDate)) {
      setDepartureDate(paramDate);
      hasPrefill = true;
    }

    if (paramPax && Number(paramPax) > 0) {
      setNumParticipants(Math.max(1, Math.min(50, Number(paramPax))));
      hasPrefill = true;
    }

    if (paramTransport && TRANSPORT_OPTIONS.some((t) => t.id === paramTransport)) {
      setSelectedTransportId(paramTransport);
      hasPrefill = true;
    }

    if (paramGuide && GUIDE_OPTIONS.some((g) => g.id === paramGuide)) {
      setSelectedGuideId(paramGuide);
      hasPrefill = true;
    }

    if (paramAddons) {
      const addonList = paramAddons.split(",").map((a) => a.trim());
      const validAddons = ADDON_OPTIONS.filter((a) => addonList.includes(a.id)).map((a) => a.id);
      if (validAddons.length > 0) {
        setSelectedAddonIds(validAddons);
        hasPrefill = true;
      }
    }

    if (paramRequests) {
      setSpecialRequests(paramRequests);
      hasPrefill = true;
    }

    if (hasPrefill) {
      setLoadedFromAssistant(true);
      setCurrentStep(2); // Automatically advance to journey parameters so user sees prefilled options
    }
  }, [destinations, searchParams]);

  // Compute Selected Destination Objects
  const selectedDestinations = destinations.filter((d) => selectedDestIds.includes(d.id));

  // Compute Live Estimate
  const breakdown: CustomTourPriceBreakdown = calculateCustomTourEstimate({
    destinations: selectedDestinations,
    durationId: selectedDurationId,
    transportId: selectedTransportId,
    guideId: selectedGuideId,
    addonIds: selectedAddonIds,
    numParticipants,
  });

  // Toggle Destination Selection
  const toggleDestination = (id: string) => {
    setSelectedDestIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) {
          setErrorMsg("Please select at least 1 destination for your tour.");
          return prev;
        }
        setErrorMsg("");
        return prev.filter((item) => item !== id);
      } else {
        setErrorMsg("");
        return [...prev, id];
      }
    });
  };

  // Toggle Add-on Selection
  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Step 2 & 4 Validation
  const validateContactForm = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = "Full name is required.";
    if (!whatsappNumber.trim()) {
      errors.whatsappNumber = "WhatsApp number is required.";
    } else if (whatsappNumber.replace(/[^0-9]/g, "").length < 8) {
      errors.whatsappNumber = "Enter a valid phone number (at least 8 digits).";
    }
    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email format.";
    }
    if (!pickupLocation.trim()) errors.pickupLocation = "Pickup location is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateContactForm()) {
      setCurrentStep(4);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        bookingType: "CUSTOM",
        customerName: fullName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        customerEmail: email.trim(),
        customerPhone: whatsappNumber.trim(),
        departureDate,
        numParticipants,
        destinations: selectedDestinations.map((d) => ({
          id: d.id,
          name: d.name,
          slug: d.slug,
        })),
        durationId: selectedDurationId,
        transportId: selectedTransportId,
        guideId: selectedGuideId,
        addonIds: selectedAddonIds,
        pickupLocation: pickupLocation.trim(),
        specialRequests: `Nationality: ${nationality}\n${specialRequests.trim()}`,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit custom trip request.");
      }

      setSubmittedBooking(data.booking);
      setCurrentStep(5);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyBookingCode = () => {
    if (submittedBooking?.bookingCode) {
      navigator.clipboard.writeText(submittedBooking.bookingCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <div className="bg-secondary-50 text-secondary-950 min-h-screen pb-24">
      {/* HERO BANNER */}
      <section className="relative h-[38vh] min-h-72 flex items-center justify-center text-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/pkg-crater.png')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-secondary-950/85 via-secondary-950/75 to-secondary-950/90" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 mt-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Build Your Own Trip</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Custom Tour Package Builder
          </h1>
          <p className="text-xs sm:text-sm text-secondary-200 max-w-2xl mx-auto leading-relaxed">
            Personalize your dream expedition across Mount Ijen and East Java. Select your
            destinations, travel duration, private transport, and local guides with transparent
            cost estimations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant'))}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition cursor-pointer backdrop-blur-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary-400" />
              <span>Need recommendations? Ask Tour Assistant</span>
            </button>
          </div>
        </div>
      </section>

      {/* TOUR ASSISTANT PREFILL BANNER */}
      {loadedFromAssistant && (
        <div className="max-w-5xl mx-auto px-4 -mt-2 mb-4 relative z-30">
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 backdrop-blur-sm text-secondary-950 flex items-center justify-between gap-3 shadow-md animate-fade-in">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs sm:text-sm font-bold">
                ✨ Synchronized with Ijen Tour Assistant:
                <span className="font-normal text-secondary-700 ml-1">
                  Your destination, date, transport, and participant preferences have been prefilled into the custom builder.
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLoadedFromAssistant(false)}
              className="text-secondary-500 hover:text-secondary-900 text-xs font-bold px-2 py-1 rounded-lg hover:bg-white/60 transition cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* STEPPER PROGRESS INDICATOR */}
      <div className="max-w-5xl mx-auto px-4 -mt-6 relative z-20">
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-secondary-200">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { num: 1, label: "Destinations", icon: MapPin },
              { num: 2, label: "Trip Setup", icon: Calendar },
              { num: 3, label: "Price Estimate", icon: DollarSign },
              { num: 4, label: "Review & Send", icon: ShieldCheck },
            ].map((step) => {
              const isDone = currentStep > step.num || currentStep === 5;
              const isCurrent = currentStep === step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  disabled={currentStep === 5}
                  onClick={() => {
                    if (step.num < currentStep || currentStep !== 5) {
                      setCurrentStep(step.num);
                    }
                  }}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 py-2 px-1 rounded-2xl transition cursor-pointer ${
                    isCurrent
                      ? "bg-secondary-950 text-white font-black shadow-sm"
                      : isDone
                      ? "bg-emerald-50 text-emerald-800 font-bold"
                      : "bg-secondary-50 text-secondary-500 font-medium hover:bg-secondary-100"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      isCurrent
                        ? "bg-primary-500 text-secondary-950 font-black"
                        : isDone
                        ? "bg-emerald-500 text-white"
                        : "bg-secondary-200 text-secondary-700"
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : step.num}
                  </div>
                  <span className="hidden sm:inline text-xs">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ERROR BANNER */}
      {errorMsg && (
        <div className="max-w-5xl mx-auto px-4 mt-6">
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        </div>
      )}

      {/* MAIN WIZARD CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
        {/* ========================================================= */}
        {/* STEP 1: SELECT DESTINATIONS */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-secondary-100">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-primary-600">
                  Step 1 of 4
                </span>
                <h2 className="text-2xl font-black text-secondary-950">
                  Choose Your Destinations
                </h2>
                <p className="text-xs text-secondary-600 mt-1">
                  Select one or multiple destinations you want to explore during your private trip.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-900 border border-primary-200 px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 self-start sm:self-auto">
                <CheckCircle2 className="w-4 h-4 text-primary-600" />
                <span>{selectedDestIds.length} Selected</span>
              </div>
            </div>

            {destinationsLoading ? (
              <CustomTripDestinationsSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {destinations.map((dest) => {
                  const isSelected = selectedDestIds.includes(dest.id);
                  return (
                    <div
                      key={dest.id}
                      onClick={() => toggleDestination(dest.id)}
                      className={`group relative rounded-2xl border p-4 transition-all cursor-pointer overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? "border-primary-500 bg-primary-50/20 ring-2 ring-primary-500/20 shadow-md"
                          : "border-secondary-200 bg-white hover:border-secondary-300 hover:shadow-xs"
                      }`}
                    >
                      <div>
                        <div className="relative aspect-16/10 rounded-xl overflow-hidden mb-3 bg-secondary-100">
                          <img
                            src={dest.image || "/images/pkg-bluefire.png"}
                            alt={dest.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/pkg-bluefire.png";
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <span className="absolute top-2.5 left-2.5 bg-secondary-950/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                            {dest.tag || "Destination"}
                          </span>
                          <div
                            className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center transition ${
                              isSelected
                                ? "bg-primary-500 text-secondary-950 font-black shadow-md scale-110"
                                : "bg-white/90 text-secondary-400"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        <h3 className="font-extrabold text-secondary-950 text-base leading-snug mb-1 group-hover:text-primary-600 transition">
                          {dest.name}
                        </h3>
                        <p className="text-xs text-secondary-600 line-clamp-2 leading-relaxed">
                          {dest.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-secondary-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-secondary-500 block">
                            Entrance / Permit
                          </span>
                          <span className="font-extrabold text-secondary-950">
                            {formatCurrency(dest.ticketPrice)}{" "}
                            <span className="text-[10px] font-normal text-secondary-500">
                              / pax
                            </span>
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition ${
                            isSelected
                              ? "bg-primary-500 text-secondary-950"
                              : "bg-secondary-100 text-secondary-700 group-hover:bg-secondary-950 group-hover:text-white"
                          }`}
                        >
                          {isSelected ? "Selected ✓" : "Add to Trip"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step 1 Actions */}
            <div className="pt-6 border-t border-secondary-100 flex justify-between items-center">
              <span className="text-xs text-secondary-500">
                Tip: You can combine mountain treks with safari savannas or tropical beaches.
              </span>
              <button
                type="button"
                onClick={() => {
                  if (selectedDestIds.length === 0) {
                    setErrorMsg("Please select at least 1 destination to proceed.");
                    return;
                  }
                  setErrorMsg("");
                  setCurrentStep(2);
                }}
                className="px-6 py-3 rounded-2xl bg-secondary-950 hover:bg-primary-500 hover:text-secondary-950 text-white font-extrabold text-xs transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Trip Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: JOURNEY PARAMETERS & SETUP */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200 shadow-sm space-y-8">
            <div className="pb-5 border-b border-secondary-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-primary-600">
                Step 2 of 4
              </span>
              <h2 className="text-2xl font-black text-secondary-950">
                Setup Travel Details & Services
              </h2>
              <p className="text-xs text-secondary-600 mt-1">
                Configure your dates, participants, private vehicle charter, and guide preferences.
              </p>
            </div>

            {/* PART 1: DATE & PARTICIPANTS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-secondary-950 mb-1.5">
                  Departure Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-semibold bg-secondary-50 border border-secondary-200 text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-secondary-950 mb-1.5">
                  Number of Participants <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={numParticipants}
                    onChange={(e) =>
                      setNumParticipants(Math.max(1, Math.min(50, Number(e.target.value) || 1)))
                    }
                    className="w-full pl-10 pr-24 py-3 rounded-2xl text-xs font-bold bg-secondary-50 border border-secondary-200 text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setNumParticipants((prev) => Math.max(1, prev - 1))}
                      className="w-7 h-7 rounded-xl bg-secondary-200 hover:bg-secondary-300 text-secondary-800 flex items-center justify-center transition cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setNumParticipants((prev) => Math.min(50, prev + 1))}
                      className="w-7 h-7 rounded-xl bg-secondary-200 hover:bg-secondary-300 text-secondary-800 flex items-center justify-center transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* PART 2: DURATION */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-secondary-950">
                Trip Duration & Schedule
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DURATION_OPTIONS.map((dur) => {
                  const isSelected = selectedDurationId === dur.id;
                  return (
                    <div
                      key={dur.id}
                      onClick={() => setSelectedDurationId(dur.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-primary-500 bg-primary-50/30 ring-2 ring-primary-500/20"
                          : "border-secondary-200 bg-secondary-50/50 hover:border-secondary-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-xs text-secondary-950">
                            {dur.name}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-primary-600 font-bold" />}
                        </div>
                        <p className="text-[11px] text-secondary-600 leading-relaxed">
                          {dur.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PART 3: TRANSPORTATION */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-secondary-950">
                Private Transportation (Driver + Fuel Included)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TRANSPORT_OPTIONS.map((trans) => {
                  const isSelected = selectedTransportId === trans.id;
                  return (
                    <div
                      key={trans.id}
                      onClick={() => setSelectedTransportId(trans.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-primary-500 bg-primary-50/30 ring-2 ring-primary-500/20"
                          : "border-secondary-200 bg-secondary-50/50 hover:border-secondary-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-xs text-secondary-950">
                            {trans.name}
                          </span>
                          <span className="font-mono text-xs font-bold text-primary-700">
                            {trans.pricePerDay === 0
                              ? "Free"
                              : `${formatCurrency(trans.pricePerDay)}/day`}
                          </span>
                        </div>
                        <span className="text-[10px] bg-secondary-200/80 text-secondary-700 px-2 py-0.5 rounded font-bold inline-block mb-1">
                          {trans.capacity}
                        </span>
                        <p className="text-[11px] text-secondary-600 leading-relaxed">
                          {trans.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PART 4: GUIDE */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-secondary-950">
                Tour Guide & Assistant Service
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {GUIDE_OPTIONS.map((guide) => {
                  const isSelected = selectedGuideId === guide.id;
                  return (
                    <div
                      key={guide.id}
                      onClick={() => setSelectedGuideId(guide.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-primary-500 bg-primary-50/30 ring-2 ring-primary-500/20"
                          : "border-secondary-200 bg-secondary-50/50 hover:border-secondary-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-xs text-secondary-950">
                            {guide.name}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-primary-600" />}
                        </div>
                        <span className="text-xs font-bold text-primary-700 block mb-1">
                          {guide.pricePerDay === 0
                            ? "Free"
                            : `${formatCurrency(guide.pricePerDay)}/day`}
                        </span>
                        <p className="text-[11px] text-secondary-600 leading-relaxed">
                          {guide.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PART 5: OPERATIONAL ADDONS */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-secondary-950">
                Optional Facilities & Gear Add-ons
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ADDON_OPTIONS.map((addon) => {
                  const isSelected = selectedAddonIds.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? "border-primary-500 bg-primary-50/20"
                          : "border-secondary-200 bg-secondary-50/40 hover:border-secondary-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center mt-0.5 shrink-0 transition ${
                          isSelected
                            ? "bg-primary-500 text-secondary-950 font-bold"
                            : "border border-secondary-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div className="grow text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-secondary-950">{addon.name}</span>
                          <span className="font-mono text-primary-700 font-bold shrink-0">
                            {formatCurrency(addon.price)}
                            <span className="text-[10px] text-secondary-500 font-normal">
                              {addon.perPerson ? "/pax" : "/trip"}
                            </span>
                          </span>
                        </div>
                        <p className="text-[11px] text-secondary-600 mt-0.5 leading-relaxed">
                          {addon.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-secondary-950 mb-1.5">
                Special Requests / Dietary / Notes
              </label>
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Vegetarian meal preferences, child car seat requirement, pickup flight details..."
                className="w-full px-4 py-3 rounded-2xl text-xs bg-secondary-50 border border-secondary-200 text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Step 2 Actions */}
            <div className="pt-6 border-t border-secondary-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl border border-secondary-300 text-secondary-700 font-bold text-xs hover:bg-secondary-100 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 rounded-2xl bg-secondary-950 hover:bg-primary-500 hover:text-secondary-950 text-white font-extrabold text-xs transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>View Price Breakdown</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: PRICE BREAKDOWN & ESTIMATION */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200 shadow-sm space-y-6">
            <div className="pb-5 border-b border-secondary-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-primary-600">
                Step 3 of 4
              </span>
              <h2 className="text-2xl font-black text-secondary-950">
                Transparent Cost Estimation
              </h2>
              <p className="text-xs text-secondary-600 mt-1">
                Here is a transparent breakdown of your personalized itinerary based on official
                park levies and private logistics.
              </p>
            </div>

            {/* Breakdown Table */}
            <div className="bg-secondary-50 rounded-2xl border border-secondary-200 overflow-hidden text-xs">
              <div className="p-4 bg-secondary-100/70 border-b border-secondary-200 font-black text-secondary-900 uppercase tracking-wider text-[11px] flex justify-between">
                <span>Itinerary Component</span>
                <span>Subtotal (IDR)</span>
              </div>

              <div className="divide-y divide-secondary-200/60 p-2 sm:p-4 space-y-2">
                {/* 1. Destinations */}
                <div className="pt-2">
                  <div className="flex justify-between font-bold text-secondary-950 mb-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary-600" />
                      <span>Destinations Admission & Conservation ({numParticipants} Guests)</span>
                    </span>
                    <span className="font-black text-secondary-950">
                      {formatCurrency(breakdown.destinationsTotal)}
                    </span>
                  </div>
                  <ul className="pl-5 space-y-1 text-[11px] text-secondary-600">
                    {breakdown.destinationsList.map((d, i) => (
                      <li key={i} className="flex justify-between">
                        <span>
                          {d.name} ({formatCurrency(d.unitPrice)} × {numParticipants} pax)
                        </span>
                        <span>{formatCurrency(d.total)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Transportation */}
                <div className="pt-3">
                  <div className="flex justify-between font-bold text-secondary-950 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-primary-600" />
                      <span>Private Transport Charter ({breakdown.durationDays} Days)</span>
                    </span>
                    <span className="font-black text-secondary-950">
                      {formatCurrency(breakdown.transportTotal)}
                    </span>
                  </div>
                  <p className="pl-5 text-[11px] text-secondary-600 flex justify-between">
                    <span>
                      {breakdown.transportName} ({formatCurrency(breakdown.transportDailyPrice)} ×{" "}
                      {breakdown.durationDays} day)
                    </span>
                    <span>{formatCurrency(breakdown.transportTotal)}</span>
                  </p>
                </div>

                {/* 3. Guide */}
                <div className="pt-3">
                  <div className="flex justify-between font-bold text-secondary-950 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-primary-600" />
                      <span>Tour Guide & Assistant ({breakdown.durationDays} Days)</span>
                    </span>
                    <span className="font-black text-secondary-950">
                      {formatCurrency(breakdown.guideTotal)}
                    </span>
                  </div>
                  <p className="pl-5 text-[11px] text-secondary-600 flex justify-between">
                    <span>
                      {breakdown.guideName} ({formatCurrency(breakdown.guideDailyPrice)} ×{" "}
                      {breakdown.durationDays} day)
                    </span>
                    <span>{formatCurrency(breakdown.guideTotal)}</span>
                  </p>
                </div>

                {/* 4. Addons */}
                {breakdown.addonsList.length > 0 && (
                  <div className="pt-3">
                    <div className="flex justify-between font-bold text-secondary-950 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                        <span>Optional Gear & Facilities</span>
                      </span>
                      <span className="font-black text-secondary-950">
                        {formatCurrency(breakdown.addonsTotal)}
                      </span>
                    </div>
                    <ul className="pl-5 space-y-1 text-[11px] text-secondary-600">
                      {breakdown.addonsList.map((a, i) => (
                        <li key={i} className="flex justify-between">
                          <span>
                            {a.name} ({formatCurrency(a.unitPrice)} × {a.qty})
                          </span>
                          <span>{formatCurrency(a.total)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Total Card */}
              <div className="p-4 bg-primary-100/60 border-t border-primary-200 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-primary-800 block">
                    Total Estimated Expedition Cost
                  </span>
                  <span className="text-xs text-secondary-600">
                    For {numParticipants} participant(s) • {breakdown.durationName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-secondary-950">
                    {formatCurrency(breakdown.estimatedTotal)}
                  </span>
                  <span className="text-[10px] text-secondary-600 block">
                    (Approx. {formatCurrency(Math.round(breakdown.estimatedTotal / numParticipants))} / person)
                  </span>
                </div>
              </div>
            </div>

            {/* IMPORTANT DISCLAIMER NOTICE */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
              <Info className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <p className="font-extrabold">Estimated Cost vs Final Approved Price:</p>
                <p className="text-amber-900">
                  The amount displayed above is a <strong>transparent operational estimate</strong>.
                  Before payment, our tour coordinator will examine road conditions, permit
                  availability, and seasonal crater policies, then contact you via WhatsApp with the
                  guaranteed final price. No advance payment is charged until you agree to the final
                  quote!
                </p>
              </div>
            </div>

            {/* Step 3 Actions */}
            <div className="pt-6 border-t border-secondary-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl border border-secondary-300 text-secondary-700 font-bold text-xs hover:bg-secondary-100 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Adjust Journey Options</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 rounded-2xl bg-secondary-950 hover:bg-primary-500 hover:text-secondary-950 text-white font-extrabold text-xs transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Enter Contact Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 4: CONTACT INFORMATION & FINAL REVIEW */}
        {/* ========================================================= */}
        {currentStep === 4 && (
          <form
            onSubmit={handleSubmitBooking}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200 shadow-sm space-y-8"
          >
            <div className="pb-5 border-b border-secondary-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-primary-600">
                Step 4 of 4
              </span>
              <h2 className="text-2xl font-black text-secondary-950">
                Contact Details & Final Review
              </h2>
              <p className="text-xs text-secondary-600 mt-1">
                Provide your WhatsApp number and pickup location so our team can send your custom
                itinerary proposal.
              </p>
            </div>

            {/* GUEST INPUT FORM */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-secondary-950 mb-1.5">
                    Lead Traveler Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (formErrors.fullName) setFormErrors((prev) => ({ ...prev, fullName: "" }));
                      }}
                      placeholder="e.g. Johnathan Smith"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs bg-secondary-50 border border-secondary-200 text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  {formErrors.fullName && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-secondary-950 mb-1.5">
                    WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#25D366]">
                      <FaWhatsapp className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={whatsappNumber}
                      onChange={(e) => {
                        setWhatsappNumber(e.target.value);
                        if (formErrors.whatsappNumber)
                          setFormErrors((prev) => ({ ...prev, whatsappNumber: "" }));
                      }}
                      placeholder="e.g. +62 812 3456 7890"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs bg-secondary-50 border border-secondary-200 text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  {formErrors.whatsappNumber && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.whatsappNumber}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Address */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-secondary-950 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      placeholder="johnathan@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs bg-secondary-50 border border-secondary-200 text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-secondary-950 mb-1.5">
                    Nationality / Country
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="e.g. France, Singapore"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs bg-secondary-50 border border-secondary-200 text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  {/* Quick Pills */}
                  <div className="mt-2 flex flex-wrap gap-1 items-center">
                    <span className="text-[10px] text-secondary-500 mr-1">Quick:</span>
                    {POPULAR_NATIONALITIES.map((nation) => (
                      <button
                        key={nation}
                        type="button"
                        onClick={() => setNationality(nation)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                          nationality === nation
                            ? "bg-primary-500 text-secondary-950 font-bold border-primary-500"
                            : "bg-secondary-50 border-secondary-200 text-secondary-700 hover:border-primary-400"
                        }`}
                      >
                        {nation}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pickup Location */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-secondary-950 mb-1.5">
                  Pickup Location in Banyuwangi / East Java <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-red-500">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={pickupLocation}
                    onChange={(e) => {
                      setPickupLocation(e.target.value);
                      if (formErrors.pickupLocation)
                        setFormErrors((prev) => ({ ...prev, pickupLocation: "" }));
                    }}
                    placeholder="Hotel name, airport, or train station"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs bg-secondary-50 border border-secondary-200 text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                {/* Quick Pickup Pills */}
                <div className="mt-2 flex flex-wrap gap-1 items-center">
                  <span className="text-[10px] text-secondary-500 mr-1">Quick:</span>
                  {QUICK_PICKUPS.map((spot) => (
                    <button
                      key={spot}
                      type="button"
                      onClick={() => setPickupLocation(spot)}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                        pickupLocation === spot
                          ? "bg-primary-500 text-secondary-950 font-bold border-primary-500"
                          : "bg-secondary-50 border-secondary-200 text-secondary-700 hover:border-primary-400"
                      }`}
                    >
                      {spot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ORDER SUMMARY RECAP */}
            <div className="p-4 bg-secondary-50 rounded-2xl border border-secondary-200 text-xs space-y-3">
              <span className="font-extrabold text-secondary-900 block">
                Itinerary Overview to be Requested:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-secondary-700">
                <div>
                  <span className="text-secondary-500 block text-[10px]">Destinations:</span>
                  <p className="font-bold text-secondary-950">
                    {selectedDestinations.map((d) => d.name).join(" • ")}
                  </p>
                </div>
                <div>
                  <span className="text-secondary-500 block text-[10px]">Schedule & Party:</span>
                  <p className="font-bold text-secondary-950">
                    {departureDate} • {numParticipants} Guests ({breakdown.durationName})
                  </p>
                </div>
                <div>
                  <span className="text-secondary-500 block text-[10px]">Logistics:</span>
                  <p className="font-bold text-secondary-950">
                    {breakdown.transportName} • {breakdown.guideName}
                  </p>
                </div>
                <div>
                  <span className="text-secondary-500 block text-[10px]">Estimated Price:</span>
                  <p className="font-black text-primary-700 text-sm">
                    {formatCurrency(breakdown.estimatedTotal)}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 Actions */}
            <div className="pt-6 border-t border-secondary-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl border border-secondary-300 text-secondary-700 font-bold text-xs hover:bg-secondary-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Price Breakdown</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-2xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary-950"></div>
                    <span>Sending Custom Request...</span>
                  </>
                ) : (
                  <>
                    <FaWhatsapp className="w-4 h-4 text-secondary-950" />
                    <span>Submit Custom Trip Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* STEP 5: SUCCESS & CONFIRMATION */}
        {/* ========================================================= */}
        {currentStep === 5 && submittedBooking && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-secondary-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Request Successfully Received
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-secondary-950">
                Your Custom Expedition is in Motion!
              </h2>
              <p className="text-xs sm:text-sm text-secondary-600 leading-relaxed">
                Thank you, <strong>{submittedBooking.customerName}</strong>. Our head tour
                coordinator has received your custom trip request and is preparing your personalized
                itinerary proposal.
              </p>
            </div>

            {/* Official Booking Code Box */}
            <div className="max-w-md mx-auto p-4 bg-secondary-50 border border-secondary-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="text-left">
                <span className="text-[10px] text-secondary-500 uppercase font-bold block">
                  Official Reservation Code
                </span>
                <span className="font-mono text-base font-black text-primary-600">
                  {submittedBooking.bookingCode}
                </span>
              </div>
              <button
                type="button"
                onClick={copyBookingCode}
                className="px-3 py-2 bg-white hover:bg-secondary-100 text-secondary-800 border border-secondary-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Itinerary Summary */}
            <div className="max-w-md mx-auto bg-secondary-50/80 p-4 rounded-2xl border border-secondary-100 text-left text-xs space-y-2">
              <p className="font-bold text-secondary-950">
                🗺️ {submittedBooking.packageName}
              </p>
              <p className="text-secondary-600">
                📅 Date: {submittedBooking.departureDate} • {submittedBooking.numParticipants} Person(s)
              </p>
              <p className="text-secondary-600">
                📍 Pickup: {submittedBooking.pickupLocation}
              </p>
              <p className="font-black text-primary-700 pt-1 border-t border-secondary-200/80">
                Estimated Price: {formatCurrency(submittedBooking.totalPrice)}
              </p>
            </div>

            {/* Direct WhatsApp Call to Action */}
            <div className="pt-2 max-w-md mx-auto flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={getWhatsAppLink(
                  `Hello Ijen Tour! I just submitted a custom tour request with code: *${submittedBooking.bookingCode}* for ${submittedBooking.customerName}. Looking forward to discussing the final itinerary!`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-md"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>Chat with Coordinator on WhatsApp</span>
              </a>

              <Link
                href="/booking"
                className="px-5 py-3.5 rounded-2xl border border-secondary-300 hover:bg-secondary-100 text-secondary-800 font-bold text-xs flex items-center justify-center transition"
              >
                <span>Track Reservation Status</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomPackageBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="py-32 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-xs text-secondary-500 mt-3 font-semibold">
            Loading Custom Tour Package Builder...
          </p>
        </div>
      }
    >
      <CustomPackageBuilderContent />
    </Suspense>
  );
}
