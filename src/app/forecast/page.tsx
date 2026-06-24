"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, SectionTitle, fmtMoney } from "@/components/ui";

const CATEGORIES = ["PIPELINE", "BEST_CASE", "COMMIT", "OMITTED"];
const REASONS = [
  { code: "NO_BUDGET_CONFIRMATION", label: "Budget not confirmed" },
  { code: "WEAK_NEXT_STEP", label: "Weak next step" },
  { code: "CUSTOMER_TIMING_WRONG", label: "Timing wrong" },
  { code: "COMPETITOR_MISCLASSIFIED", label: "Competitive risk" },
  { code: "OTHER", label: "Other" },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function ForecastPage() {
  const [data, setData] = useState<any>(null);
  const [forbidden, setForbidden] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/forecast").then(async (r) => {
      if (r.status === 403) return setForbidden(true);
      setData(await r.json());
    });
  }, []);
  useEffect(load, [load]);

  if (forbidden)
    return (
      <div className="rounded-xl border border-edge bg-panel/70 p-8 text-center">
        <div className="text-lg font-medium">Forecast Review is for managers &amp; admins</div>
        <p className="mt-1 text-sm text-gray-500">Switch to a manager or admin user to view the team forecast.</p>
      </div>
    );
  if (!data) return <div className="text-gray-500">Loading forecast…</div>;

  async function override(dealId: string, category: string, reasonCode: string) {
    await fetch(`/api/forecast/${dealId}/override`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ category, reasonCode }),
    });
    setEditing(null);
    load();
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Forecast Review</h1>
      <p className="mb-6 text-sm text-gray-400">Manager view · explainable, evidence-backed forecast</p>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Pipeline" value={data.rollup.pipeline} />
        <Stat label="Best case" value={data.rollup.bestCase} />
        <Stat label="Commit" value={data.rollup.commit} accent />
        <Stat label="Total open" value={data.rollup.total} />
      </div>

      <Card className="overflow-hidden">
        <SectionTitle>
          <span className="px-4 pt-4 block">Open deals</span>
        </SectionTitle>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-edge text-left text-xs uppercase tracking-wider text-gray-500">
              <th className="px-4 py-2 font-medium">Deal</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Category</th>
              <th className="px-4 py-2 font-medium">Risk</th>
              <th className="px-4 py-2 font-medium">Confidence</th>
              <th className="px-4 py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.deals.map((d: any) => (
              <tr key={d.id} className="border-b border-edge/50 last:border-0">
                <td className="px-4 py-2.5">
                  <Link href={`/deals/${d.id}`} className="hover:text-indigo-300">{d.name}</Link>
                  {d.recentlyChanged && <span className="ml-2 rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] text-violet-300">changed</span>}
                </td>
                <td className="px-4 py-2.5 tabular-nums text-gray-400">{fmtMoney(d.amount)}</td>
                <td className="px-4 py-2.5">
                  <span className="rounded bg-edge px-2 py-0.5 text-xs">{d.forecastCategory}</span>
                  {d.previousCategory && <span className="ml-1 text-[10px] text-gray-600">was {d.previousCategory}</span>}
                </td>
                <td className={`px-4 py-2.5 tabular-nums ${d.riskScore >= 60 ? "text-rose-300" : "text-gray-400"}`}>{d.riskScore}</td>
                <td className="px-4 py-2.5 tabular-nums text-gray-400">{d.forecastConfidence}</td>
                <td className="px-4 py-2.5">
                  {editing === d.id ? (
                    <div className="flex flex-wrap items-center gap-1">
                      {CATEGORIES.map((c) => (
                        <ReasonMenu key={c} category={c} onPick={(reason) => override(d.id, c, reason)} reasons={REASONS} />
                      ))}
                      <button onClick={() => setEditing(null)} className="text-xs text-gray-500 hover:text-gray-300">cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditing(d.id)} className="rounded border border-edge px-2 py-1 text-xs text-gray-400 hover:bg-edge">
                      Override
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {data.overridePatterns.length > 0 && (
        <Card className="mt-5 p-4">
          <SectionTitle hint="learning signal">Override patterns</SectionTitle>
          <div className="space-y-1 text-xs text-gray-400">
            {data.overridePatterns.map((o: any) => (
              <div key={o.id} className="flex justify-between">
                <span>{o.type}: {o.from} → {o.to}</span>
                <span className="text-gray-600">{o.reason.replace(/_/g, " ").toLowerCase()}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <Card className={`p-4 ${accent ? "border-violet-500/40" : ""}`}>
      <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
      <div className={`text-xl font-semibold tabular-nums ${accent ? "text-violet-300" : ""}`}>{fmtMoney(value)}</div>
    </Card>
  );
}

function ReasonMenu({ category, onPick, reasons }: { category: string; onPick: (reason: string) => void; reasons: { code: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="rounded bg-indigo-500/20 px-2 py-1 text-xs text-indigo-200 hover:bg-indigo-500/30">
        {category}
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-44 rounded border border-edge bg-panel p-1 shadow-xl">
          <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-gray-500">Reason</div>
          {reasons.map((r) => (
            <button key={r.code} onClick={() => onPick(r.code)} className="block w-full rounded px-2 py-1 text-left text-xs text-gray-300 hover:bg-edge">
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
