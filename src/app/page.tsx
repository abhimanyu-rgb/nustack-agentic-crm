"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionCard, type ActionCardData } from "@/components/ActionCard";
import { Card, badgeLabel, fmtMoney } from "@/components/ui";

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

  if (!data) return <div className="text-gray-500">Loading queue…</div>;

  const badges = ["All", ...Array.from(new Set(data.queue.map((q) => q.badge)))];
  const visible = filter === "All" ? data.queue : data.queue.filter((q) => q.badge === filter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Good morning, {data.header.user?.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-gray-400">
          {data.header.queueCount} action{data.header.queueCount === 1 ? "" : "s"} ready ·{" "}
          <span className="text-rose-300">{fmtMoney(data.header.revenueAtRisk)} revenue at risk</span>
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
        <Card className="p-8 text-center text-gray-500">Queue clear. Nice work. 🎉</Card>
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
