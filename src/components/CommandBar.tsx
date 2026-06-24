"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Card {
  title: string;
  subtitle?: string;
  dealId?: string;
  href?: string;
  metrics?: { label: string; value: string; tone?: "good" | "bad" | "neutral" }[];
  evidence?: string[];
}
interface Result {
  intent: string;
  headline: string;
  cards: Card[];
}

const toneClass = (t?: string) =>
  t === "good" ? "text-emerald-300" : t === "bad" ? "text-rose-300" : "text-gray-300";

export function CommandBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd/Ctrl-K to open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      if (!suggestions.length) fetch("/api/command-bar").then((r) => r.json()).then((d) => setSuggestions(d.suggestions ?? []));
    }
  }, [open, suggestions.length]);

  async function ask(q: string) {
    setQuery(q);
    setBusy(true);
    const res = await fetch("/api/command-bar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: q }),
    }).then((r) => r.json());
    setResult(res);
    setBusy(false);
  }

  function go(href?: string) {
    if (!href) return;
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="ml-2 flex items-center gap-2 rounded-md border border-edge px-3 py-1.5 text-xs text-gray-400 hover:bg-edge hover:text-gray-200"
        title="Ask anything (⌘K)"
      >
        <span>Ask…</span>
        <kbd className="rounded bg-edge px-1 text-[9px] text-gray-500">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-24" onClick={() => setOpen(false)}>
          <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-edge bg-panel shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (query.trim()) ask(query);
              }}
              className="flex items-center gap-2 border-b border-edge px-4 py-3"
            >
              <span className="text-gray-500">⌕</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about your pipeline… e.g. which deals got riskier?"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-600"
              />
              {busy && <span className="text-xs text-gray-500">thinking…</span>}
            </form>

            <div className="max-h-[55vh] overflow-y-auto p-3">
              {!result ? (
                <div>
                  <div className="px-1 pb-2 text-[10px] uppercase tracking-wider text-gray-500">Try asking</div>
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => ask(s)}
                      className="block w-full rounded px-2 py-1.5 text-left text-sm text-gray-300 hover:bg-edge"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="px-1 pb-2 text-sm text-gray-300">{result.headline}</div>
                  {result.cards.length === 0 ? (
                    <div className="px-1 py-3 text-xs text-gray-500">
                      No matches. Try one of the example prompts.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {result.cards.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => go(c.href)}
                          className="block w-full rounded-lg border border-edge bg-canvas p-3 text-left transition hover:border-gray-600"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium">{c.title}</span>
                            {c.metrics && (
                              <span className="flex shrink-0 gap-2 text-xs">
                                {c.metrics.map((m) => (
                                  <span key={m.label} className="tabular-nums">
                                    <span className="text-gray-500">{m.label} </span>
                                    <span className={toneClass(m.tone)}>{m.value}</span>
                                  </span>
                                ))}
                              </span>
                            )}
                          </div>
                          {c.subtitle && <div className="mt-0.5 text-xs text-gray-500">{c.subtitle}</div>}
                          {c.evidence && c.evidence.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {c.evidence.map((e, j) => (
                                <span key={j} className="rounded border border-edge px-1.5 py-0.5 text-[11px] text-gray-400">
                                  {e}
                                </span>
                              ))}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  <button onClick={() => { setResult(null); setQuery(""); }} className="mt-3 px-1 text-xs text-indigo-400 hover:underline">
                    ← ask something else
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
