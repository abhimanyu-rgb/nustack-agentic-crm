// MockProvider — deterministic Conversation Intelligence (PRD 07.4).
// Pattern-matches a transcript into signals/commitments/qualification evidence.
// Produces the same ConversationExtraction shape a Claude provider would,
// so the rest of the system is provider-agnostic.

import type {
  AgentProvider,
  ConversationExtraction,
  ExtractedCommitment,
  ExtractedQualEvidence,
  ExtractedSignal,
  ExtractedStakeholderUpdate,
} from "./types";

interface Rule {
  // matches if ALL of `all` present, or ANY of `any` present
  all?: string[];
  any?: string[];
  emit: (matchedLine: string) => Partial<ExtractedSignal> & {
    signalType: string;
    signalFamily: string;
    title: string;
  };
}

const has = (text: string, term: string) => text.toLowerCase().includes(term.toLowerCase());
const anyOf = (text: string, terms: string[]) => terms.some((t) => has(text, t));
const allOf = (text: string, terms: string[]) => terms.every((t) => has(text, t));

// Signal extraction rules. Order matters only for readability; all are evaluated.
const SIGNAL_RULES: Rule[] = [
  {
    any: ["takes two days", "manual", "takes too long", "spend hours", "painful", "frustrat", "bottleneck"],
    emit: (l) => ({
      signalType: "PAIN_CONFIRMED",
      signalFamily: "QUALIFICATION",
      title: "Pain confirmed",
      description: "Buyer described a concrete operational pain.",
      evidenceText: l,
      impactDirection: "POSITIVE",
      impactMagnitude: "HIGH",
      confidence: 0.91,
    }),
  },
  {
    any: ["vp of sales", "vp sales", "cro", "chief revenue", "economic buyer", "budget owner", "she owns the budget", "he owns the budget"],
    emit: (l) => ({
      signalType: "ECONOMIC_BUYER_ENGAGED",
      signalFamily: "QUALIFICATION",
      title: "Economic buyer engaged",
      description: "An economic-buyer-level stakeholder participated.",
      evidenceText: l,
      impactDirection: "POSITIVE",
      impactMagnitude: "HIGH",
      confidence: 0.84,
    }),
  },
  {
    any: ["decision criteria", "evaluating on", "must have", "requirements are", "we need it to", "integration with"],
    emit: (l) => ({
      signalType: "DECISION_CRITERIA_CONFIRMED",
      signalFamily: "QUALIFICATION",
      title: "Decision criteria discussed",
      description: "Buyer stated evaluation criteria.",
      evidenceText: l,
      impactDirection: "POSITIVE",
      impactMagnitude: "MEDIUM",
      confidence: 0.8,
    }),
  },
  {
    all: ["next", "tuesday"],
    emit: (l) => ({
      signalType: "MUTUAL_NEXT_STEP_CONFIRMED",
      signalFamily: "COMMITMENT",
      title: "Mutual next step confirmed",
      description: "Both sides agreed to a dated next step.",
      evidenceText: l,
      impactDirection: "POSITIVE",
      impactMagnitude: "MEDIUM",
      confidence: 0.86,
    }),
  },
  {
    any: ["schedule", "let's set up", "book a", "next meeting", "follow-up call", "technical review", "demo next"],
    emit: (l) => ({
      signalType: "NEXT_MEETING_BOOKED",
      signalFamily: "ENGAGEMENT",
      title: "Next meeting booked",
      description: "A future meeting was agreed.",
      evidenceText: l,
      impactDirection: "POSITIVE",
      impactMagnitude: "MEDIUM",
      confidence: 0.82,
    }),
  },
  {
    any: ["budget isn't", "no budget", "not sure about budget", "budget not", "can't commit budget", "budget unconfirmed", "haven't allocated"],
    emit: (l) => ({
      signalType: "NO_BUDGET_SIGNAL",
      signalFamily: "QUALIFICATION",
      title: "Budget unconfirmed",
      description: "Budget was not confirmed.",
      evidenceText: l,
      impactDirection: "NEGATIVE",
      impactMagnitude: "MEDIUM",
      confidence: 0.78,
    }),
  },
  {
    any: ["competitor", "we also looked at", "comparing you to", "incumbent", "currently use", "alternative is", "salesforce", "hubspot", "gong"],
    emit: (l) => ({
      signalType: "COMPETITOR_NAMED",
      signalFamily: "COMPETITIVE",
      title: "Competitor referenced",
      description: "A competitor or incumbent was mentioned.",
      evidenceText: l,
      impactDirection: "NEGATIVE",
      impactMagnitude: "MEDIUM",
      confidence: 0.74,
    }),
  },
  {
    any: ["too expensive", "price is high", "discount", "pricing concern", "cost is a", "pushback on price"],
    emit: (l) => ({
      signalType: "PRICE_PUSHBACK",
      signalFamily: "RISK",
      title: "Price pushback",
      description: "Buyer raised a pricing objection.",
      evidenceText: l,
      impactDirection: "NEGATIVE",
      impactMagnitude: "MEDIUM",
      confidence: 0.77,
    }),
  },
  {
    any: ["urgent", "by end of quarter", "deadline", "board meeting", "need this before", "cost of delay", "every week we wait"],
    emit: (l) => ({
      signalType: "BUYER_URGENCY_INCREASED",
      signalFamily: "MOMENTUM",
      title: "Buyer urgency increased",
      description: "Buyer expressed time pressure / compelling event.",
      evidenceText: l,
      impactDirection: "POSITIVE",
      impactMagnitude: "HIGH",
      confidence: 0.83,
    }),
  },
  {
    any: ["security review", "infosec", "soc 2", "security team needs"],
    emit: (l) => ({
      signalType: "SECURITY_REVIEW_RISK",
      signalFamily: "RISK",
      title: "Security review risk",
      description: "A security review may delay the deal.",
      evidenceText: l,
      impactDirection: "NEGATIVE",
      impactMagnitude: "MEDIUM",
      confidence: 0.72,
    }),
  },
  {
    any: ["procurement", "legal will need", "contract review", "redline", "paper process"],
    emit: (l) => ({
      signalType: "PAPER_PROCESS_IDENTIFIED",
      signalFamily: "QUALIFICATION",
      title: "Paper process identified",
      description: "Legal/procurement process surfaced.",
      evidenceText: l,
      impactDirection: "NEUTRAL",
      impactMagnitude: "MEDIUM",
      confidence: 0.7,
    }),
  },
];

