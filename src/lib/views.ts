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

// ---------------------------------------------------------------------------
// Command Center — company-wide leadership view across all AEs (admin/manager).
// Combines: per-AE performance grid, pipeline funnel flow, and confidence/risk.
// ---------------------------------------------------------------------------

export function commandView() {
  const open = db.deals.filter((d) => d.status === "OPEN");
  const closed = db.deals.filter((d) => d.status === "WON" || d.status === "LOST");
  const aes = db.users.filter((u) => u.role === "AE");

  const avg = (nums: number[]) => (nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0);

  // ---- Per-AE performance grid ----
  const perAE = aes.map((ae) => {
    const mine = open.filter((d) => d.ownerId === ae.id);
    const myClosed = closed.filter((d) => d.ownerId === ae.id);
    const won = myClosed.filter((d) => d.status === "WON");
    const lost = myClosed.filter((d) => d.status === "LOST");
    const myOverrides = db.overrides.filter((o) => mine.some((d) => d.id === o.dealId) || o.userId === ae.id);
    const myPendingActions = db.actions.filter((a) => a.assignedToUserId === ae.id && a.status === "PENDING");
    const commitDeals = mine.filter((d) => d.forecastCategory === "COMMIT");
    const atRisk = mine.filter((d) => d.scores.risk >= 60);
    return {
      id: ae.id,
      name: ae.name,
      openCount: mine.length,
      pipelineValue: mine.reduce((n, d) => n + d.amount, 0),
      commitValue: commitDeals.reduce((n, d) => n + d.amount, 0),
      avgConfidence: avg(mine.map((d) => d.scores.forecastConfidence)),
      avgRisk: avg(mine.map((d) => d.scores.risk)),
      atRiskCount: atRisk.length,
      atRiskValue: atRisk.reduce((n, d) => n + d.amount, 0),
      wonCount: won.length,
      lostCount: lost.length,
      winRate: won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) : 0,
      overrideCount: myOverrides.length,
      pendingActions: myPendingActions.length,
    };
  });

  // ---- Pipeline funnel: open deals by stage (master flow of leads) ----
  const stageOrder = db.stages
    .filter((s) => s.name !== "Closed Won" && s.name !== "Closed Lost")
    .sort((a, b) => a.order - b.order);
  const funnel = stageOrder.map((s) => {
    const inStage = open.filter((d) => d.stageId === s.id);
    return {
      stageId: s.id,
      stageName: s.name,
      count: inStage.length,
      value: inStage.reduce((n, d) => n + d.amount, 0),
      avgConfidence: avg(inStage.map((d) => d.scores.forecastConfidence)),
      avgRisk: avg(inStage.map((d) => d.scores.risk)),
    };
  });

  // ---- Company confidence / risk rollup ----
  const companyConfidence = avg(open.map((d) => d.scores.forecastConfidence));
  const companyRisk = avg(open.map((d) => d.scores.risk));
  const totalPipeline = open.reduce((n, d) => n + d.amount, 0);
  const commitValue = open.filter((d) => d.forecastCategory === "COMMIT").reduce((n, d) => n + d.amount, 0);
  const atRiskValue = open.filter((d) => d.scores.risk >= 60).reduce((n, d) => n + d.amount, 0);

  // Confidence buckets for a quick distribution read.
  const buckets = { high: 0, medium: 0, low: 0 };
  for (const d of open) {
    if (d.scores.forecastConfidence >= 67) buckets.high++;
    else if (d.scores.forecastConfidence >= 34) buckets.medium++;
    else buckets.low++;
  }

  return {
    company: {
      name: db.workspace.name,
      openCount: open.length,
      totalPipeline,
      commitValue,
      atRiskValue,
      companyConfidence,
      companyRisk,
      aeCount: aes.length,
      confidenceBuckets: buckets,
    },
    perAE,
    funnel,
  };
}
