"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, SectionTitle, fmtMoney } from "@/components/ui";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function CommandPage() {
  const [data, setData] = useState<any>(null);
  const [forbidden, setForbidden] = useState(false);
  useEffect(() => {
    fetch("/api/command").then(async (r) => {
      if (r.status === 403) return setForbidden(true);
      setData(await r.json());
    });
  }, []);
  if (forbidden)
    return (
      <div className="rounded-xl border border-edge bg-panel/70 p-8 text-center">
        <div className="text-lg font-medium">Command Center is for managers &amp; admins</div>
        <p className="mt-1 text-sm text-gray-500">Switch to a manager or admin user to view company-wide performance.</p>
      </div>
    );
  if (!data) return <div className="text-gray-500">Loading command center…</div>;

  const { company, perAE, funnel } = data;
  const maxFunnelValue = Math.max(...funnel.map((f: any) => f.value), 1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Command Center</h1>
        <p className="mt-1 text-sm text-gray-400">
          {company.name} · {company.aeCount} AEs · {company.openCount} open deals · company-wide flow & confidence
        </p>
      </div>

      {/* Company rollup KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Kpi label="Total pipeline" value={fmtMoney(company.totalPipeline)} />
        <Kpi label="Commit" value={fmtMoney(company.commitValue)} accent="violet" />
        <Kpi label="Revenue at risk" value={fmtMoney(company.atRiskValue)} accent="rose" />
        <Kpi label="Avg forecast confidence" value={`${company.companyConfidence}`} suffix="/100" accent={company.companyConfidence >= 60 ? "emerald" : "amber"} />
        <Kpi label="Avg risk" value={`${company.companyRisk}`} suffix="/100" accent={company.companyRisk >= 60 ? "rose" : "amber"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Pipeline funnel — master flow of leads */}
        <Card className="p-4 lg:col-span-2">
          <SectionTitle hint="open deals by stage">Pipeline flow</SectionTitle>
          <div className="space-y-2">
            {funnel.map((f: any) => (
              <div key={f.stageId} className="flex items-center gap-3">
                <div className="w-32 shrink-0 truncate text-sm text-gray-300">{f.stageName}</div>
                <div className="relative h-7 flex-1 overflow-hidden rounded bg-canvas">
                  <div
                    className="absolute inset-y-0 left-0 rounded bg-indigo-500/40"
                    style={{ width: `${(f.value / maxFunnelValue) * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-2 text-xs">
                    <span className="text-gray-200">{f.count} deal{f.count === 1 ? "" : "s"}</span>
                    <span className="tabular-nums text-gray-400">{fmtMoney(f.value)}</span>
                  </div>
                </div>
                <div className="w-24 shrink-0 text-right text-[11px] text-gray-500">
                  conf {f.avgConfidence} · <span className={f.avgRisk >= 60 ? "text-rose-300" : ""}>risk {f.avgRisk}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Confidence distribution */}
        <Card className="p-4">
          <SectionTitle hint="open deals">Forecast confidence</SectionTitle>
          <ConfBar label="High (67+)" count={company.confidenceBuckets.high} total={company.openCount} color="bg-emerald-400" />
          <ConfBar label="Medium (34–66)" count={company.confidenceBuckets.medium} total={company.openCount} color="bg-amber-400" />
          <ConfBar label="Low (<34)" count={company.confidenceBuckets.low} total={company.openCount} color="bg-rose-400" />
          <p className="mt-3 text-xs text-gray-500">
            Confidence is the agent&apos;s defensibility of each deal&apos;s forecast — backed by signals, not sentiment.
          </p>
        </Card>
      </div>

      {/* Per-AE performance grid */}
      <Card className="mt-5 overflow-hidden">
        <div className="px-4 pt-4">
          <SectionTitle hint="coordinate across the team">Account Executives</SectionTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-edge text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-4 py-2 font-medium">AE</th>
                <th className="px-4 py-2 font-medium">Open</th>
                <th className="px-4 py-2 font-medium">Pipeline</th>
                <th className="px-4 py-2 font-medium">Commit</th>
                <th className="px-4 py-2 font-medium">Confidence</th>
                <th className="px-4 py-2 font-medium">Risk</th>
                <th className="px-4 py-2 font-medium">At risk</th>
                <th className="px-4 py-2 font-medium">Win rate</th>
                <th className="px-4 py-2 font-medium">Overrides</th>
                <th className="px-4 py-2 font-medium">Queue</th>
              </tr>
            </thead>
            <tbody>
              {perAE.map((ae: any) => (
                <tr key={ae.id} className="border-b border-edge/50 last:border-0 hover:bg-edge/30">
                  <td className="px-4 py-2.5 font-medium">
                    <Link href={`/deals?owner=${ae.id}`} className="text-indigo-300 hover:underline">{ae.name}</Link>
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-gray-400">{ae.openCount}</td>
                  <td className="px-4 py-2.5 tabular-nums text-gray-300">{fmtMoney(ae.pipelineValue)}</td>
                  <td className="px-4 py-2.5 tabular-nums text-violet-300">{fmtMoney(ae.commitValue)}</td>
                  <td className="px-4 py-2.5"><Pill value={ae.avgConfidence} good={ae.avgConfidence >= 60} /></td>
                  <td className="px-4 py-2.5"><Pill value={ae.avgRisk} good={ae.avgRisk < 50} invert /></td>
                  <td className="px-4 py-2.5 tabular-nums">
                    {ae.atRiskCount > 0 ? (
                      <span className="text-rose-300">{ae.atRiskCount} · {fmtMoney(ae.atRiskValue)}</span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-gray-400">{ae.wonCount + ae.lostCount ? `${ae.winRate}%` : "—"}</td>
                  <td className="px-4 py-2.5 tabular-nums text-gray-400">{ae.overrideCount}</td>
                  <td className="px-4 py-2.5 tabular-nums text-gray-400">{ae.pendingActions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="mt-4 text-xs text-gray-600">
        Reading the grid: high override or low win-rate AEs are coaching candidates; high &quot;at risk&quot; values are
        where the forecast is most exposed. Click into <Link href="/forecast" className="text-indigo-400 hover:underline">Forecast</Link> for deal-level explanations.
      </p>
    </div>
  );
}

function Kpi({ label, value, suffix, accent }: { label: string; value: string; suffix?: string; accent?: string }) {
  const color =
    accent === "violet" ? "text-violet-300" : accent === "rose" ? "text-rose-300" : accent === "emerald" ? "text-emerald-300" : accent === "amber" ? "text-amber-300" : "";
  return (
    <Card className={`p-4 ${accent === "violet" ? "border-violet-500/40" : accent === "rose" ? "border-rose-500/30" : ""}`}>
      <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
      <div className={`text-xl font-semibold tabular-nums ${color}`}>
        {value}
        {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
      </div>
    </Card>
  );
}

function ConfBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="mb-2">
      <div className="mb-1 flex justify-between text-xs text-gray-400">
        <span>{label}</span>
        <span className="tabular-nums">{count}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-canvas">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Pill({ value, good, invert }: { value: number; good: boolean; invert?: boolean }) {
  void invert;
  return (
    <span className={`rounded px-2 py-0.5 text-xs tabular-nums ${good ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
      {value}
    </span>
  );
}
