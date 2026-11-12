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
  { id: "general", label: "General Info", short: "General", icon: Package },
  { id: "pricing", label: "Pricing & Schedule", short: "Pricing", icon: DollarSign },
  { id: "media", label: "Media & Photos", short: "Media", icon: ImageIcon },
  { id: "itinerary", label: "Itinerary", short: "Itinerary", icon: Calendar },
  { id: "facilities", label: "Facilities (Inclusions)", short: "Facilities", icon: ShieldCheck },
  { id: "highlights_packing", label: "Packing List", short: "Checklist", icon: Sparkles },
  { id: "faqs_addons", label: "FAQs & Add-ons", short: "FAQ & Addon", icon: HelpCircle },
  { id: "seo", label: "SEO & Publishing", short: "Publish", icon: Globe },
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
  const [duration, setDuration] = useState(initialData?.duration || "1 Day (Midnight)");
  const [durationDays, setDurationDays] = useState<number>(initialData?.durationDays ?? 1);
  const [durationNights, setDurationNights] = useState<number>(initialData?.durationNights ?? 0);
  const [minParticipants, setMinParticipants] = useState<number>(initialData?.minParticipants ?? 1);
  const [maxParticipants, setMaxParticipants] = useState<number>(initialData?.maxParticipants ?? 15);
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "Moderate (3 km Trekking)");
  const [altitude, setAltitude] = useState(initialData?.altitude || "2,769 masl");
  const [meetingPoint, setMeetingPoint] = useState(initialData?.meetingPoint || "Banyuwangi (Hotel / Station / Airport)");
  const [pickupArea, setPickupArea] = useState(initialData?.pickupArea || "Banyuwangi City Area & Surrounds");
  const [departureTime, setDepartureTime] = useState(initialData?.departureTime || "00:00 - 00:30 WIB (Midnight)");
  const [recommendedAge, setRecommendedAge] = useState(initialData?.recommendedAge || "7 - 65 Years");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [safetyInfo, setSafetyInfo] = useState(initialData?.safetyInfo || "");
  const [importantNotes, setImportantNotes] = useState(initialData?.importantNotes || "");

  // Pricing
  const [basePrice, setBasePrice] = useState<number>(initialData?.basePrice ?? 750000);
  const [price, setPrice] = useState(initialData?.price || "Rp 750.000");
  const [currency, setCurrency] = useState(initialData?.currency || "IDR");
  const [pricingUnit, setPricingUnit] = useState(initialData?.pricingUnit || "per person");
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
        title: "Pickup at Hotel / Station",
        desc: "Our driver will pick you up at your hotel or station in the Banyuwangi area with a comfortable air-conditioned vehicle.",
        location: "Banyuwangi City Area",
        note: "Please be ready 15 minutes before pickup time.",
      },
      {
        day: "01:30 WIB",
        startTime: "01:30",
        endTime: "02:00",
        title: "Arrive at Paltuding Basecamp & Briefing",
        desc: "Safety briefing from our local guide and distribution of sulfur gas respirator masks and headlamps.",
        location: "Paltuding Post",
        note: "Check respirator mask fit and headlamp battery.",
      },
      {
        day: "02:00 WIB",
        startTime: "02:00",
        endTime: "03:45",
        title: "Start Ascent via Mount Ijen Trail",
        desc: "Guided 3 km hike toward the crater rim beneath a starry night sky.",
        location: "Ijen Trekking Trail",
        note: "The initial trail is steep; maintain a steady, comfortable pace.",
      },
      {
        day: "03:45 WIB",
        startTime: "03:45",
        endTime: "05:15",
        title: "Blue Fire Phenomenon Exploration",
        desc: "Descend to the crater floor with your guide to witness the rare and mesmerizing electric-blue flames.",
        location: "Ijen Crater Floor",
        note: "Wear your respirator mask properly when approaching the solfatara vents.",
      },
      {
        day: "05:15 WIB",
        startTime: "05:15",
        endTime: "07:00",
        title: "Golden Sunrise & Turquoise Acid Lake",
        desc: "Watch the sunrise illuminate the world's largest acidic crater lake.",
        location: "Ijen Crater Rim",
        note: "Best photo spot with your guide.",
      },
      {
        day: "07:00 WIB",
        startTime: "07:00",
        endTime: "08:30",
        title: "Return to Basecamp & Refreshment",
        desc: "Relaxed descent back to basecamp for hot drinks and light snacks.",
        location: "Paltuding Post",
      },
      {
        day: "08:30 WIB",
        startTime: "08:30",
        endTime: "10:00",
        title: "Drop-off at Hotel / Station",
        desc: "Return transfer to your hotel or agreed drop-off point in Banyuwangi.",
        location: "Banyuwangi",
        note: "Tour concludes with unforgettable memories.",
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
      { item: "Round-Trip AC Transportation from Banyuwangi Hotel/Station" },
      { item: "Official BKSDA / Mount Ijen Entrance Ticket & Visitor Insurance" },
      { item: "Licensed Local Guide (Former Sulfur Miner)" },
      { item: "Sulfur-Grade Medical Gas Respirator Mask" },
      { item: "Headlamp / Illumination Gear" },
      { item: "Mineral Water & Warm Snacks" },
      { item: "Standard Mountain First-Aid Kit" },
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
      { item: "Personal Expenses Outside the Package" },
      { item: "Crater Trolley Taxi Cart (Optional if fatigued)" },
      { item: "Additional Full Meals" },
      { item: "Voluntary Tips for Guide / Driver" },
    ];
  });

  // Highlights
  const [highlights, setHighlights] = useState<string[]>(() => {
    if (Array.isArray(initialData?.highlights) && initialData.highlights.length > 0) {
      return initialData.highlights;
    }
    return [
      "Midnight 00:00 Departure from Banyuwangi",
      "Licensed Local Sulfur-Miner Guide",
      "Safety-Standard Respirator Mask & Headlamp",
      "Sunrise & World's Largest Acidic Lake Photo Spot",
      "Private AC Vehicle Pickup & Drop-off",
    ];
  });

  // Packing List
  const [packingList, setPackingList] = useState<PackingItem[]>(() => {
    if (Array.isArray(initialData?.packingList) && initialData.packingList.length > 0) {
      return initialData.packingList;
    }
    return [
      { item: "Warm Jacket / Windbreaker", note: "Early-morning summit temperatures can drop to 6°C - 10°C", category: "Clothing" },
      { item: "Trekking Shoes / Anti-Slip Sneakers", note: "Sandy and steep uphill trail", category: "Footwear" },
      { item: "Long Pants & Thick Socks", note: "Protection against cold temperatures and dust", category: "Clothing" },
      { item: "Camera / Smartphone & Powerbank", note: "To capture Blue Fire & Sunrise moments", category: "Electronics" },
      { item: "Sufficient Cash (IDR)", note: "For sulfur souvenirs or hot drinks at basecamp", category: "Documents & Cash" },
      { item: "Personal Medication", note: "Especially for guests with asthma or cold sensitivity", category: "Health" },
    ];
  });

  // FAQs
  const [faqs, setFaqs] = useState<FaqItem[]>(() => {
    if (Array.isArray(initialData?.faqs) && initialData.faqs.length > 0) {
      return initialData.faqs;
    }
    return [
      {
        q: "Can beginners or children join this tour?",
        a: "Yes! The trekking trail is wide and well-defined. If you get tired, local trolley taxi carts are available to take you up to the summit.",
      },
      {
        q: "When is the best time to see the Blue Fire?",
        a: "The best viewing window is between 03:00 and 04:30 WIB while the sky is still pitch dark. We schedule departures so you arrive at the best vantage point on time.",
      },
      {
        q: "Is the sulfur gas odor dangerous?",
        a: "We provide specialized active-filter gas respirator masks that safely filter sulfur fumes. Our guides continuously monitor wind direction for your safety.",
      },
      {
        q: "How do payment and cancellation policies work?",
        a: "Bookings are confirmed with a flexible deposit via bank transfer or QRIS. Free rescheduling is available up to 48 hours before departure.",
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
        name: "Mount Ijen Trolley Taxi (Round-Trip)",
        description: "Traditional hand-cart service operated by local miners for guests who prefer to conserve energy",
        price: 800000,
        currency: "IDR",
        pricingUnit: "per trolley",
        isActive: true,
      },
      {
        id: "drone",
        name: "4K Drone & Camera Documentation",
        description: "Cinematic highlight video + high-resolution photos with Blue Fire & Sunrise backdrop",
        price: 650000,
        currency: "IDR",
        pricingUnit: "per group",
        isActive: true,
      },
      {
        id: "pickup",
        name: "Surabaya Juanda / Malang Airport Transfer",
        description: "Private highway car transfer directly to your Banyuwangi hotel",
        price: 600000,
        currency: "IDR",
        pricingUnit: "per car",
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
      setError("Tour package title is required.");
      setActiveTab("general");
      return;
    }
    if (!description.trim()) {
      setError("Package description is required.");
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
        throw new Error(data.error || "Failed to save tour package.");
      }

      setSuccessMessage(mode === "create" ? "Tour package created successfully!" : "Package changes saved successfully!");
      setTimeout(() => {
        router.push("/admin/trips");
        router.refresh();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while saving the package.");
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
        day: `Day ${nextIdx}`,
        startTime: "08:00",
        endTime: "10:00",
        title: "New Trip Activity",
        desc: "Description of travel activity and highlights visitors will experience.",
        location: "Mount Ijen / Banyuwangi",
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
    setPackingList([...packingList, { item: "", note: "", category: "Gear" }]);
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
        name: "Additional Extra Service",
        description: "Description of extra facility or trip convenience",
        price: 150000,
        currency: "IDR",
        pricingUnit: "per person",
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
            title="Back to Packages List"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black text-secondary-950 truncate">
              {mode === "create" ? "Create New Tour Package" : `Edit Package: ${title || "Tour Package"}`}
            </h1>
            <div className="flex items-center gap-2 text-xs text-secondary-500 font-mono truncate mt-0.5">
              <span>Slug: /packages/{slug || "package-url"}</span>
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
            title="Click to toggle Draft / Published status"
          >
            <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-amber-500"}`} />
            <span className="hidden sm:inline">{isActive ? "Status: Public" : "Status: Draft"}</span>
            <span className="sm:hidden">{isActive ? "Public" : "Draft"}</span>
          </button>

          {/* Cancel button */}
          <Link
            href="/admin/trips"
            className="px-3.5 py-2 rounded-xl border border-secondary-200 hover:bg-secondary-100 text-secondary-700 font-bold text-xs transition inline-flex items-center justify-center"
          >
            Cancel
          </Link>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-xs transition shadow-sm inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>{submitting ? "Saving..." : mode === "create" ? "Create Package" : "Save Changes"}</span>
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

      {/* ENGLISH CONTENT GUIDANCE */}
      <div className="p-4 bg-blue-50/80 border border-blue-200/90 text-blue-950 rounded-2xl text-xs flex items-start gap-3">
        <Globe className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">English Public Content Guidance</p>
          <p className="text-blue-800 leading-relaxed">
            Please manually enter all public-facing package content in clear, natural English (package title, descriptions, itinerary, inclusions, exclusions, highlights, packing list, add-ons, FAQs, and SEO metadata). Database content is displayed directly to visitors without automatic translation.
          </p>
        </div>
      </div>

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
            <h3 className="text-lg font-black text-secondary-950">1. Package Info & Specifications</h3>
            <p className="text-xs text-secondary-500 mt-0.5">
              Set the tour title, unique URL slug, narrative description, and travel parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Package Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Tour Package Name / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Midnight Expedition Blue Fire Ijen"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs sm:text-sm font-bold text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            {/* Slug URL */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider">
                  Unique URL Slug (Package Detail Link) *
                </label>
                <button
                  type="button"
                  onClick={() => setAutoSlug(!autoSlug)}
                  className="text-[11px] font-bold text-primary-700 hover:underline cursor-pointer"
                >
                  {autoSlug ? "✓ Auto-generate active" : "Custom manual"}
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
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Main Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              >
                <option value="midnight">Midnight Expedition (Early Morning)</option>
                <option value="regular">Regular Tour (Relaxed Pace)</option>
                <option value="private">Private Exclusive Tour</option>
              </select>
            </div>

            {/* Package Type */}
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Tour Package Type</label>
              <select
                value={packageType}
                onChange={(e) => setPackageType(e.target.value)}
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              >
                <option value="Open Trip">Open Trip (Shared Group)</option>
                <option value="Private Tour">Private Tour (Exclusive)</option>
                <option value="Midnight Expedition">Midnight Expedition</option>
                <option value="Family / Group">Family / Corporate Group</option>
              </select>
            </div>

            {/* Duration Display String */}
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Display Duration *</label>
              <input
                type="text"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="1 Day (Midnight) or 2D1N"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            {/* Duration Days & Nights */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Days</label>
                <input
                  type="number"
                  min={1}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Nights</label>
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
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Min Participants</label>
              <input
                type="number"
                min={1}
                value={minParticipants}
                onChange={(e) => setMinParticipants(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Max Participants</label>
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
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Trekking Difficulty Level</label>
              <input
                type="text"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                placeholder="Moderate (3 km Trek / 2 Hours)"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Summit Altitude</label>
              <input
                type="text"
                value={altitude}
                onChange={(e) => setAltitude(e.target.value)}
                placeholder="2,769 masl"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            {/* Meeting Point & Departure Time */}
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Meeting Point</label>
              <input
                type="text"
                value={meetingPoint}
                onChange={(e) => setMeetingPoint(e.target.value)}
                placeholder="Banyuwangi (Hotel / Station / Airport)"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Pickup Area</label>
              <input
                type="text"
                value={pickupArea}
                onChange={(e) => setPickupArea(e.target.value)}
                placeholder="Banyuwangi City Area & Surrounds"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Departure Time</label>
              <input
                type="text"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                placeholder="00:00 - 00:30 WIB (Midnight)"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Recommended Age</label>
              <input
                type="text"
                value={recommendedAge}
                onChange={(e) => setRecommendedAge(e.target.value)}
                placeholder="7 - 65 Years"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            {/* Short Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Short Summary
              </label>
              <textarea
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Compelling 1-2 sentence summary for package cards on the homepage..."
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs sm:text-sm text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            {/* Full Narrative Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Full Tour Description (Overview) *
              </label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the complete experience guests will enjoy..."
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs sm:text-sm text-secondary-950 leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            {/* Safety & Important Notes */}
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Safety Information
              </label>
              <textarea
                rows={3}
                value={safetyInfo}
                onChange={(e) => setSafetyInfo(e.target.value)}
                placeholder="Sulfur gas warnings, restrictions for guests with asthma/heart conditions..."
                className="w-full px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Important Notes
              </label>
              <textarea
                rows={3}
                value={importantNotes}
                onChange={(e) => setImportantNotes(e.target.value)}
                placeholder="Health certificate requirements, BKSDA ticket counter hours..."
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
            <h3 className="text-lg font-black text-secondary-950">2. Pricing Structure & Discount Scheme</h3>
            <p className="text-xs text-secondary-500 mt-0.5">
              Configure base price for booking calculations, currency, promotional discounts, and pricing terms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Base Price Numeric */}
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Numeric Base Price *
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
                Used for the automated booking calculator on the public page.
              </span>
            </div>

            {/* Price Display String */}
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Display Price Text (Public Label) *
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
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="IDR"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Pricing Unit</label>
              <select
                value={pricingUnit}
                onChange={(e) => setPricingUnit(e.target.value)}
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              >
                <option value="per person">per person</option>
                <option value="per group">per group</option>
                <option value="per booking">per booking</option>
                <option value="per car">per car (Private Vehicle)</option>
              </select>
            </div>

            {/* Discount Price */}
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Promo / Strikethrough Price (Optional)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-secondary-400">Rp</span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="Leave blank if no promotion"
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Group Discount Percent */}
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">Group Discount (%)</label>
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
                Pricing Terms & Notes
              </label>
              <textarea
                rows={3}
                value={priceNotes}
                onChange={(e) => setPriceNotes(e.target.value)}
                placeholder="e.g. Price includes domestic entrance tickets. International visitor ticket surcharge applies per BKSDA regulations..."
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
            <h3 className="text-lg font-black text-secondary-950">3. Cover Photo & Tour Gallery</h3>
            <p className="text-xs text-secondary-500 mt-0.5">
              Upload a high-resolution cover image and supporting gallery photos (connected directly to Supabase Storage).
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-secondary-950 uppercase tracking-wider mb-2">
                Main Cover Photo (Cover Image) *
              </label>
              <ImageUpload
                value={coverImage}
                onChange={(url) => setCoverImage(url)}
                folder="trips"
                label="Upload Main Cover"
                aspectRatio="video"
                required
                helperText="High-resolution JPG, PNG, or WebP format (Max. 5 MB)."
              />
            </div>

            <div className="pt-4 border-t border-secondary-100">
              <label className="block text-xs font-black text-secondary-950 uppercase tracking-wider mb-2">
                Supporting Photo Gallery (Multi-Image Gallery)
              </label>
              <MultiImageUpload
                value={galleryImages}
                onChange={(urls) => setGalleryImages(urls)}
                folder="trips"
                maxFiles={8}
                label="Upload Gallery Photos"
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
              <h3 className="text-lg font-black text-secondary-950">4. Travel Schedule (Itinerary)</h3>
              <p className="text-xs text-secondary-500 mt-0.5">
                Manage itinerary activity sequence, timing, agenda titles, descriptions, locations, and operational notes.
              </p>
            </div>
            <button
              type="button"
              onClick={addItineraryItem}
              className="px-4 py-2 rounded-xl bg-secondary-950 hover:bg-secondary-900 text-white font-bold text-xs transition inline-flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Add Activity</span>
            </button>
          </div>

          {itinerary.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-secondary-200 rounded-3xl p-6">
              <p className="text-xs font-bold text-secondary-500 mb-3">No itinerary items configured for this package yet.</p>
              <button
                type="button"
                onClick={addItineraryItem}
                className="px-4 py-2 rounded-xl bg-primary-500 text-secondary-950 font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Add First Activity</span>
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
                      <span className="text-xs font-black text-secondary-950">Activity #{idx + 1}</span>
                    </div>

                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveItineraryItem(idx, "up")}
                        disabled={idx === 0}
                        className="w-8 h-8 rounded-xl border border-secondary-200 hover:bg-white text-secondary-600 disabled:opacity-30 inline-flex items-center justify-center transition shrink-0 cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="w-4 h-4 shrink-0" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItineraryItem(idx, "down")}
                        disabled={idx === itinerary.length - 1}
                        className="w-8 h-8 rounded-xl border border-secondary-200 hover:bg-white text-secondary-600 disabled:opacity-30 inline-flex items-center justify-center transition shrink-0 cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="w-4 h-4 shrink-0" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItineraryItem(idx)}
                        className="w-8 h-8 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 inline-flex items-center justify-center transition shrink-0 cursor-pointer ml-1"
                        title="Delete This Activity"
                      >
                        <Trash2 className="w-4 h-4 shrink-0" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Day / Time Label */}
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-bold text-secondary-700 uppercase tracking-wider mb-1">
                        Time / Day Label (e.g. 00:00 WIB / Day 1)
                      </label>
                      <input
                        type="text"
                        value={item.day}
                        onChange={(e) => updateItineraryItem(idx, "day", e.target.value)}
                        placeholder="00:00 WIB or Day 1"
                        className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-xl text-xs text-secondary-950 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    {/* Activity Title */}
                    <div className="sm:col-span-8">
                      <label className="block text-[11px] font-bold text-secondary-700 uppercase tracking-wider mb-1">Activity Title *</label>
                      <input
                        type="text"
                        required
                        value={item.title}
                        onChange={(e) => updateItineraryItem(idx, "title", e.target.value)}
                        placeholder="e.g. Electric Blue Fire Phenomenon"
                        className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-xl text-xs text-secondary-950 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-12">
                      <label className="block text-[11px] font-bold text-secondary-700 uppercase tracking-wider mb-1">Activity Description</label>
                      <textarea
                        rows={2}
                        value={item.desc}
                        onChange={(e) => updateItineraryItem(idx, "desc", e.target.value)}
                        placeholder="Describe what travelers will do during this step..."
                        className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    {/* Location & Note */}
                    <div className="sm:col-span-6">
                      <label className="block text-[11px] font-bold text-secondary-700 uppercase tracking-wider mb-1">Location (Optional)</label>
                      <input
                        type="text"
                        value={item.location || ""}
                        onChange={(e) => updateItineraryItem(idx, "location", e.target.value)}
                        placeholder="Ijen Crater Floor / Paltuding Basecamp"
                        className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label className="block text-[11px] font-bold text-secondary-700 uppercase tracking-wider mb-1">Special Note (Optional)</label>
                      <input
                        type="text"
                        value={item.note || ""}
                        onChange={(e) => updateItineraryItem(idx, "note", e.target.value)}
                        placeholder="Wear gas respirator mask & headlamp"
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
                  <h4 className="text-base font-black text-secondary-950">Included (Inclusions)</h4>
                  <p className="text-[11px] text-emerald-700 font-medium">Facilities provided by the operator</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addInclusion}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition inline-flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Add</span>
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
                    placeholder="e.g. Medical Gas Respirator Mask"
                    className="w-full px-3.5 py-2 bg-emerald-50/40 border border-emerald-200 rounded-xl text-xs font-semibold text-secondary-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeInclusion(i)}
                    className="w-8 h-8 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 inline-flex items-center justify-center transition shrink-0 cursor-pointer"
                    title="Delete Item"
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
                  <h4 className="text-base font-black text-secondary-950">Not Included (Exclusions)</h4>
                  <p className="text-[11px] text-rose-700 font-medium">Optional costs outside package coverage</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addExclusion}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition inline-flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Add</span>
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
                    placeholder="e.g. Crater Trolley Taxi Cart"
                    className="w-full px-3.5 py-2 bg-rose-50/40 border border-rose-200 rounded-xl text-xs font-semibold text-secondary-950 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeExclusion(i)}
                    className="w-8 h-8 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 inline-flex items-center justify-center transition shrink-0 cursor-pointer"
                    title="Delete Item"
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
                <h4 className="text-base font-black text-secondary-950">Key Selling Points (Package Highlights)</h4>
                <p className="text-xs text-secondary-500">Top highlights featured prominently on the package detail page</p>
              </div>
              <button
                type="button"
                onClick={addHighlight}
                className="px-3.5 py-1.5 rounded-xl bg-secondary-950 text-white text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Add Point</span>
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
                    placeholder="e.g. Sunrise & World's Largest Acidic Lake Photo Spot"
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
                <h4 className="text-base font-black text-secondary-950">Recommended Packing List</h4>
                <p className="text-xs text-secondary-500">Recommended gear and clothing for travelers to bring</p>
              </div>
              <button
                type="button"
                onClick={addPackingItem}
                className="px-3.5 py-1.5 rounded-xl bg-secondary-950 text-white text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Add Item</span>
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
                      placeholder="Item Name (e.g. Warm Jacket)"
                      className="w-full px-3 py-1.5 bg-white border border-secondary-200 rounded-xl text-xs font-bold text-secondary-950"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={p.category || ""}
                      onChange={(e) => updatePackingItem(idx, "category", e.target.value)}
                      placeholder="Category (Clothing / Footwear)"
                      className="w-full px-3 py-1.5 bg-white border border-secondary-200 rounded-xl text-xs text-secondary-950"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={p.note || ""}
                      onChange={(e) => updatePackingItem(idx, "note", e.target.value)}
                      placeholder="Temperature or specification notes"
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
                <h4 className="text-base font-black text-secondary-950">Optional Services (Tour Add-ons)</h4>
                <p className="text-xs text-secondary-500">
                  Paid optional add-ons guests can select during booking (Trolley Taxi, Drone Documentation, etc.)
                </p>
              </div>
              <button
                type="button"
                onClick={addAddon}
                className="px-4 py-2 rounded-xl bg-secondary-950 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Add New Add-on</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addons.map((ad, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-secondary-50 border border-secondary-200 space-y-3 relative">
                  <div className="flex items-center justify-between border-b border-secondary-200/80 pb-2">
                    <span className="text-xs font-black text-secondary-950">Add-on Option #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeAddon(idx)}
                      className="w-8 h-8 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 inline-flex items-center justify-center transition shrink-0 cursor-pointer"
                      title="Delete Add-on"
                    >
                      <Trash2 className="w-4 h-4 shrink-0" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold text-secondary-700 uppercase tracking-wider mb-1">Service Name *</label>
                      <input
                        type="text"
                        value={ad.name}
                        onChange={(e) => updateAddon(idx, "name", e.target.value)}
                        placeholder="e.g. Mount Ijen Trolley Taxi (Round-Trip)"
                        className="w-full px-3 py-1.5 bg-white border border-secondary-200 rounded-xl text-xs font-bold text-secondary-950"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-secondary-700 uppercase tracking-wider mb-1">Extra Price (IDR)</label>
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
                        <label className="block text-[10px] font-bold text-secondary-700 uppercase tracking-wider mb-1">Pricing Unit</label>
                        <input
                          type="text"
                          value={ad.pricingUnit || "per person"}
                          onChange={(e) => updateAddon(idx, "pricingUnit", e.target.value)}
                          placeholder="per person / per trolley"
                          className="w-full px-3 py-1.5 bg-white border border-secondary-200 rounded-xl text-xs text-secondary-950"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-secondary-700 uppercase tracking-wider mb-1">Facility Description</label>
                      <textarea
                        rows={2}
                        value={ad.description || ""}
                        onChange={(e) => updateAddon(idx, "description", e.target.value)}
                        placeholder="Describe details of this extra service..."
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
                        <span className="text-xs font-bold text-secondary-800">Active Status (Visible at Checkout)</span>
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
                <h4 className="text-base font-black text-secondary-950">Package-Specific Frequently Asked Questions (FAQ)</h4>
                <p className="text-xs text-secondary-500">
                  Common questions guests ask about the terrain, gas masks, or duration of this tour
                </p>
              </div>
              <button
                type="button"
                onClick={addFaq}
                className="px-4 py-2 rounded-xl bg-secondary-950 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Add FAQ</span>
              </button>
            </div>

            <div className="space-y-4">
              {faqs.map((f, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-secondary-50 border border-secondary-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-secondary-950">Question #{idx + 1}</span>
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
                      placeholder="Question (e.g., Is this hike safe for children?)"
                      className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-xl text-xs font-bold text-secondary-950"
                    />
                  </div>
                  <div>
                    <textarea
                      rows={2}
                      value={f.a}
                      onChange={(e) => updateFaq(idx, "a", e.target.value)}
                      placeholder="Informative and helpful answer..."
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
            <h3 className="text-lg font-black text-secondary-950">8. Search Engine Optimization (SEO) & Publishing</h3>
            <p className="text-xs text-secondary-500 mt-0.5">
              Configure the meta title and meta description for Google search snippets, as well as package visibility settings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Meta Title (Browser Tab & Google Title)
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Midnight Blue Fire Ijen Expedition - Official Banyuwangi Tour"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-[10px] text-secondary-500 mt-1 block">
                Recommended 50 - 60 characters so it is not truncated on Google.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Promotional Badge (Tag Sticker)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Best Seller / Most Popular / Midnight"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Meta Description (Google Search Snippet)
              </label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="150-160 character summary description for the Google search snippet..."
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wider mb-1.5">
                Display Order (Sort Order)
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
                Open Graph Image URL (Optional)
              </label>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder="Image URL for social media sharing (defaults to cover image if left blank)"
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
                  <span className="text-xs font-bold text-secondary-950 block">Publish Package</span>
                  <span className="text-[10px] text-secondary-500">Visible on public website</span>
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
                  <span className="text-[10px] text-secondary-500">Highlighted on homepage</span>
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
                  <span className="text-[10px] text-secondary-500">Most popular badge</span>
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
                  <span className="text-xs font-bold text-secondary-950 block">Latest Package</span>
                  <span className="text-[10px] text-secondary-500">Mark as newly updated</span>
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
              <span>Back to: {prevTab.label}</span>
            </button>
          ) : (
            <Link
              href="/admin/trips"
              className="px-4 py-2 rounded-xl border border-secondary-200 bg-white hover:bg-secondary-100 text-secondary-700 font-bold text-xs inline-flex items-center justify-center transition"
            >
              Cancel & Back to List
            </Link>
          )}

          {nextTab && (
            <button
              type="button"
              onClick={() => setActiveTab(nextTab.id)}
              className="px-4 py-2 rounded-xl border border-secondary-300 bg-secondary-100 hover:bg-secondary-200 text-secondary-950 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>Next: {nextTab.label}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
          <Link
            href="/admin/trips"
            className="hidden sm:inline-flex px-4 py-2.5 rounded-xl border border-secondary-200 text-secondary-700 hover:bg-secondary-100 font-bold text-xs items-center justify-center transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-xs transition shadow-md inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>{submitting ? "Saving Data..." : mode === "create" ? "Create Tour Package" : "Save All Changes"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
