# NuStack Agentic Revenue CRM — Detailed PRD Pack

**Version:** v0.1  
**Audience:** Claude / coding agents / product engineering / design / data / GTM  
**Product type:** B2B SaaS application  
**Primary market:** Mid-market US B2B sales teams  
**Core thesis:** Capture is table stakes. The product wedge is post-capture judgment, confidence-gated execution, and compounding learning loops.

---

## 0. Claude Implementation Prompt

Use this document as the canonical product specification for creating the application.

You are building **NuStack Agentic Revenue CRM**, an AI-native sales execution system. Do not build a traditional CRM with AI widgets. Build a closed-loop revenue engine where sales activity and market events become signals, signals become explainable deal judgments, deal judgments become confidence-gated actions, human corrections become training labels, and outcomes improve future scoring and outreach.

The product should feel like **HubSpot rebuilt for the agentic world**, but with a different center of gravity:

- HubSpot/Salesforce/legacy CRM center: record, fields, dashboards, workflows.
- AI-native capture CRMs center: auto-created records from email/calendar.
- NuStack center: action queue, deal judgment, stage progression, forecast truth, learning loop.

Build around these primitives:

1. **Signal**
2. **Judgment**
3. **Action**
4. **Approval**
5. **Override**
6. **Outcome**
7. **Learning event**

Every recommendation, score, forecast movement, and autonomous action must be explainable, reversible, permissioned, and audited.

---

# PRD 01 — Product Strategy & Application Definition

## 1.1 Product Name

**NuStack Agentic Revenue CRM**

Potential external names can be decided later. For implementation, use `NuStack CRM` or `Agentic Revenue CRM`.

## 1.2 One-Line Definition

NuStack Agentic Revenue CRM is a closed-loop sales execution system that turns captured engagement and market signals into explainable deal judgments, confidence-gated actions, and compounding learning loops.

## 1.3 Product Vision

Revenue teams should not maintain a CRM. The revenue system should observe work, understand what happened, judge what it means, recommend what to do, execute safe actions, ask for approval when stakes are higher, and learn from every correction and outcome.

## 1.4 Product Thesis

The market has moved beyond "the CRM fills itself in." Auto-capture from email, calendar, meetings, and transcripts is now table stakes. The open white space is everything after capture:

- Is this deal actually qualified?
- Did the buying process advance?
- Is the next step real or weak?
- Is the forecast defensible?
- Is the champion real?
- Is there a compelling event?
- Which signal increased or reduced win likelihood?
- Which account event should change seller behavior?
- Which correction from the AE should improve the model?
- Which won/lost patterns should improve SDR targeting?

NuStack exists to answer those questions and convert the answers into action.

## 1.5 Product Positioning

### Positioning Statement

For mid-market B2B sales teams that find traditional CRMs too administrative and AI-native CRMs too capture-centric, NuStack is an agentic revenue execution platform that uses captured reality to judge, advance, forecast, and learn across the full sales loop.

### Against Traditional CRM

Traditional CRM:
- Stores records.
- Requires manual data hygiene.
- Exposes dashboards.
- Uses AI to assist with existing records.

NuStack:
- Treats the record as a byproduct.
- Captures activity ambiently.
- Scores deal reality from evidence.
- Surfaces actions, not charts.
- Learns from human correction and outcomes.

### Against AI-Native Capture CRMs

Capture CRMs:
- Auto-create contacts, companies, and activities.
- Reduce admin.
- Improve record completeness.

NuStack:
- Assumes capture is available.
- Uses capture to make stage, risk, forecast, and action judgments.
- Closes the loop from outcomes back into scoring and outreach.

### Against Conversation Intelligence / Forecasting Tools

Conversation tools and forecast tools:
- Inspect calls or forecast views.
- Provide summaries, risk flags, or manager reporting.
- Often sit adjacent to the CRM.

NuStack:
- Owns the operating loop.
- Combines engagement + market + qualification evidence.
- Turns insights into actions.
- Captures overrides as product-native learning data.

## 1.6 Target Customer

### Ideal Customer Profile

Mid-market US B2B company with:

- 20–500 sales users.
- Multi-stakeholder deals.
- Sales cycles between 2 weeks and 9 months.
- ACV typically $10k–$250k.
- Sales stack includes email, calendar, meetings, call recording/conversation intelligence, enrichment, sequencer, and CRM.
- Pain around CRM admin, forecast accuracy, deal inspection, rep productivity, and fragmented tooling.

### Initial Best-Fit Segments

1. B2B SaaS sales teams.
2. Technology services companies.
3. RevOps-led mid-market companies.
4. Founder-led growth teams graduating from HubSpot.
5. Teams where managers inspect deals manually every week.

### Poor Initial Fits

- Very small founder-only sales motion.
- High-volume B2C call centers.
- Enterprise CRM transformation requiring deep custom objects.
- Field sales with highly bespoke quoting or territory complexity.
- Companies with no sales activity capture or unwillingness to connect core systems.

## 1.7 Primary Personas

### Account Executive

**Goal:** Sell more with less admin.  
**Pain:** Updating CRM, remembering commitments, preparing follow-ups, defending forecast, tracking multiple stakeholders.  
**NuStack value:** Daily action queue, deal room, automatic briefing, next-step quality, stage proposals, risk visibility.

### SDR / BDR

**Goal:** Create qualified pipeline.  
**Pain:** Generic targeting, sequence optimization based on opens/replies, poor feedback from closed-won data.  
**NuStack value:** Outreach loop learns from won patterns and suggests better targets/messages.

### Sales Manager

**Goal:** Know the truth of the pipeline and coach the right deals.  
**Pain:** Forecast calls are subjective, CRM data is stale, risk discovered too late.  
**NuStack value:** Explainable forecast, changed-deals view, risk queue, override patterns, coaching prompts.

### RevOps

**Goal:** Improve data quality, process adherence, forecasting, and sales system leverage.  
**Pain:** CRM hygiene, process compliance, fragmented tools, untrusted reports.  
**NuStack value:** Ambient capture, structured signals, audit trail, pipeline governance, model feedback analytics.

### Admin / Workspace Owner

**Goal:** Configure safely without weeks of admin setup.  
**Pain:** Complex CRM implementation, brittle workflows, adoption resistance.  
**NuStack value:** Learn-my-motion onboarding, suggested pipeline/playbook/ICP, approval-based config.

## 1.8 Jobs To Be Done

### AE Jobs

- When I start my day, show me the highest-leverage actions across my deals.
- Before a call, brief me on deal state, stakeholders, risks, and recent signals.
- After a call, summarize commitments, objections, next steps, and stage implications.
- When a deal should move stage, propose it and show evidence.
- When the agent is wrong, let me correct it in one or two clicks.
- When my manager asks why a deal is forecasted, give me defensible evidence.

### Manager Jobs

- When forecast changes, show me what changed and why.
- When a deal is at risk, show evidence, not vague AI opinions.
- When reps override the system, show recurring patterns.
- When coaching reps, surface the five deals where intervention matters most.
- When inspecting pipeline, separate real progress from sentiment-only progress.

### RevOps Jobs

- When onboarding the workspace, infer sales motion from historical data.
- When agents act, audit every action.
- When fields change, trace changes to source signals.
- When models are corrected, collect structured labels.
- When teams differ, support tenant-specific calibration without exposing tenant data.

---

# PRD 02 — Product Principles

## 2.1 Capture Is Substrate, Not Wedge

The application must support ambient capture, but UX and roadmap should not over-index on "auto-fill CRM." Capture is necessary for the loop but not the differentiated product promise.

## 2.2 Action Queue Over Dashboard

The default home is not charts. It is a ranked queue of actions that are ready to approve, correct, send, schedule, inspect, or undo.

## 2.3 Evidence Before Judgment

No score, stage proposal, forecast movement, or risk flag should exist without evidence. Evidence must be traceable to signals.

## 2.4 Confidence-Gated Autonomy

The system can act only when confidence and blast radius allow it. Otherwise it queues the action for human approval.

## 2.5 Human Correction Is a Product Primitive

Rejecting, editing, or overriding the agent must be fast. The reason must be structured. Corrections become labeled training data.

## 2.6 Trust Is a First-Class UX Layer

Every autonomous or semi-autonomous action must include:

- Source evidence.
- Confidence level.
- Rationale.
- Actor identity: agent or user.
- Timestamp.
- Undo/revert affordance where applicable.
- Audit trail.

## 2.7 The Forecast Must Be Explainable

Forecast is not just a rollup number. It is a set of changed deal judgments backed by evidence.

## 2.8 Learning Optimizes Business Outcomes

The learning loop optimizes for closed-won, slipped, lost, no-decision, expansion, and qualified pipeline. It must not optimize superficial metrics only, such as email opens.

---

# PRD 03 — Product Scope

## 3.1 MVP Scope

The MVP must prove the core loop after capture.

### MVP Must Include

1. Workspace setup.
2. Email/calendar connection placeholder or mocked integration layer.
3. Meeting transcript ingestion.
4. Account, contact, and deal core objects.
5. Signal timeline.
6. Conversation signal extraction.
7. Basic outside signal ingestion placeholder/manual source.
8. Deal score.
9. Stage proposal.
10. Confidence score.
11. AE approval/override.
12. Structured override reason capture.
13. Today Queue.
14. Deal Room.
15. Audit log.
16. Basic outcome capture: won/lost/slipped.
17. Learning event logging, even if model retraining is not automated yet.

### MVP Nice-to-Have

- Real Gmail/Google Calendar integration.
- Gong/Fathom/Read.ai transcript import.
- Basic research agent using public web/news enrichment.
- Manager forecast review page.
- Slack alerts.

### MVP Non-Goals

- Full enterprise CRM customization.
- Deep territory management.
- CPQ.
- Marketing automation suite.
- Customer support CRM.
- Fully autonomous email sending.
- Fully autonomous deal close/loss.
- Cross-tenant model learning in production.

## 3.2 V1 Scope

V1 should make the system credible as a daily operating layer.

Must include:

