// Deal Scoring Agent (PRD 06, 07.7) + Stage Progression Agent (PRD 07.8).
// Pure functions over a deal's signals/qualification/buying-group. Every score
// is composed from named factors so the explanation drawer can show "why".

import type {
  DealScores,
  ImpactDirection,
  QualificationEvidence,
  ScoreFactor,
  Signal,
  Stakeholder,
} from "../types";
import { MODEL_VERSION } from "./types";

export { MODEL_VERSION };

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

const dir = (d: ImpactDirection) => (d === "POSITIVE" ? 1 : d === "NEGATIVE" ? -1 : 0);
const mag = (m: string) => (m === "HIGH" ? 1 : m === "MEDIUM" ? 0.6 : 0.3);

export interface ScoreResult {
  score: number;
  positiveFactors: ScoreFactor[];
  negativeFactors: ScoreFactor[];
}

interface ScoringContext {
  signals: Signal[];
  qualification: QualificationEvidence[];
  stakeholders: Stakeholder[];
  nextStepQuality?: number;
}

function factorsFromSignals(
  signals: Signal[],
  predicate: (s: Signal) => boolean,
  weightOf: (s: Signal) => number,
): { positive: ScoreFactor[]; negative: ScoreFactor[]; net: number } {
  const positive: ScoreFactor[] = [];
  const negative: ScoreFactor[] = [];
  let net = 0;
  for (const s of signals) {
    if (!predicate(s)) continue;
    const w = weightOf(s) * dir(s.impactDirection);
    net += w;
    const f: ScoreFactor = { signalId: s.id, description: s.title, weight: Math.round(w) };
    if (w >= 0) positive.push(f);
    else negative.push(f);
  }
  return { positive, negative, net };
}

// --- Individual scores --------------------------------------------------------

function dealHealth(ctx: ScoringContext): ScoreResult {
  const base = 50;
  const { positive, negative, net } = factorsFromSignals(
    ctx.signals,
    () => true,
    (s) => mag(s.impactMagnitude) * 12,
  );
  const qualBoost = ctx.qualification.filter((q) => q.status === "STRONG" || q.status === "PRESENT").length * 4;
  if (qualBoost) positive.push({ description: "Qualification evidence present", weight: qualBoost });
  return { score: clamp(base + net + qualBoost), positiveFactors: positive, negativeFactors: negative };
}

function stageReadiness(ctx: ScoringContext): ScoreResult {
  const base = 40;
  const positive: ScoreFactor[] = [];
  const negative: ScoreFactor[] = [];
  let total = base;
  const strongQual = ctx.qualification.filter((q) => q.status === "STRONG" || q.status === "PRESENT");
  for (const q of strongQual) {
    const w = 8;
    total += w;
    positive.push({ description: `${q.evidenceType} evidence`, weight: w });
  }
  const missing = ctx.qualification.filter((q) => q.status === "MISSING" || q.status === "WEAK");
  for (const q of missing) {
    total -= 6;
    negative.push({ description: `${q.evidenceType} missing/weak`, weight: -6 });
  }
  if (ctx.nextStepQuality !== undefined && ctx.nextStepQuality >= 70) {
    total += 10;
    positive.push({ description: "Strong mutual next step", weight: 10 });
  }
  // Sentiment alone must never advance stage (PRD 07.7) — no sentiment term here.
  return { score: clamp(total), positiveFactors: positive, negativeFactors: negative };
}

function riskScore(ctx: ScoringContext): ScoreResult {
  // Higher = more risk.
  const base = 25;
  const positive: ScoreFactor[] = []; // factors that ADD risk
  const negative: ScoreFactor[] = []; // factors that REDUCE risk
  let total = base;
  for (const s of ctx.signals) {
    if (s.signalFamily === "RISK" && s.impactDirection === "NEGATIVE") {
      const w = mag(s.impactMagnitude) * 18;
      total += w;
      positive.push({ signalId: s.id, description: s.title, weight: Math.round(w) });
    }
  }
  const ebEngaged = ctx.stakeholders.some((st) => st.isEconomicBuyer);
  if (!ebEngaged) {
    total += 12;
    positive.push({ description: "No economic buyer engaged", weight: 12 });
  }
  const threads = ctx.stakeholders.filter((st) => st.engagementLevel !== "LOW").length;
  if (threads <= 1) {
    total += 15;
    positive.push({ description: "Single-threaded deal", weight: 15 });
  } else {
    total -= 8;
    negative.push({ description: "Multi-threaded", weight: -8 });
  }
  return { score: clamp(total), positiveFactors: positive, negativeFactors: negative };
}

function momentum(ctx: ScoringContext): ScoreResult {
  const base = 45;
  const { positive, negative, net } = factorsFromSignals(
    ctx.signals,
    (s) => s.signalFamily === "MOMENTUM" || s.signalFamily === "ENGAGEMENT" || s.signalFamily === "COMMITMENT",
    (s) => mag(s.impactMagnitude) * 14,
  );
  return { score: clamp(base + net), positiveFactors: positive, negativeFactors: negative };
}

function buyingGroupCoverage(ctx: ScoringContext): ScoreResult {
  const roles = new Set(ctx.stakeholders.map((s) => s.roleInDeal));
  const positive: ScoreFactor[] = [];
  const negative: ScoreFactor[] = [];
  const want: Array<[string, number]> = [
    ["ECONOMIC_BUYER", 30],
    ["CHAMPION", 25],
    ["TECHNICAL_BUYER", 15],
    ["END_USER", 10],
  ];
  let total = 20;
  for (const [role, w] of want) {
    if (roles.has(role as never)) {
      total += w;
      positive.push({ description: `${role} identified`, weight: w });
    } else {
      negative.push({ description: `${role} missing`, weight: -Math.round(w / 2) });
    }
  }
  return { score: clamp(total), positiveFactors: positive, negativeFactors: negative };
}

