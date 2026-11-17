"use client";

import { useState, useRef } from "react";
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
  Compass,
  MapPin,
  Shield,
  Backpack,
  Camera,
  Mountain,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import {
  DEFAULT_TRAVEL_RESOURCES,
  type TravelResourceDTO,
} from "@/lib/travel-resources-defaults";

const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  Shirt,
  Footprints,
  HeartPulse,
  Lightbulb,
  Compass,
  MapPin,
  Shield,
  Backpack,
  Camera,
  Mountain,
  BookOpen,
};

// 20 Comprehensive Field Guide Slugs for Direct Blog Linking
const GUIDE_SLUG_MAP: Record<string, string> = {
  "Medical Health Certificate": "medical-health-certificate-kawah-ijen",
  "BBKSDA Online Entry Ticket": "bbksda-online-ticket-mount-ijen-booking-guide",
  "Official Photo ID": "id-passport-requirements-mount-ijen-trekking",
  "Cash in Indonesian Rupiah (IDR)": "cash-expenses-guide-paltuding-mount-ijen",
  "Heavy Jacket / Windbreaker": "best-jacket-windbreaker-mount-ijen-summit",
  "Thermal Base Layers": "layering-system-thermal-clothing-mount-ijen",
  "Outdoor Trekking Pants": "best-hiking-pants-guide-mount-ijen",
  "Warm Gloves & Beanie": "gloves-beanie-cold-weather-mount-ijen",
  "Gas Mask Respirator": "gas-mask-respirator-guide-kawah-ijen-sulfur",
  "Headlamp / Flashlight": "headlamp-flashlight-night-trek-mount-ijen",
  "Sturdy Trekking Shoes": "best-shoes-hiking-boots-mount-ijen-trail",
  "Trekking Poles": "trekking-poles-benefits-mount-ijen-hike",
  "Drinking Water & Electrolytes": "drinking-water-hydration-electrolytes-mount-ijen",
  "High-Calorie Trail Snacks": "high-calorie-trail-snacks-mount-ijen",
  "Personal Medication": "first-aid-personal-medication-mount-ijen",
  "Eye Drops & Spare Masks": "eye-drops-spare-masks-sulfur-smoke-ijen",
  "Physical Preparation": "physical-fitness-preparation-hiking-mount-ijen",
  "Check Operational Schedule (Ijen Clean-Up)": "ijen-clean-up-schedule-operational-hours",
  "Yield to Sulfur Miners": "yielding-to-sulfur-miners-trail-etiquette-ijen",
  "Leave No Trace & Respect Locals": "leave-no-trace-ethics-respect-local-guides-ijen",
};

interface TravelResourcesInteractiveProps {
  resources?: TravelResourceDTO[];
}

