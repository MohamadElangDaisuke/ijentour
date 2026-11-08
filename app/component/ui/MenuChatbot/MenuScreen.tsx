"use client";

import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { MenuChatbotResponse, MenuItem, NavigationButton } from "./types";
import NavigationBar from "./NavigationBar";
import LoadingDots from "./LoadingDots";
import PackageCard from "./PackageCard";
import DestinationCard from "./DestinationCard";

interface MenuScreenProps {
  response: MenuChatbotResponse;
  onMenuItemClick: (item: MenuItem) => void;
  onNavigate: (btn: NavigationButton) => void;
  isLoading: boolean;
  onPackageSelect?: (id: string, title: string) => void;
  onDestinationSelect?: (slug: string, name: string) => void;
}

export default function MenuScreen({
  response,
  onMenuItemClick,
  onNavigate,
  isLoading,
  onPackageSelect,
  onDestinationSelect,
}: MenuScreenProps) {
  const { screen, title, subtitle, answerText, menuItems, packages, destinations, navigation, whatsappLink, whatsappMessage } = response;

  const isMainMenu = screen === "MAIN_MENU";

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <LoadingDots />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Title & Subtitle */}
      {(title || subtitle) && (
        <div className="pb-1">
          <h4 className="font-black text-sm text-secondary-900 dark:text-white">{title}</h4>
          {subtitle && (
            <p className="text-[11px] text-secondary-500 dark:text-secondary-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      )}

      {/* MAIN_MENU / SUBMENU: Grid of menu item buttons */}
      {(screen === "MAIN_MENU" || screen === "SUBMENU") && menuItems && menuItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {menuItems.map((item) => (
            <button
              key={`menu-item-${item.id}`}
              type="button"
              onClick={() => onMenuItemClick(item)}
              disabled={isLoading}
              className={`w-full text-left flex items-start gap-2.5 px-3 py-3 rounded-xl border transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group ${
                isMainMenu
                  ? "bg-white dark:bg-secondary-900 border-secondary-200 dark:border-secondary-700 hover:bg-primary-50 dark:hover:bg-primary-950/20 hover:border-primary-300 dark:hover:border-primary-600"
                  : "bg-secondary-50 dark:bg-secondary-900/60 border-secondary-200 dark:border-secondary-700 hover:bg-primary-50 dark:hover:bg-primary-950/20 hover:border-primary-300 dark:hover:border-primary-600"
              }`}
            >
              {item.icon && (
                <span className="text-lg leading-none shrink-0 mt-0.5">{item.icon}</span>
              )}
              <div className="min-w-0">
                <span className="block font-bold text-xs text-secondary-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-300 transition">
                  {item.label}
                </span>
                {item.description && (
                  <span className="block text-[10px] text-secondary-500 dark:text-secondary-400 mt-0.5 leading-relaxed">
                    {item.description}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ITEM_SELECT: Package or Destination cards + optional filter buttons */}
      {screen === "ITEM_SELECT" && (
        <>
          {/* Filter/category buttons if available */}
          {menuItems && menuItems.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pb-1">
              {menuItems.map((item) => (
                <button
                  key={`item-filter-${item.id}`}
                  type="button"
                  onClick={() => onMenuItemClick(item)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 hover:bg-primary-50 dark:hover:bg-primary-950/20 hover:border-primary-300 dark:hover:border-primary-600 text-xs font-bold text-secondary-800 dark:text-secondary-200 transition cursor-pointer disabled:opacity-50"
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {packages && packages.length > 0 && (
            <div className="space-y-2">
              {packages.map((pkg) => (
                <PackageCard
                  key={`pkg-${pkg.id}`}
                  pkg={pkg}
                  onSelect={(id, title) => onPackageSelect?.(id, title)}
                />
              ))}
            </div>
          )}

          {destinations && destinations.length > 0 && (
            <div className="space-y-2">
              {destinations.map((dest) => (
                <DestinationCard
                  key={`dest-${dest.id}`}
                  dest={dest}
                  onSelect={(slug, name) => onDestinationSelect?.(slug, name)}
                />
              ))}
            </div>
          )}

          {(!packages || packages.length === 0) && (!destinations || destinations.length === 0) && (
            <div className="text-center py-6 text-secondary-500 dark:text-secondary-400 text-xs">
              No items found.
            </div>
          )}
        </>
      )}

      {/* ANSWER: Text answer with optional follow-up menu items */}
      {screen === "ANSWER" && (
        <>
          {answerText && (
            <div className="p-4 rounded-xl bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 text-xs text-secondary-800 dark:text-secondary-200 leading-relaxed whitespace-pre-wrap">
              {answerText}
            </div>
          )}

          {/* Follow-up menu items */}
          {menuItems && menuItems.length > 0 && (
            <div className="mt-1">
              <p className="text-[10px] font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-2">
                Related options:
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {menuItems.map((item) => (
                  <button
                    key={`followup-${item.id}`}
                    type="button"
                    onClick={() => onMenuItemClick(item)}
                    disabled={isLoading}
                    className="w-full text-left flex items-start gap-2 px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900/60 hover:bg-primary-50 dark:hover:bg-primary-950/20 hover:border-primary-300 dark:hover:border-primary-600 transition text-xs font-semibold text-secondary-800 dark:text-secondary-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
                  >
                    {item.icon && <span className="shrink-0">{item.icon}</span>}
                    <span className="group-hover:text-primary-700 dark:group-hover:text-primary-300 transition">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* WHATSAPP: CTA card */}
      {screen === "WHATSAPP" && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500 flex items-center justify-center">
            <FaWhatsapp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-black text-sm text-emerald-900 dark:text-emerald-100">
              Continue on WhatsApp
            </h4>
            {answerText && (
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 leading-relaxed">
                {answerText}
              </p>
            )}
          </div>
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm transition shadow-sm cursor-pointer"
            >
              <FaWhatsapp className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          )}
        </div>
      )}

      {/* Navigation bar — always shown except MAIN_MENU */}
      {!isMainMenu && navigation && navigation.length > 0 && (
        <div className="pt-1">
          <NavigationBar
            navigation={navigation}
            onNavigate={onNavigate}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
