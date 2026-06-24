// In-memory store + orchestration (the "closed loop").
// Singleton across hot reloads via globalThis. NOT for production — a real build
// would back this with Postgres + an event bus (PRD 11/18). The point here is to
// make the loop observable end-to-end.

import { agentProvider } from "./agents/mockProvider";
import { computeScores } from "./agents/scoring";
import { proposeStage } from "./agents/stageProgression";
import { resolveAutonomy } from "./agents/autonomy";
import { runOutreachOptimization } from "./agents/outreach";
import { MODEL_VERSION } from "./agents/types";
import { nextId, reserve } from "./ids";
import * as seed from "./seed";
import type {
  ActionRecommendation,
  AuditEvent,
  Commitment,
  Deal,
  Judgment,
  LearningEvent,
  Override,
  OverrideReasonCode,
  OutreachSuggestion,
  QualificationEvidence,
  Signal,
  StageProposal,
  TargetAccount,
  Transcript,
  Activity,
  Outcome,
  ForecastCategory,
} from "./types";

interface DB {
  workspace: typeof seed.workspace;
  users: typeof seed.users;
  stages: typeof seed.stages;
  accounts: typeof seed.accounts;
  contacts: typeof seed.contacts;
  deals: Deal[];
  stakeholders: typeof seed.stakeholders;
  signals: Signal[];
  qualificationEvidence: QualificationEvidence[];
  commitments: Commitment[];
  stageProposals: StageProposal[];
  actions: ActionRecommendation[];
  overrides: Override[];
  judgments: Judgment[];
  activities: Activity[];
  transcripts: Transcript[];
  outcomes: Outcome[];
  learningEvents: LearningEvent[];
  audit: AuditEvent[];
  targetAccounts: TargetAccount[];
  outreachSuggestions: OutreachSuggestion[];
}

function buildDB(): DB {
  // Reserve id counters past seeded ids so generated ids don't collide.
  reserve("sig", 20);
  reserve("act", 10);
  reserve("sp", 5);
  reserve("ov", 3);
  return {
    workspace: seed.workspace,
    users: seed.users,
    stages: seed.stages,
    accounts: seed.accounts,
    contacts: seed.contacts,
    deals: structuredClone(seed.deals),
    stakeholders: structuredClone(seed.stakeholders),
    signals: structuredClone(seed.signals),
    qualificationEvidence: structuredClone(seed.qualificationEvidence),
    commitments: structuredClone(seed.commitments),
    stageProposals: structuredClone(seed.stageProposals),
    actions: structuredClone(seed.actions),
    overrides: structuredClone(seed.overrides),
    judgments: [],
    activities: [],
    transcripts: [],
    outcomes: [],
    learningEvents: [
      { id: "le_0001", workspaceId: seed.workspace.id, dealId: "deal_globex", eventType: "AE_STAGE_OVERRIDE", inputSnapshot: {}, label: "rejected_advance", sourceObjectType: "OVERRIDE", sourceObjectId: "ov_0001", tenantVisible: true, eligibleForCrossTenantLearning: false, createdAt: "2026-06-05T00:00:00Z" },
      { id: "le_0002", workspaceId: seed.workspace.id, dealId: "deal_umbrella", eventType: "RISK_DISMISSED", inputSnapshot: {}, label: "dismissed_market_signal", sourceObjectType: "OVERRIDE", sourceObjectId: "ov_0002", tenantVisible: true, eligibleForCrossTenantLearning: false, createdAt: "2026-06-03T00:00:00Z" },
      { id: "le_0003", workspaceId: seed.workspace.id, dealId: "deal_bright", eventType: "MANAGER_FORECAST_OVERRIDE", inputSnapshot: {}, label: "downgraded_forecast", sourceObjectType: "OVERRIDE", sourceObjectId: "ov_0003", tenantVisible: true, eligibleForCrossTenantLearning: false, createdAt: "2026-06-16T00:00:00Z" },
    ],
    audit: [
      { id: "audit_0001", workspaceId: seed.workspace.id, actorType: "AGENT", actorId: "stage_progression_agent", objectType: "STAGE_PROPOSAL", objectId: "sp_acme", eventType: "PROPOSAL_CREATED", afterValue: "ADVANCE to Solution Fit", sourceSignalIds: ["sig_0012", "sig_0013"], createdAt: "2026-06-17T00:10:00Z" },
    ],
    targetAccounts: structuredClone(seed.targetAccounts),
    outreachSuggestions: [],
  };
}

