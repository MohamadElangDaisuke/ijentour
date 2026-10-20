"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Compass,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Copy,
  Layers,
  AlertCircle,
} from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import { useBookingModal } from "@/lib/bookingModalStore";
import { LivePackage } from "@/lib/travelAssistant";
import { formatCurrency } from "@/lib/utils";
import { ConversationContext } from "@/lib/ruleEngine/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommendedPackages?: LivePackage[];
  comparisonPackages?: LivePackage[];
  customTrip?: {
    isCustomTrip: boolean;
    targetUrl: string;
    formattedSummary: string;
  } | null;
  suggestedPrompts?: string[];
  timestamp: Date;
  isError?: boolean;
}

interface TravelAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export default function TravelAssistantModal({
  isOpen,
  onClose,
  initialPrompt,
}: TravelAssistantModalProps) {
  const { openBookingModal } = useBookingModal();

  // Initial conversation area MUST BE COMPLETELY EMPTY
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [context, setContext] = useState<ConversationContext>({});
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [comparingPackages, setComparingPackages] = useState<LivePackage[] | null>(null);
  const [copiedSummaryId, setCopiedSummaryId] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen]);

  // Handle ESC key to close modal or comparison drawer immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (comparingPackages) {
          setComparingPackages(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, comparingPackages, onClose]);

  // Auto-close modal whenever the page route changes
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      if (isOpen) {
        onClose();
      }
      prevPathnameRef.current = pathname;
    }
  }, [pathname, isOpen, onClose]);

  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const query = (textToSend || inputValue).trim();
      if (!query || isLoading) return;

      const userMessage: ChatMessage = {
        id: "user-" + Date.now(),
        role: "user",
        content: query,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsLoading(true);
      setLastFailedQuery(null);

      try {
        const payload = {
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context,
        };

        const res = await fetch("/api/ai/travel-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (data.success) {
          const assistantMsg: ChatMessage = {
            id: "assistant-" + Date.now(),
            role: "assistant",
            content: data.message || "Here is the official information from our tour catalog:",
            recommendedPackages: data.recommendedPackages || [],
            comparisonPackages: data.comparisonPackages || [],
            customTrip: data.customTrip || null,
            suggestedPrompts: data.suggestedPrompts || [],
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, assistantMsg]);

          if (data.context) {
            setContext(data.context);
          }

          // If comparison packages returned, open side-by-side comparison
          if (data.comparisonPackages && data.comparisonPackages.length >= 2) {
            setComparingPackages(data.comparisonPackages);
          }
        } else {
          throw new Error(data.error || "Failed to process inquiry.");
        }
      } catch (err: any) {
        console.error("[Chatbot UI] Request error:", err);
        setLastFailedQuery(query);
        const errorMsg: ChatMessage = {
          id: "error-" + Date.now(),
          role: "assistant",
          content:
            "Sorry, there was a temporary issue connecting to the database server. Please try sending your inquiry again or reach us on WhatsApp.",
          isError: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [inputValue, isLoading, messages, context]
  );

  // If initialPrompt is passed from outside
  useEffect(() => {
    if (isOpen && initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt.trim());
    }
  }, [isOpen, initialPrompt, handleSendMessage]);

  const handleResetChat = () => {
    setMessages([]);
    setContext({});
    setComparingPackages(null);
    setLastFailedQuery(null);
  };

  const copyTripSummary = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSummaryId(id);
    setTimeout(() => setCopiedSummaryId(null), 2500);
  };

  return (
    <AnimatePresence>
      {/* Dimmed backdrop for instant exit on clicking outside */}
      {isOpen && (
        <motion.div
          key="assistant-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-secondary-950/40 backdrop-blur-[2px] transition-opacity cursor-pointer"
          aria-hidden="true"
        />
      )}

      {/* Main Floating Assistant Window */}
      {isOpen && (
        <motion.div
          key="assistant-modal-window"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="assistant-modal-title"
          className="fixed bottom-2 right-2 left-2 sm:left-auto sm:bottom-6 sm:right-6 z-50 w-auto sm:w-[440px] max-w-[calc(100vw-16px)] sm:max-w-md h-[min(680px,calc(100dvh-16px))] sm:h-[min(680px,88vh)] bg-white dark:bg-secondary-950 rounded-2xl sm:rounded-3xl shadow-2xl border border-secondary-200/90 dark:border-secondary-800 flex flex-col overflow-hidden backdrop-blur-xl"
        >
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary-950 via-secondary-900 to-secondary-950 text-white p-3.5 px-4 sm:p-4 sm:px-5 border-b border-secondary-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-primary-500/20 border border-primary-500/40 flex items-center justify-center text-primary-400">
                <MessageSquare className="w-5 h-5 text-primary-400" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-secondary-950" />
            </div>
            <div>
              <h3
                id="assistant-modal-title"
                className="font-black text-sm text-white tracking-tight flex items-center gap-1.5"
              >
                <span>Ijen Tour Assistant</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-primary-500 text-secondary-950 font-black uppercase">
                  Official
                </span>
              </h3>
              <p className="text-[11px] text-secondary-400 flex items-center gap-1">
                <span>Customer Service</span>
                <span>•</span>
                <span>Live Database</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleResetChat}
              className="p-2 rounded-xl hover:bg-secondary-800 text-secondary-400 hover:text-white transition cursor-pointer"
              title="Reset Conversation"
              aria-label="Reset Conversation"
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

        {/* Short Description Outside Conversation Area */}
        <div className="px-5 py-2.5 bg-secondary-50/90 dark:bg-secondary-900/90 border-b border-secondary-200/70 dark:border-secondary-800/80 text-[11px] text-secondary-600 dark:text-secondary-300 font-medium flex items-center justify-between shrink-0">
          <span>Ask us about our tours, prices & schedules.</span>
          <span className="text-[10px] text-secondary-400 font-normal">Esc to close</span>
        </div>

        {/* Messages Container */}
        <div
          ref={chatContainerRef}
          className="grow overflow-y-auto p-4 space-y-4 bg-secondary-50/40 dark:bg-secondary-900/40 text-xs sm:text-sm flex flex-col"
        >
          {/* Initial Conversation Area Must Be Completely Empty */}
          {messages.length === 0 ? null : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* Message Bubble */}
                <div
                  className={`max-w-[90%] rounded-2xl p-3.5 sm:p-4 shadow-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary-500 text-secondary-950 font-medium rounded-tr-xs"
                      : msg.isError
                      ? "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 rounded-tl-xs"
                      : "bg-white dark:bg-secondary-900 border border-secondary-200/80 dark:border-secondary-800 text-secondary-900 dark:text-secondary-100 rounded-tl-xs shadow-xs"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <MarkdownRenderer content={msg.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>

                {/* Error Retry Button */}
                {msg.isError && lastFailedQuery && (
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendMessage(lastFailedQuery)}
                      className="px-3 py-1.5 rounded-xl bg-secondary-900 hover:bg-secondary-800 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-primary-400" />
                      <span>Retry Inquiry</span>
                    </button>
                  </div>
                )}

                {/* Rich Recommendation Cards */}
                {msg.recommendedPackages && msg.recommendedPackages.length > 0 && (
                  <div className="w-full mt-3 space-y-2.5">
                    <div className="flex items-center justify-between px-1 text-[11px] font-bold text-secondary-500 uppercase tracking-wider">
                      <span>Verified Tour Packages</span>
                      <span>{msg.recommendedPackages.length} tours</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {msg.recommendedPackages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200/80 dark:border-secondary-800 p-3 shadow-xs hover:shadow-md transition-shadow flex flex-col gap-2.5"
                        >
                          <div className="flex gap-3">
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-secondary-100 border border-secondary-200/60">
                              <img
                                src={pkg.coverImage || "/images/pkg-bluefire.png"}
                                alt={pkg.title}
                                className="w-full h-full object-cover"
                              />
                              {pkg.badge && (
                                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-secondary-950/80 backdrop-blur-xs text-[9px] font-bold text-primary-400">
                                  {pkg.badge}
                                </span>
                              )}
                            </div>

                            <div className="grow min-w-0">
                              <h4 className="font-extrabold text-xs sm:text-sm text-secondary-950 dark:text-white line-clamp-1">
                                {pkg.title}
                              </h4>
                              <p className="text-primary-600 dark:text-primary-400 font-black text-sm mt-0.5">
                                {pkg.price || formatCurrency(pkg.basePrice)}
                              </p>

                              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-secondary-500 font-medium">
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-secondary-400" />
                                  <span>{pkg.duration}</span>
                                </span>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-secondary-400" />
                                  <span>{pkg.meetingPoint || "Banyuwangi"}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Highlights Preview */}
                          {pkg.highlights && pkg.highlights.length > 0 && (
                            <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-xl p-2 text-[11px] text-secondary-600 dark:text-secondary-300">
                              <span className="font-bold text-secondary-800 dark:text-secondary-200 block mb-0.5">
                                Highlights:
                              </span>
                              <ul className="space-y-0.5 line-clamp-2">
                                {pkg.highlights.slice(0, 2).map((h, i) => (
                                  <li key={i} className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3 h-3 text-primary-500 shrink-0" />
                                    <span className="truncate">{h}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Verified Schedule Availability */}
                          {pkg.schedules && pkg.schedules.length > 0 && (
                            <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg">
                              <Calendar className="w-3 h-3 shrink-0" />
                              <span>
                                Upcoming: {pkg.schedules[0].departureDate} (
                                {pkg.schedules[0].availableSlots} slots left)
                              </span>
                            </div>
                          )}

                          {/* Card Action Buttons */}
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-secondary-100 dark:border-secondary-800">
                            <Link
                              href={`/packages/${pkg.id}`}
                              target="_blank"
                              className="px-3 py-1.5 rounded-xl border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-100 dark:hover:bg-secondary-800 font-bold text-[11px] text-secondary-800 dark:text-secondary-200 text-center flex items-center justify-center gap-1 transition"
                            >
                              <span>View Details</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                openBookingModal({
                                  packageName: pkg.title,
                                  pickupLocation: pkg.meetingPoint || "Banyuwangi Area",
                                })
                              }
                              className="px-3 py-1.5 rounded-xl bg-primary-500 hover:bg-primary-600 font-black text-[11px] text-secondary-950 text-center transition cursor-pointer shadow-2xs"
                            >
                              Book This Tour
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Compare Button if multiple packages exist */}
                    {msg.recommendedPackages.length >= 2 && (
                      <button
                        type="button"
                        onClick={() => setComparingPackages(msg.recommendedPackages!)}
                        className="w-full py-2 rounded-xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 font-bold text-xs text-secondary-800 dark:text-secondary-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-primary-600" />
                        <span>Compare Packages Side-by-Side</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Custom Trip Handoff Card */}
                {msg.customTrip && (
                  <div className="w-full mt-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 space-y-2.5 text-secondary-900 dark:text-secondary-100">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-amber-600" />
                      <h4 className="font-black text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        Custom Trip Service
                      </h4>
                    </div>

                    <p className="text-xs text-secondary-700 dark:text-secondary-300 leading-relaxed">
                      Design your personalized tour by choosing custom destinations, duration, private vehicle fleet, and add-on amenities.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <Link
                        href={msg.customTrip.targetUrl || "/custom-package"}
                        target="_blank"
                        className="grow px-3.5 py-2 rounded-xl bg-secondary-950 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-secondary-800 transition shadow-xs text-center"
                      >
                        <span>Open Custom Trip Builder</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          copyTripSummary(
                            msg.customTrip!.formattedSummary || "Custom Trip Request",
                            msg.id
                          )
                        }
                        className="px-3 py-2 rounded-xl border border-secondary-300 dark:border-secondary-700 hover:bg-white dark:hover:bg-secondary-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>
                          {copiedSummaryId === msg.id ? "Copied!" : "Copy Summary"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Suggested Prompts after bot response */}
                {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {msg.suggestedPrompts.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        disabled={isLoading}
                        className="px-2.5 py-1 rounded-full bg-white dark:bg-secondary-900 hover:bg-primary-50 dark:hover:bg-secondary-800 border border-secondary-200/80 dark:border-secondary-800 text-[11px] font-semibold text-secondary-700 dark:text-secondary-300 hover:text-primary-700 dark:hover:text-primary-400 transition cursor-pointer shadow-2xs"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-secondary-400 mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="flex items-start gap-2 animate-fade-in">
              <div className="bg-white dark:bg-secondary-900 border border-secondary-200/80 dark:border-secondary-800 rounded-2xl rounded-tl-xs p-3.5 shadow-xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" />
                <div
                  className="w-2 h-2 rounded-full bg-primary-500 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-primary-500 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
                <span className="text-xs text-secondary-500 font-medium ml-1">
                  Searching official tour database...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-3 bg-white dark:bg-secondary-950 border-t border-secondary-200/80 dark:border-secondary-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about tour packages, pricing, schedules..."
              disabled={isLoading}
              className="grow px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-secondary-100/80 dark:bg-secondary-900 border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-secondary-900 text-base sm:text-sm text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 rounded-2xl bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-secondary-950 font-black transition cursor-pointer shadow-xs shrink-0"
              aria-label="Send inquiry"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-secondary-400 mt-1.5 px-1">
            <span>Accurate answers directly from our official database</span>
            <span>Rule-Based Assistant</span>
          </div>
        </div>
      </motion.div>
    )}

    {/* Side-by-Side Package Comparison Drawer */}
    {isOpen && comparingPackages && comparingPackages.length > 0 && (
      <motion.div
        key="assistant-comparison-drawer"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="pointer-events-auto fixed inset-2 sm:inset-6 md:inset-10 z-60 bg-white dark:bg-secondary-950 rounded-2xl sm:rounded-3xl shadow-2xl border border-secondary-200 dark:border-secondary-800 flex flex-col overflow-hidden max-w-5xl mx-auto my-auto max-h-[92dvh]"
      >
        <div className="p-3.5 px-4 sm:p-4 sm:px-6 bg-secondary-900 text-white flex items-center justify-between border-b border-secondary-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary-400" />
            <h3 className="font-extrabold text-sm sm:text-base">
              Package Comparison ({comparingPackages.length} tours)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setComparingPackages(null)}
            className="p-1.5 rounded-xl hover:bg-secondary-800 text-secondary-400 hover:text-white transition cursor-pointer"
            title="Close Comparison"
            aria-label="Close Comparison"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grow overflow-x-auto p-3 sm:p-6 overflow-y-auto overscroll-contain">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-secondary-200 dark:border-secondary-800">
                    <th className="p-3 font-bold text-secondary-500 w-1/4">Feature</th>
                    {comparingPackages.map((pkg) => (
                      <th key={pkg.id} className="p-3 font-extrabold text-secondary-950 dark:text-white w-1/3">
                        <p className="line-clamp-2 text-sm">{pkg.title}</p>
                        <p className="font-black text-primary-600 dark:text-primary-400 text-base mt-1">
                          {pkg.price || formatCurrency(pkg.basePrice)}
                        </p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                  <tr>
                    <td className="p-3 font-bold text-secondary-500">Duration</td>
                    {comparingPackages.map((pkg) => (
                      <td key={pkg.id} className="p-3 font-medium text-secondary-800 dark:text-secondary-200">
                        {pkg.duration}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-secondary-500">Difficulty</td>
                    {comparingPackages.map((pkg) => (
                      <td key={pkg.id} className="p-3 font-medium text-secondary-800 dark:text-secondary-200">
                        {pkg.difficulty || "Moderate"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-secondary-500">Meeting Point</td>
                    {comparingPackages.map((pkg) => (
                      <td key={pkg.id} className="p-3 font-medium text-secondary-800 dark:text-secondary-200">
                        {pkg.meetingPoint || "Banyuwangi Area"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-secondary-500">Category</td>
                    {comparingPackages.map((pkg) => (
                      <td key={pkg.id} className="p-3 font-medium text-secondary-800 dark:text-secondary-200 capitalize">
                        {pkg.category}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-secondary-500">Included Features</td>
                    {comparingPackages.map((pkg) => (
                      <td key={pkg.id} className="p-3 text-secondary-700 dark:text-secondary-300">
                        <ul className="space-y-1 list-disc pl-4 text-xs">
                          {pkg.included.slice(0, 4).map((inc, idx) => (
                            <li key={idx}>{inc}</li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-secondary-500">Action</td>
                    {comparingPackages.map((pkg) => (
                      <td key={pkg.id} className="p-3 space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            setComparingPackages(null);
                            openBookingModal({
                              packageName: pkg.title,
                              pickupLocation: pkg.meetingPoint || "Banyuwangi",
                            });
                          }}
                          className="w-full py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-secondary-950 font-black text-xs transition shadow-xs cursor-pointer text-center"
                        >
                          Book This Tour
                        </button>
                        <Link
                          href={`/packages/${pkg.id}`}
                          target="_blank"
                          className="w-full py-1.5 rounded-xl border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-100 dark:hover:bg-secondary-800 font-bold text-xs text-secondary-800 dark:text-secondary-200 transition text-center block"
                        >
                          View Package Details
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
    </AnimatePresence>
  );
}
