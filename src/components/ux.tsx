"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

// --- Skeleton loaders --------------------------------------------------------

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-edge ${className}`} />;
}

// A few rows of card-shaped skeletons for list pages.
export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-xl border border-edge bg-panel p-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-2 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

// --- Empty state -------------------------------------------------------------

export function EmptyState({ icon = "✦", title, hint }: { icon?: string; title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-edge bg-panel p-10 text-center">
      <div className="text-2xl">{icon}</div>
      <div className="mt-2 font-medium">{title}</div>
      {hint && <div className="mt-1 text-sm text-gray-500">{hint}</div>}
    </div>
  );
}

// --- First-run hint banner (dismissible, remembered per key) -----------------

export function HintBanner({ id, children }: { id: string; children: React.ReactNode }) {
  const [dismissed, setDismissed] = useState(true);
  const key = `nustack-hint-${id}`;
  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(key) === "1");
    } catch {
      setDismissed(false);
    }
  }, [key]);
  if (dismissed) return null;
  return (
    <div className="mb-4 flex items-start gap-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 py-2.5 text-sm text-indigo-200">
      <span aria-hidden>💡</span>
      <div className="flex-1">{children}</div>
      <button
        onClick={() => {
          try {
            localStorage.setItem(key, "1");
          } catch {
            /* ignore */
          }
          setDismissed(true);
        }}
        className="text-xs text-indigo-300/70 hover:text-indigo-100"
        aria-label="Dismiss hint"
      >
        Got it
      </button>
    </div>
  );
}

// --- Toasts ------------------------------------------------------------------

interface Toast {
  id: number;
  message: string;
  tone: "success" | "error" | "info";
}
interface ToastCtx {
  toast: (message: string, tone?: Toast["tone"]) => void;
}
const Ctx = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(Ctx);

let _id = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = ++_id;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-lg border px-4 py-2.5 text-sm shadow-lg ${
              t.tone === "error"
                ? "border-rose-500/40 bg-rose-500/15 text-rose-200"
                : t.tone === "info"
                  ? "border-sky-500/40 bg-sky-500/15 text-sky-200"
                  : "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

// --- Tooltip for jargon (hover/focus) ---------------------------------------

export function Info({ tip }: { tip: string }) {
  return (
    <span className="group relative ml-1 inline-flex cursor-help">
      <span className="grid h-3.5 w-3.5 place-items-center rounded-full border border-current text-[9px] text-gray-500">
        i
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 w-56 -translate-x-1/2 rounded-md border border-edge bg-panel p-2 text-xs font-normal normal-case tracking-normal text-gray-300 opacity-0 shadow-xl transition group-hover:opacity-100">
        {tip}
      </span>
    </span>
  );
}
