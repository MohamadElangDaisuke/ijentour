"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-secondary-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold mb-2">Something Went Wrong</h2>
      <p className="text-secondary-400 text-sm mb-6 max-w-md">
        An unexpected error occurred while loading this page. Please try again.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="px-6 py-2.5 rounded-full bg-primary-500 hover:bg-primary-400 text-secondary-950 font-bold text-sm transition cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}
