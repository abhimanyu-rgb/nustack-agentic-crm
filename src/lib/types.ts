// Domain types for NuStack Agentic Revenue CRM (Release 0 prototype).
// Mirrors PRD 04 (Core Objects), 05 (Signal Taxonomy), 06 (Scores), 08 (Autonomy).
// Kept deliberately flat and JSON-serializable for the in-memory store.

export type ID = string;

// ---------------------------------------------------------------------------
// Enums (PRD 04)
// ---------------------------------------------------------------------------

export type UserRole = "AE" | "SDR" | "SALES_MANAGER" | "REVOPS" | "ADMIN" | "EXECUTIVE_VIEWER";

export type DealStatus = "OPEN" | "WON" | "LOST" | "SLIPPED" | "NO_DECISION" | "ARCHIVED";

export type ForecastCategory = "PIPELINE" | "BEST_CASE" | "COMMIT" | "CLOSED" | "OMITTED";

export type StakeholderRole =
  | "ECONOMIC_BUYER"
  | "CHAMPION"
  | "BLOCKER"
  | "TECHNICAL_BUYER"
  | "LEGAL"
  | "PROCUREMENT"
  | "INFLUENCER"
  | "END_USER"
  | "UNKNOWN";

export type ActivityType =
  | "EMAIL_SENT"
  | "EMAIL_RECEIVED"
  | "MEETING_HELD"
  | "CALL_HELD"
  | "CALENDAR_EVENT"
  | "SEQUENCE_STEP"
  | "NOTE"
  | "TASK"
  | "CONTRACT_EVENT"
  | "CRM_FIELD_CHANGE";

export type SignalSourceType =
  | "ENGAGEMENT"
  | "CONVERSATION"
  | "EMAIL"
  | "CALENDAR"
  | "CRM"
  | "MARKET"
  | "ENRICHMENT"
  | "USER"
  | "SYSTEM";

export type SignalFamily =
  | "ENGAGEMENT"
  | "COMMITMENT"
  | "QUALIFICATION"
  | "BUYING_GROUP"
  | "MOMENTUM"
  | "RISK"
  | "MARKET"
  | "COMMERCIAL"
  | "COMPETITIVE"
  | "OUTCOME";

export type ImpactDirection = "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "UNKNOWN";
export type ImpactMagnitude = "LOW" | "MEDIUM" | "HIGH";

export type JudgmentType =
  | "DEAL_HEALTH"
  | "STAGE_READINESS"
  | "FORECAST_CONFIDENCE"
  | "RISK"
  | "MOMENTUM"
  | "CHAMPION_STRENGTH"
  | "BUYING_GROUP_COVERAGE"
  | "NEXT_STEP_QUALITY"
  | "COMPETITIVE_RISK"
  | "COMPELLING_EVENT"
  | "QUALIFICATION_COMPLETENESS";

export type ProposalType = "ADVANCE" | "REGRESS" | "NO_CHANGE" | "CLOSE_WON" | "CLOSE_LOST";

export type ProposalStatus =
  | "PENDING_APPROVAL"
  | "PENDING_MANAGER_APPROVAL"
  | "AUTO_APPLIED"
  | "APPROVED"
  | "REJECTED"
  | "EDITED"
  | "EXPIRED"
  | "REVERTED";

export type ActionType =
  | "FOLLOW_UP_EMAIL"
  | "SCHEDULE_NEXT_MEETING"
  | "UPDATE_STAGE"
  | "UPDATE_FORECAST"
  | "UPDATE_CLOSE_DATE"
  | "ADD_CONTACT"
  | "UPDATE_STAKEHOLDER_ROLE"
  | "CREATE_TASK"
  | "MANAGER_REVIEW"
  | "RISK_MITIGATION"
  | "SEND_MUTUAL_ACTION_PLAN"
  | "SDR_TARGETING_SUGGESTION"
  | "OUTREACH_MESSAGE_SUGGESTION"
  | "PLAYBOOK_SUGGESTION";

export type AutonomyMode =
  | "AUTO_APPLY"
  | "AUTO_APPLY_WITH_UNDO"
  | "QUEUE_FOR_APPROVAL"
  | "ASK_FOR_CLARIFICATION"
  | "NEVER_AUTO";

export type BusinessRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ActionStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "EDITED"
  | "AUTO_APPLIED"
  | "REVERTED"
  | "DISMISSED";

export type OverrideReasonCode =
  | "WRONG_STAGE"
  | "MISSING_ECONOMIC_BUYER"
  | "WEAK_NEXT_STEP"
  | "NO_BUDGET_CONFIRMATION"
  | "WRONG_STAKEHOLDER_ROLE"
  | "SENTIMENT_OVERWEIGHTED"
  | "OUTSIDE_SIGNAL_IRRELEVANT"
  | "COMPETITOR_MISCLASSIFIED"
  | "CUSTOMER_TIMING_WRONG"
  | "INTERNAL_PROCESS_EXCEPTION"
  | "OTHER";

export type OutcomeType = "WON" | "LOST" | "SLIPPED" | "NO_DECISION";