function splitLines(text: string): string[] {
  return text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function matchSignals(text: string): ExtractedSignal[] {
  const lines = splitLines(text);
  const seen = new Set<string>();
  const out: ExtractedSignal[] = [];
  for (const line of lines) {
    for (const rule of SIGNAL_RULES) {
      const matched =
        (rule.all && allOf(line, rule.all)) || (rule.any && anyOf(line, rule.any));
      if (!matched) continue;
      const partial = rule.emit(line);
      if (seen.has(partial.signalType)) continue; // dedupe per type
      seen.add(partial.signalType);
      out.push({
        signalType: partial.signalType,
        signalFamily: partial.signalFamily,
        title: partial.title,
        description: partial.description ?? "",
        evidenceText: partial.evidenceText ?? line,
        impactDirection: partial.impactDirection ?? "NEUTRAL",
        impactMagnitude: partial.impactMagnitude ?? "MEDIUM",
        confidence: partial.confidence ?? 0.7,
      });
    }
  }
  return out;
}

function matchCommitments(text: string): ExtractedCommitment[] {
  const lines = splitLines(text);
  const out: ExtractedCommitment[] = [];
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (anyOf(lower, ["i'll send", "we'll send", "i will send", "i'll share", "let me get you", "we'll provide"])) {
      out.push({
        ownerSide: "SELLER",
        description: line,
        confidence: 0.82,
      });
    }
    if (anyOf(lower, ["i'll invite", "i'll bring", "i'll loop in", "i'll get", "we'll review internally", "i'll check with", "i'll confirm"])) {
      out.push({
        ownerSide: "BUYER",
        description: line,
        confidence: 0.8,
      });
    }
  }
  return out;
}

