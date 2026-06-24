// First-prototype data seed (PRD 22.2):
// 3 users, 5 accounts, 8 contacts, 6 open deals, 2 won, 2 lost,
// 20 signals, 5 stage proposals, 10 action cards, 3 overrides, 4 risk flags.
// Dates are fixed strings (no Date.now) for reproducibility.

import type {
  Account,
  ActionRecommendation,
  Commitment,
  Contact,
  Deal,
  DealScores,
  Override,
  PipelineStage,
  QualificationEvidence,
  Signal,
  Stakeholder,
  StageProposal,
  TargetAccount,
  User,
  Workspace,
} from "./types";

const WS = "ws_0001";
const NOW = "2026-06-19T09:00:00Z";

const emptyScores = (over: Partial<DealScores> = {}): DealScores => ({
  dealHealth: 60,
  stageReadiness: 55,
  forecastConfidence: 50,
  risk: 40,
  momentum: 50,
  championStrength: 45,
  buyingGroupCoverage: 40,
  nextStepQuality: 45,
  competitiveRisk: 20,
  compellingEventStrength: 30,
  qualificationCompleteness: 40,
  ...over,
});

export const workspace: Workspace = {
  id: WS,
  name: "Northwind Revenue",
  domain: "northwind.example",
  createdAt: "2026-01-05T00:00:00Z",
  timezone: "America/New_York",
  salesMotionType: "B2B SaaS mid-market",
  defaultCurrency: "USD",
  isCrossTenantLearningEnabled: false,
  status: "ACTIVE",
};

export const users: User[] = [
  { id: "user_ae", workspaceId: WS, name: "Sarah Chen", email: "sarah@northwind.example", role: "AE", managerId: "user_mgr", status: "ACTIVE" },
  { id: "user_ae2", workspaceId: WS, name: "Diego Alvarez", email: "diego@northwind.example", role: "AE", managerId: "user_mgr", status: "ACTIVE" },
  { id: "user_ae3", workspaceId: WS, name: "Nina Kapoor", email: "nina@northwind.example", role: "AE", managerId: "user_mgr", status: "ACTIVE" },
  { id: "user_ae4", workspaceId: WS, name: "Tom Becker", email: "tom@northwind.example", role: "AE", managerId: "user_mgr", status: "ACTIVE" },
  { id: "user_sdr", workspaceId: WS, name: "Jordan Vance", email: "jordan@northwind.example", role: "SDR", managerId: "user_mgr", status: "ACTIVE" },
  { id: "user_mgr", workspaceId: WS, name: "Marcus Reyes", email: "marcus@northwind.example", role: "SALES_MANAGER", status: "ACTIVE" },
  { id: "user_revops", workspaceId: WS, name: "Priya Nair", email: "priya@northwind.example", role: "REVOPS", status: "ACTIVE" },
  { id: "user_admin", workspaceId: WS, name: "Alex Morgan", email: "alex@northwind.example", role: "ADMIN", status: "ACTIVE" },
];

export const stages: PipelineStage[] = [
  { id: "stage_1", workspaceId: WS, name: "Prospecting", order: 1, exitCriteria: ["Contact engaged"], entryCriteria: [], requiredEvidenceTypes: [], autoAdvanceAllowed: false, managerApprovalRequired: false },
  { id: "stage_2", workspaceId: WS, name: "Qualified", order: 2, exitCriteria: ["Pain identified"], entryCriteria: ["Contact engaged"], requiredEvidenceTypes: ["IDENTIFIED_PAIN"], autoAdvanceAllowed: false, managerApprovalRequired: false },
  { id: "stage_3", workspaceId: WS, name: "Discovery", order: 3, exitCriteria: ["Pain confirmed", "Decision criteria"], entryCriteria: ["Pain identified"], requiredEvidenceTypes: ["IDENTIFIED_PAIN", "DECISION_CRITERIA"], autoAdvanceAllowed: false, managerApprovalRequired: false },
  { id: "stage_4", workspaceId: WS, name: "Solution Fit", order: 4, exitCriteria: ["EB engaged", "Criteria mapped"], entryCriteria: ["Pain confirmed", "Decision criteria"], requiredEvidenceTypes: ["ECONOMIC_BUYER", "DECISION_CRITERIA"], autoAdvanceAllowed: false, managerApprovalRequired: false },
  { id: "stage_5", workspaceId: WS, name: "Business Case", order: 5, exitCriteria: ["Metrics agreed"], entryCriteria: ["EB engaged"], requiredEvidenceTypes: ["METRICS", "ECONOMIC_BUYER"], autoAdvanceAllowed: false, managerApprovalRequired: true },
  { id: "stage_6", workspaceId: WS, name: "Negotiation", order: 6, exitCriteria: ["Terms agreed"], entryCriteria: ["Metrics agreed"], requiredEvidenceTypes: ["PAPER_PROCESS"], autoAdvanceAllowed: false, managerApprovalRequired: true },
  { id: "stage_7", workspaceId: WS, name: "Procurement / Legal", order: 7, exitCriteria: ["Signed"], entryCriteria: ["Terms agreed"], requiredEvidenceTypes: ["PAPER_PROCESS"], autoAdvanceAllowed: false, managerApprovalRequired: true },
  { id: "stage_won", workspaceId: WS, name: "Closed Won", order: 8, exitCriteria: [], entryCriteria: [], requiredEvidenceTypes: [], autoAdvanceAllowed: false, managerApprovalRequired: false },
  { id: "stage_lost", workspaceId: WS, name: "Closed Lost", order: 9, exitCriteria: [], entryCriteria: [], requiredEvidenceTypes: [], autoAdvanceAllowed: false, managerApprovalRequired: false },
];