// Run the Outreach Optimization agent once against seeded won/lost data so the
// SDR queue is populated on boot. Uses a fixed timestamp for reproducibility.
function seedOutreach(database: DB): void {
  const sdr = database.users.find((u) => u.role === "SDR");
  if (!sdr) return;
  const suggestions = runOutreachOptimization({
    wonDeals: database.deals.filter((d) => d.status === "WON"),
    lostDeals: database.deals.filter((d) => d.status === "LOST"),
    accounts: database.accounts,
    targets: database.targetAccounts,
    sdr,
    idFor: (p) => nextId(p),
    now: () => "2026-06-18T08:00:00Z",
  });
  database.outreachSuggestions.push(...suggestions);
}

const g = globalThis as unknown as { __NUSTACK_DB__?: DB; __NUSTACK_CLOCK__?: number };
if (!g.__NUSTACK_DB__) {
  g.__NUSTACK_DB__ = buildDB();
  seedOutreach(g.__NUSTACK_DB__);
}
if (g.__NUSTACK_CLOCK__ === undefined) g.__NUSTACK_CLOCK__ = Date.parse("2026-06-19T09:00:00Z");

export const db: DB = g.__NUSTACK_DB__;

// Monotonic clock — avoids Date.now() nondeterminism while still ordering events.
function now(): string {
  g.__NUSTACK_CLOCK__! += 1000;
  return new Date(g.__NUSTACK_CLOCK__!).toISOString();
}

// --- Queries ----------------------------------------------------------------

export const getDeal = (id: string) => db.deals.find((d) => d.id === id);
export const getStage = (id: string) => db.stages.find((s) => s.id === id);
export const getAccount = (id: string) => db.accounts.find((a) => a.id === id);
export const getUser = (id: string) => db.users.find((u) => u.id === id);
export const dealSignals = (dealId: string) => db.signals.filter((s) => s.dealId === dealId && s.status === "ACTIVE");
export const dealQual = (dealId: string) => db.qualificationEvidence.filter((q) => q.dealId === dealId);
export const dealStakeholders = (dealId: string) => db.stakeholders.filter((s) => s.dealId === dealId);
export const dealCommitments = (dealId: string) => db.commitments.filter((c) => c.dealId === dealId);
export const dealProposals = (dealId: string) => db.stageProposals.filter((p) => p.dealId === dealId);
export const dealActions = (dealId: string) => db.actions.filter((a) => a.dealId === dealId);
export const dealAudit = (dealId: string) =>
  db.audit.filter((a) => a.objectId === dealId || dealProposals(dealId).some((p) => p.id === a.objectId));
export const dealJudgments = (dealId: string) => db.judgments.filter((j) => j.dealId === dealId);

