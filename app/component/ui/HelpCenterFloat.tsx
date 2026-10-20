"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Mail,
  X,
  ChevronRight,
  ExternalLink,
  Headphones,
} from "lucide-react";
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa";
import { getAdminWhatsAppNumber, getWhatsAppLink, WhatsAppTemplates } from "@/lib/whatsapp";
import { OFFICIAL_SOCIAL_LINKS, OFFICIAL_EMAIL } from "@/lib/constants";
import TravelAssistantModal from "./TravelAssistantModal";

export default function HelpCenterFloat() {
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  const [isOpen, setIsOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [initialAssistantPrompt, setInitialAssistantPrompt] = useState<string | undefined>(undefined);

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  // Requirement 6: Automatically close Help Center panel & Chatbot modal on route navigation
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      setIsOpen(false);
      setIsAssistantOpen(false);
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  // Close panel on ESC or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isAssistantOpen) {
        setIsOpen(false);
        triggerButtonRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerButtonRef.current &&
        !triggerButtonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isAssistantOpen]);

  // Global event listener to open Assistant from buttons on any page
  useEffect(() => {
    const handleOpenAssistant = (e: any) => {
      setIsAssistantOpen(true);
      setIsOpen(false);
      if (e.detail?.prompt) {
        setInitialAssistantPrompt(e.detail.prompt);
      }
    };
    window.addEventListener("open-ai-assistant", handleOpenAssistant);
    window.addEventListener("open-tour-assistant", handleOpenAssistant);

    const checkHash = () => {
      if (
        typeof window !== "undefined" &&
        (window.location.hash === "#tour-assistant" || window.location.hash === "#ai-assistant")
      ) {
        setIsAssistantOpen(true);
        setIsOpen(false);
      }
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);

    return () => {
      window.removeEventListener("open-ai-assistant", handleOpenAssistant);
      window.removeEventListener("open-tour-assistant", handleOpenAssistant);
      window.removeEventListener("hashchange", checkHash);
    };
  }, []);

  // Verified contacts
  const whatsAppNumber = getAdminWhatsAppNumber();
  const whatsAppLink = getWhatsAppLink(WhatsAppTemplates.generalInquiry());

  const openChatAssistant = () => {
    setInitialAssistantPrompt(undefined);
    setIsAssistantOpen(true);
    setIsOpen(false);
  };

  return (
    <>
      {/* Single Unified Floating Help Center Container (Reference #3) */}
      <aside
        aria-label="Ijen Tour Official Help Center"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end"
      >
        {/* Help Center Panel (Reference Design #3) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="help-center-panel"
              ref={panelRef}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mb-2.5 sm:mb-3 w-[min(380px,calc(100vw-24px))] max-h-[calc(100dvh-96px)] overflow-y-auto overscroll-contain rounded-2xl sm:rounded-3xl bg-white dark:bg-secondary-950 p-3.5 sm:p-5 shadow-2xl border border-secondary-200/90 dark:border-secondary-800 text-secondary-950 dark:text-white backdrop-blur-xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="help-center-heading"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-secondary-100 dark:border-secondary-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/30 flex items-center justify-center">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      id="help-center-heading"
                      className="font-black text-sm text-secondary-950 dark:text-white leading-tight"
                    >
                      Ijen Tour Help Center
                    </h3>
                    <p className="text-[11px] text-secondary-500 dark:text-secondary-400">
                      Official assistance & direct contact channels
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl text-secondary-400 hover:text-secondary-700 dark:hover:text-white hover:bg-secondary-100 dark:hover:bg-secondary-800 transition cursor-pointer"
                  aria-label="Close Help Center Panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Support Channels */}
              <div className="space-y-2.5">
                {/* 1. Ijen Tour Assistant (Chatbot) */}
                <button
                  type="button"
                  onClick={openChatAssistant}
                  className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-r from-primary-500/15 via-primary-500/10 to-amber-500/10 hover:from-primary-500/25 hover:to-amber-500/20 border border-primary-500/35 transition flex items-center justify-between gap-3 group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-secondary-950 text-primary-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <MessageSquare className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs sm:text-sm text-secondary-950 dark:text-white">
                          Ijen Tour Assistant
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-primary-500 text-secondary-950 font-black text-[9px] uppercase tracking-wider">
                          Official
                        </span>
                      </div>
                      <p className="text-[11px] text-secondary-600 dark:text-secondary-300 line-clamp-1 mt-0.5">
                        Tour packages, prices & departure schedules
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 2. Official WhatsApp Consultation */}
                <a
                  href={whatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left p-3.5 rounded-2xl bg-secondary-50 dark:bg-secondary-900/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-secondary-200/80 dark:border-secondary-800 hover:border-emerald-300 transition flex items-center justify-between gap-3 group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <FaWhatsapp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs sm:text-sm text-secondary-950 dark:text-white block">
                          WhatsApp Consultation
                        </span>
                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold text-[9px]">
                          24/7
                        </span>
                      </div>
                      <p className="text-[11px] text-secondary-500 dark:text-secondary-400 mt-0.5">
                        +{whatsAppNumber} (Direct Coordinator)
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-secondary-400 group-hover:text-emerald-600 shrink-0 transition" />
                </a>

                {/* 3. Official Email Support */}
                <a
                  href={`mailto:${OFFICIAL_EMAIL}`}
                  className="w-full text-left p-3.5 rounded-2xl bg-secondary-50 dark:bg-secondary-900/60 hover:bg-secondary-100 dark:hover:bg-secondary-800 border border-secondary-200/80 dark:border-secondary-800 transition flex items-center justify-between gap-3 group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-secondary-900 dark:bg-secondary-800 text-secondary-100 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <Mail className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-secondary-950 dark:text-white block">
                        Email Support
                      </span>
                      <p className="text-[11px] text-secondary-500 dark:text-secondary-400 mt-0.5">
                        {OFFICIAL_EMAIL}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-secondary-400 group-hover:text-secondary-700 shrink-0 transition" />
                </a>
              </div>

              {/* 4. Verified Official Social Media Row */}
              <div className="mt-3.5 pt-3 border-t border-secondary-100 dark:border-secondary-800">
                <div className="flex items-center justify-between mb-2 px-0.5">
                  <span className="text-[11px] font-bold text-secondary-500 uppercase tracking-wider">
                    Official Social Channels
                  </span>
                  <span className="text-[10px] text-secondary-400">Verified</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {/* Instagram */}
                  <a
                    href={OFFICIAL_SOCIAL_LINKS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Official Instagram"
                    title="Instagram @alyaanvi"
                    className="flex flex-col items-center justify-center py-2 px-0.5 sm:py-2.5 sm:px-1 rounded-2xl bg-secondary-50 dark:bg-secondary-900 hover:bg-pink-50 dark:hover:bg-pink-950/30 border border-secondary-200/80 dark:border-secondary-800 hover:border-pink-300 transition text-secondary-700 dark:text-secondary-300 hover:text-pink-600 group"
                  >
                    <FaInstagram className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] sm:text-[10px] font-semibold">Instagram</span>
                  </a>

                  {/* Facebook */}
                  <a
                    href={OFFICIAL_SOCIAL_LINKS.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Official Facebook"
                    title="Facebook @ijentour"
                    className="flex flex-col items-center justify-center py-2 px-0.5 sm:py-2.5 sm:px-1 rounded-2xl bg-secondary-50 dark:bg-secondary-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-secondary-200/80 dark:border-secondary-800 hover:border-blue-300 transition text-secondary-700 dark:text-secondary-300 hover:text-blue-600 group"
                  >
                    <FaFacebook className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] sm:text-[10px] font-semibold">Facebook</span>
                  </a>

                  {/* YouTube */}
                  <a
                    href={OFFICIAL_SOCIAL_LINKS.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Official YouTube"
                    title="YouTube @ijentour"
                    className="flex flex-col items-center justify-center py-2 px-0.5 sm:py-2.5 sm:px-1 rounded-2xl bg-secondary-50 dark:bg-secondary-900 hover:bg-red-50 dark:hover:bg-red-950/30 border border-secondary-200/80 dark:border-secondary-800 hover:border-red-300 transition text-secondary-700 dark:text-secondary-300 hover:text-red-600 group"
                  >
                    <FaYoutube className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] sm:text-[10px] font-semibold">YouTube</span>
                  </a>

                  {/* TikTok */}
                  <a
                    href={OFFICIAL_SOCIAL_LINKS.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Official TikTok"
                    title="TikTok @ijentour"
                    className="flex flex-col items-center justify-center py-2 px-0.5 sm:py-2.5 sm:px-1 rounded-2xl bg-secondary-50 dark:bg-secondary-900 hover:bg-secondary-100 dark:hover:bg-secondary-800 border border-secondary-200/80 dark:border-secondary-800 transition text-secondary-700 dark:text-secondary-300 hover:text-secondary-950 dark:hover:text-white group"
                  >
                    <FaTiktok className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] sm:text-[10px] font-semibold">TikTok</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Trigger Button (Single Hub) */}
        <motion.button
          ref={triggerButtonRef}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={isOpen ? "Close Help Center" : "Open Ijen Tour Help Center"}
          title={isOpen ? "Close Help Center" : "Open Ijen Tour Help Center (Chatbot, WhatsApp & Support)"}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 sm:gap-2.5 rounded-full px-3.5 py-2.5 sm:px-5 sm:py-3.5 shadow-2xl transition-all cursor-pointer font-black text-xs sm:text-sm ${
            isOpen
              ? "bg-secondary-950 text-white shadow-secondary-950/40 border border-secondary-700"
              : "bg-gradient-to-r from-secondary-950 via-secondary-900 to-secondary-950 text-white border border-primary-500/50 shadow-xl shadow-secondary-950/30 hover:border-primary-400"
          }`}
        >
          {isOpen ? (
            <>
              <X className="w-5 h-5 text-primary-400" />
              <span>Close Help</span>
            </>
          ) : (
            <>
              <div className="relative">
                <Headphones className="w-5 h-5 text-primary-400" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-secondary-950 animate-pulse" />
              </div>
              <span className="hidden sm:inline">Help Center</span>
              <span className="sm:hidden">Help</span>
              <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary-500/20 text-primary-300 text-[10px] font-bold">
                Online
              </span>
            </>
          )}
        </motion.button>
      </aside>

      {/* Full Ijen Tour Assistant Window */}
      <TravelAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        initialPrompt={initialAssistantPrompt}
      />
    </>
  );
}
