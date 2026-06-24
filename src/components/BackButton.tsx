"use client";

import { useRouter } from "next/navigation";

// History-aware back link: returns the user to wherever they came from
// (Today, Command, Forecast, a filtered list, etc.). Falls back to `fallback`
// if there's no in-app history (e.g. the page was opened directly).
export function BackButton({ fallback = "/", label = "Back" }: { fallback?: string; label?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        // window.history.length > 1 means there's somewhere to go back to.
        if (typeof window !== "undefined" && window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200"
    >
      <span aria-hidden>←</span> {label}
    </button>
  );
}
