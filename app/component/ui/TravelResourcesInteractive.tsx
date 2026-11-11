"use client";

import { useState } from "react";
import {
  FileText,
  Shirt,
  Footprints,
  HeartPulse,
  Lightbulb,
  CheckCircle2,
  Info,
} from "lucide-react";

interface ChecklistItem {
  title: string;
  desc: string;
  highlight?: string;
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
      },
      {
        title: "BBKSDA Online Entry Ticket",
        desc: "Book your official permit online via the East Java BBKSDA ticketing system before reaching the Paltuding checkpoint.",
        highlight: "On-site ticket purchases at the entrance are often unavailable due to strict daily visitor quotas.",
      },
      {
        title: "Official Photo ID",
        desc: "Carry valid physical identification (Passport for international visitors, or National ID/Driver's License for domestic visitors) for ticket checks.",
        highlight: "The identification name must match the name on your online booking permit.",
      },
      {
        title: "Cash in Indonesian Rupiah (IDR)",
        desc: "Prepare small cash denominations to rent equipment (gas masks, traditional Ijen trolley carts) or purchase warm drinks and snacks at basecamp.",
        highlight: "ATM machines and digital cellular signals at Paltuding are very limited.",
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
      },
      {
        title: "Thermal Base Layers",
        desc: "Wear moisture-wicking thermal tops and leggings to keep your core dry and prevent chills during rest stops.",
      },
      {
        title: "Outdoor Trekking Pants",
        desc: "Choose flexible, quick-drying outdoor trousers designed for trekking.",
        highlight: "Avoid stiff denim jeans so your legs can move naturally and comfortably on steep trails.",
      },
      {
        title: "Warm Gloves & Beanie",
        desc: "Crucial for keeping your ears and fingertips warm against freezing early-morning temperatures.",
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
      },
      {
        title: "Headlamp / Flashlight",
        desc: "The mountain trail has no pathway lighting. A headlamp is strongly recommended to keep both hands free for balance.",
      },
      {
        title: "Sturdy Trekking Shoes",
        desc: "Wear sturdy hiking or trail shoes with deep anti-slip tread to tackle slippery volcanic dust both uphill and downhill.",
      },
      {
        title: "Trekking Poles",
        desc: "Greatly relieves strain on knees and joints, helps maintain balance on steep inclines, and supports the descent.",
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
      },
      {
        title: "High-Calorie Trail Snacks",
        desc: "Pack easily digestible high-calorie snacks such as chocolate, dates, honey sticks, or biscuits for fast energy boosts.",
      },
      {
        title: "Personal Medication",
        desc: "Bring antacids, motion sickness tablets, pain relief, and a personal inhaler if you have any history of mild respiratory sensitivity.",
      },
      {
        title: "Eye Drops & Spare Masks",
        desc: "Very useful for soothing stinging eyes caused by shifting sulfur gas fumes, along with spare medical masks for the return journey.",
        highlight: "Apply lubricating eye drops if your eyes feel irritated from volcanic sulfur gas.",
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
      },
      {
        title: "Check Operational Schedule (Ijen Clean-Up)",
        desc: "Mount Ijen is routinely closed on the first Friday of each month for conservation and environmental clean-up. Verify dates in advance.",
        highlight: "Always reconfirm your trekking dates with our team before booking your trip.",
      },
      {
        title: "Yield to Sulfur Miners",
        desc: "The trail is actively shared with local sulfur miners carrying baskets up to 80 kg. Always give them right-of-way and step aside safely.",
      },
      {
        title: "Leave No Trace & Respect Locals",
        desc: "Do not litter along trails or at the crater. Always ask politely with a smile before taking photographs of miners at work.",
      },
    ],
  },
];

export function TravelResourcesInteractive() {
  const [activeTabId, setActiveTabId] = useState<string>("documents");

  const activeTab = tabsData.find((tab) => tab.id === activeTabId) || tabsData[0];
  const IconComponent = activeTab.icon;

  return (
    <div className="w-full min-w-0 max-w-full">
      {/* Main container in theme palette (Crater Teal Soft & Accent Gold) with clean edges */}
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

              {/* Tab Navigation: Horizontal swipe on mobile (contained within parent width), Vertical stack on desktop */}
              <div className="w-full min-w-0 max-w-full overflow-hidden">
                <div className="flex w-full min-w-0 max-w-full gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0 scroll-smooth snap-x snap-mandatory overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {tabsData.map((tab) => {
                    const isActive = tab.id === activeTabId;
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTabId(tab.id)}
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
                        <span className="truncate">{tab.tabLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Note / Info Callout below left tabs on desktop */}
            <div className="mt-6 hidden lg:flex items-start gap-3 border border-secondary-200/90 bg-white/90 p-4 text-xs text-secondary-600 shadow-2xs dark:border-secondary-800/80 dark:bg-secondary-900/60 dark:text-secondary-300 rounded-xl">
              <Info className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400 mt-0.5" />
              <p className="leading-relaxed">
                Select a category above to review mandatory travel documents, recommended equipment, and essential guidelines before your trek.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: ACTIVE DETAIL CONTENT (Fluid 100% width on mobile) */}
          <div className="w-full min-w-0 max-w-full lg:col-span-8 xl:col-span-8">
            <div key={activeTab.id} className="w-full min-w-0 max-w-full flex flex-col justify-start transition-opacity duration-200">
              {/* Right Content Header: Icon + Title */}
              <div className="w-full min-w-0 max-w-full">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center border border-primary-200 bg-primary-100/80 text-primary-700 shadow-2xs dark:border-primary-500/30 dark:bg-primary-500/15 dark:text-primary-400 shrink-0 rounded-xl">
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
                  {activeTab.subtitle}
                </p>
              </div>

              {/* CONTENT GRID: 1 column on mobile, 2 columns on tablet/desktop */}
              <div className="mt-4 sm:mt-5 grid w-full min-w-0 max-w-full grid-cols-1 sm:grid-cols-2 border border-secondary-200/90 bg-white shadow-2xs dark:border-secondary-800 dark:bg-secondary-900 rounded-xl sm:rounded-2xl overflow-hidden">
                {activeTab.items.map((item, idx) => (
                  <div
                    key={item.title}
                    className={`w-full min-w-0 max-w-full flex flex-col justify-between p-4 sm:p-5 min-h-0 sm:min-h-[145px] transition hover:bg-secondary-50/70 dark:hover:bg-secondary-800/50 ${
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
                          className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary-600 dark:text-primary-400 mt-0.5"
                          aria-hidden="true"
                        />
                        <h4 className="font-bold text-secondary-950 text-sm sm:text-base leading-snug dark:text-white break-words min-w-0 flex-1">
                          {item.title}
                        </h4>
                      </div>
                      <p className="mt-2 text-xs sm:text-sm text-secondary-600 leading-relaxed dark:text-secondary-300 break-words">
                        {item.desc}
                      </p>
                    </div>

                    {item.highlight && (
                      <div className="mt-3 sm:mt-3.5 w-full min-w-0 border-l-2 border-primary-500 bg-primary-50/80 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs text-primary-950 dark:bg-primary-500/10 dark:text-primary-200 rounded-r-md break-words">
                        <strong className="text-primary-800 dark:text-primary-300">Note:</strong> {item.highlight}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
