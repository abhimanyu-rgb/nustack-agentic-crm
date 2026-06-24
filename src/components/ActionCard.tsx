"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Card, Confidence } from "./ui";
import { ReasonPicker } from "./ReasonPicker";

interface Evidence {
  id: string;
  title: string;
  evidenceText?: string;
  confidence: number;
}

export interface ActionCardData {
  id: string;
  title: string;
  description: string;
  whyNow: string;
  rationale: string;
  confidence: number;
  badge: string;
  autonomyMode: string;
  businessRiskLevel: string;
  dealId?: string;
  dealName?: string;
  draftPayload?: string;
  evidence: Evidence[];
}

export function ActionCard({ data, onResolved }: { data: ActionCardData; onResolved: () => void }) {
  const [rejecting, setRejecting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  async function resolve(decision: string, reasonCode?: string, note?: string) {
    setBusy(true);
    await fetch(`/api/actions/${data.id}/resolve`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision, reasonCode, note }),
    });
    setDone(decision);
    setBusy(false);
    setTimeout(onResolved, 600);
  }

  if (done) {
    return (
      <Card className="p-4 opacity-60">
        <div className="text-sm text-gray-400">
          {done === "APPROVED" ? "✓ Approved" : done === "REJECTED" ? "✕ Rejected (learning event logged)" : "Dismissed"} ·{" "}
          <span className="text-gray-500">{data.title}</span>
        </div>
      </Card>
    );
  }

  const autoBadge = data.autonomyMode === "AUTO_APPLY_WITH_UNDO";

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge kind={data.badge} />
          {autoBadge && (
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
              auto-apply · undo
            </span>
          )}
          <span className="text-[10px] uppercase tracking-wider text-gray-500">{data.businessRiskLevel} risk</span>
        </div>
        <Confidence value={data.confidence} />
      </div>

      <h3 className="mt-2 font-medium">{data.title}</h3>
      {data.dealId && (
        <Link href={`/deals/${data.dealId}`} className="text-xs text-indigo-400 hover:underline">
          {data.dealName} →
        </Link>
      )}

      <p className="mt-2 text-sm text-gray-300">{data.description}</p>
      <p className="mt-1 text-xs text-gray-500">
        <span className="font-medium text-gray-400">Why now:</span> {data.whyNow}
      </p>

      {data.draftPayload && (
        <div className="mt-2 rounded border border-edge bg-canvas p-2 text-xs text-gray-400">
          <div className="mb-1 text-[10px] uppercase tracking-wider text-gray-500">Draft (never sent automatically)</div>
          {data.draftPayload}
        </div>
      )}

      {data.evidence.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {data.evidence.map((e) => (
            <span
              key={e.id}
              title={e.evidenceText ?? e.title}
              className="rounded border border-edge bg-canvas px-2 py-0.5 text-[11px] text-gray-400"
            >
              {e.title}
            </span>
          ))}
        </div>
      )}

      {!rejecting ? (
        <div className="mt-3 flex gap-2">
          <button
            disabled={busy}
            onClick={() => resolve("APPROVED")}
            className="rounded bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-400 disabled:opacity-40"
          >
            {data.badge === "Stage" ? "Approve move" : "Approve"}
          </button>
          <button
            disabled={busy}
            onClick={() => setRejecting(true)}
            className="rounded border border-edge px-3 py-1.5 text-xs text-gray-300 hover:bg-edge"
          >
            Reject
          </button>
          {data.dealId && (
            <Link
              href={`/deals/${data.dealId}`}
              className="rounded border border-edge px-3 py-1.5 text-xs text-gray-400 hover:bg-edge"
            >
              Inspect
            </Link>
          )}
        </div>
      ) : (
        <ReasonPicker
          onSubmit={(code, note) => resolve("REJECTED", code, note)}
          onCancel={() => setRejecting(false)}
        />
      )}
    </Card>
  );
}