export const accounts: Account[] = [
  { id: "acc_acme", workspaceId: WS, name: "Acme Logistics", domain: "acme.example", industry: "Logistics", employeeCount: 1200, revenueBand: "$100M-$500M", location: "Chicago, IL", fundingStage: "Private", accountOwnerId: "user_ae", icpFitScore: 82, marketSignalScore: 60, createdAt: "2026-02-01T00:00:00Z" },
  { id: "acc_bright", workspaceId: WS, name: "BrightCo", domain: "brightco.example", industry: "SaaS", employeeCount: 420, revenueBand: "$50M-$100M", location: "Austin, TX", fundingStage: "Series C", accountOwnerId: "user_ae", icpFitScore: 91, marketSignalScore: 88, createdAt: "2026-02-10T00:00:00Z" },
  { id: "acc_globex", workspaceId: WS, name: "Globex Manufacturing", domain: "globex.example", industry: "Manufacturing", employeeCount: 3000, revenueBand: "$500M-$1B", location: "Detroit, MI", fundingStage: "Public", accountOwnerId: "user_ae", icpFitScore: 70, marketSignalScore: 40, createdAt: "2026-03-01T00:00:00Z" },
  { id: "acc_initech", workspaceId: WS, name: "Initech", domain: "initech.example", industry: "FinTech", employeeCount: 250, revenueBand: "$10M-$50M", location: "San Jose, CA", fundingStage: "Series B", accountOwnerId: "user_ae", icpFitScore: 76, marketSignalScore: 55, createdAt: "2026-03-15T00:00:00Z" },
  { id: "acc_umbrella", workspaceId: WS, name: "Umbrella Health", domain: "umbrella.example", industry: "Healthcare", employeeCount: 5000, revenueBand: "$1B+", location: "Boston, MA", fundingStage: "Public", accountOwnerId: "user_ae", icpFitScore: 64, marketSignalScore: 35, createdAt: "2026-04-01T00:00:00Z" },
];

export const contacts: Contact[] = [
  { id: "ct_acme_vp", workspaceId: WS, accountId: "acc_acme", name: "Dana Whitfield", email: "dana@acme.example", title: "VP of Sales", seniority: "VP", department: "Sales", relationshipStrength: 70, engagementScore: 75, lastEngagedAt: "2026-06-17T00:00:00Z" },
  { id: "ct_acme_dir", workspaceId: WS, accountId: "acc_acme", name: "Leo Park", email: "leo@acme.example", title: "Director of RevOps", seniority: "Director", department: "RevOps", relationshipStrength: 60, engagementScore: 65, lastEngagedAt: "2026-06-16T00:00:00Z" },
  { id: "ct_bright_cro", workspaceId: WS, accountId: "acc_bright", name: "Mia Torres", email: "mia@brightco.example", title: "CRO", seniority: "C-Level", department: "Revenue", relationshipStrength: 55, engagementScore: 50, lastEngagedAt: "2026-06-10T00:00:00Z" },
  { id: "ct_bright_ops", workspaceId: WS, accountId: "acc_bright", name: "Sam Olsen", email: "sam@brightco.example", title: "Sales Ops Lead", seniority: "Manager", department: "Sales Ops", relationshipStrength: 65, engagementScore: 72, lastEngagedAt: "2026-06-18T00:00:00Z" },
  { id: "ct_globex_it", workspaceId: WS, accountId: "acc_globex", name: "Raj Mehta", email: "raj@globex.example", title: "IT Director", seniority: "Director", department: "IT", relationshipStrength: 45, engagementScore: 40, lastEngagedAt: "2026-06-05T00:00:00Z" },
  { id: "ct_initech_vp", workspaceId: WS, accountId: "acc_initech", name: "Quinn Adams", email: "quinn@initech.example", title: "VP Finance", seniority: "VP", department: "Finance", relationshipStrength: 50, engagementScore: 48, lastEngagedAt: "2026-06-12T00:00:00Z" },
  { id: "ct_umbrella_dir", workspaceId: WS, accountId: "acc_umbrella", name: "Casey Lin", email: "casey@umbrella.example", title: "Director of Sales", seniority: "Director", department: "Sales", relationshipStrength: 40, engagementScore: 35, lastEngagedAt: "2026-05-28T00:00:00Z" },
  { id: "ct_umbrella_proc", workspaceId: WS, accountId: "acc_umbrella", name: "Jordan Beck", email: "jordan@umbrella.example", title: "Procurement Manager", seniority: "Manager", department: "Procurement", relationshipStrength: 30, engagementScore: 25 },
];

