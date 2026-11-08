"use client";

import React from "react";
import { ChevronLeft, Home } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { NavigationButton } from "./types";

interface NavigationBarProps {
  navigation: NavigationButton[];
  onNavigate: (btn: NavigationButton) => void;
  isLoading?: boolean;
}

export default function NavigationBar({ navigation, onNavigate, isLoading }: NavigationBarProps) {
  if (!navigation || navigation.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {navigation.map((btn, idx) => {
        if (btn.action === "back") {
          return (
            <button
              key={`nav-back-${idx}`}
              type="button"
              onClick={() => onNavigate(btn)}
              disabled={isLoading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700 border border-secondary-200 dark:border-secondary-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{btn.label}</span>
            </button>
          );
        }

        if (btn.action === "main_menu") {
          return (
            <button
              key={`nav-main-${idx}`}
              type="button"
              onClick={() => onNavigate(btn)}
              disabled={isLoading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary-900 dark:bg-secondary-800 text-secondary-200 dark:text-secondary-300 hover:bg-secondary-700 dark:hover:bg-secondary-700 border border-secondary-700 dark:border-secondary-600 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{btn.label}</span>
            </button>
          );
        }

        if (btn.action === "whatsapp") {
          return (
            <button
              key={`nav-wa-${idx}`}
              type="button"
              onClick={() => onNavigate(btn)}
              disabled={isLoading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <FaWhatsapp className="w-3.5 h-3.5" />
              <span>{btn.label}</span>
            </button>
          );
        }

        return null;
      })}
    </div>
  );
}