function buildQualEvidence(signals: ExtractedSignal[]): ExtractedQualEvidence[] {
  const map: Record<string, ExtractedQualEvidence> = {};
  const add = (
    evidenceType: ExtractedQualEvidence["evidenceType"],
    summary: string,
    status: ExtractedQualEvidence["status"],
    confidence: number,
  ) => {
    map[evidenceType] = { framework: "MEDDPICC", evidenceType, summary, status, confidence };
  };
  for (const s of signals) {
    if (s.signalType === "PAIN_CONFIRMED") add("IDENTIFIED_PAIN", s.description, "STRONG", s.confidence);
    if (s.signalType === "ECONOMIC_BUYER_ENGAGED") add("ECONOMIC_BUYER", "Economic buyer engaged in conversation.", "PRESENT", s.confidence);
    if (s.signalType === "DECISION_CRITERIA_CONFIRMED") add("DECISION_CRITERIA", "Buyer stated evaluation criteria.", "PRESENT", s.confidence);
    if (s.signalType === "PAPER_PROCESS_IDENTIFIED") add("PAPER_PROCESS", "Legal/procurement process surfaced.", "WEAK", s.confidence);
    if (s.signalType === "COMPETITOR_NAMED") add("COMPETITION", "Competitor named by buyer.", "PRESENT", s.confidence);
  }
  return Object.values(map);
}

function buildStakeholderUpdates(text: string): ExtractedStakeholderUpdate[] {
  const out: ExtractedStakeholderUpdate[] = [];
  if (anyOf(text, ["vp of sales", "vp sales", "cro", "chief revenue"])) {
    out.push({ suggestedRole: "ECONOMIC_BUYER", confidence: 0.73, requiresApproval: true });
  }
  if (anyOf(text, ["champion", "i'll push this internally", "i want to make this happen", "i'll sell it internally"])) {
    out.push({ suggestedRole: "CHAMPION", confidence: 0.68, requiresApproval: true });
  }
  return out;
}

function scoreNextStep(text: string, signals: ExtractedSignal[]): number {
  let score = 35;
  if (signals.some((s) => s.signalType === "MUTUAL_NEXT_STEP_CONFIRMED")) score += 40;
  else if (signals.some((s) => s.signalType === "NEXT_MEETING_BOOKED")) score += 25;
  if (allOf(text, ["tuesday"]) || /\b(monday|wednesday|thursday|friday)\b/i.test(text)) score += 10;
  if (anyOf(text, ["agenda", "who should join", "invite", "bring"])) score += 8;
  return Math.min(100, score);
}

function buildSummary(signals: ExtractedSignal[], commitments: ExtractedCommitment[]): string {
  const pos = signals.filter((s) => s.impactDirection === "POSITIVE").length;
  const neg = signals.filter((s) => s.impactDirection === "NEGATIVE").length;
  const headline = signals.find((s) => s.signalType === "PAIN_CONFIRMED")
    ? "Buyer confirmed a concrete pain"
    : signals.length
      ? "Conversation produced new deal evidence"
      : "Conversation processed; limited explicit signal";
  return `${headline}. Extracted ${signals.length} signal(s) (${pos} positive, ${neg} negative) and ${commitments.length} commitment(s).`;
}

export class MockProvider implements AgentProvider {
  name = "mock_conversation_intelligence";

  async extractFromTranscript(input: {
    transcriptText: string;
    dealName: string;
    currentStage: string;
  }): Promise<ConversationExtraction> {
    const text = input.transcriptText;
    const signals = matchSignals(text);
    const commitments = matchCommitments(text);
    const qualificationEvidence = buildQualEvidence(signals);
    const stakeholderUpdates = buildStakeholderUpdates(text);
    const nextStepQuality = scoreNextStep(text, signals);
    return {
      summary: buildSummary(signals, commitments),
      signals,
      commitments,
      qualificationEvidence,
      stakeholderUpdates,
      nextStepQuality,
    };
  }
}

// Single shared provider instance. To go live with Claude, replace this export
// (or branch on process.env.AGENT_PROVIDER) with a ClaudeProvider implementing
// the same AgentProvider interface.
export const agentProvider: AgentProvider = new MockProvider();