export function TravelResourcesInteractive({ resources }: TravelResourcesInteractiveProps) {
  const effectiveTabs: TravelResourceDTO[] =
    resources && resources.length > 0
      ? resources
      : DEFAULT_TRAVEL_RESOURCES.map((item) => ({
          ...item,
          id: item.slug,
        }));

  const [activeTabId, setActiveTabId] = useState<string>(effectiveTabs[0]?.slug || "documents");
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const currentIndex = effectiveTabs.findIndex(
    (tab) => tab.slug === activeTabId || tab.id === activeTabId
  );
  const activeTab = effectiveTabs[currentIndex >= 0 ? currentIndex : 0] || effectiveTabs[0];

  const IconComponent = ICON_MAP[activeTab.icon || "FileText"] || FileText;
  const isExternalLink = Boolean(activeTab.link && /^https?:\/\//i.test(activeTab.link));

  const handleSelectTab = (id: string) => {
    setActiveTabId(id);
    if (tabsContainerRef.current) {
      const activeButton = tabsContainerRef.current.querySelector<HTMLElement>(
        `[data-tab-id="${id}"]`
      );
      if (activeButton) {
        activeButton.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  const handlePrevTab = () => {
    if (currentIndex > 0) {
      const prev = effectiveTabs[currentIndex - 1];
      handleSelectTab(prev.slug || prev.id);
    }
  };

  const handleNextTab = () => {
    if (currentIndex < effectiveTabs.length - 1) {
      const next = effectiveTabs[currentIndex + 1];
      handleSelectTab(next.slug || next.id);
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full">
      {/* Main container in theme palette (Crater Teal Soft & Accent Gold) */}
      <div className="w-full min-w-0 max-w-full border border-secondary-200 bg-secondary-50/70 p-3.5 sm:p-6 lg:p-10 shadow-xs dark:border-secondary-800 dark:bg-secondary-950 rounded-2xl sm:rounded-3xl">
        <div className="grid w-full min-w-0 max-w-full grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
          {/* LEFT SIDE: TAB BUTTONS */}
          <div className="w-full min-w-0 max-w-full lg:col-span-4 xl:col-span-4 flex flex-col justify-between">
            <div className="w-full min-w-0 max-w-full">
              <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-700 dark:text-primary-400">
                  Guide Categories
                </p>
                <span className="text-[10px] font-medium text-secondary-500 lg:hidden">
                  Swipe horizontally →
                </span>
              </div>

              {/* Tab Navigation: Horizontal swipe on mobile, Vertical stack on desktop */}
              <div className="w-full min-w-0 max-w-full overflow-hidden">
                <div
                  ref={tabsContainerRef}
                  className="flex w-full min-w-0 max-w-full gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0 scroll-smooth snap-x snap-mandatory overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {effectiveTabs.map((tab) => {
                    const isActive = tab.slug === activeTab.slug;
                    const TabIcon = ICON_MAP[tab.icon || "FileText"] || FileText;
                    return (
                      <button
                        key={tab.id || tab.slug}
                        data-tab-id={tab.slug || tab.id}
                        type="button"
                        onClick={() => handleSelectTab(tab.slug || tab.id)}
                        className={`group flex items-center gap-2 sm:gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3.5 min-h-[44px] text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 whitespace-nowrap snap-start lg:w-full text-left cursor-pointer border rounded-xl ${
                          isActive
                            ? "bg-primary-500 text-secondary-950 border-primary-500 shadow-xs font-black"
                            : "bg-white text-secondary-800 hover:bg-secondary-100 hover:text-secondary-950 border-secondary-200/90 shadow-2xs dark:bg-secondary-900/90 dark:text-secondary-200 dark:border-secondary-800 dark:hover:bg-secondary-800 dark:hover:text-white"
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
                        <span className="truncate">{tab.category}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Note / Info Callout below left tabs on desktop */}
            <div className="hidden lg:flex items-start gap-3 mt-6 p-4 rounded-2xl bg-secondary-100/70 dark:bg-secondary-900/70 border border-secondary-200 dark:border-secondary-800">
              <Info className="h-5 w-5 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
              <div className="text-xs text-secondary-700 dark:text-secondary-300 leading-relaxed">
                <span className="font-bold text-secondary-950 dark:text-white block mb-0.5">
                  BBKSDA Ranger Notice
                </span>
                Rules and trail conditions are strictly monitored by rangers at Paltuding checkpoint. Click any guide card to read the complete field guide.
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: ACTIVE DETAIL CONTENT */}
          <div className="w-full min-w-0 max-w-full lg:col-span-8 xl:col-span-8">
            <div
              key={activeTab.slug}
              className="w-full min-w-0 max-w-full flex flex-col justify-start transition-opacity duration-200"
            >
              {/* Right Content Header: Icon + Title */}
              <div className="w-full min-w-0 max-w-full">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center border border-primary-200 bg-primary-100/90 text-primary-700 shadow-2xs dark:border-primary-500/30 dark:bg-primary-500/15 dark:text-primary-400 shrink-0 rounded-xl">
                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-black tracking-tight text-secondary-950 sm:text-2xl lg:text-3xl dark:text-white break-words">
                      {activeTab.title}
                    </h3>
                  </div>
                </div>

                {/* Subtitle / Intro text */}
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm lg:text-base leading-relaxed text-secondary-700 dark:text-secondary-200 break-words">
                  {activeTab.description}
                </p>

                {/* Optional Resource Link */}
                {activeTab.link && (
                  <div className="mt-3">
                    {isExternalLink ? (
                      <a
                        href={activeTab.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-700 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 transition"
                      >
                        <span>Read detailed guide</span>
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    ) : (
                      <Link
                        href={activeTab.link}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-700 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 transition"
                      >
                        <span>Explore full resource</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* CONTENT GRID: 2 columns on tablet/desktop, 1 column on mobile */}
              {activeTab.items && activeTab.items.length > 0 && (
                <div className="mt-4 sm:mt-5 grid w-full min-w-0 max-w-full grid-cols-1 sm:grid-cols-2 border border-secondary-200/90 bg-white shadow-2xs dark:border-secondary-800 dark:bg-secondary-900 rounded-xl sm:rounded-2xl overflow-hidden">
                  {activeTab.items.map((item, idx) => {
                    const itemSlug =
                      (item as any).slug || GUIDE_SLUG_MAP[item.title];
                    const blogUrl = itemSlug ? `/blog/${itemSlug}` : "/blog";

                    return (
                      <Link
                        key={`${activeTab.slug}-${idx}-${item.title}`}
                        href={blogUrl}
                        className={`group w-full min-w-0 max-w-full flex flex-col justify-between p-4 sm:p-5 min-h-0 sm:min-h-[160px] transition hover:bg-secondary-50/70 dark:hover:bg-secondary-800/50 ${
                          idx % 2 === 0
                            ? "sm:border-r border-secondary-200/90 dark:border-secondary-800"
                            : ""
                        } ${
                          idx < activeTab.items.length - 1
                            ? "max-sm:border-b border-secondary-200/90 dark:border-secondary-800"
                            : ""
                        } ${
                          idx <
                          activeTab.items.length -
                            (activeTab.items.length % 2 === 0 ? 2 : 1)
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
                            <div className="mt-3 sm:mt-3.5 w-full min-w-0 border-l-2 border-primary-500 bg-primary-50/80 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs text-primary-950 dark:bg-primary-500/10 dark:text-primary-200 rounded-md break-words">
                              <strong className="text-primary-800 dark:text-primary-300">
                                Note:
                              </strong>{" "}
                              {item.highlight}
                            </div>
                          )}
                        </div>

                        {/* Dedicated Blog Link Button */}
                        <div className="mt-4 pt-3 border-t border-secondary-100 dark:border-secondary-800/80 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-secondary-600 dark:text-secondary-400">
                            <BookOpen className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                            <span>Field Guide</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-500/10 border border-primary-300/80 dark:border-primary-500/30 text-primary-800 dark:text-primary-300 text-xs font-bold transition-all group-hover:bg-primary-500 group-hover:border-primary-500 group-hover:text-secondary-950 rounded-lg shadow-2xs">
                            <span>Read Blog</span>
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* MOBILE BOTTOM STEPPER NAVIGATION */}
              <div className="mt-4 flex lg:hidden items-center justify-between gap-2 border border-secondary-200/90 bg-white p-2.5 shadow-2xs dark:border-secondary-800 dark:bg-secondary-900 rounded-xl">
                <button
                  type="button"
                  onClick={handlePrevTab}
                  disabled={currentIndex === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-secondary-800 dark:text-secondary-200 disabled:opacity-30 disabled:pointer-events-none hover:bg-secondary-100 dark:hover:bg-secondary-800 transition rounded-lg cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Prev</span>
                </button>

                {/* Progress Indicators */}
                <div className="flex items-center gap-1.5">
                  {effectiveTabs.map((tab, idx) => (
                    <button
                      key={tab.id || tab.slug}
                      type="button"
                      aria-label={`Go to ${tab.category}`}
                      onClick={() => handleSelectTab(tab.slug || tab.id)}
                      className={`h-1.5 transition-all rounded-full ${
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
                  disabled={currentIndex === effectiveTabs.length - 1}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-secondary-950 bg-primary-500 hover:bg-primary-400 disabled:opacity-30 disabled:pointer-events-none disabled:bg-secondary-100 disabled:text-secondary-400 transition rounded-lg cursor-pointer shadow-xs"
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
export default TravelResourcesInteractive;