1. Research Agent.
2. Outside-in signal relevance scoring.
3. Risk Agent.
4. Forecast Review.
5. Manager 1:1 View.
6. Buying group mapping.
7. MEDDPICC evidence extraction.
8. Confidence-gated auto-apply for low-risk actions.
9. Undo window.
10. Rich approval queue.
11. Admin-configured autonomy thresholds.
12. SDR outreach insight surface.
13. Model evaluation dashboards.

## 3.3 V2 Scope

V2 should strengthen the moat.

Must include:

1. Scoring loop model improvement.
2. Outreach loop optimization.
3. De-identified cross-tenant pattern learning.
4. Tenant-specific calibration.
5. Advanced close-date confidence.
6. Playbook recommendation engine.
7. Competitive displacement intelligence.
8. Forecast scenario simulation.
9. Advanced manager coaching analytics.

---

# PRD 04 — Core Application Objects

## 4.1 Object Model Overview

The system centers around `Deal`. Deals receive `Signals`. Signals produce `Judgments`. Judgments produce `Actions`. Actions pass through `Approvals`. Users can create `Overrides`. Outcomes create `LearningEvents`.

## 4.2 Workspace

Represents a customer tenant.

### Fields

- `id`
- `name`
- `domain`
- `created_at`
- `timezone`
- `sales_motion_type`
- `default_currency`
- `pipeline_config_id`
- `autonomy_policy_id`
- `data_retention_policy_id`
- `learning_policy`
- `is_cross_tenant_learning_enabled`
- `status`

## 4.3 User

### Fields

- `id`
- `workspace_id`
- `name`
- `email`
- `role`
- `manager_id`
- `team_id`
- `status`
- `permissions`
- `created_at`
- `last_active_at`

### Roles

- `AE`
- `SDR`
- `SALES_MANAGER`
- `REVOPS`
- `ADMIN`
- `EXECUTIVE_VIEWER`

## 4.4 Account

### Fields

- `id`
- `workspace_id`
- `name`
- `domain`
- `industry`
- `employee_count`
- `revenue_band`
- `location`
- `funding_stage`
- `technology_stack`
- `account_owner_id`
- `icp_fit_score`
- `market_signal_score`
- `created_source`
- `created_at`
- `updated_at`

## 4.5 Contact

### Fields

- `id`
- `workspace_id`
- `account_id`
- `name`
- `email`
- `title`
- `seniority`
- `department`
- `linkedin_url`
- `phone`
- `relationship_strength`
- `engagement_score`
- `created_source`
- `last_engaged_at`
- `created_at`
- `updated_at`

## 4.6 Deal / Opportunity

### Fields

- `id`
- `workspace_id`
- `account_id`
- `name`
- `owner_id`
- `stage_id`
- `amount`
- `currency`
- `close_date`
- `forecast_category`
- `deal_health_score`
- `stage_readiness_score`
- `forecast_confidence_score`
- `risk_score`
- `momentum_score`
- `champion_strength_score`
- `buying_group_coverage_score`
- `next_step_quality_score`
- `competitive_risk_score`
- `compelling_event_strength`
- `qualification_completeness_score`
- `status`
- `created_source`
- `created_at`
- `updated_at`

### Deal Status

- `OPEN`
- `WON`
- `LOST`
- `SLIPPED`
- `NO_DECISION`
- `ARCHIVED`

## 4.7 Pipeline Stage

### Fields

- `id`
- `workspace_id`
- `name`
- `order`
- `exit_criteria`
- `entry_criteria`
- `required_evidence_types`
- `auto_advance_allowed`
- `manager_approval_required`
- `created_at`

### Default Stages

1. Prospecting
2. Qualified
3. Discovery
4. Solution Fit
5. Business Case
6. Negotiation
7. Procurement / Legal
8. Closed Won
9. Closed Lost

## 4.8 Buying Group

A deal-level collection of stakeholders.

### Fields

- `id`
- `deal_id`
- `coverage_score`
- `economic_buyer_identified`
- `champion_identified`
- `blocker_identified`
- `procurement_identified`
- `legal_identified`
- `technical_buyer_identified`
- `last_updated_at`

## 4.9 Stakeholder

### Fields

- `id`
- `deal_id`
- `contact_id`
- `role_in_deal`
- `influence_level`
- `sentiment`
- `engagement_level`
- `is_champion`
- `is_blocker`
- `is_economic_buyer`
- `last_engaged_at`
- `evidence_signal_ids`
- `confidence`

### Role In Deal

- `ECONOMIC_BUYER`
- `CHAMPION`
- `BLOCKER`
- `TECHNICAL_BUYER`
- `LEGAL`
- `PROCUREMENT`
- `INFLUENCER`
- `END_USER`
- `UNKNOWN`

## 4.10 Activity

### Fields

- `id`
- `workspace_id`
- `account_id`
- `deal_id`
- `contact_ids`
- `type`
- `source`
- `occurred_at`
- `owner_id`
- `raw_payload_ref`
- `summary`
- `created_at`

### Activity Types

- `EMAIL_SENT`
- `EMAIL_RECEIVED`
- `MEETING_HELD`
- `CALL_HELD`
- `CALENDAR_EVENT`
- `SEQUENCE_STEP`
- `NOTE`
- `TASK`
- `CONTRACT_EVENT`
- `CRM_FIELD_CHANGE`

## 4.11 Transcript

### Fields

- `id`
- `activity_id`
- `source_tool`
- `raw_text`
- `speaker_map`
- `language`
- `duration_seconds`
- `processed_status`
- `created_at`

## 4.12 Signal

Signals are normalized units of meaning.

### Fields

- `id`
- `workspace_id`
- `account_id`
- `deal_id`
- `contact_id`
- `source_type`
- `signal_family`
- `signal_type`
- `title`
- `description`
- `evidence_text`
- `evidence_url`
- `source_activity_id`
- `source_transcript_id`
- `confidence`
- `relevance_score`
- `impact_direction`
- `impact_magnitude`
- `occurred_at`
- `detected_at`
- `created_by_agent`
- `status`

### Signal Source Type

- `ENGAGEMENT`
- `CONVERSATION`
- `EMAIL`
- `CALENDAR`
- `CRM`
- `MARKET`
- `ENRICHMENT`
- `USER`
- `SYSTEM`

### Signal Family

- `ENGAGEMENT`
- `COMMITMENT`
- `QUALIFICATION`
- `BUYING_GROUP`
- `MOMENTUM`
- `RISK`
- `MARKET`
- `COMMERCIAL`
- `COMPETITIVE`
- `OUTCOME`

### Impact Direction

- `POSITIVE`
- `NEGATIVE`
- `NEUTRAL`
- `UNKNOWN`

## 4.13 Commitment

### Fields

- `id`
- `deal_id`
- `owner_side`
- `owner_user_id`
- `owner_contact_id`
- `description`
- `due_date`
- `status`
- `source_signal_id`
- `confidence`
- `created_at`
- `completed_at`

### Status

- `OPEN`
- `COMPLETED`
- `MISSED`
- `CANCELLED`

## 4.14 Qualification Evidence

### Fields

- `id`
- `deal_id`
- `framework`
- `evidence_type`
- `status`
- `source_signal_ids`
- `summary`
- `confidence`
- `last_verified_at`

### Framework

- `MEDDPICC`
- `BANT`
- `CUSTOM`

### MEDDPICC Evidence Types

- `METRICS`
- `ECONOMIC_BUYER`
- `DECISION_CRITERIA`
- `DECISION_PROCESS`
- `PAPER_PROCESS`
- `IDENTIFIED_PAIN`
- `CHAMPION`
- `COMPETITION`

## 4.15 Judgment

A structured output from an agent.

### Fields

- `id`
- `workspace_id`
- `deal_id`
- `judgment_type`
- `value`
- `score`
- `confidence`
- `rationale`
- `source_signal_ids`
- `created_by_agent`
- `model_version`
- `created_at`
- `expires_at`
- `status`

### Judgment Types

- `DEAL_HEALTH`
- `STAGE_READINESS`
- `FORECAST_CONFIDENCE`
- `RISK`
- `MOMENTUM`
- `CHAMPION_STRENGTH`
- `BUYING_GROUP_COVERAGE`
- `NEXT_STEP_QUALITY`
- `COMPETITIVE_RISK`
- `COMPELLING_EVENT`
- `QUALIFICATION_COMPLETENESS`

## 4.16 Stage Proposal

### Fields

- `id`
- `deal_id`
- `current_stage_id`
- `proposed_stage_id`
- `proposal_type`
- `confidence`
- `rationale`
- `required_evidence_met`
- `missing_evidence`
- `source_signal_ids`
- `created_by_agent`
- `status`
- `created_at`
- `resolved_at`
- `resolved_by_user_id`

### Proposal Type

- `ADVANCE`
- `REGRESS`
- `NO_CHANGE`
- `CLOSE_WON`
- `CLOSE_LOST`

### Status

- `PENDING_APPROVAL`
- `AUTO_APPLIED`
- `APPROVED`
- `REJECTED`
- `EDITED`
- `EXPIRED`
- `REVERTED`

## 4.17 Action Recommendation

### Fields

- `id`
- `workspace_id`
- `deal_id`
- `account_id`
- `assigned_to_user_id`
- `action_type`
- `title`
- `description`
- `draft_payload`
- `confidence`
- `priority_score`
- `business_risk_level`
- `autonomy_mode`
- `source_signal_ids`
- `rationale`
- `status`
- `due_at`
- `created_by_agent`
- `created_at`
- `resolved_at`

### Action Types

- `FOLLOW_UP_EMAIL`
- `SCHEDULE_NEXT_MEETING`
- `UPDATE_STAGE`
- `UPDATE_FORECAST`
- `UPDATE_CLOSE_DATE`
- `ADD_CONTACT`
- `UPDATE_STAKEHOLDER_ROLE`
- `CREATE_TASK`
- `MANAGER_REVIEW`
- `RISK_MITIGATION`
- `SEND_MUTUAL_ACTION_PLAN`
- `SDR_TARGETING_SUGGESTION`
- `OUTREACH_MESSAGE_SUGGESTION`
- `PLAYBOOK_SUGGESTION`

## 4.18 Approval Task

### Fields

