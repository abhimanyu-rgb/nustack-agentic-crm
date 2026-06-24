"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, ScoreChip, fmtMoney, fmtDate } from "@/components/ui";
import { BackButton } from "@/components/BackButton";
import { EmptyState, SkeletonList } from "@/components/ux";

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
  const risk = params.get("risk");
  const stage = params.get("stage");
  const forecast = params.get("forecast");
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [meta, setMeta] = useState<{ scope: string; ownerName?: string; filterLabel?: string }>({ scope: "self" });

  const hasFilter = Boolean(owner || risk || stage || forecast);

  useEffect(() => {
    const q = new URLSearchParams();
    if (owner) q.set("owner", owner);
    if (risk) q.set("risk", risk);
    if (stage) q.set("stage", stage);
    if (forecast) q.set("forecast", forecast);
    const qs = q.toString();
    fetch(`/api/deals${qs ? `?${qs}` : ""}`)
      .then((r) => r.json())
      .then((d) => {
        setDeals(d.deals);
        setMeta({ scope: d.scope, ownerName: d.ownerName, filterLabel: d.filterLabel });
      });
  }, [owner, risk, stage, forecast]);

  const open = deals.filter((d) => d.status === "OPEN");
  const closed = deals.filter((d) => d.status !== "OPEN");

  // Build a heading from owner scope + any active filter.
  const whose =
    meta.scope === "owner" && meta.ownerName ? `${meta.ownerName}'s` : meta.scope === "self" ? "My" : "All";
  const heading = meta.filterLabel ? `${whose} deals · ${meta.filterLabel}` : `${whose} deals`;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          {hasFilter && <div className="mb-1"><BackButton fallback="/deals" /></div>}
          <h1 className="text-2xl font-semibold">{heading}</h1>
        </div>
        {hasFilter && (
          <Link href="/deals" className="rounded border border-edge px-3 py-1.5 text-xs text-gray-400 hover:bg-edge">
            Clear filter
          </Link>
        )}
      </div>

      {open.length === 0 ? (
        <EmptyState
          icon="🗂"
          title="No open deals here"
          hint={hasFilter ? "Try clearing the filter to see all deals." : "Process a transcript in a deal to start the loop."}
        />
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
    <Suspense fallback={<SkeletonList rows={5} />}>
      <DealsList />
    </Suspense>
  );
}
