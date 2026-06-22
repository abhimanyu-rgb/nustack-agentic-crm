// Agent runtime contracts (PRD 07, 11.4/11.5).
// These interfaces define what every agent returns. The MockProvider implements
// them deterministically today; a Claude-backed provider can implement the same
// interface tomorrow without touching callers.

import type {
  ImpactDirection,
  ImpactMagnitude,
  QualEvidenceType,
  StakeholderRole,
} from "../types";

export const MODEL_VERSION = "mock_v0.1";

export interface ExtractedSignal {
  signalType: string;
  signalFamily: string;
  title: string;
  description: string;
  evidenceText: string;
  impactDirection: ImpactDirection;
  impactMagnitude: ImpactMagnitude;
  confidence: number;
}

export interface ExtractedCommitment {
  ownerSide: "BUYER" | "SELLER";
  description: string;
  dueDate?: string;
  confidence: number;
}

export interface ExtractedQualEvidence {
  framework: "MEDDPICC";
  evidenceType: QualEvidenceType;
  summary: string;
  status: "WEAK" | "PRESENT" | "STRONG";
  confidence: number;
}

export interface ExtractedStakeholderUpdate {
  contactNameHint?: string;
  suggestedRole: StakeholderRole;
  confidence: number;
  requiresApproval: boolean;
}

export interface ConversationExtraction {
  summary: string;
  signals: ExtractedSignal[];
  commitments: ExtractedCommitment[];
  qualificationEvidence: ExtractedQualEvidence[];
  stakeholderUpdates: ExtractedStakeholderUpdate[];
  nextStepQuality: number; // 0-100
}

// The provider abstraction. Swap MockProvider -> ClaudeProvider later.
export interface AgentProvider {
  name: string;
  extractFromTranscript(input: {
    transcriptText: string;
    dealName: string;
    currentStage: string;
  }): Promise<ConversationExtraction>;
}