export const deals: Deal[] = [
  { id: "deal_acme", workspaceId: WS, accountId: "acc_acme", name: "Acme — Revenue Platform", ownerId: "user_ae", stageId: "stage_3", amount: 75000, currency: "USD", closeDate: "2026-08-15", forecastCategory: "BEST_CASE", scores: emptyScores({ dealHealth: 61, stageReadiness: 54, forecastConfidence: 48, nextStepQuality: 40, risk: 38 }), status: "OPEN", createdAt: "2026-04-02T00:00:00Z", updatedAt: NOW },
  { id: "deal_bright", workspaceId: WS, accountId: "acc_bright", name: "BrightCo — Sales Productivity", ownerId: "user_ae4", stageId: "stage_2", amount: 120000, currency: "USD", closeDate: "2026-09-30", forecastCategory: "PIPELINE", scores: emptyScores({ dealHealth: 58, stageReadiness: 50, compellingEventStrength: 70 }), status: "OPEN", createdAt: "2026-04-10T00:00:00Z", updatedAt: NOW },
  { id: "deal_globex", workspaceId: WS, accountId: "acc_globex", name: "Globex — Forecast Suite", ownerId: "user_ae2", stageId: "stage_4", amount: 210000, currency: "USD", closeDate: "2026-07-31", forecastCategory: "COMMIT", scores: emptyScores({ dealHealth: 52, stageReadiness: 60, forecastConfidence: 55, risk: 68, championStrength: 30, buyingGroupCoverage: 35 }), status: "OPEN", createdAt: "2026-03-20T00:00:00Z", updatedAt: NOW },
  { id: "deal_initech", workspaceId: WS, accountId: "acc_initech", name: "Initech — Pipeline Analytics", ownerId: "user_ae3", stageId: "stage_5", amount: 95000, currency: "USD", closeDate: "2026-07-15", forecastCategory: "COMMIT", scores: emptyScores({ dealHealth: 72, stageReadiness: 78, forecastConfidence: 70, risk: 30, momentum: 75 }), status: "OPEN", createdAt: "2026-03-05T00:00:00Z", updatedAt: NOW },
  { id: "deal_umbrella", workspaceId: WS, accountId: "acc_umbrella", name: "Umbrella — Deal Inspection", ownerId: "user_ae4", stageId: "stage_2", amount: 60000, currency: "USD", closeDate: "2026-10-30", forecastCategory: "PIPELINE", scores: emptyScores({ dealHealth: 44, stageReadiness: 38, forecastConfidence: 35, risk: 72, nextStepQuality: 25, momentum: 30 }), status: "OPEN", createdAt: "2026-05-01T00:00:00Z", updatedAt: NOW },
  { id: "deal_acme_expand", workspaceId: WS, accountId: "acc_acme", name: "Acme — Expansion (Forecast Add-on)", ownerId: "user_ae", stageId: "stage_3", amount: 40000, currency: "USD", closeDate: "2026-09-10", forecastCategory: "BEST_CASE", scores: emptyScores({ dealHealth: 66, stageReadiness: 58, forecastConfidence: 52 }), status: "OPEN", createdAt: "2026-05-15T00:00:00Z", updatedAt: NOW },
  // Won + lost (closed) for outcome/learning context.
  { id: "deal_won_1", workspaceId: WS, accountId: "acc_bright", name: "BrightCo — Pilot (Won)", ownerId: "user_ae4", stageId: "stage_won", amount: 30000, currency: "USD", closeDate: "2026-05-20", forecastCategory: "CLOSED", scores: emptyScores({ dealHealth: 88, stageReadiness: 95 }), status: "WON", createdAt: "2026-01-15T00:00:00Z", updatedAt: "2026-05-20T00:00:00Z" },
  { id: "deal_won_2", workspaceId: WS, accountId: "acc_initech", name: "Initech — Seat Expansion (Won)", ownerId: "user_ae3", stageId: "stage_won", amount: 45000, currency: "USD", closeDate: "2026-04-28", forecastCategory: "CLOSED", scores: emptyScores({ dealHealth: 90, stageReadiness: 96 }), status: "WON", createdAt: "2026-01-20T00:00:00Z", updatedAt: "2026-04-28T00:00:00Z" },
  { id: "deal_lost_1", workspaceId: WS, accountId: "acc_globex", name: "Globex — CPQ (Lost)", ownerId: "user_ae2", stageId: "stage_lost", amount: 150000, currency: "USD", closeDate: "2026-05-10", forecastCategory: "OMITTED", scores: emptyScores({ dealHealth: 30, stageReadiness: 40, risk: 85 }), status: "LOST", createdAt: "2026-01-10T00:00:00Z", updatedAt: "2026-05-10T00:00:00Z" },
  { id: "deal_lost_2", workspaceId: WS, accountId: "acc_umbrella", name: "Umbrella — Analytics (Lost)", ownerId: "user_ae4", stageId: "stage_lost", amount: 80000, currency: "USD", closeDate: "2026-04-15", forecastCategory: "OMITTED", scores: emptyScores({ dealHealth: 28, stageReadiness: 35, risk: 88 }), status: "LOST", createdAt: "2026-01-25T00:00:00Z", updatedAt: "2026-04-15T00:00:00Z" },
];

export const stakeholders: Stakeholder[] = [
  { id: "sh_acme_1", dealId: "deal_acme", contactId: "ct_acme_vp", roleInDeal: "ECONOMIC_BUYER", influenceLevel: "HIGH", sentiment: "POSITIVE", engagementLevel: "HIGH", isChampion: false, isBlocker: false, isEconomicBuyer: true, lastEngagedAt: "2026-06-17T00:00:00Z", evidenceSignalIds: [], confidence: 0.8 },
  { id: "sh_acme_2", dealId: "deal_acme", contactId: "ct_acme_dir", roleInDeal: "CHAMPION", influenceLevel: "MEDIUM", sentiment: "POSITIVE", engagementLevel: "HIGH", isChampion: true, isBlocker: false, isEconomicBuyer: false, lastEngagedAt: "2026-06-16T00:00:00Z", evidenceSignalIds: [], confidence: 0.75 },
  { id: "sh_bright_1", dealId: "deal_bright", contactId: "ct_bright_ops", roleInDeal: "CHAMPION", influenceLevel: "MEDIUM", sentiment: "POSITIVE", engagementLevel: "HIGH", isChampion: true, isBlocker: false, isEconomicBuyer: false, lastEngagedAt: "2026-06-18T00:00:00Z", evidenceSignalIds: [], confidence: 0.7 },
  { id: "sh_globex_1", dealId: "deal_globex", contactId: "ct_globex_it", roleInDeal: "TECHNICAL_BUYER", influenceLevel: "LOW", sentiment: "NEUTRAL", engagementLevel: "LOW", isChampion: false, isBlocker: false, isEconomicBuyer: false, lastEngagedAt: "2026-06-05T00:00:00Z", evidenceSignalIds: [], confidence: 0.6 },
  { id: "sh_initech_1", dealId: "deal_initech", contactId: "ct_initech_vp", roleInDeal: "ECONOMIC_BUYER", influenceLevel: "HIGH", sentiment: "POSITIVE", engagementLevel: "HIGH", isChampion: false, isBlocker: false, isEconomicBuyer: true, lastEngagedAt: "2026-06-12T00:00:00Z", evidenceSignalIds: [], confidence: 0.85 },
  { id: "sh_umbrella_1", dealId: "deal_umbrella", contactId: "ct_umbrella_dir", roleInDeal: "INFLUENCER", influenceLevel: "LOW", sentiment: "NEUTRAL", engagementLevel: "LOW", isChampion: false, isBlocker: false, isEconomicBuyer: false, lastEngagedAt: "2026-05-28T00:00:00Z", evidenceSignalIds: [], confidence: 0.5 },
];

