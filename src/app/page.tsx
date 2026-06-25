"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, fmtMoney, fmtDate } from "@/components/ui";
import { EmptyState, HintBanner, SkeletonList, useToast } from "@/components/ux";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function TodayPage() {
  const [me, setMe] = useState<any>(null);
  const [deals, setDeals] = useState<any[] | null>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const load = useCallback(() => {
    fetch("/api/me").then((r) => r.json()).then(setMe);
    fetch("/api/deals").then((r) => r.json()).then((d) => setDeals(d.deals ?? []));
  }, []);
  useEffect(load, [load]);

  async function seedDemo() {
    setBusy(true);
    const res = await fetch("/api/demo", { method: "POST" });
    setBusy(false);
    if (res.ok) { toast("Demo data added to your workspace"); load(); }
    else toast("Could not load demo data", "error");
  }

  if (!me || deals === null)
    return (
      <div>
        <div className="mb-6 h-8 w-64 animate-pulse rounded bg-edge" />
        <SkeletonList rows={3} />
      </div>
    );

  const open = deals.filter((d) => d.status === "OPEN");
  const pipeline = open.reduce((n, d) => n + d.amount, 0);
  const commit = open.filter((d) => d.forecastCategory === "COMMIT").reduce((n, d) => n + d.amount, 0);
  const atRisk = open.filter((d) => d.riskScore >= 60);
  const firstName = me.user?.name?.split(" ")[0] ?? "there";

  return (
    <div>
      <HintBanner id="today-real">
        Welcome to <strong>Nudge</strong>. Add your companies, contacts and deals to build your pipeline. Everything you
        enter is saved to your private workspace. New to it? Load demo data to explore, then clear it.
      </HintBanner>

      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Good to see you, {firstName}</h1>
          <p className="mt-1 text-sm text-gray-400">{open.length} open deal{open.length === 1 ? "" : "s"} in your pipeline</p>
        </div>
        <Link href="/deals" className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400">
          + New deal
        </Link>
      </div>

      {deals.length === 0 ? (
        <EmptyState
          icon="🌱"
          title="Your pipeline is empty"
          hint="Create your first deal from the Deals tab, add the companies and people involved, then log your activity. Or load demo data to explore."
        />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Open pipeline" value={fmtMoney(pipeline)} />
            <Stat label="Commit" value={fmtMoney(commit)} accent="violet" />
            <Stat label="At risk" value={fmtMoney(atRisk.reduce((n, d) => n + d.amount, 0))} accent="rose" />
            <Stat label="Open deals" value={String(open.length)} />
          </div>

          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Your deals</h2>
          <div className="grid gap-3">
            {open.map((d) => (
              <Link key={d.id} href={`/deals/${d.id}`}>
                <Card className="flex items-center justify-between p-4 transition hover:border-gray-500">
                  <div>
                    <div className="font-medium">{d.name}</div>
                    <div className="text-xs text-gray-500">
                      {d.account?.name ?? "No company"} · {d.stage} · {fmtMoney(d.amount)}
                      {d.closeDate ? ` · closes ${fmtDate(d.closeDate)}` : ""} · {d.forecastCategory}
                    </div>
                  </div>
                  {d.riskScore >= 60 && <span className="rounded bg-rose-500/15 px-2 py-0.5 text-[11px] text-rose-300">at risk</span>}
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="mt-8 flex items-center gap-3 text-xs text-gray-500">
        <button onClick={seedDemo} disabled={busy} className="rounded border border-edge px-3 py-1.5 hover:bg-edge disabled:opacity-50">
          {busy ? "Loading…" : "Load demo data"}
        </button>
        <button
          onClick={async () => { if (confirm("Clear ALL data in your workspace?")) { await fetch("/api/demo", { method: "DELETE" }); toast("Workspace cleared"); load(); } }}
          className="rounded border border-edge px-3 py-1.5 hover:bg-edge"
        >
          Clear my workspace
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  const color = accent === "violet" ? "text-violet-300" : accent === "rose" ? "text-rose-300" : "";
  return (
    <Card className={`p-4 ${accent === "violet" ? "border-violet-500/40" : accent === "rose" ? "border-rose-500/30" : ""}`}>
      <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
      <div className={`text-xl font-semibold tabular-nums ${color}`}>{value}</div>
    </Card>
  );
}
