"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function DealsPage() {
  const [deals, setDeals] = useState<DealRow[]>([]);
  useEffect(() => {
    fetch("/api/deals")
      .then((r) => r.json())
      .then((d) => setDeals(d.deals));
  }, []);

  const open = deals.filter((d) => d.status === "OPEN");
  const closed = deals.filter((d) => d.status !== "OPEN");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Deals</h1>
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
