"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Shirt,
  Footprints,
  HeartPulse,
  Lightbulb,
  CheckCircle2,
  Info,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  BookOpen,
} from "lucide-react";

interface ChecklistItem {
  title: string;
  desc: string;
  highlight?: string;
  slug: string;
}

interface TabItem {
  id: string;
  tabLabel: string;
  title: string;
  subtitle: string;
  icon: typeof FileText;
  items: ChecklistItem[];
}

const tabsData: TabItem[] = [
  {
    id: "documents",
    tabLabel: "Documents & Entry",
    title: "Required Documents & Permits",
    subtitle:
      "To ensure smooth passage and avoid delays during BBKSDA checkpoint verification at the Paltuding basecamp, ensure these 4 official requirements are ready prior to departure.",
    icon: FileText,
    items: [
      {
        title: "Medical Health Certificate",
        desc: "Mandatory requirement! Present an original doctor's health certificate issued no more than 3 days prior to your climb date.",
        highlight: "Without this certificate, BBKSDA park rangers will strictly deny entry to the trail.",
        slug: "medical-health-certificate-kawah-ijen",
      },
      {
        title: "BBKSDA Online Entry Ticket",
        desc: "Book your official permit online via the East Java BBKSDA ticketing system before reaching the Paltuding checkpoint.",
        highlight: "On-site ticket purchases at the entrance are often unavailable due to strict daily visitor quotas.",
        slug: "bbksda-online-ticket-mount-ijen-booking-guide",
      },
      {
        title: "Official Photo ID",
        desc: "Carry valid physical identification (Passport for international visitors, or National ID/Driver's License for domestic visitors) for ticket checks.",
        highlight: "The identification name must match the name on your online booking permit.",
        slug: "id-passport-requirements-mount-ijen-trekking",
      },
      {
        title: "Cash in Indonesian Rupiah (IDR)",
        desc: "Prepare small cash denominations to rent equipment (gas masks, traditional Ijen trolley carts) or purchase warm drinks and snacks at basecamp.",
        highlight: "ATM machines and digital cellular signals at Paltuding are very limited.",
        slug: "cash-expenses-guide-paltuding-mount-ijen",
      },
    ],
  },
  {
    id: "clothing",
    tabLabel: "Warm Layering",
    title: "Warm Clothing & Cold Protection",
    subtitle:
      "Temperatures at the crater and summit drop below 10°C with severe midnight winds. Avoid light casual wear; apply an efficient multi-layering system.",
    icon: Shirt,
    items: [
      {
        title: "Heavy Jacket / Windbreaker",
        desc: "Provides vital windproof insulation against biting night winds along exposed ridgelines and the crater rim.",
        slug: "best-jacket-windbreaker-mount-ijen-summit",
      },
      {
        title: "Thermal Base Layers",
        desc: "Wear moisture-wicking thermal tops and leggings to keep your core dry and prevent chills during rest stops.",
        slug: "layering-system-thermal-clothing-mount-ijen",
      },
      {
        title: "Outdoor Trekking Pants",
        desc: "Choose flexible, quick-drying outdoor trousers designed for trekking.",
        highlight: "Avoid stiff denim jeans so your legs can move naturally and comfortably on steep trails.",
        slug: "best-hiking-pants-guide-mount-ijen",
      },
      {
        title: "Warm Gloves & Beanie",
        desc: "Crucial for keeping your ears and fingertips warm against freezing early-morning temperatures.",
        slug: "gloves-beanie-cold-weather-mount-ijen",
      },
    ],
  },
  {
    id: "gear",
    tabLabel: "Hiking Gear",
    title: "Essential Trekking Equipment",
    subtitle:
      "Hikes start around midnight in complete darkness across steep, sandy, and rocky terrain. The following equipment is essential for safety.",
    icon: Footprints,
    items: [
      {
        title: "Gas Mask Respirator",
        desc: "Sulfur vapors near the crater rim are dense and hazardous. A carbon-filter respirator mask is mandatory (available for rent at Paltuding).",
        highlight: "Tip: Bring moist wipes or clean tissue to line the inside of the mask for better facial comfort.",
        slug: "gas-mask-respirator-guide-kawah-ijen-sulfur",
      },
      {
        title: "Headlamp / Flashlight",
        desc: "The mountain trail has no pathway lighting. A headlamp is strongly recommended to keep both hands free for balance.",
        slug: "headlamp-flashlight-night-trek-mount-ijen",
      },
      {
        title: "Sturdy Trekking Shoes",
        desc: "Wear sturdy hiking or trail shoes with deep anti-slip tread to tackle slippery volcanic dust both uphill and downhill.",
        slug: "best-shoes-hiking-boots-mount-ijen-trail",
      },
      {
        title: "Trekking Poles",
        desc: "Greatly relieves strain on knees and joints, helps maintain balance on steep inclines, and supports the descent.",
        slug: "trekking-poles-benefits-mount-ijen-hike",
      },
    ],
  },
  {
    id: "supplies",
    tabLabel: "Hydration & First Aid",
    title: "Provisions & Personal First Aid",
    subtitle:
      "The uphill trek takes approximately 2 to 3 hours of steady hiking. Ensure your hydration, energy snacks, and personal medication kit are packed before you begin.",
    icon: HeartPulse,
    items: [
      {
        title: "Drinking Water & Electrolytes",
        desc: "Carry 1 to 1.5 liters of drinking water to prevent dehydration. Sip regularly in small amounts along the trail.",
        slug: "hydration-water-management-mount-ijen-hike",
      },
      {
        title: "High-Calorie Trail Snacks",
        desc: "Pack easily digestible high-calorie snacks such as chocolate, dates, honey sticks, or biscuits for fast energy boosts.",
        slug: "best-high-energy-trail-snacks-mount-ijen",
      },
      {
        title: "Personal Medication",
        desc: "Bring antacids, motion sickness tablets, pain relief, and a personal inhaler if you have any history of mild respiratory sensitivity.",
        slug: "personal-medication-first-aid-mount-ijen",
      },
      {
        title: "Eye Drops & Spare Masks",
        desc: "Very useful for soothing stinging eyes caused by shifting sulfur gas fumes, along with spare medical masks for the return journey.",
        highlight: "Apply lubricating eye drops if your eyes feel irritated from volcanic sulfur gas.",
        slug: "protect-eyes-sulfur-smoke-kawah-ijen",
      },
    ],
  },
  {
    id: "tips",
    tabLabel: "Tips & Etiquette",
    title: "Trail Tips & Visitor Etiquette",
    subtitle:
      "Essential recommendations on physical preparation, local etiquette with sulfur miners, and park operational schedules for a seamless journey.",
    icon: Lightbulb,
    items: [
      {
        title: "Physical Preparation",
        desc: "Engage in light cardio workouts like jogging or brisk walking a week in advance so your leg muscles don't cramp during the climb.",
        slug: "physical-training-preparation-mount-ijen-hike",
      },
      {
        title: "Check Operational Schedule (Ijen Clean-Up)",
        desc: "Mount Ijen is routinely closed on the first Friday of each month for conservation and environmental clean-up. Verify dates in advance.",
        highlight: "Always reconfirm your trekking dates with our team before booking your trip.",
        slug: "mount-ijen-closure-schedule-ijen-clean-up",
      },
      {
        title: "Yield to Sulfur Miners",
        desc: "The trail is actively shared with local sulfur miners carrying baskets up to 80 kg. Always give them right-of-way and step aside safely.",
        slug: "sulfur-miners-mount-ijen-etiquette-respect",
      },
      {
        title: "Leave No Trace & Respect Locals",
        desc: "Do not litter along trails or at the crater. Always ask politely with a smile before taking photographs of miners at work.",
        slug: "leave-no-trace-cultural-guidelines-mount-ijen",
      },
    ],
  },
];