// 20 signals across families.
export const signals: Signal[] = [
  { id: "sig_0001", workspaceId: WS, accountId: "acc_acme", dealId: "deal_acme", sourceType: "CONVERSATION", signalFamily: "QUALIFICATION", signalType: "PAIN_CONFIRMED", title: "Pain confirmed", description: "Forecast reviews take two days weekly.", evidenceText: "Our forecast reviews take two days every week.", confidence: 0.91, impactDirection: "POSITIVE", impactMagnitude: "HIGH", occurredAt: "2026-06-10T00:00:00Z", detectedAt: "2026-06-10T00:05:00Z", createdByAgent: "mock_conversation_intelligence", status: "ACTIVE" },
  { id: "sig_0002", workspaceId: WS, accountId: "acc_acme", dealId: "deal_acme", sourceType: "CONVERSATION", signalFamily: "QUALIFICATION", signalType: "DECISION_CRITERIA_CONFIRMED", title: "Decision criteria discussed", description: "CRM integration + forecast accuracy.", evidenceText: "We need it to integrate with our CRM and improve forecast accuracy.", confidence: 0.8, impactDirection: "POSITIVE", impactMagnitude: "MEDIUM", occurredAt: "2026-06-10T00:00:00Z", detectedAt: "2026-06-10T00:05:00Z", createdByAgent: "mock_conversation_intelligence", status: "ACTIVE" },
  { id: "sig_0003", workspaceId: WS, accountId: "acc_acme", dealId: "deal_acme", sourceType: "CONVERSATION", signalFamily: "QUALIFICATION", signalType: "NO_BUDGET_SIGNAL", title: "Budget unconfirmed", description: "Budget not yet confirmed.", evidenceText: "We haven't allocated budget for this yet.", confidence: 0.78, impactDirection: "NEGATIVE", impactMagnitude: "MEDIUM", occurredAt: "2026-06-10T00:00:00Z", detectedAt: "2026-06-10T00:05:00Z", createdByAgent: "mock_conversation_intelligence", status: "ACTIVE" },
  { id: "sig_0004", workspaceId: WS, accountId: "acc_bright", dealId: "deal_bright", sourceType: "MARKET", signalFamily: "MARKET", signalType: "FUNDING_EVENT", title: "Series C raised", description: "BrightCo raised Series C, plans to double sales team.", evidenceText: "BrightCo announces $80M Series C to scale go-to-market.", evidenceUrl: "https://news.example/brightco-series-c", confidence: 0.95, relevanceScore: 91, impactDirection: "POSITIVE", impactMagnitude: "HIGH", occurredAt: "2026-06-15T00:00:00Z", detectedAt: "2026-06-15T06:00:00Z", createdByAgent: "research_agent", status: "ACTIVE" },
  { id: "sig_0005", workspaceId: WS, accountId: "acc_globex", dealId: "deal_globex", sourceType: "ENGAGEMENT", signalFamily: "RISK", signalType: "SINGLE_THREADED", title: "Single-threaded deal", description: "Only IT Director engaged in 21 days.", confidence: 0.88, impactDirection: "NEGATIVE", impactMagnitude: "HIGH", occurredAt: "2026-06-12T00:00:00Z", detectedAt: "2026-06-12T00:00:00Z", createdByAgent: "risk_agent", status: "ACTIVE" },
  { id: "sig_0006", workspaceId: WS, accountId: "acc_globex", dealId: "deal_globex", sourceType: "CRM", signalFamily: "RISK", signalType: "CLOSE_DATE_PUSHED", title: "Close date pushed", description: "Close date moved out two weeks.", confidence: 0.8, impactDirection: "NEGATIVE", impactMagnitude: "MEDIUM", occurredAt: "2026-06-08T00:00:00Z", detectedAt: "2026-06-08T00:00:00Z", createdByAgent: "risk_agent", status: "ACTIVE" },
  { id: "sig_0007", workspaceId: WS, accountId: "acc_globex", dealId: "deal_globex", sourceType: "CONVERSATION", signalFamily: "COMPETITIVE", signalType: "COMPETITOR_NAMED", title: "Competitor referenced", description: "Incumbent vendor mentioned.", evidenceText: "We currently use Salesforce for this.", confidence: 0.74, impactDirection: "NEGATIVE", impactMagnitude: "MEDIUM", occurredAt: "2026-06-09T00:00:00Z", detectedAt: "2026-06-09T00:00:00Z", createdByAgent: "mock_conversation_intelligence", status: "ACTIVE" },
  { id: "sig_0008", workspaceId: WS, accountId: "acc_initech", dealId: "deal_initech", sourceType: "CONVERSATION", signalFamily: "QUALIFICATION", signalType: "METRICS_CONFIRMED", title: "Metrics confirmed", description: "Quantified $300k/yr inefficiency.", evidenceText: "We estimate $300k a year lost to bad pipeline data.", confidence: 0.85, impactDirection: "POSITIVE", impactMagnitude: "HIGH", occurredAt: "2026-06-11T00:00:00Z", detectedAt: "2026-06-11T00:00:00Z", createdByAgent: "mock_conversation_intelligence", status: "ACTIVE" },
  { id: "sig_0009", workspaceId: WS, accountId: "acc_initech", dealId: "deal_initech", sourceType: "ENGAGEMENT", signalFamily: "MOMENTUM", signalType: "MEETING_CADENCE_ACCELERATED", title: "Cadence accelerated", description: "Weekly meetings now.", confidence: 0.8, impactDirection: "POSITIVE", impactMagnitude: "MEDIUM", occurredAt: "2026-06-13T00:00:00Z", detectedAt: "2026-06-13T00:00:00Z", createdByAgent: "risk_agent", status: "ACTIVE" },
  { id: "sig_0010", workspaceId: WS, accountId: "acc_umbrella", dealId: "deal_umbrella", sourceType: "ENGAGEMENT", signalFamily: "RISK", signalType: "NO_NEXT_STEP", title: "No next step", description: "No scheduled next step.", confidence: 0.82, impactDirection: "NEGATIVE", impactMagnitude: "HIGH", occurredAt: "2026-06-01T00:00:00Z", detectedAt: "2026-06-01T00:00:00Z", createdByAgent: "risk_agent", status: "ACTIVE" },
  { id: "sig_0011", workspaceId: WS, accountId: "acc_umbrella", dealId: "deal_umbrella", sourceType: "ENGAGEMENT", signalFamily: "ENGAGEMENT", signalType: "ENGAGEMENT_DECAY", title: "Engagement decay", description: "Activity declined materially.", confidence: 0.79, impactDirection: "NEGATIVE", impactMagnitude: "MEDIUM", occurredAt: "2026-05-30T00:00:00Z", detectedAt: "2026-05-30T00:00:00Z", createdByAgent: "risk_agent", status: "ACTIVE" },
  { id: "sig_0012", workspaceId: WS, accountId: "acc_acme", dealId: "deal_acme", sourceType: "CONVERSATION", signalFamily: "QUALIFICATION", signalType: "ECONOMIC_BUYER_ENGAGED", title: "Economic buyer engaged", description: "VP Sales attended discovery.", evidenceText: "Our VP of Sales joined to evaluate.", confidence: 0.84, impactDirection: "POSITIVE", impactMagnitude: "HIGH", occurredAt: "2026-06-17T00:00:00Z", detectedAt: "2026-06-17T00:00:00Z", createdByAgent: "mock_conversation_intelligence", status: "ACTIVE" },
  { id: "sig_0013", workspaceId: WS, accountId: "acc_acme", dealId: "deal_acme", sourceType: "CONVERSATION", signalFamily: "COMMITMENT", signalType: "MUTUAL_NEXT_STEP_CONFIRMED", title: "Mutual next step confirmed", description: "Technical review next Tuesday.", evidenceText: "Let's do the technical review next Tuesday.", confidence: 0.86, impactDirection: "POSITIVE", impactMagnitude: "MEDIUM", occurredAt: "2026-06-17T00:00:00Z", detectedAt: "2026-06-17T00:00:00Z", createdByAgent: "mock_conversation_intelligence", status: "ACTIVE" },
  { id: "sig_0014", workspaceId: WS, accountId: "acc_bright", dealId: "deal_bright", sourceType: "CONVERSATION", signalFamily: "QUALIFICATION", signalType: "PAIN_CONFIRMED", title: "Pain confirmed", description: "Onboarding new reps is slow.", confidence: 0.83, impactDirection: "POSITIVE", impactMagnitude: "MEDIUM", occurredAt: "2026-06-09T00:00:00Z", detectedAt: "2026-06-09T00:00:00Z", createdByAgent: "mock_conversation_intelligence", status: "ACTIVE" },
  { id: "sig_0015", workspaceId: WS, accountId: "acc_initech", dealId: "deal_initech", sourceType: "CONVERSATION", signalFamily: "BUYING_GROUP", signalType: "CHAMPION_IDENTIFIED", title: "Champion identified", description: "VP Finance advocating internally.", confidence: 0.8, impactDirection: "POSITIVE", impactMagnitude: "MEDIUM", occurredAt: "2026-06-11T00:00:00Z", detectedAt: "2026-06-11T00:00:00Z", createdByAgent: "mock_conversation_intelligence", status: "ACTIVE" },
  { id: "sig_0016", workspaceId: WS, accountId: "acc_globex", dealId: "deal_globex", sourceType: "CONVERSATION", signalFamily: "RISK", signalType: "OBJECTION_UNRESOLVED", title: "Objection unresolved", description: "ROI not yet demonstrated.", confidence: 0.7, impactDirection: "NEGATIVE", impactMagnitude: "MEDIUM", occurredAt: "2026-06-09T00:00:00Z", detectedAt: "2026-06-09T00:00:00Z", createdByAgent: "mock_conversation_intelligence", status: "ACTIVE" },
  { id: "sig_0017", workspaceId: WS, accountId: "acc_initech", dealId: "deal_initech", sourceType: "CRM", signalFamily: "COMMERCIAL", signalType: "CONTRACT_REVIEW_STARTED", title: "Contract review started", description: "Legal began reviewing MSA.", confidence: 0.82, impactDirection: "POSITIVE", impactMagnitude: "MEDIUM", occurredAt: "2026-06-14T00:00:00Z", detectedAt: "2026-06-14T00:00:00Z", createdByAgent: "mock_conversation_intelligence", status: "ACTIVE" },
  { id: "sig_0018", workspaceId: WS, accountId: "acc_bright", dealId: "deal_bright", sourceType: "MARKET", signalFamily: "MARKET", signalType: "HIRING_SPIKE", title: "Hiring spike", description: "20 open sales roles posted.", evidenceUrl: "https://jobs.example/brightco", confidence: 0.7, relevanceScore: 78, impactDirection: "POSITIVE", impactMagnitude: "MEDIUM", occurredAt: "2026-06-16T00:00:00Z", detectedAt: "2026-06-16T00:00:00Z", createdByAgent: "research_agent", status: "ACTIVE" },
  { id: "sig_0019", workspaceId: WS, accountId: "acc_acme", dealId: "deal_acme_expand", sourceType: "ENGAGEMENT", signalFamily: "ENGAGEMENT", signalType: "MULTI_THREADING_INCREASED", title: "Multi-threading increased", description: "Two new stakeholders engaged.", confidence: 0.75, impactDirection: "POSITIVE", impactMagnitude: "MEDIUM", occurredAt: "2026-06-15T00:00:00Z", detectedAt: "2026-06-15T00:00:00Z", createdByAgent: "risk_agent", status: "ACTIVE" },
  { id: "sig_0020", workspaceId: WS, accountId: "acc_umbrella", dealId: "deal_umbrella", sourceType: "CONVERSATION", signalFamily: "BUYING_GROUP", signalType: "BLOCKER_IDENTIFIED", title: "Blocker identified", description: "Procurement resisting timeline.", confidence: 0.72, impactDirection: "NEGATIVE", impactMagnitude: "MEDIUM", occurredAt: "2026-06-02T00:00:00Z", detectedAt: "2026-06-02T00:00:00Z", createdByAgent: "mock_conversation_intelligence", status: "ACTIVE" },
];