- `id`
- `workspace_id`
- `action_recommendation_id`
- `assigned_to_user_id`
- `approval_type`
- `status`
- `decision`
- `decision_reason`
- `decision_note`
- `created_at`
- `decided_at`

### Decision

- `APPROVE`
- `REJECT`
- `EDIT`
- `DEFER`
- `ESCALATE`

## 4.19 Override

### Fields

- `id`
- `workspace_id`
- `deal_id`
- `user_id`
- `target_object_type`
- `target_object_id`
- `original_agent_value`
- `user_corrected_value`
- `override_reason_code`
- `override_reason_note`
- `source_context`
- `created_at`
- `learning_event_id`

### Override Reason Codes

- `WRONG_STAGE`
- `MISSING_ECONOMIC_BUYER`
- `WEAK_NEXT_STEP`
- `NO_BUDGET_CONFIRMATION`
- `WRONG_STAKEHOLDER_ROLE`
- `SENTIMENT_OVERWEIGHTED`
- `OUTSIDE_SIGNAL_IRRELEVANT`
- `COMPETITOR_MISCLASSIFIED`
- `CUSTOMER_TIMING_WRONG`
- `INTERNAL_PROCESS_EXCEPTION`
- `OTHER`

## 4.20 Outcome

### Fields

- `id`
- `deal_id`
- `outcome_type`
- `amount`
- `close_date`
- `loss_reason`
- `no_decision_reason`
- `slip_reason`
- `competitor`
- `source`
- `created_at`

### Outcome Type

- `WON`
- `LOST`
- `SLIPPED`
- `NO_DECISION`

## 4.21 Learning Event

### Fields

- `id`
- `workspace_id`
- `deal_id`
- `event_type`
- `input_snapshot`
- `label`
- `source_object_type`
- `source_object_id`
- `tenant_visible`
- `eligible_for_cross_tenant_learning`
- `created_at`

### Event Types

- `AE_STAGE_OVERRIDE`
- `MANAGER_FORECAST_OVERRIDE`
- `DEAL_WON`
- `DEAL_LOST`
- `DEAL_SLIPPED`
- `ACTION_APPROVED`
- `ACTION_REJECTED`
- `RISK_CONFIRMED`
- `RISK_DISMISSED`
- `OUTREACH_SUCCESS`
- `OUTREACH_FAILURE`

## 4.22 Audit Event

### Fields

- `id`
- `workspace_id`
- `actor_type`
- `actor_id`
- `object_type`
- `object_id`
- `event_type`
- `before_value`
- `after_value`
- `source_signal_ids`
- `reason`
- `ip_address`
- `created_at`

### Actor Type

- `USER`
- `AGENT`
- `SYSTEM`
- `INTEGRATION`

---

# PRD 05 — Signal Taxonomy

## 5.1 Signal Principle

Signals are not raw events. A raw event becomes a signal only when it has business meaning.

Example:

- Raw event: Meeting held.
- Signal: Economic buyer attended discovery call and confirmed cost-of-delay.
- Raw event: Company funding article detected.
- Signal: Account raised growth funding relevant to sales productivity expansion.

## 5.2 Engagement Signals

| Signal Type | Description | Positive/Negative |
|---|---|---|
| `MEETING_HELD` | Scheduled meeting completed | Positive |
| `MEETING_NO_SHOW` | Buyer no-showed | Negative |
| `NEXT_MEETING_BOOKED` | Confirmed future meeting | Positive |
| `EMAIL_REPLY_RECEIVED` | Buyer replied | Positive |
| `STAKEHOLDER_GHOSTED` | No response after expected follow-up | Negative |
| `MULTI_THREADING_INCREASED` | More stakeholders engaged | Positive |
| `ENGAGEMENT_DECAY` | Activity declined materially | Negative |

## 5.3 Commitment Signals

| Signal Type | Description |
|---|---|
| `BUYER_COMMITMENT_MADE` | Buyer agreed to a concrete action |
| `SELLER_COMMITMENT_MADE` | Seller agreed to provide something |
| `COMMITMENT_FULFILLED` | Commitment completed |
| `COMMITMENT_MISSED` | Commitment not completed by due date |
| `MUTUAL_NEXT_STEP_CONFIRMED` | Both sides agreed to a next step |
| `VAGUE_NEXT_STEP_DETECTED` | No concrete date/owner/action |

## 5.4 Qualification Signals

| Signal Type | Description |
|---|---|
| `PAIN_CONFIRMED` | Buyer confirmed business pain |
| `METRICS_CONFIRMED` | Quantified impact or metric confirmed |
| `ECONOMIC_BUYER_IDENTIFIED` | Economic buyer identified |
| `ECONOMIC_BUYER_ENGAGED` | Economic buyer participated |
| `DECISION_PROCESS_MAPPED` | Decision process described |
| `DECISION_CRITERIA_CONFIRMED` | Evaluation criteria stated |
| `PAPER_PROCESS_IDENTIFIED` | Legal/procurement process surfaced |
| `BUDGET_CONFIRMED` | Budget discussed or confirmed |
| `NO_BUDGET_SIGNAL` | Budget not available or not allocated |

## 5.5 Buying Group Signals

| Signal Type | Description |
|---|---|
| `CHAMPION_IDENTIFIED` | Contact acts as internal advocate |
| `CHAMPION_WEAKENED` | Champion lost influence or engagement |
| `BLOCKER_IDENTIFIED` | Stakeholder resisting or slowing deal |
| `PROCUREMENT_INTRODUCED` | Procurement entered process |
| `LEGAL_INTRODUCED` | Legal entered process |
| `TECHNICAL_BUYER_ENGAGED` | Technical evaluator engaged |
| `STAKEHOLDER_ROLE_CHANGED` | Agent detects role reassignment |

## 5.6 Momentum Signals

| Signal Type | Description |
|---|---|
| `MEETING_CADENCE_ACCELERATED` | Meetings happening more frequently |
| `BUYER_URGENCY_INCREASED` | Buyer expresses stronger urgency |
| `CLOSE_PLAN_CREATED` | Mutual action plan or close plan created |
| `CLOSE_PLAN_PROGRESSING` | Close-plan steps completed |
| `STAKEHOLDER_EXPANSION` | More relevant stakeholders involved |
| `STAGE_EXIT_CRITERIA_MET` | Evidence supports stage advancement |

## 5.7 Risk Signals

| Signal Type | Description |
|---|---|
| `NO_NEXT_STEP` | No scheduled next step |
| `CLOSE_DATE_PUSHED` | Close date moved out |
| `SINGLE_THREADED` | Only one stakeholder engaged |
| `CHAMPION_DARK` | Champion stopped engaging |
| `OBJECTION_UNRESOLVED` | Important objection remains unresolved |
| `PRICE_PUSHBACK` | Buyer objects to pricing |
| `SECURITY_REVIEW_RISK` | Security review may delay deal |
| `PROCUREMENT_DELAY` | Procurement friction detected |
| `LEGAL_REDLINE_RISK` | Contract redlines creating risk |
| `LOW_QUALIFICATION_EVIDENCE` | Stage too high for evidence |

## 5.8 Market Signals

| Signal Type | Description |
|---|---|
| `FUNDING_EVENT` | Account raised capital |
| `LAYOFF_EVENT` | Account announced layoffs |
| `HIRING_SPIKE` | Account hiring in relevant function |
| `LEADERSHIP_CHANGE` | New executive or relevant leader |
| `COMPETITOR_MENTION` | Competitor referenced in news or call |
| `ACQUISITION_EVENT` | Account acquired or acquiring |
| `REGULATORY_EVENT` | New rule creates urgency/risk |
| `TECH_STACK_CHANGE` | Account adopts or drops relevant tool |
| `STRATEGIC_INITIATIVE` | Public initiative relevant to deal |

## 5.9 Commercial Signals

| Signal Type | Description |
|---|---|
| `PRICING_DISCUSSION` | Price discussed |
| `DISCOUNT_REQUESTED` | Discount requested |
| `CONTRACT_SENT` | Contract sent |
| `CONTRACT_REVIEW_STARTED` | Contract entered review |
| `PROCUREMENT_APPROVAL_REQUIRED` | Procurement approval required |
| `PURCHASE_ORDER_REQUESTED` | PO process started |
| `PAYMENT_TERMS_OBJECTION` | Payment term issue detected |

## 5.10 Competitive Signals

| Signal Type | Description |
|---|---|
| `COMPETITOR_NAMED` | Competitor mentioned in call/email/news |
| `COMPETITOR_INCUMBENT` | Competitor is current vendor |
| `COMPETITOR_EVALUATION` | Competitor in active evaluation |
| `COMPETITIVE_DISPLACEMENT_OPPORTUNITY` | Customer dissatisfaction with incumbent |
| `COMPETITIVE_RISK_INCREASED` | Competitor appears stronger |
| `COMPETITIVE_RISK_DECREASED` | Competitor appears weaker |

---

# PRD 06 — Score and Judgment System

## 6.1 Scoring Design Principle

Scores must be composable, explainable, and scoped. Do not create one generic "AI score." Each score answers a specific sales question.

## 6.2 Core Scores

### Deal Health Score

**Question:** Is this deal generally healthy?  
**Range:** 0–100  
**Inputs:**

- Engagement trend.
- Next-step quality.
- Buying group coverage.
- Qualification completeness.
- Risk signals.
- Market relevance.
- Stage-readiness alignment.

### Stage Readiness Score

**Question:** Does evidence support the current or next stage?  
**Range:** 0–100  
**Inputs:**

- Stage entry/exit criteria.
- Required qualification evidence.
- Commitments.
- Stakeholder participation.
- Next-step specificity.
- Prior stage evidence.

### Forecast Confidence Score

**Question:** Can the forecast be defended?  
**Range:** 0–100  
**Inputs:**

- Deal health.
- Stage readiness.
- Close-date realism.
- Historical conversion patterns.
- Rep override history.
- Manager corrections.
- Recent signal changes.

### Risk Score

**Question:** How likely is the deal to slip, lose, or stall?  
**Range:** 0–100, where higher means more risk.  
**Inputs:**

- No next step.
- Single-threading.
- Procurement/legal friction.
- Competitor signals.
- Weak champion.
- Engagement decay.
- Close-date push.
- Negative market events.

