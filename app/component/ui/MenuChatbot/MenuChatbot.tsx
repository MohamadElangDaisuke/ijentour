"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, RotateCcw, Home, AlertCircle } from "lucide-react";
import {
  MenuChatbotResponse,
  MenuItem,
  NavigationButton,
  MenuChatbotRequest,
  CategoryId,
} from "./types";
import MenuScreen from "./MenuScreen";
import LoadingDots from "./LoadingDots";

interface MenuChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string; // backward compat — ignored by menu chatbot
}

interface ChatbotContext {
  selectedPackageTitle?: string;
  selectedDestinationName?: string;
  categoryId?: CategoryId;
}

export default function MenuChatbot({ isOpen, onClose }: MenuChatbotProps) {
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  const [currentResponse, setCurrentResponse] = useState<MenuChatbotResponse | null>(null);
  const [history, setHistory] = useState<MenuChatbotResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<ChatbotContext>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const bodyRef = useRef<HTMLDivElement>(null);

  // Auto-close on route change
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      if (isOpen) onClose();
      prevPathnameRef.current = pathname;
    }
  }, [pathname, isOpen, onClose]);

  // ESC key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Scroll body to top whenever screen changes
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [currentResponse]);

  const fetchMenu = useCallback(async (request: MenuChatbotRequest) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/chatbot/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const data = await res.json();
      if (data.success && data.data) {
        return data.data as MenuChatbotResponse;
      } else {
        throw new Error(data.error || "Failed to load menu.");
      }
    } catch (err: any) {
      console.error("[MenuChatbot] fetch error:", err);
      setErrorMessage(err.message || "An error occurred. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMainMenu = useCallback(async () => {
    const response = await fetchMenu({ action: "MAIN_MENU" });
    if (response) {
      setHistory([]);
      setCurrentResponse(response);
    }
  }, [fetchMenu]);

  // On open, load main menu
  useEffect(() => {
    if (isOpen && !currentResponse && !isLoading) {
      loadMainMenu();
    }
    // Reset on close
    if (!isOpen) {
      setCurrentResponse(null);
      setHistory([]);
      setContext({});
      setErrorMessage(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleMenuItemClick = useCallback(
    async (item: MenuItem) => {
      if (isLoading) return;

      // WhatsApp handoff: open WA link directly + show WA screen if link provided
      if (item.action === "WHATSAPP_HANDOFF") {
        const request: MenuChatbotRequest = {
          action: "WHATSAPP_HANDOFF",
          categoryId: item.categoryId,
          itemId: item.itemId,
          subAction: item.subAction,
          context,
        };
        if (currentResponse) {
          setHistory((prev) => [...prev, currentResponse]);
        }
        const response = await fetchMenu(request);
        if (response) {
          setCurrentResponse(response);
          if (response.whatsappLink) {
            window.open(response.whatsappLink, "_blank", "noopener,noreferrer");
          }
        }
        return;
      }

      const request: MenuChatbotRequest = {
        action: item.action,
        categoryId: item.categoryId,
        itemId: item.itemId,
        subAction: item.subAction,
        context,
      };

      if (currentResponse) {
        setHistory((prev) => [...prev, currentResponse]);
      }

      const response = await fetchMenu(request);
      if (response) {
        setCurrentResponse(response);
      }
    },
    [isLoading, currentResponse, context, fetchMenu]
  );

  const handleNavigate = useCallback(
    async (btn: NavigationButton) => {
      if (btn.action === "back") {
        setHistory((prev) => {
          const newHistory = [...prev];
          const previous = newHistory.pop();
          if (previous) {
            setCurrentResponse(previous);
          }
          return newHistory;
        });
        return;
      }

      if (btn.action === "main_menu") {
        setHistory([]);
        await loadMainMenu();
        return;
      }

      if (btn.action === "whatsapp" && btn.whatsappLink) {
        window.open(btn.whatsappLink, "_blank", "noopener,noreferrer");
      }
    },
    [loadMainMenu]
  );

  const handleReset = useCallback(async () => {
    setHistory([]);
    setContext({});
    setErrorMessage(null);
    setCurrentResponse(null);
    await loadMainMenu();
  }, [loadMainMenu]);

  const handlePackageSelect = useCallback(
    async (id: string, title: string) => {
      const newContext: ChatbotContext = { ...context, selectedPackageTitle: title, categoryId: "packages" };
      setContext(newContext);
      if (currentResponse) {
        setHistory((prev) => [...prev, currentResponse]);
      }
      const response = await fetchMenu({
        action: "ITEM_DETAIL",
        categoryId: "packages",
        itemId: id,
        context: newContext,
      });
      if (response) {
        setCurrentResponse(response);
      }
    },
    [context, currentResponse, fetchMenu]
  );

  const handleDestinationSelect = useCallback(
    async (slug: string, name: string) => {
      const newContext: ChatbotContext = { ...context, selectedDestinationName: name, categoryId: "destinations" };
      setContext(newContext);
      if (currentResponse) {
        setHistory((prev) => [...prev, currentResponse]);
      }
      const response = await fetchMenu({
        action: "ITEM_DETAIL",
        categoryId: "destinations",
        itemId: slug,
        context: newContext,
      });
      if (response) {
        setCurrentResponse(response);
      }
    },
    [context, currentResponse, fetchMenu]
  );

  return (
    <AnimatePresence>
      {/* Dimmed backdrop */}
      {isOpen && (
        <motion.div
          key="menu-chatbot-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-secondary-950/40 backdrop-blur-[2px] cursor-pointer"
          aria-hidden="true"
        />
      )}

      {/* Main chatbot window */}
      {isOpen && (
        <motion.div
          key="menu-chatbot-window"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="menu-chatbot-title"
          className="fixed bottom-2 right-2 left-2 sm:left-auto sm:bottom-6 sm:right-6 z-50 w-auto sm:w-[440px] max-w-[calc(100vw-16px)] sm:max-w-md h-[min(680px,calc(100dvh-16px))] sm:h-[min(680px,88vh)] bg-white dark:bg-secondary-950 rounded-2xl sm:rounded-3xl shadow-2xl border border-secondary-200/90 dark:border-secondary-800 flex flex-col overflow-hidden"
        >
          {/* ── Header ── */}
          <div className="bg-gradient-to-r from-secondary-950 via-secondary-900 to-secondary-950 text-white p-3.5 px-4 sm:p-4 sm:px-5 border-b border-secondary-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-primary-500/20 border border-primary-500/40 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary-400" />
                </div>
                {/* Green status dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-secondary-950" />
              </div>
              <div>
                <h3
                  id="menu-chatbot-title"
                  className="font-black text-sm text-white tracking-tight flex items-center gap-1.5"
                >
                  <span>Ijen Tour Assistant</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-primary-500 text-secondary-950 font-black uppercase">
                    Official
                  </span>
                </h3>
                <p className="text-[11px] text-secondary-400 flex items-center gap-1">
                  <span>Interactive Menu</span>
                  <span>•</span>
                  <span>Live Database</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="p-2 rounded-xl hover:bg-secondary-800 text-secondary-400 hover:text-white transition cursor-pointer disabled:opacity-50"
                title="Reset to Main Menu"
                aria-label="Reset to Main Menu"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-red-500/20 text-secondary-400 hover:text-red-400 transition cursor-pointer"
                title="Close Assistant (Esc)"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Greeting strip ── */}
          <div className="px-5 py-2.5 bg-secondary-50/90 dark:bg-secondary-900/90 border-b border-secondary-200/70 dark:border-secondary-800/80 text-[11px] text-secondary-600 dark:text-secondary-300 font-medium flex items-center justify-between shrink-0">
            <span>Select a topic below to get started.</span>
            <span className="text-[10px] text-secondary-400 font-normal">Esc to close</span>
          </div>

          {/* ── Scrollable body ── */}
          <div
            ref={bodyRef}
            className="grow overflow-y-auto p-4 bg-secondary-50/40 dark:bg-secondary-900/40"
          >
            {/* Loading (initial) */}
            {isLoading && !currentResponse && (
              <div className="flex items-center justify-center h-full">
                <LoadingDots />
              </div>
            )}

            {/* Error state */}
            {errorMessage && !isLoading && (
              <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="font-bold text-sm text-secondary-900 dark:text-white">Something went wrong</p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1 max-w-xs">
                    {errorMessage}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadMainMenu}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-secondary-950 font-black text-xs transition cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  Main Menu
                </button>
              </div>
            )}

            {/* Menu screen */}
            {currentResponse && !errorMessage && (
              <MenuScreen
                response={currentResponse}
                onMenuItemClick={handleMenuItemClick}
                onNavigate={handleNavigate}
                isLoading={isLoading}
                onPackageSelect={handlePackageSelect}
                onDestinationSelect={handleDestinationSelect}
              />
            )}
          </div>

          {/* ── Footer strip ── */}
          <div className="px-5 py-2.5 bg-secondary-50/90 dark:bg-secondary-900/90 border-t border-secondary-200/70 dark:border-secondary-800/80 text-[10px] text-secondary-400 font-normal text-center shrink-0">
            Powered by Live Database • Select a menu option above
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
