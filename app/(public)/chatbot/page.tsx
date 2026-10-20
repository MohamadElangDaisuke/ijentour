"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MessageSquare, ArrowLeft, Compass } from "lucide-react";

export default function ChatbotPage() {
  useEffect(() => {
    // Open the official assistant modal on mount
    window.dispatchEvent(new CustomEvent("open-tour-assistant"));
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto">
      <div className="w-16 h-16 rounded-3xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center text-primary-600 mb-4 shadow-inner">
        <MessageSquare className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-black text-secondary-950 mb-2">
        Ijen Tour Assistant
      </h1>
      <p className="text-sm text-secondary-600 leading-relaxed mb-6">
        Our official customer assistant is open in the bottom-right window. Feel free to ask questions about tour packages, Blue Fire midnight schedules, pricing, and custom itineraries.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-tour-assistant"))}
          className="px-5 py-2.5 rounded-full bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-xs transition shadow-md cursor-pointer"
        >
          Open Chatbot Window
        </button>
        <Link
          href="/packages"
          className="px-5 py-2.5 rounded-full bg-secondary-900 hover:bg-secondary-800 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
        >
          <Compass className="w-3.5 h-3.5 text-primary-400" />
          <span>Browse Tour Packages</span>
        </Link>
        <Link
          href="/"
          className="px-4 py-2.5 rounded-full border border-secondary-300 hover:bg-secondary-100 text-secondary-700 font-bold text-xs transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Home</span>
        </Link>
      </div>
    </div>
  );
}