### Momentum Score

**Question:** Is the deal advancing?  
**Range:** 0–100  
**Inputs:**

- Meeting cadence.
- Stakeholder expansion.
- Mutual commitments.
- Stage criteria completion.
- Buyer urgency.
- Close-plan movement.

### Buying Group Coverage Score

**Question:** Are the required stakeholders identified and engaged?  
**Range:** 0–100  
**Inputs:**

- Economic buyer.
- Champion.
- Technical buyer.
- Legal/procurement.
- End users.
- Influence distribution.
- Engagement recency.

### Champion Strength Score

**Question:** Is there a real champion?  
**Range:** 0–100  
**Inputs:**

- Internal selling behavior.
- Power/influence.
- Engagement depth.
- Willingness to share process.
- Urgency.
- Multi-threading support.
- Evidence of advocacy.

### Next Step Quality Score

**Question:** Is the next step real?  
**Range:** 0–100  
**Inputs:**

- Has date/time.
- Has owner.
- Has agenda.
- Buyer committed.
- Advances decision process.
- Includes relevant stakeholders.

### Competitive Risk Score

**Question:** How exposed is this deal to a competitor?  
**Range:** 0–100  
**Inputs:**

- Competitor named.
- Incumbent status.
- Differentiation objections.
- Buyer comparison language.
- Public competitor signals.
- Existing tool stack.

### Compelling Event Strength

**Question:** Is there a time-bound reason to buy?  
**Range:** 0–100  
**Inputs:**

- Business deadline.
- Funding/hiring event.
- Executive mandate.
- Regulatory pressure.
- Contract renewal.
- Pain urgency.
- Cost of inaction.

## 6.3 Score Output Format

All scores must output the following:

```json
{
  "deal_id": "deal_123",
  "score_type": "STAGE_READINESS",
  "score": 78,
  "confidence": 0.84,
  "direction": "INCREASED",
  "change_since_last_score": 12,
  "summary": "Stage readiness improved because economic buyer joined the call and confirmed decision criteria.",
  "positive_factors": [
    {
      "signal_id": "sig_001",
      "description": "Economic buyer attended discovery call",
      "weight": 0.22
    }
  ],
  "negative_factors": [
    {
      "signal_id": "sig_002",
      "description": "Budget remains unconfirmed",
      "weight": -0.11
    }
  ],
  "recommended_action_ids": ["act_001"],
  "model_version": "deal_scoring_v0.1"
}
```

## 6.4 Score Recalculation Triggers

Scores should recalculate when:

- Meeting transcript processed.
- New email from buyer.
- New commitment created or missed.
- Market event scored as relevant.
- Stage changed.
- Forecast category changed.
- Close date changed.
- Stakeholder role updated.
- AE overrides agent.
- Manager overrides forecast.
- Deal is won/lost/slipped.

---

# PRD 07 — Agent Runtime

## 7.1 Agent Runtime Principles

Each agent must:

1. Have a bounded responsibility.
2. Produce structured outputs.
3. Reference evidence.
4. Include confidence.
5. Defer to human gate when confidence is insufficient.
6. Log audit events.
7. Create learning events when corrected.

## 7.2 Agent List

| Agent | Purpose |
|---|---|
| Engagement Capture Agent | Ingests and normalizes activity |
| Conversation Intelligence Agent | Extracts meaning from calls/emails/transcripts |
| Research Agent | Watches external market/account events |
| Signal Relevance Agent | Scores outside signals against deal context |
| Deal Scoring Agent | Produces deal scores and judgments |
| Stage Progression Agent | Proposes stage movement |
| Risk Agent | Flags deal risk and mitigation |
| Forecast Agent | Explains forecast movement |
| Action Agent | Generates next-best actions |
| Outreach Optimization Agent | Learns from won/lost patterns to improve SDR motion |
| Approval Routing Agent | Determines human gate path |
| Learning Agent | Converts corrections/outcomes into training events |

## 7.3 Engagement Capture Agent

### Purpose

Ingest email, calendar, calls, meetings, notes, sequencer events, and CRM updates.

### Inputs

- Email metadata and bodies.
- Calendar events.
- Meeting recordings/transcripts.
- Call logs.
- Sequencer activity.
- CRM import.
- Manual uploads.

### Outputs

- Activity records.
- Draft contacts.
- Draft account associations.
- Transcript objects.
- Raw signal candidates.

### Trigger Conditions

- New integration event.
- Manual upload.
- Scheduled sync.
- Historical import.

### Requirements

- Deduplicate contacts by email/domain.
- Match activities to accounts and deals.
- Preserve raw payload references.
- Never discard source metadata.
- Mark uncertain associations for review.

### Failure Modes

- Unknown account association.
- Duplicate contact ambiguity.
- Transcript unavailable.
- Missing speaker identification.

### Human Handoff

Queue review when:

- Multiple possible account/deal matches.
- Contact email domain does not match account.
- Activity involves sensitive data.
- Confidence below threshold.

## 7.4 Conversation Intelligence Agent

### Purpose

Turn conversations into structured sales meaning.

### Inputs

- Transcript.
- Email thread.
- Meeting metadata.
- Deal context.
- Existing stakeholders.
- Pipeline stage criteria.

### Outputs

- Sentiment signals.
- Objection signals.
- Commitment records.
- Qualification evidence.
- Stakeholder role suggestions.
- Next-step quality score.
- Conversation summary.

### Extraction Targets

- Pain.
- Metrics.
- Decision criteria.
- Decision process.
- Paper process.
- Economic buyer.
- Champion.
- Competitor.
- Objections.
- Commitments.
- Next steps.
- Budget.
- Timeline.
- Risks.

### Output Contract

```json
{
  "activity_id": "act_123",
  "deal_id": "deal_456",
  "summary": "Buyer confirmed manual forecasting pain and requested a technical review next Tuesday.",
  "signals": [
    {
      "signal_type": "PAIN_CONFIRMED",
      "evidence_text": "Our forecast reviews take two days every week...",
      "confidence": 0.91
    }
  ],
  "commitments": [
    {
      "owner_side": "BUYER",
      "description": "Invite RevOps lead to technical review",
      "due_date": "2026-07-02",
      "confidence": 0.82
    }
  ],
  "qualification_evidence": [
    {
      "framework": "MEDDPICC",
      "evidence_type": "IDENTIFIED_PAIN",
      "summary": "Forecast process is time-consuming and unreliable.",
      "confidence": 0.91
    }
  ],
  "stakeholder_updates": [
    {
      "contact_id": "contact_789",
      "suggested_role": "ECONOMIC_BUYER",
      "confidence": 0.73,
      "requires_approval": true
    }
  ]
}
```

## 7.5 Research Agent

### Purpose

Continuously watch accounts for market events and generate outside-in signals.

### Inputs

- Account domain.
- Account name.
- Industry.
- Deal stage.
- Deal context.
- ICP.
- Competitors.
- Existing technology stack.
- Public web/news/enrichment data.

### Watched Event Types

- Funding.
- Layoffs.
- Hiring.
- Leadership changes.
- Product launches.
- Acquisitions.
- Competitor mentions.
- Regulatory changes.
- Technology adoption.
- Strategic initiatives.
- Customer expansion signals.

### Output

- Market signal candidates.
- Source URL.
- Event summary.
- Initial relevance score.
- Deal impact hypothesis.

### Rules

- Do not dump news into the CRM.
- Only create deal-level signals when relevance is explainable.
- Account-level events can exist without deal-level action.
- Mark stale events.
- Support user dismissal, which becomes learning data.

## 7.6 Signal Relevance Agent

### Purpose

Score whether an outside signal matters to a specific deal.

### Inputs

- Market event.
- Deal stage.
- Buyer pain.
- Product category.
- Stakeholders.
- Industry.
- Account context.
- Historical patterns.

### Output

```json
{
  "market_signal_id": "sig_market_123",
  "deal_id": "deal_456",
  "relevance_score": 87,
  "impact_direction": "POSITIVE",
  "impact_magnitude": "MEDIUM",
  "rationale": "Funding announcement includes hiring plan for sales operations, which maps to the buyer's stated forecasting pain.",
  "recommended_actions": [
    "Ask CRO whether growth funding changes sales productivity priorities."
  ],
  "confidence": 0.79
}
```

### Relevance Criteria

A market signal is relevant when it affects at least one of:

- Urgency.
- Budget.
- Stakeholder power.
- Timing.
- Risk.
- Competitive landscape.
- Business pain.
- Expansion opportunity.

## 7.7 Deal Scoring Agent

### Purpose

Fuse inside and outside signals into explainable deal judgments.

### Inputs

- Deal object.
- Signal timeline.
- Stage criteria.
- Historical outcomes.
- AE overrides.
- Market relevance signals.
- Buying group.
- Commitments.
- Qualification evidence.

### Outputs

- Score objects.
- Judgment objects.
- Rationale.
- Recommended actions.

### Requirements

- Sentiment alone must never advance stage.
- Stage readiness must be grounded in qualification evidence.
- Score changes must include "why now."
- Negative and missing evidence must be represented.

## 7.8 Stage Progression Agent

### Purpose

Propose stage movement when evidence supports it.

### Inputs

- Current stage.
- Stage criteria.
- Stage readiness score.
- Qualification evidence.
- Recent signals.
- Deal history.
- Rep override history.

### Outputs

- Stage proposal.
- Confidence.
- Evidence list.
- Missing evidence.
- Approval route.

### Stage Proposal Rules

A stage advancement proposal requires:

1. Current stage exit criteria met.
2. Next stage entry criteria mostly met.
3. At least one recent positive evidence signal.
4. No unresolved blocker that invalidates advancement.
5. Confidence above workspace minimum.

### Example

```json
{
  "deal_id": "deal_456",
  "current_stage": "Discovery",
  "proposed_stage": "Solution Fit",
  "confidence": 0.86,
  "rationale": "Move to Solution Fit because the economic buyer attended, pain was confirmed, decision criteria were discussed, and a technical review was scheduled.",
  "required_evidence_met": [
    "Pain confirmed",
    "Economic buyer engaged",
    "Next step scheduled"
  ],
  "missing_evidence": [
    "Budget not confirmed"
  ],
  "autonomy_mode": "QUEUE_FOR_APPROVAL"
}
```

