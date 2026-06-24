"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, Confidence, SectionTitle } from "@/components/ui";

/* eslint-disable @typescript-eslint/no-explicit-any */
const TYPE_BADGE: Record<string, string> = {
  TARGET_ACCOUNT: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  TRIGGER_OUTREACH: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  PERSONA: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  MESSAGE_ANGLE: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  ICP_REFINEMENT: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  FOLLOW_UP_TIMING: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
};
const typeLabel = (t: string) => t.replace(/_/g, " ").toLowerCase();

export default function OutreachPage() {
  const [data, setData] = useState<any>(null);
  const load = useCallback(() => {
    fetch("/api/sdr").then((r) => r.json()).then(setData);
  }, []);
  useEffect(load, [load]);
  if (!data) return <div className="text-gray-500">Loading outreach…</div>;

  async function resolve(id: string, decision: "ACCEPTED" | "DISMISSED") {
    await fetch(`/api/sdr/${id}/resolve`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    load();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Outreach</h1>
        <p className="mt-1 text-sm text-gray-400">
          Targeting &amp; messaging learned from{" "}
          <span className="text-emerald-300">{data.learnedFrom.wonCount} won</span> and{" "}
          <span className="text-rose-300">{data.learnedFrom.lostCount} lost</span> deals, optimized for qualified pipeline, not opens.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Suggestions */}
        <div className="lg:col-span-2">
          <SectionTitle hint={`${data.suggestions.length} suggestions`}>Recommended actions</SectionTitle>
          {data.suggestions.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">No open suggestions. 🎯</Card>
          ) : (
            <div className="grid gap-3">
              {data.suggestions.map((s: any) => (
                <Card key={s.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`rounded border px-2 py-0.5 text-[11px] font-medium ${TYPE_BADGE[s.type] ?? "bg-edge text-gray-300"}`}>
                      {typeLabel(s.type)}
                    </span>
                    <Confidence value={s.confidence} />
                  </div>
                  <h3 className="mt-2 font-medium">{s.title}</h3>
                  <p className="mt-1 text-sm text-gray-300">{s.rationale}</p>

                  {s.draftMessage && (
                    <div className="mt-2 rounded border border-edge bg-canvas p-2 text-xs text-gray-400">
                      <div className="mb-1 text-[10px] uppercase tracking-wider text-gray-500">Draft opener</div>
                      {s.draftMessage}
                    </div>
                  )}

                  {s.evidence?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {s.evidence.map((e: string, i: number) => (
                        <span key={i} className="rounded border border-edge bg-canvas px-2 py-0.5 text-[11px] text-gray-500">
                          {e}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button onClick={() => resolve(s.id, "ACCEPTED")} className="rounded bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-400">
                      {s.type === "TARGET_ACCOUNT" || s.type === "TRIGGER_OUTREACH" ? "Work this account" : "Accept"}
                    </button>
                    <button onClick={() => resolve(s.id, "DISMISSED")} className="rounded border border-edge px-3 py-1.5 text-xs text-gray-300 hover:bg-edge">
                      Dismiss
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Target accounts */}
        <div>
          <SectionTitle hint="ICP + signal ranked">Target accounts</SectionTitle>
          <div className="grid gap-2">
            {data.targets.map((t: any) => (
              <Card key={t.id} className="p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t.name}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] ${t.status === "WORKING" ? "bg-indigo-500/20 text-indigo-300" : "bg-edge text-gray-400"}`}>
                    {t.status.toLowerCase()}
                  </span>
                </div>
                <div className="text-xs text-gray-500">{t.industry} · {t.employeeCount} employees</div>
                <div className="mt-1 flex gap-3 text-[11px]">
                  <span className="text-gray-400">ICP <span className={t.icpFitScore >= 75 ? "text-emerald-300" : "text-gray-300"}>{t.icpFitScore}</span></span>
                  <span className="text-gray-400">Signal <span className={t.marketSignalScore >= 75 ? "text-emerald-300" : "text-gray-300"}>{t.marketSignalScore}</span></span>
                </div>
                {t.triggerEvents?.length > 0 && (
                  <div className="mt-1 text-[11px] text-sky-300">⚡ {t.triggerEvents.join(" · ")}</div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