export const qualificationEvidence: QualificationEvidence[] = [
  { id: "qe_acme_pain", dealId: "deal_acme", framework: "MEDDPICC", evidenceType: "IDENTIFIED_PAIN", status: "STRONG", sourceSignalIds: ["sig_0001"], summary: "Forecast process is slow and unreliable.", confidence: 0.91, lastVerifiedAt: "2026-06-10T00:00:00Z" },
  { id: "qe_acme_dc", dealId: "deal_acme", framework: "MEDDPICC", evidenceType: "DECISION_CRITERIA", status: "PRESENT", sourceSignalIds: ["sig_0002"], summary: "CRM integration + forecast accuracy.", confidence: 0.8, lastVerifiedAt: "2026-06-10T00:00:00Z" },
  { id: "qe_acme_eb", dealId: "deal_acme", framework: "MEDDPICC", evidenceType: "ECONOMIC_BUYER", status: "PRESENT", sourceSignalIds: ["sig_0012"], summary: "VP Sales engaged.", confidence: 0.84, lastVerifiedAt: "2026-06-17T00:00:00Z" },
  { id: "qe_acme_metrics", dealId: "deal_acme", framework: "MEDDPICC", evidenceType: "METRICS", status: "MISSING", sourceSignalIds: [], summary: "No quantified metric yet.", confidence: 0.3 },
  { id: "qe_initech_metrics", dealId: "deal_initech", framework: "MEDDPICC", evidenceType: "METRICS", status: "STRONG", sourceSignalIds: ["sig_0008"], summary: "$300k/yr inefficiency quantified.", confidence: 0.85, lastVerifiedAt: "2026-06-11T00:00:00Z" },
  { id: "qe_initech_eb", dealId: "deal_initech", framework: "MEDDPICC", evidenceType: "ECONOMIC_BUYER", status: "PRESENT", sourceSignalIds: [], summary: "VP Finance owns budget.", confidence: 0.8, lastVerifiedAt: "2026-06-12T00:00:00Z" },
  { id: "qe_bright_pain", dealId: "deal_bright", framework: "MEDDPICC", evidenceType: "IDENTIFIED_PAIN", status: "PRESENT", sourceSignalIds: ["sig_0014"], summary: "Slow rep onboarding.", confidence: 0.83 },
  { id: "qe_globex_dc", dealId: "deal_globex", framework: "MEDDPICC", evidenceType: "DECISION_CRITERIA", status: "WEAK", sourceSignalIds: [], summary: "Criteria vague.", confidence: 0.4 },
];