## 7.9 Risk Agent

### Purpose

Detect and explain risks before they appear in forecast misses.

### Inputs

- Signals.
- Deal scores.
- Engagement trend.
- Close date.
- Stage.
- Commitments.
- Stakeholders.
- Market events.

### Risk Types

- No next step.
- Single-threaded deal.
- Weak champion.
- Procurement delay.
- Legal delay.
- Competitor risk.
- Budget uncertainty.
- Timeline risk.
- Close-date realism risk.
- Qualification mismatch.
- Engagement decay.

### Output

- Risk flag.
- Severity.
- Rationale.
- Evidence.
- Recommended mitigation.

### Example

```json
{
  "deal_id": "deal_456",
  "risk_type": "SINGLE_THREADED",
  "severity": "HIGH",
  "confidence": 0.88,
  "rationale": "Only the Director of Sales has engaged across the last 21 days. No economic buyer or RevOps stakeholder is active.",
  "recommended_action": "Ask champion to invite CRO or RevOps owner to next call.",
  "source_signal_ids": ["sig_1", "sig_2"]
}
```

## 7.10 Forecast Agent

### Purpose

Produce manager-ready, explainable forecast updates.

### Inputs

- Deal scores.
- Stage proposals.
- Historical conversion.
- Close-date changes.
- Risk flags.
- Manager overrides.
- AE overrides.
- Outcomes.

### Outputs

- Forecast category recommendation.
- Forecast confidence.
- Changed-deals list.
- Manager review summary.
- Coaching prompt.

### Forecast Categories

- `PIPELINE`
- `BEST_CASE`
- `COMMIT`
- `CLOSED`
- `OMITTED`

### Forecast Output

```json
{
  "deal_id": "deal_456",
  "current_forecast_category": "BEST_CASE",
  "recommended_forecast_category": "COMMIT",
  "confidence": 0.76,
  "summary": "Forecast confidence increased after procurement timeline was confirmed and legal review began.",
  "positive_evidence": ["PROCUREMENT_APPROVAL_REQUIRED", "CONTRACT_REVIEW_STARTED"],
  "remaining_risks": ["PAYMENT_TERMS_OBJECTION"],
  "manager_prompt": "Confirm whether payment terms are a true blocker before moving to Commit."
}
```

## 7.11 Action Agent

### Purpose

Turn judgments into user-facing actions.

### Inputs

- Signals.
- Scores.
- Stage proposals.
- Risk flags.
- User role.
- Calendar.
- Email context.
- Playbook.

### Action Categories

- Review.
- Approve.
- Correct.
- Send.
- Schedule.
- Update.
- Coach.
- Escalate.
- Learn.

### Prioritization Formula

`priority_score = business_impact * urgency * confidence * user_relevance * time_sensitivity`

### Requirements

- Actions must be specific.
- Actions must be resolvable.
- Actions must include source evidence.
- Actions must support approve/edit/reject where relevant.
- Completed actions must update downstream objects.

## 7.12 Outreach Optimization Agent

### Purpose

Close the loop from won/lost deal patterns back into SDR targeting and messaging.

### Inputs

- Closed-won deals.
- Closed-lost deals.
- Account attributes.
- Stakeholder attributes.
- Outreach history.
- Sequence performance.
- Downstream conversion.
- Market signals before opportunity creation.

### Outputs

- ICP refinements.
- Target account suggestions.
- Persona suggestions.
- Trigger-based outreach prompts.
- Message angle recommendations.
- Sequence performance insights.

### Important Rule

Do not optimize for opens or replies alone. Optimize for qualified opportunity creation and closed-won patterns.

---

# PRD 08 — Confidence-Gated Autonomy

## 8.1 Autonomy Modes

| Mode | Description |
|---|---|
| `AUTO_APPLY` | Agent applies action immediately |
| `AUTO_APPLY_WITH_UNDO` | Agent applies action and shows undo window |
| `QUEUE_FOR_APPROVAL` | User must approve/edit/reject |
| `ASK_FOR_CLARIFICATION` | Agent asks user to resolve ambiguity |
| `NEVER_AUTO` | Action always requires explicit human action |

## 8.2 Business Risk Levels

| Level | Definition |
|---|---|
| `LOW` | Internal metadata or low-impact record update |
| `MEDIUM` | Sales process or forecast update |
| `HIGH` | Customer-facing action or revenue-critical change |
| `CRITICAL` | Legal, contract, pricing, closed-won/lost, or irreversible action |

## 8.3 Default Autonomy Matrix

| Action | Default Mode | Confidence Required | Notes |
|---|---|---:|---|
| Add meeting summary | AUTO_APPLY_WITH_UNDO | 0.70 | Low risk |
| Add transcript-derived signal | AUTO_APPLY_WITH_UNDO | 0.75 | Must cite evidence |
| Create contact from email | AUTO_APPLY_WITH_UNDO | 0.80 | Review if ambiguous |
| Associate activity to deal | AUTO_APPLY_WITH_UNDO | 0.85 | Queue if multiple deals |
| Add buyer commitment | AUTO_APPLY_WITH_UNDO | 0.80 | User can edit |
| Mark commitment missed | QUEUE_FOR_APPROVAL | 0.80 | Could be sensitive |
| Suggest stakeholder role | QUEUE_FOR_APPROVAL | 0.70 | Approve/edit |
| Update stakeholder role | QUEUE_FOR_APPROVAL | 0.85 | Unless admin allows auto |
| Update next step | AUTO_APPLY_WITH_UNDO | 0.85 | If exact date/owner |
| Move stage forward | QUEUE_FOR_APPROVAL | 0.85 | Auto only if admin allows |
| Move stage backward | QUEUE_FOR_APPROVAL | 0.90 | Sensitive |
| Change forecast category | QUEUE_FOR_APPROVAL | 0.85 | Manager may be required |
| Update close date | QUEUE_FOR_APPROVAL | 0.80 | Sensitive |
| Draft follow-up email | QUEUE_FOR_APPROVAL | 0.70 | Never send automatically in MVP |
| Send customer email | NEVER_AUTO | 1.00 | Future controlled beta only |
| Mark closed-won/lost | NEVER_AUTO | 1.00 | Human only |
| Create manager risk alert | AUTO_APPLY_WITH_UNDO | 0.75 | Internal |
| Create SDR targeting suggestion | QUEUE_FOR_APPROVAL | 0.70 | Review required |

## 8.4 Undo Window

For `AUTO_APPLY_WITH_UNDO` actions:

- Default undo window: 24 hours for internal metadata.
- Short undo window: 15 minutes for queue-visible action state.
- Revert must restore previous value.
- Revert must create audit event.
- Revert reason optional but encouraged.
- Reverted actions create learning events.

## 8.5 Approval UX Requirements

Every approval card must show:

- Proposed action.
- Rationale.
- Confidence.
- Evidence.
- Business impact.
- What changes if approved.
- Approve button.
- Edit button.
- Reject button.
- Reason picker.
- Optional note.

## 8.6 Override Reason UX

Reason capture should be one click where possible.

Example reason options for rejected stage movement:

- Missing economic buyer.
- Next step is weak.
- Budget not confirmed.
- Wrong stakeholder interpretation.
- Customer timing is wrong.
- Competitor risk underestimated.
- Agent overweighted sentiment.
- Other.

---

# PRD 09 — Core UX Surfaces

## 9.1 Setup: Learn My Motion

### Purpose

Replace weeks of CRM configuration with assisted setup.

### User

Admin, RevOps, Sales Leader.

### Inputs

- Email/calendar connection.
- CRM import.
- Closed-won history.
- Closed-lost history.
- Sales stages.
- ICP docs or manual input.
- Sequencer data.
- Conversation history if available.

### Outputs

- Proposed pipeline.
- Proposed stage criteria.
- Proposed ICP.
- Proposed qualification framework.
- Proposed playbook.
- Suggested autonomy policy.
- Data quality report.
- Integration health.

### Flow

1. User creates workspace.
2. User connects systems.
3. System imports historical deals.
4. System infers sales motion.
5. System proposes pipeline and playbook.
6. Admin reviews and edits.
7. System activates capture.
8. System starts scoring open deals.

### Acceptance Criteria

- Admin can complete setup without manually creating all fields.
- System proposes at least one pipeline.
- Admin can edit stage names and criteria.
- Admin can set autonomy thresholds.
- System shows integration status.
- Setup creates audit trail.

## 9.2 Today Queue

### Purpose

Default home for reps and managers.

### Users

AE, SDR, Manager.

### Core Concept

A ranked queue of actions, approvals, risks, and briefings.

### AE Queue Categories

- Approve stage change.
- Review follow-up draft.
- Correct stakeholder role.
- Prepare for upcoming meeting.
- Resolve no-next-step risk.
- Review new outside signal.
- Confirm commitment.
- Update forecast.
- Undo recent agent action.

### Manager Queue Categories

- Deals that changed this week.
- Forecast category changes.
- High-risk commit deals.
- Rep overrides needing review.
- Stalled deals.
- Coaching prompts.
- Pipeline quality changes.

### SDR Queue Categories

- New target account trigger.
- Outreach angle recommendation.
- Persona suggestion.
- Follow-up timing recommendation.
- Won-pattern account match.

### Card Requirements

Each card must include:

- Title.
- Object: deal/account/contact.
- Recommended action.
- Why now.
- Confidence.
- Evidence.
- Primary CTA.
- Secondary CTA.
- Reject/correct option.
- Audit/log link.

### Sorting

Default sort by:

1. Urgency.
2. Revenue impact.
3. Risk level.
4. Confidence.
5. Due date.
6. User ownership.

## 9.3 Deal Room

### Purpose

Living workspace for a deal.

### Layout

1. Header.
2. Deal score panel.
3. Stage proposal panel.
4. Signal timeline.
5. Buying group map.
6. Qualification evidence.
7. Commitments and next steps.
8. Risk flags.
9. Forecast explanation.
10. Activity history.
11. Agent actions / approvals.
12. Audit trail.

