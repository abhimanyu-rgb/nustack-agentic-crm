"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, ScoreChip, fmtMoney, fmtDate } from "@/components/ui";

interface DealRow {
  id: string;
  name: string;
  accountName: string;
  stageName: string;
  amount: number;
  closeDate: string;
  forecastCategory: string;
  status: string;
  scores: { dealHealth: number; risk: number; stageReadiness: number };
}

function DealsList() {
  const params = useSearchParams();
  const owner = params.get("owner");
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [meta, setMeta] = useState<{ scope: string; ownerName?: string }>({ scope: "self" });

  useEffect(() => {
    const qs = owner ? `?owner=${owner}` : "";
    fetch(`/api/deals${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setDeals(d.deals);
        setMeta({ scope: d.scope, ownerName: d.ownerName });
      });
  }, [owner]);

  const open = deals.filter((d) => d.status === "OPEN");
  const closed = deals.filter((d) => d.status !== "OPEN");

  const heading =
    meta.scope === "owner" && meta.ownerName
      ? `${meta.ownerName}'s deals`
      : meta.scope === "self"
        ? "My deals"
        : "All deals";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{heading}</h1>
          {meta.scope === "owner" && (
            <Link href="/command" className="text-xs text-indigo-400 hover:underline">
              ← back to Command
            </Link>
          )}
        </div>
        {meta.scope === "owner" && (
          <Link href="/deals" className="rounded border border-edge px-3 py-1.5 text-xs text-gray-400 hover:bg-edge">
            Clear filter
          </Link>
        )}
      </div>

      {open.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">No open deals in this view.</Card>
      ) : (
        <div className="grid gap-3">
          {open.map((d) => (
            <Link key={d.id} href={`/deals/${d.id}`}>
              <Card className="flex items-center justify-between p-4 transition hover:border-gray-600">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-gray-500">
                    {d.accountName} · {d.stageName} · {fmtMoney(d.amount)} · closes {fmtDate(d.closeDate)} ·{" "}
                    <span className="text-gray-400">{d.forecastCategory}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <ScoreChip label="Health" value={d.scores.dealHealth} />
                  <ScoreChip label="Readiness" value={d.scores.stageReadiness} />
                  <ScoreChip label="Risk" value={d.scores.risk} invert />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {closed.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wider text-gray-500">Closed</h2>
          <div className="grid gap-2">
            {closed.map((d) => (
              <Card key={d.id} className="flex items-center justify-between p-3 opacity-70">
                <div className="text-sm">{d.name}</div>
                <div className="text-xs text-gray-500">
                  {d.status} · {fmtMoney(d.amount)}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function DealsPage() {
  return (
    <Suspense fallback={<div className="text-gray-500">Loading deals…</div>}>
      <DealsList />
    </Suspense>
  );
}