export const commitments: Commitment[] = [
  { id: "cm_acme_1", dealId: "deal_acme", ownerSide: "BUYER", description: "Invite RevOps lead to technical review.", dueDate: "2026-06-24", status: "OPEN", sourceSignalId: "sig_0013", confidence: 0.82, createdAt: "2026-06-17T00:00:00Z" },
  { id: "cm_acme_2", dealId: "deal_acme", ownerSide: "SELLER", description: "Send integration overview doc.", dueDate: "2026-06-20", status: "OPEN", confidence: 0.85, createdAt: "2026-06-17T00:00:00Z" },
  { id: "cm_initech_1", dealId: "deal_initech", ownerSide: "SELLER", description: "Provide security questionnaire response.", dueDate: "2026-06-18", status: "COMPLETED", confidence: 0.9, createdAt: "2026-06-12T00:00:00Z" },
  { id: "cm_globex_1", dealId: "deal_globex", ownerSide: "BUYER", description: "Share ROI requirements.", dueDate: "2026-06-10", status: "MISSED", confidence: 0.7, createdAt: "2026-06-03T00:00:00Z" },
];

// 5 stage proposals.
export const stageProposals: StageProposal[] = [
  { id: "sp_acme", dealId: "deal_acme", currentStageId: "stage_3", proposedStageId: "stage_4", proposalType: "ADVANCE", confidence: 0.86, rationale: "Move to Solution Fit because economic buyer attended, pain confirmed, decision criteria discussed, technical review scheduled. Budget remains unconfirmed.", requiredEvidenceMet: ["ECONOMIC_BUYER confirmed", "DECISION_CRITERIA confirmed"], missingEvidence: ["METRICS not confirmed"], sourceSignalIds: ["sig_0001", "sig_0012", "sig_0013"], createdByAgent: "stage_progression_agent", autonomyMode: "QUEUE_FOR_APPROVAL", status: "PENDING_APPROVAL", createdAt: "2026-06-17T00:10:00Z" },
  { id: "sp_initech", dealId: "deal_initech", currentStageId: "stage_5", proposedStageId: "stage_6", proposalType: "ADVANCE", confidence: 0.79, rationale: "Move to Negotiation because metrics confirmed and contract review started.", requiredEvidenceMet: ["METRICS confirmed", "ECONOMIC_BUYER confirmed"], missingEvidence: ["PAPER_PROCESS not confirmed"], sourceSignalIds: ["sig_0008", "sig_0017"], createdByAgent: "stage_progression_agent", autonomyMode: "QUEUE_FOR_APPROVAL", status: "PENDING_APPROVAL", createdAt: "2026-06-14T00:10:00Z" },
  { id: "sp_bright", dealId: "deal_bright", currentStageId: "stage_2", proposedStageId: "stage_3", proposalType: "ADVANCE", confidence: 0.71, rationale: "Move to Discovery because pain confirmed and funding event increased urgency.", requiredEvidenceMet: ["IDENTIFIED_PAIN confirmed"], missingEvidence: ["DECISION_CRITERIA not confirmed"], sourceSignalIds: ["sig_0014", "sig_0004"], createdByAgent: "stage_progression_agent", autonomyMode: "QUEUE_FOR_APPROVAL", status: "PENDING_APPROVAL", createdAt: "2026-06-15T08:00:00Z" },
  { id: "sp_globex", dealId: "deal_globex", currentStageId: "stage_4", proposedStageId: "stage_4", proposalType: "NO_CHANGE", confidence: 0.4, rationale: "Hold at Solution Fit: single-threaded and unresolved objection.", requiredEvidenceMet: [], missingEvidence: ["Multi-threading", "ROI proof"], sourceSignalIds: ["sig_0005", "sig_0016"], createdByAgent: "stage_progression_agent", autonomyMode: "NEVER_AUTO", status: "PENDING_APPROVAL", createdAt: "2026-06-12T00:10:00Z" },
  { id: "sp_acme_expand", dealId: "deal_acme_expand", currentStageId: "stage_3", proposedStageId: "stage_4", proposalType: "ADVANCE", confidence: 0.68, rationale: "Move to Solution Fit because multi-threading increased.", requiredEvidenceMet: [], missingEvidence: ["ECONOMIC_BUYER not confirmed"], sourceSignalIds: ["sig_0019"], createdByAgent: "stage_progression_agent", autonomyMode: "QUEUE_FOR_APPROVAL", status: "PENDING_APPROVAL", createdAt: "2026-06-15T00:10:00Z" },
];

