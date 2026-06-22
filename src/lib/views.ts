// View-model builders: hydrate raw store objects into the shapes the UI needs.
// Keeps API responses self-contained (no client-side joins required).

import {
  db,
  dealActions,
  dealAudit,
  dealCommitments,
  dealJudgments,
  dealProposals,
  dealQual,
  dealSignals,
  dealStakeholders,
  getAccount,
  getStage,
  getUser,
  nextStageOf,
  pendingActions,
} from "./store";
import type { Deal } from "./types";

export function dealSummary(deal: Deal) {
  const account = getAccount(deal.accountId);
  const stage = getStage(deal.stageId);
  const owner = getUser(deal.ownerId);
  return {
    id: deal.id,
    name: deal.name,
    accountName: account?.name ?? "",
    accountId: deal.accountId,
    stageName: stage?.name ?? "",
    stageId: deal.stageId,
    ownerName: owner?.name ?? "",
    amount: deal.amount,
    currency: deal.currency,
    closeDate: deal.closeDate,
    forecastCategory: deal.forecastCategory,
    status: deal.status,
    scores: deal.scores,
    updatedAt: deal.updatedAt,
  };
}

export function actionCard(actionId: string) {
  const a = db.actions.find((x) => x.id === actionId);
  if (!a) return null;
  const deal = a.dealId ? db.deals.find((d) => d.id === a.dealId) : undefined;
  const account = a.accountId ? getAccount(a.accountId) : undefined;
  const evidence = a.sourceSignalIds
    .map((id) => db.signals.find((s) => s.id === id))
    .filter(Boolean)
    .map((s) => ({ id: s!.id, title: s!.title, evidenceText: s!.evidenceText, confidence: s!.confidence }));
  return {
    ...a,
    dealName: deal?.name,
    accountName: account?.name,
    evidence,
  };
}

export function todayQueue() {
  return pendingActions().map((a) => actionCard(a.id)).filter(Boolean);
}

export function dealDetail(dealId: string) {
  const deal = db.deals.find((d) => d.id === dealId);
  if (!deal) return null;
  const stage = getStage(deal.stageId);
  const next = nextStageOf(deal.stageId);
  const stakeholders = dealStakeholders(dealId).map((s) => {
    const contact = db.contacts.find((c) => c.id === s.contactId);
    return { ...s, contactName: contact?.name ?? "", contactTitle: contact?.title ?? "" };
  });
  const pendingProposal = dealProposals(dealId).find((p) => p.status === "PENDING_APPROVAL");
  return {
    deal: dealSummary(deal),
    stage,
    nextStage: next,
    signals: dealSignals(dealId).sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1)),
    qualification: dealQual(dealId),
    stakeholders,
    commitments: dealCommitments(dealId),
    proposals: dealProposals(dealId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    pendingProposal: pendingProposal
      ? {
          ...pendingProposal,
          proposedStageName: getStage(pendingProposal.proposedStageId)?.name,
          currentStageName: getStage(pendingProposal.currentStageId)?.name,
        }
      : null,
    actions: dealActions(dealId).filter((a) => a.status === "PENDING"),
    judgments: dealJudgments(dealId),
    audit: dealAudit(dealId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
  };
}

export function forecastView() {
  const open = db.deals.filter((d) => d.status === "OPEN");
  const sum = (cat: string) => open.filter((d) => d.forecastCategory === cat).reduce((n, d) => n + d.amount, 0);
  const changed = db.overrides
    .filter((o) => o.targetObjectType === "FORECAST")
    .map((o) => o.dealId);
  return {
    rollup: {
      pipeline: sum("PIPELINE"),
      bestCase: sum("BEST_CASE"),
      commit: sum("COMMIT"),
      total: open.reduce((n, d) => n + d.amount, 0),
    },
    deals: open.map((d) => {
      const ov = db.overrides.find((o) => o.targetObjectType === "FORECAST" && o.dealId === d.id);
      return {
        ...dealSummary(d),
        riskScore: d.scores.risk,
        forecastConfidence: d.scores.forecastConfidence,
        recentlyChanged: changed.includes(d.id),
        previousCategory: ov?.originalAgentValue,
      };
    }),
    overridePatterns: db.overrides.map((o) => ({
      id: o.id,
      dealId: o.dealId,
      reason: o.overrideReasonCode,
      from: o.originalAgentValue,
      to: o.userCorrectedValue,
      type: o.targetObjectType,
    })),
  };
}