export type ActorType = "USER" | "AGENT" | "SYSTEM" | "INTEGRATION";

export type QualEvidenceType =
  | "METRICS"
  | "ECONOMIC_BUYER"
  | "DECISION_CRITERIA"
  | "DECISION_PROCESS"
  | "PAPER_PROCESS"
  | "IDENTIFIED_PAIN"
  | "CHAMPION"
  | "COMPETITION";

export type QualEvidenceStatus = "MISSING" | "WEAK" | "PRESENT" | "STRONG";

export type LearningEventType =
  | "AE_STAGE_OVERRIDE"
  | "MANAGER_FORECAST_OVERRIDE"
  | "DEAL_WON"
  | "DEAL_LOST"
  | "DEAL_SLIPPED"
  | "ACTION_APPROVED"
  | "ACTION_REJECTED"
  | "RISK_CONFIRMED"
  | "RISK_DISMISSED"
  | "OUTREACH_SUCCESS"
  | "OUTREACH_FAILURE";

// ---------------------------------------------------------------------------
// Objects
// ---------------------------------------------------------------------------

export interface Workspace {
  id: ID;
  name: string;
  domain: string;
  createdAt: string;
  timezone: string;
  salesMotionType: string;
  defaultCurrency: string;
  isCrossTenantLearningEnabled: boolean;
  status: "ACTIVE" | "SETUP" | "SUSPENDED";
}

export interface User {
  id: ID;
  workspaceId: ID;
  name: string;
  email: string;
  role: UserRole;
  managerId?: ID;
  status: "ACTIVE" | "INVITED" | "DISABLED";
}

export interface Account {
  id: ID;
  workspaceId: ID;
  name: string;
  domain: string;
  industry: string;
  employeeCount: number;
  revenueBand: string;
  location: string;
  fundingStage: string;
  accountOwnerId: ID;
  icpFitScore: number;
  marketSignalScore: number;
  createdAt: string;
}

export interface Contact {
  id: ID;
  workspaceId: ID;
  accountId: ID;
  name: string;
  email: string;
  title: string;
  seniority: string;
  department: string;
  relationshipStrength: number;
  engagementScore: number;
  lastEngagedAt?: string;
}

export interface PipelineStage {
  id: ID;
  workspaceId: ID;
  name: string;
  order: number;
  exitCriteria: string[];
  entryCriteria: string[];
  requiredEvidenceTypes: QualEvidenceType[];
  autoAdvanceAllowed: boolean;
  managerApprovalRequired: boolean;
}

export interface DealScores {
  dealHealth: number;
  stageReadiness: number;
  forecastConfidence: number;
  risk: number;
  momentum: number;
  championStrength: number;
  buyingGroupCoverage: number;
  nextStepQuality: number;
  competitiveRisk: number;
  compellingEventStrength: number;
  qualificationCompleteness: number;
}

