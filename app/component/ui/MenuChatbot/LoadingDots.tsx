"use client";

import React from "react";

export default function LoadingDots() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={`dot-${i}`}
            className="w-2.5 h-2.5 rounded-full bg-primary-500"
            style={{
              animation: "bounce 1.2s infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <p className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">
        Loading information...
      </p>
      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