// 10 action cards. 4 are RISK_MITIGATION (the "4 risk flags").
export const actions: ActionRecommendation[] = [
  { id: "act_0001", workspaceId: WS, dealId: "deal_acme", accountId: "acc_acme", assignedToUserId: "user_ae", actionType: "UPDATE_STAGE", title: "Approve stage move: Acme → Solution Fit", description: "Stage proposal ready for review.", confidence: 0.86, priorityScore: 92, businessRiskLevel: "MEDIUM", autonomyMode: "QUEUE_FOR_APPROVAL", sourceSignalIds: ["sig_0012", "sig_0013"], rationale: "EB engaged, pain confirmed, next step scheduled.", whyNow: "Discovery call processed today; evidence now supports Solution Fit.", status: "PENDING", createdByAgent: "action_agent", createdAt: "2026-06-17T00:10:00Z", stageProposalId: "sp_acme", badge: "Stage" },
  { id: "act_0002", workspaceId: WS, dealId: "deal_bright", accountId: "acc_bright", assignedToUserId: "user_ae4", actionType: "FOLLOW_UP_EMAIL", title: "Review follow-up: BrightCo Series C", description: "Draft email tying Series C hiring to forecasting pain.", draftPayload: "Hi Mia — congrats on the Series C. As you scale the sales team, forecast accuracy during fast hiring usually gets harder. Worth a 20-min look at how we'd help your new reps ramp without breaking forecast hygiene?", confidence: 0.74, priorityScore: 88, businessRiskLevel: "HIGH", autonomyMode: "QUEUE_FOR_APPROVAL", sourceSignalIds: ["sig_0004"], rationale: "Funding maps to stated pain.", whyNow: "Funding announced 4 days ago; timing is fresh.", status: "PENDING", createdByAgent: "action_agent", createdAt: "2026-06-15T08:05:00Z", badge: "Market" },
  { id: "act_0003", workspaceId: WS, dealId: "deal_globex", accountId: "acc_globex", assignedToUserId: "user_ae2", actionType: "RISK_MITIGATION", title: "Resolve single-threaded risk: Globex", description: "Ask IT Director to introduce economic buyer / RevOps owner.", confidence: 0.88, priorityScore: 85, businessRiskLevel: "LOW", autonomyMode: "AUTO_APPLY_WITH_UNDO", sourceSignalIds: ["sig_0005"], rationale: "Only one stakeholder engaged in 21 days.", whyNow: "Commit-category deal at high slip risk.", status: "PENDING", createdByAgent: "risk_agent", createdAt: "2026-06-12T00:15:00Z", badge: "Risk" },
  { id: "act_0004", workspaceId: WS, dealId: "deal_umbrella", accountId: "acc_umbrella", assignedToUserId: "user_ae4", actionType: "RISK_MITIGATION", title: "Resolve no-next-step risk: Umbrella", description: "Propose a concrete next meeting with agenda.", confidence: 0.82, priorityScore: 80, businessRiskLevel: "LOW", autonomyMode: "AUTO_APPLY_WITH_UNDO", sourceSignalIds: ["sig_0010"], rationale: "No scheduled next step; engagement decaying.", whyNow: "Deal stalling for 3 weeks.", status: "PENDING", createdByAgent: "risk_agent", createdAt: "2026-06-02T00:15:00Z", badge: "Risk" },
  { id: "act_0005", workspaceId: WS, dealId: "deal_globex", accountId: "acc_globex", assignedToUserId: "user_ae2", actionType: "RISK_MITIGATION", title: "Address close-date push: Globex", description: "Confirm realistic close date with buyer.", confidence: 0.8, priorityScore: 78, businessRiskLevel: "LOW", autonomyMode: "AUTO_APPLY_WITH_UNDO", sourceSignalIds: ["sig_0006"], rationale: "Close date slipped two weeks.", whyNow: "Commit deal with shifting date.", status: "PENDING", createdByAgent: "risk_agent", createdAt: "2026-06-08T00:15:00Z", badge: "Risk" },
  { id: "act_0006", workspaceId: WS, dealId: "deal_umbrella", accountId: "acc_umbrella", assignedToUserId: "user_ae4", actionType: "RISK_MITIGATION", title: "Engage blocker: Umbrella procurement", description: "Plan to neutralize procurement resistance.", confidence: 0.72, priorityScore: 70, businessRiskLevel: "LOW", autonomyMode: "AUTO_APPLY_WITH_UNDO", sourceSignalIds: ["sig_0020"], rationale: "Procurement resisting timeline.", whyNow: "Blocker identified on last call.", status: "PENDING", createdByAgent: "risk_agent", createdAt: "2026-06-02T00:20:00Z", badge: "Risk" },
  { id: "act_0007", workspaceId: WS, dealId: "deal_initech", accountId: "acc_initech", assignedToUserId: "user_ae3", actionType: "UPDATE_STAGE", title: "Approve stage move: Initech → Negotiation", description: "Stage proposal ready.", confidence: 0.79, priorityScore: 76, businessRiskLevel: "MEDIUM", autonomyMode: "QUEUE_FOR_APPROVAL", sourceSignalIds: ["sig_0008", "sig_0017"], rationale: "Metrics + contract review.", whyNow: "Legal started review today.", status: "PENDING", createdByAgent: "action_agent", createdAt: "2026-06-14T00:15:00Z", stageProposalId: "sp_initech", badge: "Stage" },
  { id: "act_0008", workspaceId: WS, dealId: "deal_acme", accountId: "acc_acme", assignedToUserId: "user_ae", actionType: "UPDATE_STAKEHOLDER_ROLE", title: "Confirm buying role: Acme VP as Decision maker", description: "Agent suggests Dana Whitfield = Decision maker (economic buyer).", confidence: 0.73, priorityScore: 68, businessRiskLevel: "MEDIUM", autonomyMode: "QUEUE_FOR_APPROVAL", sourceSignalIds: ["sig_0012"], rationale: "VP Sales evaluated and owns outcome.", whyNow: "Role inferred from today's call.", status: "PENDING", createdByAgent: "conversation_intelligence_agent", createdAt: "2026-06-17T00:12:00Z", badge: "Stakeholder" },
  { id: "act_0009", workspaceId: WS, dealId: "deal_acme", accountId: "acc_acme", assignedToUserId: "user_ae", actionType: "CREATE_TASK", title: "Confirm commitment: send integration doc to Acme", description: "Seller commitment due 2026-06-20.", confidence: 0.85, priorityScore: 60, businessRiskLevel: "LOW", autonomyMode: "AUTO_APPLY_WITH_UNDO", sourceSignalIds: ["sig_0013"], rationale: "Commitment captured on call.", whyNow: "Due in 3 days.", status: "PENDING", createdByAgent: "action_agent", createdAt: "2026-06-17T00:13:00Z", badge: "Commitment" },
  { id: "act_0010", workspaceId: WS, dealId: "deal_globex", accountId: "acc_globex", assignedToUserId: "user_mgr", actionType: "MANAGER_REVIEW", title: "Manager review: Globex commit at risk", description: "High-risk commit deal needs inspection.", confidence: 0.84, priorityScore: 90, businessRiskLevel: "LOW", autonomyMode: "AUTO_APPLY_WITH_UNDO", sourceSignalIds: ["sig_0005", "sig_0006", "sig_0016"], rationale: "Risk score 68 on a commit deal.", whyNow: "Forecast call is Friday.", status: "PENDING", createdByAgent: "forecast_agent", createdAt: "2026-06-12T00:20:00Z", badge: "Forecast" },
];