export interface Deal {
  id: ID;
  workspaceId: ID;
  accountId: ID;
  name: string;
  ownerId: ID;
  stageId: ID;
  amount: number;
  currency: string;
  closeDate: string;
  forecastCategory: ForecastCategory;
  scores: DealScores;
  status: DealStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Stakeholder {
  id: ID;
  dealId: ID;
  contactId: ID;
  roleInDeal: StakeholderRole;
  influenceLevel: "LOW" | "MEDIUM" | "HIGH";
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  engagementLevel: "LOW" | "MEDIUM" | "HIGH";
  isChampion: boolean;
  isBlocker: boolean;
  isEconomicBuyer: boolean;
  lastEngagedAt?: string;
  evidenceSignalIds: ID[];
  confidence: number;
}

export interface Activity {
  id: ID;
  workspaceId: ID;
  accountId: ID;
  dealId?: ID;
  contactIds: ID[];
  type: ActivityType;
  source: string;
  occurredAt: string;
  ownerId: ID;
  summary: string;
  createdAt: string;
}

export interface Transcript {
  id: ID;
  activityId: ID;
  sourceTool: string;
  rawText: string;
  language: string;
  durationSeconds: number;
  processedStatus: "PENDING" | "PROCESSING" | "PROCESSED" | "FAILED";
  createdAt: string;
}

export interface Signal {
  id: ID;
  workspaceId: ID;
  accountId: ID;
  dealId?: ID;
  contactId?: ID;
  sourceType: SignalSourceType;
  signalFamily: SignalFamily;
  signalType: string;
  title: string;
  description: string;
  evidenceText?: string;
  evidenceUrl?: string;
  sourceActivityId?: ID;
  sourceTranscriptId?: ID;
  confidence: number;
  relevanceScore?: number;
  impactDirection: ImpactDirection;
  impactMagnitude: ImpactMagnitude;
  occurredAt: string;
  detectedAt: string;
  createdByAgent: string;
  status: "ACTIVE" | "DISMISSED" | "STALE";
}

export interface Commitment {
  id: ID;
  dealId: ID;
  ownerSide: "BUYER" | "SELLER";
  description: string;
  dueDate?: string;
  status: "OPEN" | "COMPLETED" | "MISSED" | "CANCELLED";
  sourceSignalId?: ID;
  confidence: number;
  createdAt: string;
}

export interface QualificationEvidence {
  id: ID;
  dealId: ID;
  framework: "MEDDPICC" | "BANT" | "CUSTOM";
  evidenceType: QualEvidenceType;
  status: QualEvidenceStatus;
  sourceSignalIds: ID[];
  summary: string;
  confidence: number;
  lastVerifiedAt?: string;
}

export interface ScoreFactor {
  signalId?: ID;
  description: string;
  weight: number; // positive or negative
}

export interface Judgment {
  id: ID;
  workspaceId: ID;
  dealId: ID;
  judgmentType: JudgmentType;
  value: string;
  score: number;
  confidence: number;
  rationale: string;
  direction: "INCREASED" | "DECREASED" | "UNCHANGED";
  changeSinceLast: number;
  positiveFactors: ScoreFactor[];
  negativeFactors: ScoreFactor[];
  sourceSignalIds: ID[];
  createdByAgent: string;
  modelVersion: string;
  createdAt: string;
}

export interface StageProposal {
  id: ID;
  dealId: ID;
  currentStageId: ID;
  proposedStageId: ID;
  proposalType: ProposalType;
  confidence: number;
  rationale: string;
  requiredEvidenceMet: string[];
  missingEvidence: string[];
  sourceSignalIds: ID[];
  createdByAgent: string;
  autonomyMode: AutonomyMode;
  status: ProposalStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedByUserId?: ID;
}

export interface ActionRecommendation {
  id: ID;
  workspaceId: ID;
  dealId?: ID;
  accountId?: ID;
  assignedToUserId: ID;
  actionType: ActionType;
  title: string;
  description: string;
  draftPayload?: string;
  confidence: number;
  priorityScore: number;
  businessRiskLevel: BusinessRiskLevel;
  autonomyMode: AutonomyMode;
  sourceSignalIds: ID[];
  rationale: string;
  whyNow: string;
  status: ActionStatus;
  dueAt?: string;
  createdByAgent: string;
  createdAt: string;
  resolvedAt?: string;
  // For stage-change actions, link to the proposal it represents.
  stageProposalId?: ID;
  badge: "Risk" | "Stage" | "Follow-up" | "Forecast" | "Market" | "Commitment" | "Stakeholder";
}

export interface Override {
  id: ID;
  workspaceId: ID;
  dealId: ID;
  userId: ID;
  targetObjectType: string;
  targetObjectId: ID;
  originalAgentValue: string;
  userCorrectedValue: string;
  overrideReasonCode: OverrideReasonCode;
  overrideReasonNote?: string;
  sourceContext: string;
  createdAt: string;
  learningEventId?: ID;
}

export interface Outcome {
  id: ID;
  dealId: ID;
  outcomeType: OutcomeType;
  amount: number;
  closeDate: string;
  lossReason?: string;
  competitor?: string;
  source: string;
  createdAt: string;
}

export interface LearningEvent {
  id: ID;
  workspaceId: ID;
  dealId?: ID;
  eventType: LearningEventType;
  inputSnapshot: Record<string, unknown>;
  label: string;
  sourceObjectType: string;
  sourceObjectId: ID;
  tenantVisible: boolean;
  eligibleForCrossTenantLearning: boolean;
  createdAt: string;
}

// SDR / Outreach Optimization (PRD 07.12, 09.2 SDR queue).
export interface TargetAccount {
  id: ID;
  workspaceId: ID;
  name: string;
  domain: string;
  industry: string;
  employeeCount: number;
  icpFitScore: number; // 0-100
  marketSignalScore: number; // 0-100, strength of recent triggers
  triggerEvents: string[]; // e.g. "Series C funding", "20 sales roles open"
  matchedWonPattern?: string; // which closed-won pattern this resembles
  status: "NEW" | "WORKING" | "QUALIFIED" | "DISMISSED";
}

export type OutreachSuggestionType =
  | "TARGET_ACCOUNT"
  | "PERSONA"
  | "MESSAGE_ANGLE"
  | "ICP_REFINEMENT"
  | "TRIGGER_OUTREACH"
  | "FOLLOW_UP_TIMING";

export interface OutreachSuggestion {
  id: ID;
  workspaceId: ID;
  assignedToUserId: ID;
  type: OutreachSuggestionType;
  title: string;
  rationale: string; // grounded in won/lost patterns — never opens/replies alone
  evidence: string[]; // closed-won deals / signals this is learned from
  targetAccountId?: ID;
  draftMessage?: string;
  confidence: number;
  priorityScore: number;
  status: "PENDING" | "ACCEPTED" | "DISMISSED";
  createdByAgent: string;
  createdAt: string;
}

export interface AuditEvent {
  id: ID;
  workspaceId: ID;
  actorType: ActorType;
  actorId: ID;
  objectType: string;
  objectId: ID;
  eventType: string;
  beforeValue?: string;
  afterValue?: string;
  sourceSignalIds: ID[];
  reason?: string;
  createdAt: string;
}