### Header Fields

- Deal name.
- Account.
- Owner.
- Stage.
- Amount.
- Close date.
- Forecast category.
- Health score.
- Risk score.
- Last meaningful change.

### Signal Timeline

Timeline filter options:

- All signals.
- Engagement.
- Commitments.
- Qualification.
- Buying group.
- Risks.
- Market.
- Commercial.
- Competitive.
- Agent actions.
- User overrides.

### Stage Proposal Panel

Shows:

- Current stage.
- Proposed stage.
- Confidence.
- Reason.
- Required evidence met.
- Missing evidence.
- Approve/edit/reject.
- Reason capture.

### Buying Group Map

Shows contacts grouped by:

- Economic buyer.
- Champion.
- Blocker.
- Technical buyer.
- Legal.
- Procurement.
- Influencer.
- Unknown.

Each stakeholder card:

- Engagement level.
- Sentiment.
- Influence.
- Last engagement.
- Evidence.
- Suggested role changes.

### Qualification Evidence View

Shows MEDDPICC or configured framework.

For each evidence item:

- Status: missing, weak, present, strong.
- Evidence summary.
- Source signals.
- Confidence.
- Last verified date.
- Edit/correct.

## 9.4 Account Room

### Purpose

Account-level view across deals and market context.

### Components

- Account summary.
- Open deals.
- Stakeholders.
- Engagement history.
- Market timeline.
- ICP fit.
- Trigger events.
- Related accounts.
- Outreach insights.
- Expansion potential.

## 9.5 Forecast Review

### Purpose

Manager surface for explainable forecast.

### Main View

- Forecast rollup.
- Changed deals this week.
- Deals moved into/out of commit.
- High-risk commit deals.
- Slipped deals.
- Forecast confidence trend.
- Rep override patterns.

### Deal Change Card

Must show:

- Previous forecast category.
- Current/recommended category.
- Change reason.
- Signals driving change.
- Remaining risks.
- Manager action.
- AE override history.

### Manager 1:1 Mode

Shows each rep:

- Top changed deals.
- Deals needing coaching.
- Rep override pattern.
- Deals with weak next steps.
- Commit deals with risk.
- Suggested coaching questions.

## 9.6 Command Bar

### Purpose

Conversational control surface that returns actionable cards, not plain chat.

### Example Commands

- "Show deals that got riskier this week."
- "Why did Acme move to best case?"
- "Draft follow-up for yesterday's call."
- "Which commit deals have no economic buyer?"
- "Find accounts with new funding and open opportunities."
- "Show rejected stage proposals this month."
- "Which SDR sequences created the most won pipeline?"

### Response Requirements

- Return interactive cards.
- Include filters and objects.
- Cite evidence.
- Allow next action from response.
- Never produce untraceable recommendations.

## 9.7 Admin / RevOps Console

### Purpose

Govern setup, policy, integrations, and learning.

### Components

- Integration health.
- Pipeline config.
- Stage criteria config.
- Autonomy policy.
- Role permissions.
- Signal taxonomy config.
- Model performance.
- Override analytics.
- Audit log.
- Data retention.
- Cross-tenant learning settings.

---

# PRD 10 — Workflow Specifications

## 10.1 Workspace Onboarding

### Trigger

Admin creates new workspace.

### Steps

1. Create workspace.
2. Invite users or import users.
3. Connect email/calendar.
4. Connect CRM if replacing or augmenting.
5. Connect transcript/call tools.
6. Import historical deals.
7. Infer pipeline.
8. Infer stage criteria.
9. Infer ICP.
10. Propose playbook.
11. Configure autonomy.
12. Activate agents.

### System Outputs

- Workspace setup checklist.
- Inferred sales motion.
- Data completeness report.
- Integration status.
- Initial scored deals.

## 10.2 Meeting Transcript Processing

### Trigger

New transcript received.

### Steps

1. Normalize transcript.
2. Match to account/deal/contact.
3. Extract summary.
4. Extract signals.
5. Extract commitments.
6. Extract objections.
7. Extract qualification evidence.
8. Suggest stakeholder updates.
9. Recalculate scores.
10. Generate action cards.
11. Create audit events.

### Edge Cases

- No matching deal.
- Multiple possible deals.
- Unknown speakers.
- Conflicting commitments.
- Sensitive language.
- Customer asks not to be recorded.

## 10.3 Stage Proposal Workflow

### Trigger

Stage readiness score crosses threshold or meaningful signal detected.

### Steps

1. Evaluate current stage exit criteria.
2. Evaluate next stage entry criteria.
3. Identify supporting evidence.
4. Identify missing evidence.
5. Generate proposal.
6. Determine autonomy mode.
7. Auto-apply or queue approval.
8. User approves/edits/rejects.
9. Capture reason.
10. Update deal.
11. Create learning event.

### Acceptance Criteria

- Proposal cannot be created without evidence.
- User can inspect each supporting signal.
- Reject/edit requires at most two clicks plus optional note.
- Override creates learning event.

## 10.4 Outside Signal Workflow

### Trigger

Research Agent detects account event.

### Steps

1. Create market event.
2. Match to account.
3. Match to open deals.
4. Score relevance to each deal.
5. Create market signal if relevant.
6. Generate recommended action if high impact.
7. Show in Deal Room and Today Queue.
8. User can dismiss as irrelevant.
9. Dismissal creates learning event.

### Example

Funding announcement detected:

- Account raised Series B.
- Deal is for revenue productivity.
- Press release mentions sales team expansion.
- Relevance high.
- System recommends AE ask whether growth plan changes sales productivity urgency.

## 10.5 Deal Risk Workflow

### Trigger

Risk score increases or specific risk signal detected.

### Steps

1. Detect risk.
2. Classify risk type.
3. Set severity.
4. Link evidence.
5. Generate mitigation action.
6. Notify AE or manager based on severity.
7. Track whether action taken.
8. Learn from confirmed/dismissed risks.

## 10.6 Forecast Review Workflow

### Trigger

Weekly forecast cycle or score/forecast category changes.

### Steps

1. Aggregate open deals.
2. Identify changed deals.
3. Generate forecast explanations.
4. Identify high-risk commit deals.
5. Identify slipped deals.
6. Generate manager coaching prompts.
7. Manager approves/changes forecast category.
8. Capture reason.
9. Create learning event.

## 10.7 AE Override Workflow

### Trigger

AE rejects or edits agent proposal.

### Steps

1. User selects reject/edit.
2. System shows reason picker.
3. User picks reason.
4. Optional note.
5. System updates target object.
6. Audit event created.
7. Learning event created.
8. Score recalibration queued.

### UX Requirement

The entire override must be possible in under 10 seconds.

## 10.8 Outcome Learning Workflow

### Trigger

Deal marked won/lost/slipped/no decision.

### Steps

1. Capture outcome.
2. Snapshot deal state before outcome.
3. Link recent signals.
4. Link stage/forecast history.
5. Link overrides.
6. Create learning event.
7. Update scoring model dataset.
8. Update outreach loop dataset.
9. Surface insights later.

---

# PRD 11 — API and Event Contracts

## 11.1 API Style

Recommended architecture:

- REST for core CRUD.
- Event bus for async agent workflows.
- Webhooks for integrations.
- Background jobs for scoring/research.
- Structured JSON contracts for agent I/O.

## 11.2 Core REST Resources

### Workspace

- `POST /workspaces`
- `GET /workspaces/{id}`
- `PATCH /workspaces/{id}`

### Users

- `GET /users`
- `POST /users`
- `PATCH /users/{id}`

### Accounts

- `GET /accounts`
- `POST /accounts`
- `GET /accounts/{id}`
- `PATCH /accounts/{id}`

### Contacts

- `GET /contacts`
- `POST /contacts`
- `GET /contacts/{id}`
- `PATCH /contacts/{id}`

### Deals

- `GET /deals`
- `POST /deals`
- `GET /deals/{id}`
- `PATCH /deals/{id}`
- `GET /deals/{id}/signals`
- `GET /deals/{id}/judgments`
- `GET /deals/{id}/actions`
- `GET /deals/{id}/audit`

### Signals

- `POST /signals`
- `GET /signals/{id}`
- `PATCH /signals/{id}`

### Actions

- `GET /actions`
- `GET /actions/{id}`
- `POST /actions/{id}/approve`
- `POST /actions/{id}/reject`
- `POST /actions/{id}/edit`
- `POST /actions/{id}/undo`

### Stage Proposals

- `GET /stage-proposals`
- `POST /stage-proposals/{id}/approve`
- `POST /stage-proposals/{id}/reject`
- `POST /stage-proposals/{id}/edit`

### Forecast

- `GET /forecast`
- `GET /forecast/changes`
- `POST /forecast/{deal_id}/override`

### Learning

- `GET /learning/events`
- `POST /learning/events`

## 11.3 Event Bus Topics

| Event | Trigger |
|---|---|
| `activity.created` | New activity ingested |
| `transcript.created` | Transcript available |
| `transcript.processed` | Conversation extraction complete |
| `signal.created` | New signal created |
| `signal.relevance_scored` | Market relevance scored |
| `deal.score_updated` | Deal scores recalculated |
| `stage.proposal_created` | Stage proposal generated |
| `action.created` | Action recommendation generated |
| `action.approved` | User approved action |
| `action.rejected` | User rejected action |
| `action.auto_applied` | Agent applied action |
| `action.reverted` | User undid action |
| `override.created` | User corrected agent |
| `deal.outcome_created` | Won/lost/slipped/no-decision |
| `learning.event_created` | Learning event logged |
| `forecast.changed` | Forecast recommendation changed |

## 11.4 Agent Job Contract

```json
{
  "job_id": "job_123",
  "agent_name": "deal_scoring_agent",
  "workspace_id": "ws_123",
  "object_type": "DEAL",
  "object_id": "deal_456",
  "trigger_event": "signal.created",
  "input_refs": {
    "signal_ids": ["sig_1", "sig_2"],
    "deal_id": "deal_456"
  },
  "requested_at": "2026-06-19T10:00:00Z",
  "idempotency_key": "deal_456_signal_sig_1_score_v1"
}
```

