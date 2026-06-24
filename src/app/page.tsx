"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ActionCard, type ActionCardData } from "@/components/ActionCard";
import { badgeLabel, fmtMoney } from "@/components/ui";
import { EmptyState, HintBanner, SkeletonList } from "@/components/ux";

interface TodayData {
  queue: ActionCardData[];
  header: { queueCount: number; revenueAtRisk: number; user: string };
}

export default function TodayPage() {
  const [data, setData] = useState<TodayData | null>(null);
  const [filter, setFilter] = useState<string>("All");

  const load = useCallback(() => {
    fetch("/api/today")
      .then((r) => r.json())
      .then(setData);
  }, []);

  useEffect(load, [load]);

  if (!data)
    return (
      <div>
        <div className="mb-6 h-8 w-64 animate-pulse rounded bg-edge" />
        <SkeletonList rows={4} />
      </div>
    );

  const badges = ["All", ...Array.from(new Set(data.queue.map((q) => q.badge)))];
  const visible = filter === "All" ? data.queue : data.queue.filter((q) => q.badge === filter);

  return (
    <div>
      <HintBanner id="today">
        This is your <strong>action queue</strong>, not a dashboard. Each card is an AI recommendation with evidence.
        Approve, reject (with a reason), or open the deal to inspect. Try the <strong>⌘K Ask bar</strong> to query your pipeline.
      </HintBanner>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Good morning, {data.header.user?.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-gray-400">
          {data.header.queueCount} action{data.header.queueCount === 1 ? "" : "s"} ready ·{" "}
          {data.header.revenueAtRisk > 0 ? (
            <Link href="/deals?risk=high" className="text-rose-300 hover:underline">
              {fmtMoney(data.header.revenueAtRisk)} revenue at risk
            </Link>
          ) : (
            <span className="text-gray-500">no deals at risk</span>
          )}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {badges.map((b) => (
          <button
            key={b}
            onClick={() => setFilter(b)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              filter === b ? "border-indigo-400 bg-indigo-500/20 text-indigo-200" : "border-edge text-gray-400 hover:text-gray-200"
            }`}
          >
            {badgeLabel(b)}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon="🎉" title="Queue clear" hint="No actions need your attention right now. New ones appear as deals change." />
      ) : (
        <div className="grid gap-3">
          {visible.map((a) => (
            <ActionCard key={a.id} data={a} onResolved={load} />
          ))}
        </div>
      )}
    </div>
  );
}