// 3 overrides (historical examples for learning context).
export const overrides: Override[] = [
  { id: "ov_0001", workspaceId: WS, dealId: "deal_globex", userId: "user_ae", targetObjectType: "STAGE_PROPOSAL", targetObjectId: "sp_globex_prev", originalAgentValue: "ADVANCE to Business Case", userCorrectedValue: "NO_CHANGE", overrideReasonCode: "WEAK_NEXT_STEP", overrideReasonNote: "No real ROI proof yet.", sourceContext: "Deal Room", createdAt: "2026-06-05T00:00:00Z", learningEventId: "le_0001" },
  { id: "ov_0002", workspaceId: WS, dealId: "deal_umbrella", userId: "user_ae", targetObjectType: "MARKET_SIGNAL", targetObjectId: "sig_old_market", originalAgentValue: "Relevant: leadership change", userCorrectedValue: "Dismissed", overrideReasonCode: "OUTSIDE_SIGNAL_IRRELEVANT", sourceContext: "Today Queue", createdAt: "2026-06-03T00:00:00Z", learningEventId: "le_0002" },
  { id: "ov_0003", workspaceId: WS, dealId: "deal_bright", userId: "user_mgr", targetObjectType: "FORECAST", targetObjectId: "deal_bright", originalAgentValue: "BEST_CASE", userCorrectedValue: "PIPELINE", overrideReasonCode: "NO_BUDGET_CONFIRMATION", overrideReasonNote: "Too early to forecast.", sourceContext: "Forecast Review", createdAt: "2026-06-16T00:00:00Z", learningEventId: "le_0003" },
];

// SDR target accounts (PRD 09.2 SDR queue). Some carry funding/hiring triggers
// so the Outreach Optimization agent can connect them to won patterns.
export const targetAccounts: TargetAccount[] = [
  { id: "tgt_nimbus", workspaceId: WS, name: "Nimbus Cloud", domain: "nimbus.example", industry: "SaaS", employeeCount: 380, icpFitScore: 88, marketSignalScore: 90, triggerEvents: ["Series C funding ($65M)", "18 sales roles open"], matchedWonPattern: "BrightCo — Pilot (Won)", status: "NEW" },
  { id: "tgt_vertex", workspaceId: WS, name: "Vertex Financial", domain: "vertex.example", industry: "FinTech", employeeCount: 240, icpFitScore: 84, marketSignalScore: 72, triggerEvents: ["New VP of RevOps hired"], matchedWonPattern: "Initech — Seat Expansion (Won)", status: "NEW" },
  { id: "tgt_solis", workspaceId: WS, name: "Solis Health", domain: "solis.example", industry: "Healthcare", employeeCount: 1100, icpFitScore: 61, marketSignalScore: 40, triggerEvents: ["Expanding commercial team"], status: "NEW" },
  { id: "tgt_atlas", workspaceId: WS, name: "Atlas Robotics", domain: "atlas.example", industry: "SaaS", employeeCount: 520, icpFitScore: 79, marketSignalScore: 81, triggerEvents: ["Hiring spike: 25 GTM roles", "Doubled pipeline target"], matchedWonPattern: "BrightCo — Pilot (Won)", status: "NEW" },
  { id: "tgt_orbit", workspaceId: WS, name: "Orbit Logistics", domain: "orbit.example", industry: "Logistics", employeeCount: 90, icpFitScore: 48, marketSignalScore: 30, triggerEvents: [], status: "NEW" },
];
