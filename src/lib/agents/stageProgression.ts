// Stage Progression Agent (PRD 07.8) + Action Agent (PRD 07.11).
// Given a deal's scores, qualification evidence and the pipeline, decide whether
// to propose a stage move and what evidence supports/blocks it.

import type {
  DealScores,
  PipelineStage,
  QualificationEvidence,
  Signal,
} from "../types";
import { resolveAutonomy } from "./autonomy";

export interface StageProposalDraft {
  proposalType: "ADVANCE" | "NO_CHANGE";
  proposedStageId: string;
  confidence: number;
  rationale: string;
  requiredEvidenceMet: string[];
  missingEvidence: string[];
  sourceSignalIds: string[];
  autonomyMode: ReturnType<typeof resolveAutonomy>["mode"];
}

interface StageContext {
  currentStage: PipelineStage;
  nextStage?: PipelineStage;
  scores: DealScores;
  qualification: QualificationEvidence[];
  recentSignals: Signal[];
}

// PRD 07.8 Stage Proposal Rules:
// 1. Current stage exit criteria met (proxied by stage readiness).
// 2. Next stage entry criteria mostly met (qualification coverage).
// 3. At least one recent positive evidence signal.
// 4. No unresolved blocker invalidating advancement.
// 5. Confidence above workspace minimum.
export function proposeStage(ctx: StageContext): StageProposalDraft {
  const { currentStage, nextStage, scores, qualification, recentSignals } = ctx;

  const noChange: StageProposalDraft = {
    proposalType: "NO_CHANGE",
    proposedStageId: currentStage.id,
    confidence: 0,
    rationale: "Evidence does not yet support advancement.",
    requiredEvidenceMet: [],
    missingEvidence: [],
    sourceSignalIds: [],
    autonomyMode: "NEVER_AUTO",
  };

  if (!nextStage) return noChange; // already at last open stage

  const met: string[] = [];
  const missing: string[] = [];

  // Required evidence for the NEXT stage.
  const required = nextStage.requiredEvidenceTypes ?? [];
  const presentTypes = new Set(
    qualification.filter((q) => q.status === "PRESENT" || q.status === "STRONG").map((q) => q.evidenceType),
  );
  for (const reqType of required) {
    if (presentTypes.has(reqType)) met.push(`${reqType} confirmed`);
    else missing.push(`${reqType} not confirmed`);
  }

  // Recent positive signals (rule 3).
  const positiveSignals = recentSignals.filter((s) => s.impactDirection === "POSITIVE");
  const sourceSignalIds = positiveSignals.map((s) => s.id);

  // Unresolved blocker (rule 4): an active high-magnitude RISK signal.
  const blocker = recentSignals.find(
    (s) => s.signalFamily === "RISK" && s.impactDirection === "NEGATIVE" && s.impactMagnitude === "HIGH",
  );

  // Confidence: stage readiness + evidence coverage, penalized by missing/blocker.
  const coverage = required.length ? met.length / required.length : 1;
  let confidence = (scores.stageReadiness / 100) * 0.6 + coverage * 0.4;
  if (blocker) confidence -= 0.25;
  confidence = Math.max(0, Math.min(0.99, confidence));

  const readinessOk = scores.stageReadiness >= 65;
  const hasPositive = positiveSignals.length > 0;
  const enoughCoverage = required.length === 0 ? true : coverage >= 0.5;

  if (!readinessOk || !hasPositive || !enoughCoverage) {
    return {
      ...noChange,
      requiredEvidenceMet: met,
      missingEvidence: missing.length ? missing : ["Stage readiness below threshold"],
      sourceSignalIds,
    };
  }

  const { mode } = resolveAutonomy("UPDATE_STAGE", confidence);

  const rationaleParts = [`Move to ${nextStage.name} because`];
  if (met.length) rationaleParts.push(met.slice(0, 3).join(", ").toLowerCase() + ".");
  if (blocker) rationaleParts.push(`Note: unresolved risk — ${blocker.title}.`);
  if (missing.length) rationaleParts.push(`Remaining gap: ${missing.join(", ").toLowerCase()}.`);

  return {
    proposalType: "ADVANCE",
    proposedStageId: nextStage.id,
    confidence: Math.round(confidence * 100) / 100,
    rationale: rationaleParts.join(" "),
    requiredEvidenceMet: met,
    missingEvidence: missing,
    sourceSignalIds,
    autonomyMode: mode,
  };
}