export function TravelResourcesInteractive() {
  const [activeTabId, setActiveTabId] = useState<string>("documents");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const currentIndex = tabsData.findIndex((tab) => tab.id === activeTabId);
  const activeTab = tabsData[currentIndex] || tabsData[0];
  const IconComponent = activeTab.icon;

  const handleSelectTab = (id: string) => {
    setActiveTabId(id);
  };

  const handlePrevTab = () => {
    if (currentIndex > 0) {
      setActiveTabId(tabsData[currentIndex - 1].id);
    }
  };

  const handleNextTab = () => {
    if (currentIndex < tabsData.length - 1) {
      setActiveTabId(tabsData[currentIndex + 1].id);
    }
  };

  // Auto-scroll active tab into view on mobile
  useEffect(() => {
    const activeEl = tabRefs.current[activeTabId];
    if (activeEl && tabsContainerRef.current) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeTabId]);

  return (
    <div className="w-full min-w-0 max-w-full">
      {/* Main container: sharp architectural styling, zero rounding, crater teal tint */}
      <div className="w-full min-w-0 max-w-full border border-secondary-200/90 bg-secondary-50/70 p-4 sm:p-6 lg:p-10 shadow-xs dark:border-secondary-800 dark:bg-secondary-950 rounded-none">
        <div className="grid w-full min-w-0 max-w-full grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
          
          {/* LEFT COLUMN: TABS */}
          <div className="w-full min-w-0 max-w-full lg:col-span-4 xl:col-span-4 flex flex-col justify-between">
            <div className="w-full min-w-0 max-w-full">
              {/* Category label & mobile indicator */}
              <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-700 dark:text-primary-400">
                  Guide Categories
                </p>
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-500 lg:hidden">
                  {currentIndex + 1} of {tabsData.length}
                </span>
              </div>

              {/* Mobile Tabs Wrapper */}
              <div className="relative w-full min-w-0 max-w-full">
                <div
                  ref={tabsContainerRef}
                  className="flex w-full min-w-0 max-w-full gap-2 overflow-x-auto pb-1.5 lg:flex-col lg:overflow-visible lg:pb-0 scroll-smooth overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {tabsData.map((tab) => {
                    const isActive = tab.id === activeTabId;
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        ref={(el) => {
                          tabRefs.current[tab.id] = el;
                        }}
                        type="button"
                        onClick={() => handleSelectTab(tab.id)}
                        className={`group flex items-center gap-2.5 sm:gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3.5 min-h-[42px] text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 whitespace-nowrap lg:w-full text-left cursor-pointer border rounded-none ${
                          isActive
                            ? "bg-primary-500 text-secondary-950 border-primary-500 shadow-xs font-black ring-1 ring-primary-500"
                            : "bg-white text-secondary-800 hover:bg-secondary-100 hover:text-secondary-950 border-secondary-200/90 shadow-2xs dark:bg-secondary-900 dark:text-secondary-200 dark:border-secondary-800 dark:hover:bg-secondary-800 dark:hover:text-white"
                        }`}
                      >
                        <TabIcon
                          className={`h-4 w-4 transition-colors shrink-0 ${
                            isActive
                              ? "text-secondary-950"
                              : "text-secondary-500 group-hover:text-primary-600 dark:text-secondary-400 dark:group-hover:text-primary-400"
                          }`}
                          aria-hidden="true"
                        />
                        <span>{tab.tabLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Note / Info Callout below left tabs on desktop */}
            <div className="mt-6 hidden lg:flex items-start gap-3 border border-secondary-200/90 bg-white/90 p-4 text-xs text-secondary-600 shadow-2xs dark:border-secondary-800/80 dark:bg-secondary-900/60 dark:text-secondary-300 rounded-none">
              <Info className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400 mt-0.5" />
              <p className="leading-relaxed">
                Select a category above to review mandatory travel documents, recommended equipment, and essential guidelines before your trek.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVE CONTENT */}
          <div className="w-full min-w-0 max-w-full lg:col-span-8 xl:col-span-8 flex flex-col justify-start">
            <div key={activeTab.id} className="w-full min-w-0 max-w-full flex flex-col justify-start">
              
              {/* Category Detail Header */}
              <div className="w-full min-w-0 max-w-full">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center border border-primary-200 bg-primary-100/90 text-primary-700 shadow-2xs dark:border-primary-500/30 dark:bg-primary-500/15 dark:text-primary-400 shrink-0 rounded-none">
                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight text-secondary-950 dark:text-white break-words">
                      {activeTab.title}
                    </h3>
                  </div>
                </div>

                <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm lg:text-base leading-relaxed text-secondary-700 dark:text-secondary-200 break-words">
                  {activeTab.subtitle}
                </p>
              </div>

              {/* ZERO GAP & ZERO ROUNDING CONTENT GRID */}
              <div className="mt-4 sm:mt-5 grid w-full min-w-0 max-w-full grid-cols-1 sm:grid-cols-2 border border-secondary-200/90 bg-white shadow-2xs dark:border-secondary-800 dark:bg-secondary-900 rounded-none">
                {activeTab.items.map((item, idx) => (
                  <Link
                    key={item.title}
                    href={`/blog/${item.slug}`}
                    className={`group relative w-full min-w-0 max-w-full flex flex-col justify-between p-4 sm:p-5 min-h-0 sm:min-h-[160px] transition-colors hover:bg-secondary-50/90 dark:hover:bg-secondary-800/60 block cursor-pointer ${
                      idx % 2 === 0
                        ? "sm:border-r border-secondary-200/90 dark:border-secondary-800"
                        : ""
                    } ${
                      idx < activeTab.items.length - 1
                        ? "max-sm:border-b border-secondary-200/90 dark:border-secondary-800"
                        : ""
                    } ${
                      idx < 2
                        ? "sm:border-b border-secondary-200/90 dark:border-secondary-800"
                        : ""
                    }`}
                  >
                    <div className="w-full min-w-0">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2
                          className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary-600 dark:text-primary-400 mt-0.5 group-hover:scale-110 transition-transform"
                          aria-hidden="true"
                        />
                        <h4 className="font-bold text-secondary-950 text-sm sm:text-base leading-snug dark:text-white break-words min-w-0 flex-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {item.title}
                        </h4>
                      </div>
                      <p className="mt-2 text-xs sm:text-sm text-secondary-600 leading-relaxed dark:text-secondary-300 break-words">
                        {item.desc}
                      </p>

                      {item.highlight && (
                        <div className="mt-3 sm:mt-3.5 w-full min-w-0 border-l-2 border-primary-500 bg-primary-50/80 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs text-primary-950 dark:bg-primary-500/10 dark:text-primary-200 rounded-none break-words">
                          <strong className="text-primary-800 dark:text-primary-300">Note:</strong> {item.highlight}
                        </div>
                      )}
                    </div>

                    {/* Dedicated Blog Link Button */}
                    <div className="mt-4 pt-3 border-t border-secondary-100 dark:border-secondary-800/80 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-secondary-600 dark:text-secondary-400">
                        <BookOpen className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                        <span>Field Guide</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-500/10 border border-primary-300/80 dark:border-primary-500/30 text-primary-800 dark:text-primary-300 text-xs font-bold transition-all group-hover:bg-primary-500 group-hover:border-primary-500 group-hover:text-secondary-950 shadow-2xs">
                        <span>Read Blog</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* MOBILE BOTTOM STEPPER NAVIGATION */}
              <div className="mt-4 flex lg:hidden items-center justify-between gap-2 border border-secondary-200/90 bg-white p-2.5 shadow-2xs dark:border-secondary-800 dark:bg-secondary-900 rounded-none">
                <button
                  type="button"
                  onClick={handlePrevTab}
                  disabled={currentIndex === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-secondary-800 dark:text-secondary-200 disabled:opacity-30 disabled:pointer-events-none hover:bg-secondary-100 dark:hover:bg-secondary-800 transition rounded-none cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Prev</span>
                </button>

                {/* Progress Indicators */}
                <div className="flex items-center gap-1.5">
                  {tabsData.map((tab, idx) => (
                    <button
                      key={tab.id}
                      type="button"
                      aria-label={`Go to ${tab.tabLabel}`}
                      onClick={() => handleSelectTab(tab.id)}
                      className={`h-1.5 transition-all ${
                        idx === currentIndex
                          ? "w-5 bg-primary-500"
                          : "w-1.5 bg-secondary-300 dark:bg-secondary-700 hover:bg-secondary-400"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNextTab}
                  disabled={currentIndex === tabsData.length - 1}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-secondary-950 bg-primary-500 hover:bg-primary-400 disabled:opacity-30 disabled:pointer-events-none disabled:bg-secondary-100 disabled:text-secondary-400 transition rounded-none cursor-pointer shadow-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