## 11.5 Agent Result Contract

```json
{
  "job_id": "job_123",
  "status": "SUCCEEDED",
  "outputs": {
    "judgment_ids": ["judg_1"],
    "action_ids": ["act_1"],
    "stage_proposal_ids": ["sp_1"]
  },
  "confidence": 0.84,
  "model_version": "deal_scoring_v0.1",
  "audit_event_id": "audit_123",
  "completed_at": "2026-06-19T10:00:08Z"
}
```

## 11.6 Idempotency Requirements

Every agent job must include an idempotency key. Reprocessing the same source event should not duplicate:

- Signals.
- Commitments.
- Actions.
- Stage proposals.
- Audit events.

---

# PRD 12 — Permissions and Trust

## 12.1 Permission Model

### AE

Can:

- View assigned deals.
- Approve/reject own action cards.
- Override own deal stage proposals.
- Edit deal information.
- View own audit history.

Cannot:

- Change workspace autonomy policy.
- View all-team forecast unless allowed.
- Enable cross-tenant learning.

### SDR

Can:

- View assigned accounts/leads.
- View outreach suggestions.
- Approve/edit own outreach actions.
- See limited deal outcome insights.

### Manager

Can:

- View team deals.
- Review forecast.
- Override forecast categories.
- Review AE override patterns.
- Approve high-impact actions if configured.

### RevOps

Can:

- Configure pipeline.
- Configure stage criteria.
- Configure signal taxonomy.
- View audit logs.
- Manage integrations.
- View model performance.

### Admin

Can:

- Manage users.
- Manage permissions.
- Configure autonomy policies.
- Configure data retention.
- Enable/disable learning settings.

## 12.2 Trust Requirements

The product must answer these questions for every agent action:

- What changed?
- Who or what changed it?
- Why did it change?
- Which signals support the change?
- How confident was the system?
- Could the user undo it?
- Was it approved?
- Was it overridden?
- Was it used for learning?

## 12.3 Tenant Isolation

- Tenant data must remain isolated.
- Raw conversations must never cross tenant boundaries.
- Cross-tenant learning must use de-identified, aggregated features only.
- Admins must be able to disable cross-tenant learning eligibility.
- Learning event eligibility must be stored per event.

## 12.4 Sensitive Action Policy

Actions that are never autonomous in MVP:

- Send customer email.
- Change pricing.
- Mark deal closed-won.
- Mark deal closed-lost.
- Send contract.
- Change legal terms.
- Delete records.
- Export sensitive data.
- Invite external users.

---

# PRD 13 — Data and ML Evaluation

## 13.1 Model Evaluation Philosophy

Evaluate agents on business usefulness, correctness, trust, and downstream outcomes.

## 13.2 Conversation Extraction Metrics

- Commitment extraction precision.
- Commitment extraction recall.
- Objection classification accuracy.
- Stakeholder role accuracy.
- Qualification evidence accuracy.
- Hallucination rate.
- User correction rate.

## 13.3 Deal Scoring Metrics

- Correlation with stage advancement.
- Correlation with win/loss.
- Slip prediction precision.
- Slip prediction recall.
- Forecast confidence calibration.
- Manager trust score.
- Override rate by score type.

## 13.4 Stage Proposal Metrics

- Approval rate.
- Rejection rate.
- Edit rate.
- Reason distribution.
- Time to resolution.
- False advancement rate.
- Missed advancement rate.

## 13.5 Risk Agent Metrics

- Confirmed risk rate.
- Dismissed risk rate.
- Slip/loss prediction.
- Average lead time before slip.
- Mitigation action completion.
- Risk fatigue rate.

## 13.6 Research Agent Metrics

- Relevant signal rate.
- Dismissed-as-irrelevant rate.
- Source quality.
- Duplicate event rate.
- Action generation rate.
- Win/slip correlation.

## 13.7 Outreach Loop Metrics

- Qualified opportunity creation.
- Meeting-to-opportunity conversion.
- Opportunity-to-win conversion.
- Downstream ACV.
- Persona fit.
- Trigger effectiveness.
- Message angle effectiveness.

## 13.8 Learning Dataset Rules

Each learning record should include:

- Tenant ID.
- Eligibility flag.
- Feature snapshot.
- Source signals.
- Agent output.
- Human correction.
- Outcome.
- Timestamp.
- Model version.

---

# PRD 14 — MVP User Stories and Acceptance Criteria

## 14.1 Today Queue

### Story

As an AE, I want to see my most important deal actions in one queue so I do not have to inspect every record.

### Acceptance Criteria

- User sees ranked action cards.
- Cards include deal, action, reason, confidence, and evidence.
- User can approve/edit/reject.
- Queue updates after action resolution.
- Every decision creates audit event.

## 14.2 Deal Room

### Story

As an AE, I want a living view of each deal so I can understand what changed, what matters, and what to do next.

### Acceptance Criteria

- Deal room shows scores.
- Deal room shows signal timeline.
- Deal room shows commitments.
- Deal room shows buying group.
- Deal room shows stage proposal.
- User can inspect evidence.
- User can override agent.

## 14.3 Transcript Ingestion

### Story

As an AE, I want meeting transcripts to become structured deal signals automatically.

### Acceptance Criteria

- Transcript can be uploaded or ingested.
- System creates summary.
- System extracts at least commitments, objections, and qualification evidence.
- Extracted items link back to transcript snippets.
- User can correct extracted items.

## 14.4 Stage Proposal

### Story

As an AE, I want the system to propose deal stage movement based on evidence so I can keep pipeline accurate with less admin.

### Acceptance Criteria

- Proposal includes current stage and proposed stage.
- Proposal includes rationale.
- Proposal includes supporting evidence.
- Proposal includes missing evidence.
- User can approve/edit/reject.
- Rejection captures reason.
- Override creates learning event.

## 14.5 Market Signal

### Story

As an AE, I want relevant account news to be translated into deal implications, not raw headlines.

### Acceptance Criteria

- System can ingest or create market event.
- Event is matched to account.
- Event relevance is scored against deal.
- Low relevance events do not spam Today Queue.
- High relevance events include recommended action.
- User can dismiss as irrelevant.

## 14.6 Forecast Review

### Story

As a manager, I want to see which deals changed and why so I can run forecast from evidence.

### Acceptance Criteria

- Manager sees changed deals.
- Each changed deal includes reason.
- Forecast recommendation includes confidence.
- Manager can override.
- Override reason is captured.
- Forecast changes are audited.

## 14.7 Override Capture

### Story

As a rep, I want to correct the agent quickly so I am not punished with more admin.

### Acceptance Criteria

- Override reason picker appears on reject/edit.
- User can complete override in under 10 seconds.
- Optional note supported.
- Override is stored structurally.
- Learning event is created.

---

# PRD 15 — Page-Level UX Details

## 15.1 Global Navigation

Suggested nav:

1. Today
2. Deals
3. Accounts
4. Forecast
5. Signals
6. Learning
7. Admin

Role-specific visibility:

- SDR may see Today, Accounts, Signals.
- AE sees Today, Deals, Accounts, Forecast subset.
- Manager sees Today, Deals, Forecast, Learning.
- RevOps/Admin sees all.

## 15.2 Today Page Components

### Header

- Greeting.
- Queue count.
- Revenue at risk.
- Actions due today.
- New agent updates.

### Filters

- Action type.
- Deal owner.
- Priority.
- Confidence.
- Risk.
- Due date.
- Approval required.

### Action Card

Fields:

- Badge: Risk / Stage / Follow-up / Forecast / Market / Commitment.
- Object name.
- Recommended action.
- Why now.
- Confidence.
- Evidence chips.
- Primary CTA.
- Secondary CTA.
- Reject/correct.

## 15.3 Deal Room Components

### Score Panel

- Deal health.
- Risk.
- Momentum.
- Stage readiness.
- Forecast confidence.

Each score clickable for explanation.

### Explanation Drawer

Shows:

- Score trend.
- Positive drivers.
- Negative drivers.
- Missing evidence.
- Related signals.
- Model version.
- Last updated.

### Signal Timeline Item

Fields:

- Signal type.
- Source.
- Occurred date.
- Summary.
- Impact.
- Confidence.
- Evidence preview.
- Actions generated.

### Approval Drawer

- Proposed change.
- Before/after.
- Confidence.
- Rationale.
- Evidence.
- Approve/edit/reject.
- Reason picker.

## 15.4 Forecast Page Components

### Forecast Summary

- Total pipeline.
- Best case.
- Commit.
- Closed.
- Forecast confidence.
- Change vs previous period.

### Changed Deals Table

Columns:

- Deal.
- Owner.
- Amount.
- Previous category.
- Current/recommended category.
- Change reason.
- Risk.
- Confidence.
- Manager action.

### Coaching Drawer

- Summary.
- Evidence.
- Suggested coaching question.
- Suggested next action.

---

# PRD 16 — Example End-to-End Scenario

## Scenario: Discovery Call Advances Deal

### Context

Deal: Acme  
Stage: Discovery  
Amount: $75,000  
Owner: Sarah AE

### Event

Discovery call transcript arrives.

### Agent Processing

Conversation Intelligence Agent extracts:

- Pain confirmed: forecast process takes two days weekly.
- Economic buyer attended: VP Sales.
- Decision criteria discussed: CRM integration and forecast accuracy.
- Next step scheduled: technical review next Tuesday.
- Budget not confirmed.

### Signals Created

- `PAIN_CONFIRMED`
- `ECONOMIC_BUYER_ENGAGED`
- `DECISION_CRITERIA_CONFIRMED`
- `MUTUAL_NEXT_STEP_CONFIRMED`
- `BUDGET_UNCONFIRMED`

### Deal Scoring

- Stage readiness increases from 54 to 82.
- Deal health increases from 61 to 76.
- Forecast confidence increases from 48 to 62.
- Next-step quality increases from 40 to 91.

### Stage Proposal

Agent proposes:

Move from Discovery to Solution Fit.

Rationale:

"Move to Solution Fit because the economic buyer attended, pain was confirmed, decision criteria were discussed, and a technical review was scheduled. Budget remains unconfirmed."

### Human Gate