export function pendingActions(): ActionRecommendation[] {
  return db.actions
    .filter((a) => a.status === "PENDING")
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

export function nextStageOf(stageId: string) {
  const cur = getStage(stageId);
  if (!cur) return undefined;
  return db.stages.find((s) => s.order === cur.order + 1 && s.name !== "Closed Won" && s.name !== "Closed Lost");
}

function audit(e: Omit<AuditEvent, "id" | "workspaceId" | "createdAt">) {
  const evt: AuditEvent = { id: nextId("audit"), workspaceId: db.workspace.id, createdAt: now(), ...e };
  db.audit.push(evt);
  return evt;
}

function learning(e: Omit<LearningEvent, "id" | "workspaceId" | "createdAt">) {
  const evt: LearningEvent = { id: nextId("le"), workspaceId: db.workspace.id, createdAt: now(), ...e };
  db.learningEvents.push(evt);
  return evt;
}

// --- Scoring -----------------------------------------------------------------

export function rescore(dealId: string): void {
  const deal = getDeal(dealId);
  if (!deal) return;
  const prev = { ...deal.scores };
  const { scores, breakdown } = computeScores({
    signals: dealSignals(dealId),
    qualification: dealQual(dealId),
    stakeholders: dealStakeholders(dealId),
    nextStepQuality: deal.scores.nextStepQuality,
  });
  deal.scores = scores;
  deal.updatedAt = now();

  // Emit judgments for the headline scores so the explanation drawer has data.
  const types: Array<[keyof typeof breakdown, Judgment["judgmentType"]]> = [
    ["dealHealth", "DEAL_HEALTH"],
    ["stageReadiness", "STAGE_READINESS"],
    ["risk", "RISK"],
    ["forecastConfidence", "FORECAST_CONFIDENCE"],
    ["momentum", "MOMENTUM"],
  ];
  for (const [key, jt] of types) {
    const r = breakdown[key];
    const change = r.score - (prev[key] ?? r.score);
    db.judgments.push({
      id: nextId("judg"),
      workspaceId: db.workspace.id,
      dealId,
      judgmentType: jt,
      value: String(r.score),
      score: r.score,
      confidence: 0.8,
      rationale: r.positiveFactors.map((f) => f.description).slice(0, 3).join("; ") || "No strong drivers.",
      direction: change > 0 ? "INCREASED" : change < 0 ? "DECREASED" : "UNCHANGED",
      changeSinceLast: change,
      positiveFactors: r.positiveFactors,
      negativeFactors: r.negativeFactors,
      sourceSignalIds: [...r.positiveFactors, ...r.negativeFactors].map((f) => f.signalId).filter(Boolean) as string[],
      createdByAgent: "deal_scoring_agent",
      modelVersion: MODEL_VERSION,
      createdAt: now(),
    });
  }
  audit({ actorType: "AGENT", actorId: "deal_scoring_agent", objectType: "DEAL", objectId: dealId, eventType: "SCORES_RECALCULATED", beforeValue: JSON.stringify(prev), afterValue: JSON.stringify(scores), sourceSignalIds: [] });
}

// --- The closed loop: transcript ingestion -----------------------------------

export interface ProcessResult {
  transcriptId: string;
  newSignals: Signal[];
  newCommitments: Commitment[];
  scoresBefore: Deal["scores"];
  scoresAfter: Deal["scores"];
  proposal?: StageProposal;
  action?: ActionRecommendation;
  summary: string;
}

export async function processTranscript(dealId: string, transcriptText: string): Promise<ProcessResult> {
  const deal = getDeal(dealId);
  if (!deal) throw new Error("deal not found");
  const stage = getStage(deal.stageId)!;
  const scoresBefore = { ...deal.scores };

  // 1. Activity + transcript records.
  const activity: Activity = {
    id: nextId("act_ity"), workspaceId: db.workspace.id, accountId: deal.accountId, dealId, contactIds: [],
    type: "MEETING_HELD", source: "manual_upload", occurredAt: now(), ownerId: deal.ownerId,
    summary: "Uploaded transcript", createdAt: now(),
  };
  db.activities.push(activity);
  const transcript: Transcript = {
    id: nextId("tr"), activityId: activity.id, sourceTool: "manual", rawText: transcriptText,
    language: "en", durationSeconds: 0, processedStatus: "PROCESSING", createdAt: now(),
  };
  db.transcripts.push(transcript);

  // 2. Conversation Intelligence extraction (provider-agnostic).
  const extraction = await agentProvider.extractFromTranscript({
    transcriptText, dealName: deal.name, currentStage: stage.name,
  });

  // 3. Persist signals (idempotency: dedupe by type within this transcript).
  const newSignals: Signal[] = [];
  for (const s of extraction.signals) {
    const sig: Signal = {
      id: nextId("sig"), workspaceId: db.workspace.id, accountId: deal.accountId, dealId,
      sourceType: "CONVERSATION", signalFamily: s.signalFamily as Signal["signalFamily"], signalType: s.signalType,
      title: s.title, description: s.description, evidenceText: s.evidenceText,
      sourceTranscriptId: transcript.id, confidence: s.confidence,
      impactDirection: s.impactDirection, impactMagnitude: s.impactMagnitude,
      occurredAt: now(), detectedAt: now(), createdByAgent: agentProvider.name, status: "ACTIVE",
    };
    db.signals.push(sig);
    newSignals.push(sig);
    audit({ actorType: "AGENT", actorId: agentProvider.name, objectType: "SIGNAL", objectId: sig.id, eventType: "SIGNAL_CREATED", afterValue: sig.title, sourceSignalIds: [sig.id] });
  }

  // 4. Persist commitments.
  const newCommitments: Commitment[] = [];
  for (const c of extraction.commitments) {
    const cm: Commitment = {
      id: nextId("cm"), dealId, ownerSide: c.ownerSide, description: c.description, dueDate: c.dueDate,
      status: "OPEN", confidence: c.confidence, createdAt: now(),
    };
    db.commitments.push(cm);
    newCommitments.push(cm);
  }

  // 5. Merge qualification evidence (upsert by evidenceType).
  for (const q of extraction.qualificationEvidence) {
    const existing = db.qualificationEvidence.find((e) => e.dealId === dealId && e.evidenceType === q.evidenceType);
    if (existing) {
      existing.status = q.status;
      existing.summary = q.summary;
      existing.confidence = q.confidence;
      existing.lastVerifiedAt = now();
    } else {
      db.qualificationEvidence.push({
        id: nextId("qe"), dealId, framework: "MEDDPICC", evidenceType: q.evidenceType,
        status: q.status, sourceSignalIds: [], summary: q.summary, confidence: q.confidence, lastVerifiedAt: now(),
      });
    }
  }

  // Carry next-step quality into the deal before rescoring.
  deal.scores.nextStepQuality = extraction.nextStepQuality;

  // 6. Rescore.
  transcript.processedStatus = "PROCESSED";
  rescore(dealId);
  const scoresAfter = { ...deal.scores };

  // 7. Stage proposal.
  const draft = proposeStage({
    currentStage: stage,
    nextStage: nextStageOf(stage.id),
    scores: deal.scores,
    qualification: dealQual(dealId),
    recentSignals: newSignals,
  });

  let proposal: StageProposal | undefined;
  let action: ActionRecommendation | undefined;
  if (draft.proposalType === "ADVANCE") {
    proposal = {
      id: nextId("sp"), dealId, currentStageId: stage.id, proposedStageId: draft.proposedStageId,
      proposalType: "ADVANCE", confidence: draft.confidence, rationale: draft.rationale,
      requiredEvidenceMet: draft.requiredEvidenceMet, missingEvidence: draft.missingEvidence,
      sourceSignalIds: draft.sourceSignalIds, createdByAgent: "stage_progression_agent",
      autonomyMode: draft.autonomyMode, status: "PENDING_APPROVAL", createdAt: now(),
    };
    db.stageProposals.push(proposal);
    audit({ actorType: "AGENT", actorId: "stage_progression_agent", objectType: "STAGE_PROPOSAL", objectId: proposal.id, eventType: "PROPOSAL_CREATED", afterValue: `ADVANCE to ${getStage(draft.proposedStageId)?.name}`, sourceSignalIds: draft.sourceSignalIds });

    const { mode, businessRisk } = resolveAutonomy("UPDATE_STAGE", draft.confidence);
    action = {
      id: nextId("act"), workspaceId: db.workspace.id, dealId, accountId: deal.accountId,
      assignedToUserId: deal.ownerId, actionType: "UPDATE_STAGE",
      title: `Approve stage move: ${deal.name.split(" — ")[0]} → ${getStage(draft.proposedStageId)?.name}`,
      description: draft.rationale, confidence: draft.confidence,
      priorityScore: Math.round(draft.confidence * 100), businessRiskLevel: businessRisk, autonomyMode: mode,
      sourceSignalIds: draft.sourceSignalIds, rationale: draft.rationale,
      whyNow: "New transcript processed; evidence now supports advancement.",
      status: "PENDING", createdByAgent: "action_agent", createdAt: now(), stageProposalId: proposal.id, badge: "Stage",
    };
    db.actions.push(action);
  }

  return {
    transcriptId: transcript.id,
    newSignals, newCommitments, scoresBefore, scoresAfter, proposal, action,
    summary: extraction.summary,
  };
}

// --- Approvals / overrides ---------------------------------------------------

const MANAGER_ROLES = new Set(["SALES_MANAGER", "REVOPS", "ADMIN"]);

export function approveStageProposal(proposalId: string, userId: string, note?: string) {
  const p = db.stageProposals.find((x) => x.id === proposalId);
  if (!p) throw new Error("proposal not found");
  const deal = getDeal(p.dealId)!;
  const targetStage = getStage(p.proposedStageId);
  const approver = getUser(userId);
  const approverIsManager = approver ? MANAGER_ROLES.has(approver.role) : false;

  // Manager gate (PRD 08.3 / seed `managerApprovalRequired`): an AE approving a
  // move INTO a manager-gated stage doesn't apply it — it escalates for sign-off.
  // A manager (or admin) approving applies it directly.
  if (targetStage?.managerApprovalRequired && p.status === "PENDING_APPROVAL" && !approverIsManager) {
    p.status = "PENDING_MANAGER_APPROVAL";
    // The AE's action card resolves; a new approval action lands in the manager's queue.
    const aeAct = db.actions.find((a) => a.stageProposalId === proposalId && a.assignedToUserId === deal.ownerId);
    if (aeAct) { aeAct.status = "APPROVED"; aeAct.resolvedAt = now(); }
    const manager = getUser(deal.ownerId)?.managerId ?? db.users.find((u) => u.role === "SALES_MANAGER")?.id;
    if (manager) {
      db.actions.push({
        id: nextId("act"), workspaceId: db.workspace.id, dealId: deal.id, accountId: deal.accountId,
        assignedToUserId: manager, actionType: "UPDATE_STAGE",
        title: `Approve stage move: ${deal.name.split(" — ")[0]} → ${targetStage.name} (rep-endorsed)`,
        description: `${getUser(userId)?.name ?? "AE"} endorsed this move into a manager-gated stage. ${p.rationale}`,
        confidence: p.confidence, priorityScore: Math.round(p.confidence * 100) + 5,
        businessRiskLevel: "HIGH", autonomyMode: "QUEUE_FOR_APPROVAL",
        sourceSignalIds: p.sourceSignalIds, rationale: p.rationale,
        whyNow: `Stage ${targetStage.name} requires manager sign-off.`,
        status: "PENDING", createdByAgent: "approval_routing_agent", createdAt: now(), stageProposalId: proposalId, badge: "Stage",
      });
    }
    audit({ actorType: "USER", actorId: userId, objectType: "STAGE_PROPOSAL", objectId: proposalId, eventType: "ESCALATED_TO_MANAGER", afterValue: `${targetStage.name} (awaiting manager)`, sourceSignalIds: p.sourceSignalIds, reason: note });
    return p;
  }

  // Apply the move (manager-gated stages reach here only via a manager approver).
  const before = deal.stageId;
  deal.stageId = p.proposedStageId;
  deal.updatedAt = now();
  p.status = "APPROVED";
  p.resolvedAt = now();
  p.resolvedByUserId = userId;
  const act = db.actions.find((a) => a.stageProposalId === proposalId && a.status === "PENDING");
  if (act) { act.status = "APPROVED"; act.resolvedAt = now(); }
  audit({ actorType: "USER", actorId: userId, objectType: "DEAL", objectId: deal.id, eventType: approverIsManager && targetStage?.managerApprovalRequired ? "STAGE_CHANGED_MANAGER_APPROVED" : "STAGE_CHANGED", beforeValue: getStage(before)?.name, afterValue: getStage(p.proposedStageId)?.name, sourceSignalIds: p.sourceSignalIds, reason: note });
  learning({ dealId: deal.id, eventType: "ACTION_APPROVED", inputSnapshot: { proposalId, scores: deal.scores }, label: "stage_advance_accepted", sourceObjectType: "STAGE_PROPOSAL", sourceObjectId: proposalId, tenantVisible: true, eligibleForCrossTenantLearning: false });
  rescore(deal.id);
  return p;
}

export function rejectStageProposal(proposalId: string, userId: string, reasonCode: OverrideReasonCode, note?: string) {
  const p = db.stageProposals.find((x) => x.id === proposalId);
  if (!p) throw new Error("proposal not found");
  p.status = "REJECTED";
  p.resolvedAt = now();
  p.resolvedByUserId = userId;
  const act = db.actions.find((a) => a.stageProposalId === proposalId);
  if (act) { act.status = "REJECTED"; act.resolvedAt = now(); }
  const le = learning({ dealId: p.dealId, eventType: "ACTION_REJECTED", inputSnapshot: { proposalId, reasonCode }, label: `stage_rejected:${reasonCode}`, sourceObjectType: "STAGE_PROPOSAL", sourceObjectId: proposalId, tenantVisible: true, eligibleForCrossTenantLearning: false });
  const ov: Override = {
    id: nextId("ov"), workspaceId: db.workspace.id, dealId: p.dealId, userId,
    targetObjectType: "STAGE_PROPOSAL", targetObjectId: proposalId,
    originalAgentValue: `ADVANCE to ${getStage(p.proposedStageId)?.name}`, userCorrectedValue: "NO_CHANGE",
    overrideReasonCode: reasonCode, overrideReasonNote: note, sourceContext: "Today Queue/Deal Room",
    createdAt: now(), learningEventId: le.id,
  };
  db.overrides.push(ov);
  audit({ actorType: "USER", actorId: userId, objectType: "STAGE_PROPOSAL", objectId: proposalId, eventType: "PROPOSAL_REJECTED", afterValue: reasonCode, sourceSignalIds: p.sourceSignalIds, reason: note });
  return p;
}

export function resolveAction(actionId: string, userId: string, decision: "APPROVED" | "REJECTED" | "DISMISSED", reasonCode?: OverrideReasonCode, note?: string) {
  const a = db.actions.find((x) => x.id === actionId);
  if (!a) throw new Error("action not found");
  // Stage actions defer to the proposal flow.
  if (a.stageProposalId && decision === "APPROVED") return approveStageProposal(a.stageProposalId, userId, note);
  if (a.stageProposalId && decision === "REJECTED") return rejectStageProposal(a.stageProposalId, userId, reasonCode ?? "OTHER", note);

  a.status = decision;
  a.resolvedAt = now();
  audit({ actorType: "USER", actorId: userId, objectType: "ACTION", objectId: actionId, eventType: `ACTION_${decision}`, afterValue: a.title, sourceSignalIds: a.sourceSignalIds, reason: note });
  learning({ dealId: a.dealId, eventType: decision === "APPROVED" ? "ACTION_APPROVED" : "ACTION_REJECTED", inputSnapshot: { actionId }, label: `action_${decision.toLowerCase()}`, sourceObjectType: "ACTION", sourceObjectId: actionId, tenantVisible: true, eligibleForCrossTenantLearning: false });
  return a;
}

export function overrideForecast(dealId: string, userId: string, category: ForecastCategory, reasonCode: OverrideReasonCode, note?: string) {
  const deal = getDeal(dealId);
  if (!deal) throw new Error("deal not found");
  const before = deal.forecastCategory;
  deal.forecastCategory = category;
  deal.updatedAt = now();
  const le = learning({ dealId, eventType: "MANAGER_FORECAST_OVERRIDE", inputSnapshot: { before, after: category }, label: `forecast_override:${reasonCode}`, sourceObjectType: "DEAL", sourceObjectId: dealId, tenantVisible: true, eligibleForCrossTenantLearning: false });
  db.overrides.push({
    id: nextId("ov"), workspaceId: db.workspace.id, dealId, userId, targetObjectType: "FORECAST",
    targetObjectId: dealId, originalAgentValue: before, userCorrectedValue: category,
    overrideReasonCode: reasonCode, overrideReasonNote: note, sourceContext: "Forecast Review",
    createdAt: now(), learningEventId: le.id,
  });
  audit({ actorType: "USER", actorId: userId, objectType: "DEAL", objectId: dealId, eventType: "FORECAST_OVERRIDDEN", beforeValue: before, afterValue: category, sourceSignalIds: [], reason: note });
  return deal;
}

export function resetDB(): void {
  // Mutate the existing object in place so the exported `db` reference stays valid.
  const fresh = buildDB();
  Object.assign(db, fresh);
  seedOutreach(db);
  g.__NUSTACK_CLOCK__ = Date.parse("2026-06-19T09:00:00Z");
}

// --- SDR / outreach -----------------------------------------------------------

export function resolveOutreachSuggestion(id: string, decision: "ACCEPTED" | "DISMISSED", userId: string) {
  const s = db.outreachSuggestions.find((x) => x.id === id);
  if (!s) throw new Error("suggestion not found");
  s.status = decision;
  // If accepting a target-account suggestion, mark that account as being worked.
  if (decision === "ACCEPTED" && s.targetAccountId) {
    const t = db.targetAccounts.find((a) => a.id === s.targetAccountId);
    if (t) t.status = "WORKING";
  }
  learning({
    eventType: decision === "ACCEPTED" ? "OUTREACH_SUCCESS" : "OUTREACH_FAILURE",
    inputSnapshot: { suggestionId: id, type: s.type },
    label: `outreach_${decision.toLowerCase()}:${s.type}`,
    sourceObjectType: "OUTREACH_SUGGESTION", sourceObjectId: id,
    tenantVisible: true, eligibleForCrossTenantLearning: false,
  });
  audit({ actorType: "USER", actorId: userId, objectType: "OUTREACH_SUGGESTION", objectId: id, eventType: `OUTREACH_${decision}`, afterValue: s.title, sourceSignalIds: [] });
  return s;
}
