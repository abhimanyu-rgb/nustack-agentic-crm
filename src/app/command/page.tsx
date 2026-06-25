"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, SectionTitle, fmtMoney } from "@/components/ui";
import { HintBanner, SkeletonList } from "@/components/ux";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function CommandPage() {
  const [data, setData] = useState<any>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    fetch("/api/command").then(async (r) => {
      if (r.status === 403) return setForbidden(true);
      if (!r.ok) return;
      setData(await r.json());
    });
  }, []);

  if (forbidden)
    return (
      <div className="rounded-xl border border-edge bg-panel p-8 text-center">
        <div className="text-lg font-medium">Access not allowed</div>
        <p className="mt-1 text-sm text-gray-500">Command is for managers and admins.</p>
      </div>
    );
  if (!data)
    return (
      <div>
        <div className="mb-6 h-8 w-64 animate-pulse rounded bg-edge" />
        <SkeletonList rows={4} />
      </div>
    );

  const { company, perAE, funnel } = data;
  const maxVal = Math.max(...funnel.map((f: any) => f.value), 1);

  return (
    <div>
      <HintBanner id="command-real">
        Company-wide view across your AEs. Each row is a rep; the funnel shows where pipeline sits by stage.
      </HintBanner>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Command Center</h1>
        <p className="mt-1 text-sm text-gray-400">{company.name} · {company.aeCount} AEs · {company.openCount} open deals</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Total pipeline" value={fmtMoney(company.totalPipeline)} />
        <Kpi label="Commit" value={fmtMoney(company.commitValue)} accent="violet" />
        <Kpi label="Revenue at risk" value={fmtMoney(company.atRiskValue)} accent="rose" />
        <Kpi label="Avg risk" value={`${company.avgRisk}/100`} accent={company.avgRisk >= 60 ? "rose" : undefined} />
      </div>

      <Card className="mb-5 p-4">
        <SectionTitle hint="open deals by stage">Pipeline flow</SectionTitle>
        <div className="space-y-2">
          {funnel.map((f: any) => (
            <div key={f.stage} className="flex items-center gap-3">
              <div className="w-32 shrink-0 truncate text-sm text-gray-300">{f.stage}</div>
              <div className="relative h-7 flex-1 overflow-hidden rounded bg-canvas">
                <div className="absolute inset-y-0 left-0 rounded bg-indigo-500/40" style={{ width: `${(f.value / maxVal) * 100}%` }} />
                <div className="absolute inset-0 flex items-center justify-between px-2 text-xs">
                  <span className="text-gray-200">{f.count} deal{f.count === 1 ? "" : "s"}</span>
                  <span className="tabular-nums text-gray-400">{fmtMoney(f.value)}</span>
                </div>
              </div>
              <div className="w-16 shrink-0 text-right text-[11px] text-gray-500">
                <span className={f.avgRisk >= 60 ? "text-rose-300" : ""}>risk {f.avgRisk}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="px-4 pt-4"><SectionTitle hint="coordinate across the team">Account Executives</SectionTitle></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-edge text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-4 py-2 font-medium">AE</th>
                <th className="px-4 py-2 font-medium">Open</th>
                <th className="px-4 py-2 font-medium">Pipeline</th>
                <th className="px-4 py-2 font-medium">Commit</th>
                <th className="px-4 py-2 font-medium">Health</th>
                <th className="px-4 py-2 font-medium">Risk</th>
                <th className="px-4 py-2 font-medium">At risk</th>
                <th className="px-4 py-2 font-medium">Win rate</th>
              </tr>
            </thead>
            <tbody>
              {perAE.map((ae: any) => (
                <tr key={ae.id} className="border-b border-edge last:border-0">
                  <td className="px-4 py-2.5 font-medium">{ae.name}</td>
                  <td className="px-4 py-2.5 tabular-nums text-gray-400">{ae.openCount}</td>
                  <td className="px-4 py-2.5 tabular-nums text-gray-300">{fmtMoney(ae.pipelineValue)}</td>
                  <td className="px-4 py-2.5 tabular-nums text-violet-300">{fmtMoney(ae.commitValue)}</td>
                  <td className="px-4 py-2.5"><Pill value={ae.avgHealth} good={ae.avgHealth >= 60} /></td>
                  <td className="px-4 py-2.5"><Pill value={ae.avgRisk} good={ae.avgRisk < 50} /></td>
                  <td className="px-4 py-2.5 tabular-nums">{ae.atRiskCount > 0 ? <span className="text-rose-300">{ae.atRiskCount} · {fmtMoney(ae.atRiskValue)}</span> : <span className="text-gray-600">-</span>}</td>
                  <td className="px-4 py-2.5 tabular-nums text-gray-400">{ae.winRate ? `${ae.winRate}%` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="mt-4 text-xs text-gray-600">High at-risk values are where the forecast is most exposed. <Link href="/deals" className="text-indigo-400 hover:underline">View all deals</Link>.</p>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: string }) {
  const color = accent === "violet" ? "text-violet-300" : accent === "rose" ? "text-rose-300" : "";
  return (
    <Card className={`p-4 ${accent === "violet" ? "border-violet-500/40" : accent === "rose" ? "border-rose-500/30" : ""}`}>
      <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
      <div className={`text-xl font-semibold tabular-nums ${color}`}>{value}</div>
    </Card>
  );
}

function Pill({ value, good }: { value: number; good: boolean }) {
  return <span className={`rounded px-2 py-0.5 text-xs tabular-nums ${good ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>{value}</span>;
}
