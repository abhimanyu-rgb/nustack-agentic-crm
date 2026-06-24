"use client";

import { use, useCallback, useEffect, useState } from "react";
import { Card, Confidence, ScoreChip, SectionTitle, buyingRoleLabel, fmtDate, fmtMoney } from "@/components/ui";
import { ReasonPicker } from "@/components/ReasonPicker";
import { TranscriptUploader } from "@/components/TranscriptUploader";
import { BackButton } from "@/components/BackButton";
import { HintBanner, Info, SkeletonList } from "@/components/ux";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function DealRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [d, setD] = useState<any>(null);
  const [rejecting, setRejecting] = useState(false);
  const [openScore, setOpenScore] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch(`/api/deals/${id}`)
      .then((r) => r.json())
      .then(setD);
  }, [id]);

  useEffect(load, [load]);

  if (!d || d.error)
    return (
      <div>
        <div className="mb-4 h-7 w-72 animate-pulse rounded bg-edge" />
        <SkeletonList rows={4} />
      </div>
    );
  const { deal, signals, qualification, stakeholders, commitments, pendingProposal, escalatedProposal, audit, judgments } = d;
  const s = deal.scores;

  async function resolveProposal(decision: "APPROVE" | "REJECT", reasonCode?: string, note?: string) {
    await fetch(`/api/proposals/${pendingProposal.id}/resolve`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision, reasonCode, note }),
    });
    setRejecting(false);
    load();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* Header spans full width */}
      <div className="lg:col-span-3">
        <BackButton fallback="/deals" label="Back" />
        <div className="mt-2">
          <HintBanner id="dealroom">
            Paste a meeting transcript below to run the loop: <strong>extract signals → rescore → propose a stage move</strong>.
            Click any score chip to see its drivers.
          </HintBanner>
        </div>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{deal.name}</h1>
            <p className="text-sm text-gray-400">
              {deal.accountName} · {deal.stageName} · {fmtMoney(deal.amount)} · closes {fmtDate(deal.closeDate)} ·{" "}
              <span className="text-gray-300">{deal.forecastCategory}</span> · owner {deal.ownerName}
            </p>
          </div>
        </div>
      </div>

      {/* Left column: scores, proposal, qualification, buying group */}
      <div className="grid gap-5 lg:col-span-2">
        <Card className="p-4">
          <SectionTitle hint="click a score for drivers">Deal scores</SectionTitle>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            <ScoreChip label="Health" value={s.dealHealth} onClick={() => setOpenScore(openScore === "DEAL_HEALTH" ? null : "DEAL_HEALTH")} />
            <ScoreChip label="Risk" value={s.risk} invert onClick={() => setOpenScore(openScore === "RISK" ? null : "RISK")} />
            <ScoreChip label="Momentum" value={s.momentum} onClick={() => setOpenScore(openScore === "MOMENTUM" ? null : "MOMENTUM")} />
            <ScoreChip label="Readiness" value={s.stageReadiness} onClick={() => setOpenScore(openScore === "STAGE_READINESS" ? null : "STAGE_READINESS")} />
            <ScoreChip label="Forecast" value={s.forecastConfidence} onClick={() => setOpenScore(openScore === "FORECAST_CONFIDENCE" ? null : "FORECAST_CONFIDENCE")} />
            <ScoreChip label="Champion" value={s.championStrength} />
          </div>

          {/* Explanation drawer for the selected score (PRD 15.3 Explanation Drawer) */}
          {openScore && <ScoreDrawer judgments={judgments} type={openScore} onClose={() => setOpenScore(null)} />}

          {judgments.length > 0 && !openScore && (
            <div className="mt-3 space-y-1 border-t border-edge pt-3 text-xs text-gray-400">
              {judgments.slice(-5).map((j: any) => (
                <div key={j.id} className="flex items-center justify-between">
                  <span>{j.judgmentType.replace(/_/g, " ").toLowerCase()}</span>
                  <span className={j.direction === "INCREASED" ? "text-emerald-300" : j.direction === "DECREASED" ? "text-rose-300" : "text-gray-500"}>
                    {j.score} {j.changeSinceLast > 0 ? `▲${j.changeSinceLast}` : j.changeSinceLast < 0 ? `▼${Math.abs(j.changeSinceLast)}` : "-"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Stage proposal panel */}
        {pendingProposal && pendingProposal.proposalType === "ADVANCE" && (
          <Card className="border-indigo-500/40 p-4">
            <SectionTitle>Stage proposal</SectionTitle>
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded bg-edge px-2 py-1">{pendingProposal.currentStageName}</span>
              <span className="text-gray-500">→</span>
              <span className="rounded bg-indigo-500/20 px-2 py-1 text-indigo-200">{pendingProposal.proposedStageName}</span>
              <span className="ml-auto"><Confidence value={pendingProposal.confidence} /></span>
            </div>
            <p className="mt-2 text-sm text-gray-300">{pendingProposal.rationale}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="mb-1 font-medium text-emerald-300">Evidence met</div>
                {pendingProposal.requiredEvidenceMet.length ? pendingProposal.requiredEvidenceMet.map((e: string) => <div key={e} className="text-gray-400">✓ {e}</div>) : <div className="text-gray-600">-</div>}
              </div>
              <div>
                <div className="mb-1 font-medium text-amber-300">Missing evidence</div>
                {pendingProposal.missingEvidence.length ? pendingProposal.missingEvidence.map((e: string) => <div key={e} className="text-gray-400">○ {e}</div>) : <div className="text-gray-600">-</div>}
              </div>
            </div>
            {!rejecting ? (
              <div className="mt-3 flex gap-2">
                <button onClick={() => resolveProposal("APPROVE")} className="rounded bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-400">
                  Approve move
                </button>
                <button onClick={() => setRejecting(true)} className="rounded border border-edge px-3 py-1.5 text-xs text-gray-300 hover:bg-edge">
                  Reject
                </button>
              </div>
            ) : (
              <ReasonPicker onSubmit={(code, note) => resolveProposal("REJECT", code, note)} onCancel={() => setRejecting(false)} />
            )}
          </Card>
        )}

        {/* Escalated to manager — AE endorsed, awaiting sign-off */}
        {escalatedProposal && (
          <Card className="border-amber-500/40 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2 text-sm text-amber-300">
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider">Awaiting manager</span>
              <span>
                Move to <span className="font-medium">{escalatedProposal.proposedStageName}</span> endorsed, pending manager sign-off.
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">{escalatedProposal.proposedStageName} requires manager approval before the deal advances.</p>
          </Card>
        )}

        {/* Transcript loop trigger */}
        <TranscriptUploader dealId={id} onProcessed={load} />

        {/* Signal timeline */}
        <Card className="p-4">
          <SectionTitle hint={`${signals.length} signals`}>Signal timeline</SectionTitle>
          <div className="space-y-2">
            {signals.map((sig: any) => (
              <div key={sig.id} className="flex gap-3 border-l-2 pl-3" style={{ borderColor: sig.impactDirection === "POSITIVE" ? "#34d399" : sig.impactDirection === "NEGATIVE" ? "#fb7185" : "#6b7280" }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{sig.title}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">{sig.signalFamily}</span>
                  </div>
                  <div className="text-xs text-gray-500">{sig.description}</div>
                  {sig.evidenceText && <div className="mt-0.5 text-xs italic text-gray-600">“{sig.evidenceText}”</div>}
                </div>
                <div className="text-right text-[10px] text-gray-600">{fmtDate(sig.occurredAt)}<br />{Math.round(sig.confidence * 100)}%</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Right column: buying committee (contacts), qualification, commitments, audit */}
      <div className="grid gap-5">
        <Card className="p-4">
          <SectionTitle hint="contacts & roles">Buying committee</SectionTitle>
          <div className="space-y-2">
            {stakeholders.map((st: any) => (
              <div key={st.id} className="rounded border border-edge p-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{st.contactName}</span>
                  <span className="text-[10px] uppercase tracking-wider text-indigo-300">{buyingRoleLabel(st.roleInDeal)}</span>
                </div>
                <div className="text-xs text-gray-500">{st.contactTitle}</div>
                <div className="mt-1 flex gap-2 text-[10px] text-gray-500">
                  <span>influence {st.influenceLevel}</span>
                  <span>· engagement {st.engagementLevel}</span>
                  <span>· {st.sentiment.toLowerCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <SectionTitle hint="MEDDPICC">
            Qualification
            <Info tip="MEDDPICC: Metrics, Economic buyer, Decision criteria/process, Paper process, Identified pain, Champion, Competition. Each is scored from call evidence." />
          </SectionTitle>
          <div className="space-y-1.5">
            {qualification.map((q: any) => (
              <div key={q.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{q.evidenceType.replace(/_/g, " ").toLowerCase()}</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] ${q.status === "STRONG" ? "bg-emerald-500/20 text-emerald-300" : q.status === "PRESENT" ? "bg-sky-500/20 text-sky-300" : q.status === "WEAK" ? "bg-amber-500/20 text-amber-300" : "bg-rose-500/20 text-rose-300"}`}>
                  {q.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <SectionTitle>Commitments</SectionTitle>
          <div className="space-y-2">
            {commitments.length === 0 && <div className="text-xs text-gray-600">None yet.</div>}
            {commitments.map((c: any) => (
              <div key={c.id} className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">{c.ownerSide}</span>
                  <span className={`text-[10px] ${c.status === "COMPLETED" ? "text-emerald-300" : c.status === "MISSED" ? "text-rose-300" : "text-gray-400"}`}>{c.status}</span>
                </div>
                <div className="text-gray-300">{c.description}</div>
                {c.dueDate && <div className="text-xs text-gray-600">due {fmtDate(c.dueDate)}</div>}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <SectionTitle hint={`${audit.length} events`}>Audit trail</SectionTitle>
          <div className="space-y-1 text-xs">
            {audit.slice(0, 12).map((a: any) => (
              <div key={a.id} className="flex justify-between gap-2 text-gray-500">
                <span>
                  <span className={a.actorType === "AGENT" ? "text-indigo-400" : "text-gray-300"}>{a.actorType}</span> {a.eventType.replace(/_/g, " ").toLowerCase()}
                </span>
                <span className="shrink-0">{fmtDate(a.createdAt)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Explanation drawer: shows the latest judgment's positive/negative drivers for
// a score type. Empty for seeded deals until a transcript triggers a rescore.
function ScoreDrawer({ judgments, type, onClose }: { judgments: any[]; type: string; onClose: () => void }) {
  const j = [...judgments].reverse().find((x) => x.judgmentType === type);
  const label = type.replace(/_/g, " ").toLowerCase();
  return (
    <div className="mt-3 rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-indigo-300">Why {label} is {j ? j.score : "this"}</span>
        <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-300">close</button>
      </div>
      {!j ? (
        <p className="text-xs text-gray-500">
          No scoring run recorded yet for this deal. Process a transcript below to generate driver-level evidence.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="mb-1 font-medium text-emerald-300">Positive drivers</div>
            {j.positiveFactors.length ? j.positiveFactors.map((f: any, i: number) => (
              <div key={i} className="flex justify-between text-gray-400"><span>{f.description}</span><span className="tabular-nums text-emerald-300">+{f.weight}</span></div>
            )) : <div className="text-gray-600">None</div>}
          </div>
          <div>
            <div className="mb-1 font-medium text-rose-300">Negative drivers</div>
            {j.negativeFactors.length ? j.negativeFactors.map((f: any, i: number) => (
              <div key={i} className="flex justify-between text-gray-400"><span>{f.description}</span><span className="tabular-nums text-rose-300">{f.weight}</span></div>
            )) : <div className="text-gray-600">None</div>}
          </div>
        </div>
      )}
      {j && <div className="mt-2 border-t border-edge pt-2 text-[11px] text-gray-500">{j.rationale} · model {j.modelVersion}</div>}
    </div>
  );
}