Mode: Queue for approval.

Sarah approves but adds note:

"Budget discussion expected in technical review."

### Learning

Action approved creates learning event:

- Stage proposal accepted.
- Evidence pattern stored.
- Missing budget tolerated at this stage for this tenant.

## Scenario: Market Signal Creates Urgency

### Context

Deal: BrightCo  
Stage: Qualified  
Pain: Sales productivity during growth  
Open amount: $120,000

### Event

Research Agent detects BrightCo raised Series C and plans to double sales team.

### Relevance Agent

Scores relevance: 91.

Reason:

Funding and sales hiring directly connect to stated pain around onboarding and forecast quality.

### Action

Today Queue card:

"Ask CRO whether the Series C hiring plan changes urgency for sales productivity tooling."

### AE Response

AE approves follow-up draft after editing.

### Learning

If opportunity later advances or wins, this trigger becomes part of outreach and scoring loop.

---

# PRD 17 — Release Plan

## Release 0: Prototype

Goal: Demonstrate loop with mocked integrations.

Scope:

- Seed accounts/deals.
- Upload transcript.
- Extract signals.
- Generate score.
- Generate stage proposal.
- Approve/reject.
- Deal Room.
- Today Queue.
- Audit log.

## Release 1: MVP

Goal: Real early-customer workflow.

Scope:

- Auth/workspace/users.
- Core CRM objects.
- Transcript ingestion.
- Email/calendar activity import.
- Signal engine.
- Deal scoring v0.
- Stage proposal.
- Override capture.
- Today Queue.
- Deal Room.
- Basic admin.
- Audit.
- Outcome capture.

## Release 2: Manager Value

Goal: Make manager forecast workflow defensible.

Scope:

- Forecast Review.
- Changed deals.
- Risk Agent.
- Manager 1:1.
- Forecast overrides.
- Coaching prompts.
- Score trends.

## Release 3: Outside-In Intelligence

Goal: Prove market signal differentiation.

Scope:

- Research Agent.
- Account watchlist.
- Relevance scoring.
- Market timeline.
- Outside-in action cards.
- User dismissals as learning events.

## Release 4: Learning Loops

Goal: Begin compounding.

Scope:

- Scoring loop dataset.
- Outreach loop dataset.
- Override analytics.
- Model evaluation.
- Tenant-specific calibration.
- De-identified pattern store.

---

# PRD 18 — Technical Architecture Recommendation

## 18.1 Suggested Stack

This is optional and can be adapted.

### Frontend

- Next.js / React.
- TypeScript.
- Tailwind or equivalent.
- Component library with cards, drawers, timeline, tables.

### Backend

- Node.js/NestJS or Python/FastAPI.
- PostgreSQL for core data.
- Redis or queue service for jobs.
- Event bus: Kafka, NATS, or managed pub/sub.
- Object storage for raw transcripts/payloads.
- Vector store for semantic retrieval if needed.

### Agent Layer

- Agent orchestration service.
- Prompt/version registry.
- Structured output validation.
- Tool access by agent type.
- Guardrails and policy checks.
- Human gate service.

### Data

- Postgres relational core.
- Event log.
- Audit log.
- Feature store later.
- Model evaluation table.
- Tenant isolation by workspace ID plus infrastructure controls.

## 18.2 Service Boundaries

| Service | Responsibility |
|---|---|
| Core CRM Service | Accounts, contacts, deals, users |
| Activity Service | Activity ingestion and normalization |
| Signal Service | Signal creation and timeline |
| Agent Runtime Service | Agent jobs and outputs |
| Scoring Service | Score calculation |
| Action Service | Action queue and approvals |
| Forecast Service | Forecast rollups and explanations |
| Learning Service | Learning events and datasets |
| Admin Service | Policy, permissions, integrations |
| Audit Service | Immutable audit records |

## 18.3 Agent Safety Pipeline

Before any agent output is applied:

1. Validate schema.
2. Validate object permissions.
3. Validate confidence.
4. Validate autonomy policy.
5. Validate business risk level.
6. Link source evidence.
7. Create audit draft.
8. Apply/queue/reject based on policy.

---

# PRD 19 — Edge Cases

## 19.1 Conflicting Signals

Example: Buyer sentiment positive, but no next step and budget not confirmed.

Required behavior:

- Do not advance stage solely from sentiment.
- Show conflict in rationale.
- Generate risk or clarification action.

## 19.2 Multiple Deals at Same Account

Required behavior:

- Activity association must use meeting participants, subject, calendar context, and active opportunities.
- If confidence below threshold, queue association review.

## 19.3 Weak Champion

If a stakeholder is friendly but lacks influence:

- Do not mark as strong champion.
- Label as engaged influencer or weak champion.
- Recommend finding economic buyer.

## 19.4 Noisy Market News

If event is account-level but irrelevant to deal:

- Store at account timeline only.
- Do not create Today Queue card.
- Allow user to dismiss.
- Learn from dismissal.

## 19.5 Rep Rejects Many Correct Proposals

Required behavior:

- Track override patterns.
- Surface to manager only as coaching/quality signal, not punitive by default.
- Use manager validation for model tuning.

## 19.6 Model Low Confidence

Required behavior:

- Ask clarifying question or queue review.
- Do not silently apply.
- Explain uncertainty.

## 19.7 Sensitive Customer Email

Required behavior:

- Draft only.
- Never send automatically in MVP.
- Require user approval.
- Preserve final user-edited copy.

---

# PRD 20 — Non-Functional Requirements

## 20.1 Performance

- Today Queue loads under 2 seconds for standard workspace.
- Deal Room initial load under 3 seconds.
- Transcript processing can be async.
- Score updates should appear within 60 seconds after transcript processing.
- Queue card updates should be near-real-time where possible.

## 20.2 Reliability

- Agent jobs must be retryable.
- Duplicate events must be idempotent.
- Failed agent jobs must be visible to admin.
- Core CRM operations must not depend on live LLM availability.

## 20.3 Security

- Tenant isolation.
- Role-based access.
- Encryption at rest.
- Encryption in transit.
- Secure storage for integration credentials.
- Audit logs immutable or append-only.
- Data export controls.

## 20.4 Compliance Readiness

Plan for:

- SOC 2.
- GDPR-style data deletion.
- Customer data retention policy.
- User-level access logs.
- Integration permission transparency.

## 20.5 Observability

Track:

- Agent job success/failure.
- Latency.
- Token/model cost.
- Approval rates.
- Override rates.
- Queue backlog.
- Integration health.
- Score recalculation frequency.

---

# PRD 21 — Success Metrics

## 21.1 Product Adoption Metrics

- Daily active reps.
- Today Queue completion rate.
- Deal Room weekly usage.
- Approval card resolution rate.
- Override reason capture rate.
- Manager forecast review usage.

## 21.2 Sales Workflow Metrics

- CRM admin time reduction.
- Next-step coverage.
- Stakeholder coverage.
- Stage hygiene.
- Forecast inspection time.
- Risk mitigation completion.

## 21.3 Business Outcome Metrics

- Forecast accuracy.
- Slip rate reduction.
- Win rate improvement.
- Sales cycle reduction.
- Pipeline conversion improvement.
- Rep productivity.
- Qualified pipeline generation.

## 21.4 Trust Metrics

- Agent approval rate.
- Agent rejection rate.
- Undo rate.
- Dismissed signal rate.
- Explanation view rate.
- User trust survey.
- Manager trust score.

## 21.5 Learning Metrics

- Learning event volume.
- Override capture completeness.
- Stage proposal precision.
- Risk prediction precision.
- Forecast confidence calibration.
- Outreach pattern lift.

---

# PRD 22 — Build Order for Coding Agent

## 22.1 Suggested Implementation Sequence

1. Create database schema for core objects.
2. Build workspace/user/auth model.
3. Build accounts/contacts/deals CRUD.
4. Build activity and transcript ingestion.
5. Build signal table and signal timeline.
6. Build mocked Conversation Intelligence Agent.
7. Build deal score calculation v0.
8. Build stage proposal generation.
9. Build Today Queue.
10. Build approval/override workflow.
11. Build Deal Room.
12. Build audit log.
13. Build outcome capture.
14. Build learning event logging.
15. Build manager forecast view.
16. Add research agent.
17. Add risk agent.
18. Add admin autonomy policy.
19. Add evaluation dashboards.

## 22.2 First Prototype Data Seed

Create sample workspace with:

- 3 users: AE, Manager, RevOps.
- 5 accounts.
- 8 contacts.
- 6 open deals.
- 2 won deals.
- 2 lost deals.
- 20 signals.
- 5 stage proposals.
- 10 action cards.
- 3 overrides.
- 4 risk flags.

## 22.3 First Demo Flow

1. User opens Today Queue.
2. Sees stage proposal for Acme.
3. Opens Deal Room.
4. Reviews signal timeline.
5. Reviews transcript-derived evidence.
6. Approves stage movement.
7. System updates deal.
8. Audit event created.
9. Learning event created.
10. Manager Forecast view shows changed deal.

---

# PRD 23 — Open Product Questions

These should be answered during design/build.

1. Should NuStack replace CRM or initially augment existing CRM?
2. Should stage names be standardized for MVP or configurable from day one?
3. Which integrations are required for first customer?
4. What is the minimum acceptable transcript quality?
5. How much of MEDDPICC should be default versus configurable?
6. Should manager approval be required for forecast changes in MVP?
7. What customer data can be eligible for cross-tenant learning?
8. How should model explanations be stored for audit durability?
9. How should the product handle reps gaming agent feedback?
10. What is the first paid wedge: AE productivity or manager forecast truth?

---

# PRD 24 — Final Product Anchor

NuStack Agentic Revenue CRM should be implemented as a system where:

- The **home** is Today Queue.
- The **deal record** is a living brief.
- The **CRM field** is a consequence of accepted evidence.
- The **agent output** is always explainable.
- The **human correction** is structured learning data.
- The **forecast** is grounded in signal history.
- The **moat** is the loop from signal to judgment to action to outcome to learning.

Do not build a dashboard-first CRM.  
Do not build an auto-capture-only CRM.  
Build the post-capture revenue operating system.