function championStrength(ctx: ScoringContext): ScoreResult {
  const champ = ctx.stakeholders.find((s) => s.isChampion);
  const positive: ScoreFactor[] = [];
  const negative: ScoreFactor[] = [];
  if (!champ) {
    negative.push({ description: "No identified champion", weight: -30 });
    return { score: 25, positiveFactors: positive, negativeFactors: negative };
  }
  let total = 40;
  if (champ.influenceLevel === "HIGH") {
    total += 30;
    positive.push({ description: "Champion has high influence", weight: 30 });
  } else if (champ.influenceLevel === "MEDIUM") {
    total += 15;
    positive.push({ description: "Champion has moderate influence", weight: 15 });
  } else {
    negative.push({ description: "Champion has low influence (weak champion)", weight: -10 });
  }
  if (champ.engagementLevel === "HIGH") {
    total += 15;
    positive.push({ description: "Champion highly engaged", weight: 15 });
  }
  return { score: clamp(total), positiveFactors: positive, negativeFactors: negative };
}

function nextStepQuality(ctx: ScoringContext): ScoreResult {
  const score = ctx.nextStepQuality ?? 40;
  return {
    score: clamp(score),
    positiveFactors: score >= 70 ? [{ description: "Dated, owned, mutual next step", weight: score }] : [],
    negativeFactors: score < 50 ? [{ description: "Weak or missing next step", weight: -(60 - score) }] : [],
  };
}

function competitiveRisk(ctx: ScoringContext): ScoreResult {
  const named = ctx.signals.filter((s) => s.signalFamily === "COMPETITIVE");
  const positive: ScoreFactor[] = [];
  let total = 15;
  for (const s of named) {
    total += 20;
    positive.push({ signalId: s.id, description: s.title, weight: 20 });
  }
  return { score: clamp(total), positiveFactors: positive, negativeFactors: [] };
}

function compellingEvent(ctx: ScoringContext): ScoreResult {
  const urgency = ctx.signals.filter(
    (s) => s.signalType === "BUYER_URGENCY_INCREASED" || s.signalFamily === "MARKET",
  );
  const positive: ScoreFactor[] = [];
  let total = 20;
  for (const s of urgency) {
    total += 25;
    positive.push({ signalId: s.id, description: s.title, weight: 25 });
  }
  return { score: clamp(total), positiveFactors: positive, negativeFactors: [] };
}

function qualificationCompleteness(ctx: ScoringContext): ScoreResult {
  const total = ctx.qualification.length;
  const strong = ctx.qualification.filter((q) => q.status === "STRONG" || q.status === "PRESENT").length;
  const ALL_MEDDPICC = 8;
  const score = clamp((strong / ALL_MEDDPICC) * 100);
  return {
    score,
    positiveFactors: ctx.qualification
      .filter((q) => q.status === "STRONG" || q.status === "PRESENT")
      .map((q) => ({ description: `${q.evidenceType} confirmed`, weight: Math.round(100 / ALL_MEDDPICC) })),
    negativeFactors: total < ALL_MEDDPICC ? [{ description: `${ALL_MEDDPICC - strong} MEDDPICC element(s) missing`, weight: -10 }] : [],
  };
}

function forecastConfidence(scores: Partial<DealScores>): ScoreResult {
  const dh = scores.dealHealth ?? 50;
  const sr = scores.stageReadiness ?? 50;
  const risk = scores.risk ?? 40;
  const score = clamp(dh * 0.4 + sr * 0.4 + (100 - risk) * 0.2);
  return {
    score,
    positiveFactors: [
      { description: "Deal health", weight: Math.round(dh * 0.4) },
      { description: "Stage readiness", weight: Math.round(sr * 0.4) },
    ],
    negativeFactors: risk > 50 ? [{ description: "Elevated risk", weight: -Math.round(risk * 0.2) }] : [],
  };
}

export interface FullScoring {
  scores: DealScores;
  breakdown: Record<keyof DealScores, ScoreResult>;
}

export function computeScores(ctx: ScoringContext): FullScoring {
  const dh = dealHealth(ctx);
  const sr = stageReadiness(ctx);
  const rk = riskScore(ctx);
  const mo = momentum(ctx);
  const bg = buyingGroupCoverage(ctx);
  const cs = championStrength(ctx);
  const ns = nextStepQuality(ctx);
  const cr = competitiveRisk(ctx);
  const ce = compellingEvent(ctx);
  const qc = qualificationCompleteness(ctx);
  const fc = forecastConfidence({ dealHealth: dh.score, stageReadiness: sr.score, risk: rk.score });

  const scores: DealScores = {
    dealHealth: dh.score,
    stageReadiness: sr.score,
    forecastConfidence: fc.score,
    risk: rk.score,
    momentum: mo.score,
    championStrength: cs.score,
    buyingGroupCoverage: bg.score,
    nextStepQuality: ns.score,
    competitiveRisk: cr.score,
    compellingEventStrength: ce.score,
    qualificationCompleteness: qc.score,
  };

  const breakdown: Record<keyof DealScores, ScoreResult> = {
    dealHealth: dh,
    stageReadiness: sr,
    forecastConfidence: fc,
    risk: rk,
    momentum: mo,
    championStrength: cs,
    buyingGroupCoverage: bg,
    nextStepQuality: ns,
    competitiveRisk: cr,
    compellingEventStrength: ce,
    qualificationCompleteness: qc,
  };

  return { scores, breakdown };
}
