// Confidence-Gated Autonomy (PRD 08). Maps an action type + confidence to a mode.

import type { ActionType, AutonomyMode, BusinessRiskLevel } from "../types";

interface Policy {
  defaultMode: AutonomyMode;
  confidenceRequired: number;
  businessRisk: BusinessRiskLevel;
}

// PRD 08.3 Default Autonomy Matrix (subset relevant to the prototype).
export const AUTONOMY_MATRIX: Partial<Record<ActionType, Policy>> = {
  UPDATE_STAGE: { defaultMode: "QUEUE_FOR_APPROVAL", confidenceRequired: 0.85, businessRisk: "MEDIUM" },
  UPDATE_FORECAST: { defaultMode: "QUEUE_FOR_APPROVAL", confidenceRequired: 0.85, businessRisk: "MEDIUM" },
  UPDATE_CLOSE_DATE: { defaultMode: "QUEUE_FOR_APPROVAL", confidenceRequired: 0.8, businessRisk: "MEDIUM" },
  FOLLOW_UP_EMAIL: { defaultMode: "QUEUE_FOR_APPROVAL", confidenceRequired: 0.7, businessRisk: "HIGH" },
  UPDATE_STAKEHOLDER_ROLE: { defaultMode: "QUEUE_FOR_APPROVAL", confidenceRequired: 0.85, businessRisk: "MEDIUM" },
  RISK_MITIGATION: { defaultMode: "AUTO_APPLY_WITH_UNDO", confidenceRequired: 0.75, businessRisk: "LOW" },
  MANAGER_REVIEW: { defaultMode: "AUTO_APPLY_WITH_UNDO", confidenceRequired: 0.75, businessRisk: "LOW" },
  SCHEDULE_NEXT_MEETING: { defaultMode: "AUTO_APPLY_WITH_UNDO", confidenceRequired: 0.85, businessRisk: "LOW" },
  CREATE_TASK: { defaultMode: "AUTO_APPLY_WITH_UNDO", confidenceRequired: 0.7, businessRisk: "LOW" },
  SDR_TARGETING_SUGGESTION: { defaultMode: "QUEUE_FOR_APPROVAL", confidenceRequired: 0.7, businessRisk: "LOW" },
};

export function resolveAutonomy(
  actionType: ActionType,
  confidence: number,
): { mode: AutonomyMode; businessRisk: BusinessRiskLevel } {
  const policy = AUTONOMY_MATRIX[actionType] ?? {
    defaultMode: "QUEUE_FOR_APPROVAL" as AutonomyMode,
    confidenceRequired: 0.8,
    businessRisk: "MEDIUM" as BusinessRiskLevel,
  };
  // If confidence is below threshold, never auto-apply — always queue (PRD 19.6).
  if (confidence < policy.confidenceRequired && policy.defaultMode === "AUTO_APPLY_WITH_UNDO") {
    return { mode: "QUEUE_FOR_APPROVAL", businessRisk: policy.businessRisk };
  }
  return { mode: policy.defaultMode, businessRisk: policy.businessRisk };
}
