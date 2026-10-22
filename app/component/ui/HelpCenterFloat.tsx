"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Mail,
  X,
  ChevronRight,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { getAdminWhatsAppNumber, getWhatsAppLink, WhatsAppTemplates } from "@/lib/whatsapp";
import { OFFICIAL_EMAIL } from "@/lib/constants";
import TravelAssistantModal from "./TravelAssistantModal";

function SupportChatIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="6 4 88 84"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Headband arch */}
      <path
        d="M 23 38 A 30 30 0 0 1 77 38"
        fill="none"
        stroke="currentColor"
        strokeWidth="7.5"
        strokeLinecap="round"
      />

      {/* Left and Right Earcups */}
      <rect x="7" y="34.5" width="18" height="25" rx="9" fill="currentColor" />
      <rect x="75" y="34.5" width="18" height="25" rx="9" fill="currentColor" />

      {/* Central Chat Bubble with Tail and Punched-Out Three Dots */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M 50 23 C 61.6 23 71 32.4 71 44 C 71 49.5 69 54.5 65.5 58.2 C 67.5 62.5 69 64.5 69 64.8 C 69 65 67.8 65 65.5 64.6 C 61.5 63.8 57.5 62.5 53.5 64.4 C 52.3 64.8 51.2 65 50 65 C 38.4 65 29 55.6 29 44 C 29 32.4 38.4 23 50 23 Z M 42 41.5 A 2.5 2.5 0 1 0 42 46.5 A 2.5 2.5 0 1 0 42 41.5 Z M 50 41.5 A 2.5 2.5 0 1 0 50 46.5 A 2.5 2.5 0 1 0 50 41.5 Z M 58 41.5 A 2.5 2.5 0 1 0 58 46.5 A 2.5 2.5 0 1 0 58 41.5 Z"
      />

      {/* Microphone Arm */}
      <path
        d="M 23 65 C 27 75 41 78.5 48 77.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="6.5"
        strokeLinecap="round"
      />

      {/* Microphone Capsule */}
      <circle cx="51" cy="80" r="6.8" fill="currentColor" />
    </svg>
  );
}

export default function HelpCenterFloat() {
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  const [isOpen, setIsOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [initialAssistantPrompt, setInitialAssistantPrompt] = useState<string | undefined>(undefined);

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const [isInHero, setIsInHero] = useState(false);

  // Requirement: Hide Help Center float when user is inside the Hero section
  useEffect(() => {
    const checkHero = () => {
      const heroElement = document.getElementById("hero");
      if (!heroElement) {
        setIsInHero(false);
        return;
      }
      const rect = heroElement.getBoundingClientRect();
      // Hero is active if its bottom hasn't scrolled past top + 80px offset
      setIsInHero(rect.bottom > 80);
    };

    checkHero();
    window.addEventListener("scroll", checkHero, { passive: true });
    window.addEventListener("resize", checkHero, { passive: true });

    return () => {
      window.removeEventListener("scroll", checkHero);
      window.removeEventListener("resize", checkHero);
    };
  }, [pathname]);

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
      {/* Single Unified Floating Help Center Container (Hidden when on Hero section) */}
      <AnimatePresence>
        {(!isInHero || isOpen) && (
          <motion.aside
            key="help-center-floating-aside"
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            aria-label="Ijen Tour Official Help Center"
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end"
          >
        {/* Help Center Panel (Shadcn Popover / Card Style) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="help-center-panel"
              ref={panelRef}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="mb-3 w-[min(380px,calc(100vw-24px))] max-h-[calc(100dvh-96px)] overflow-y-auto overscroll-contain rounded-xl bg-white/95 dark:bg-secondary-900/95 p-4 sm:p-5 shadow-2xl border border-secondary-200/90 dark:border-secondary-800 text-secondary-950 dark:text-white backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-labelledby="help-center-heading"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-secondary-100 dark:border-secondary-800">
                <div>
                  <h3
                    id="help-center-heading"
                    className="text-sm font-semibold tracking-tight text-secondary-900 dark:text-white"
                  >
                    Help & Support
                  </h3>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                    How can we help your journey today?
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1.5 text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors cursor-pointer"
                  aria-label="Close Help Center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* 3 Clear, Direct Support Actions */}
              <div className="py-1 divide-y divide-secondary-100 dark:divide-secondary-800/80">
                {/* 1. AI Assistant */}
                <button
                  type="button"
                  onClick={openChatAssistant}
                  className="w-full text-left py-3 px-2 rounded-lg hover:bg-secondary-100/80 dark:hover:bg-secondary-800/70 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-secondary-900 dark:text-white block">
                        Chat with AI Assistant
                      </span>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate mt-0.5">
                        Instant answers on packages & pricing
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-secondary-400 group-hover:text-secondary-700 dark:group-hover:text-secondary-200 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 2. WhatsApp Direct */}
                <a
                  href={whatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left py-3 px-2 rounded-lg hover:bg-secondary-100/80 dark:hover:bg-secondary-800/70 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                      <FaWhatsapp className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-secondary-900 dark:text-white block">
                        Chat via WhatsApp
                      </span>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate mt-0.5">
                        Direct consultation with our local team
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-secondary-400 group-hover:text-secondary-700 dark:group-hover:text-secondary-200 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {/* 3. Email Support */}
                <a
                  href={`mailto:${OFFICIAL_EMAIL}`}
                  className="w-full text-left py-3 px-2 rounded-lg hover:bg-secondary-100/80 dark:hover:bg-secondary-800/70 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-secondary-900 dark:text-white block">
                        Send an Email
                      </span>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate mt-0.5">
                        {OFFICIAL_EMAIL}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-secondary-400 group-hover:text-secondary-700 dark:group-hover:text-secondary-200 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Trigger Button (Responsive: icon-only on mobile, full pill on desktop) */}
        <motion.button
          ref={triggerButtonRef}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={isOpen ? "Close Help Center" : "Open Help Center"}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className={`flex items-center justify-center rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer border ${
            isOpen
              ? "p-2.5 sm:px-4 sm:py-2.5 gap-2 sm:gap-2.5 bg-secondary-100 text-secondary-900 border-secondary-300 dark:bg-secondary-800 dark:text-white dark:border-secondary-700"
              : "p-2.5 sm:px-4 sm:py-2.5 gap-2 sm:gap-2.5 bg-white/95 text-secondary-900 border-secondary-200/90 hover:bg-secondary-50/90 dark:bg-secondary-900/95 dark:text-white dark:border-secondary-700/80 dark:hover:bg-secondary-800/90 shadow-lg shadow-secondary-950/10 dark:shadow-secondary-950/40 backdrop-blur-md"
          }`}
        >
          {isOpen ? (
            <>
              <X className="h-5 w-5 sm:h-4 sm:w-4 text-secondary-500 dark:text-secondary-400" />
              <span className="hidden sm:inline font-medium text-xs sm:text-sm">Close</span>
            </>
          ) : (
            <>
              <SupportChatIcon className="h-6 w-6 sm:h-6.5 sm:w-6.5 text-primary-600 dark:text-primary-400 shrink-0" />
              <span className="hidden sm:inline font-semibold sm:font-medium text-xs sm:text-sm">
                Help Center
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Online</span>
              </span>
            </>
          )}
        </motion.button>
      </motion.aside>
    )}
  </AnimatePresence>

      {/* Full Ijen Tour Assistant Window */}
      <TravelAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        initialPrompt={initialAssistantPrompt}
      />
    </>
  );
}
