// Command Bar intent matcher (PRD 09.6).
// Deterministic NL→structured-query router. Returns cited, actionable cards —
// never plain prose. A Claude-backed parser can replace `matchIntent` later;
// the CommandResult contract stays the same so the UI/API don't change.

import {
  db,
  getAccount,
  getStage,
  getUser,
  dealJudgments,
  dealStakeholders,
} from "../store";
import type { Deal, User } from "../types";

export interface CommandCard {
  title: string;
  subtitle?: string;
  dealId?: string;
  href?: string;
  metrics?: { label: string; value: string; tone?: "good" | "bad" | "neutral" }[];
  evidence?: string[];
}

export interface CommandResult {
  intent: string;
  query: string;
  headline: string;
  cards: CommandCard[];
}

const has = (q: string, ...terms: string[]) => terms.some((t) => q.includes(t));

function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

// Deals visible to the asking user (AEs are scoped to their own).
function scopedDeals(me: User): Deal[] {
  const seesAll = me.role === "SALES_MANAGER" || me.role === "REVOPS" || me.role === "ADMIN" || me.role === "EXECUTIVE_VIEWER";
  return db.deals.filter((d) => seesAll || d.ownerId === me.id);
}

function dealCard(d: Deal, extra: Partial<CommandCard> = {}): CommandCard {
  return {
    title: d.name,
    subtitle: `${getAccount(d.accountId)?.name ?? ""} · ${getStage(d.stageId)?.name ?? ""} · ${fmtMoney(d.amount)} · ${d.forecastCategory}`,
    dealId: d.id,
    href: `/deals/${d.id}`,
    ...extra,
  };
}

export function runCommandBar(rawQuery: string, me: User): CommandResult {
  const q = rawQuery.toLowerCase().trim();
  const open = scopedDeals(me).filter((d) => d.status === "OPEN");
  const base = { query: rawQuery };

  // 1. "deals that got riskier / at risk / risky"
  if (has(q, "risk", "riskier", "at risk", "slipping")) {
    const risky = open.filter((d) => d.scores.risk >= 55).sort((a, b) => b.scores.risk - a.scores.risk);
    return {
      ...base,
      intent: "DEALS_AT_RISK",
      headline: `${risky.length} deal(s) carrying elevated risk${me.role === "AE" ? " in your pipeline" : ""}.`,
      cards: risky.map((d) =>
        dealCard(d, {
          metrics: [
            { label: "Risk", value: String(d.scores.risk), tone: "bad" },
            { label: "Amount", value: fmtMoney(d.amount) },
          ],
          evidence: db.signals
            .filter((s) => s.dealId === d.id && s.signalFamily === "RISK" && s.status === "ACTIVE")
            .map((s) => s.title),
        }),
      ),
    };
  }

  // 2. "commit deals with no economic buyer" / "missing economic buyer"
  if (has(q, "economic buyer", "no eb", "decision maker") || (has(q, "commit") && has(q, "no", "missing", "without"))) {
    const commit = open.filter((d) => (has(q, "commit") ? d.forecastCategory === "COMMIT" : true));
    const noEB = commit.filter((d) => !dealStakeholders(d.id).some((s) => s.isEconomicBuyer));
    return {
      ...base,
      intent: "MISSING_ECONOMIC_BUYER",
      headline: `${noEB.length} deal(s) lack an engaged economic buyer (decision maker).`,
      cards: noEB.map((d) =>
        dealCard(d, {
          metrics: [{ label: "Buying group", value: String(d.scores.buyingGroupCoverage), tone: d.scores.buyingGroupCoverage < 50 ? "bad" : "neutral" }],
          evidence: ["No stakeholder tagged as Decision maker"],
        }),
      ),
    };
  }

  // 3. "why did X move / change" — explain a deal's recent score movement
  const whyMatch = q.match(/why (?:did|is|has) (.+?)(?: move| moved| change| changed| best case| commit|\?|$)/);
  if (has(q, "why") && whyMatch) {
    const name = whyMatch[1].trim();
    const deal = open.find((d) => d.name.toLowerCase().includes(name) || getAccount(d.accountId)?.name.toLowerCase().includes(name));
    if (deal) {
      const judgments = dealJudgments(deal.id);
      const latest = judgments.slice(-5);
      return {
        ...base,
        intent: "EXPLAIN_DEAL",
        headline: `Why ${deal.name} is where it is:`,
        cards: [
          dealCard(deal, {
            metrics: [
              { label: "Health", value: String(deal.scores.dealHealth), tone: deal.scores.dealHealth >= 67 ? "good" : "neutral" },
              { label: "Forecast conf.", value: String(deal.scores.forecastConfidence) },
              { label: "Risk", value: String(deal.scores.risk), tone: deal.scores.risk >= 55 ? "bad" : "neutral" },
            ],
            evidence: latest.length
              ? latest.map((j) => `${j.judgmentType.replace(/_/g, " ").toLowerCase()}: ${j.rationale}`)
              : db.signals.filter((s) => s.dealId === deal.id && s.status === "ACTIVE").slice(0, 4).map((s) => `${s.title} — ${s.description}`),
          }),
        ],
      };
    }
  }

  // 4. "weak next step" / "no next step"
  if (has(q, "next step", "next-step")) {
    const weak = open.filter((d) => d.scores.nextStepQuality < 50).sort((a, b) => a.scores.nextStepQuality - b.scores.nextStepQuality);
    return {
      ...base,
      intent: "WEAK_NEXT_STEP",
      headline: `${weak.length} deal(s) with a weak or missing next step.`,
      cards: weak.map((d) => dealCard(d, { metrics: [{ label: "Next-step quality", value: String(d.scores.nextStepQuality), tone: "bad" }] })),
    };
  }

  // 5. "rejected / overridden stage proposals" / "override patterns"
  if (has(q, "rejected", "override", "overridden", "overrode")) {
    const overrides = db.overrides.filter((o) => {
      const d = db.deals.find((x) => x.id === o.dealId);
      return d && (me.role !== "AE" || d.ownerId === me.id);
    });
    return {
      ...base,
      intent: "OVERRIDES",
      headline: `${overrides.length} correction(s) of the agent on record.`,
      cards: overrides.map((o) => {
        const d = db.deals.find((x) => x.id === o.dealId);
        return {
          title: d?.name ?? o.dealId,
          subtitle: `${o.targetObjectType}: ${o.originalAgentValue} → ${o.userCorrectedValue}`,
          dealId: o.dealId,
          href: d ? `/deals/${o.dealId}` : undefined,
          evidence: [o.overrideReasonCode.replace(/_/g, " ").toLowerCase(), ...(o.overrideReasonNote ? [o.overrideReasonNote] : [])],
        };
      }),
    };
  }

  // 6. "funding" / "new funding and open opportunities" / market signals
  if (has(q, "funding", "raised", "series", "market", "news")) {
    const marketDeals = open.filter((d) => db.signals.some((s) => s.dealId === d.id && s.signalFamily === "MARKET" && s.status === "ACTIVE"));
    return {
      ...base,
      intent: "MARKET_SIGNALS",
      headline: `${marketDeals.length} open deal(s) with a relevant market signal.`,
      cards: marketDeals.map((d) =>
        dealCard(d, {
          evidence: db.signals.filter((s) => s.dealId === d.id && s.signalFamily === "MARKET" && s.status === "ACTIVE").map((s) => `${s.title} (relevance ${s.relevanceScore ?? "—"})`),
        }),
      ),
    };
  }

  // 7. "what should I do" / "top actions" / "my queue"
  if (has(q, "what should i do", "top action", "my queue", "priorit", "focus")) {
    const acts = db.actions
      .filter((a) => a.status === "PENDING" && (me.role !== "AE" || a.assignedToUserId === me.id))
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 5);
    return {
      ...base,
      intent: "TOP_ACTIONS",
      headline: `Your ${acts.length} highest-leverage action(s) right now.`,
      cards: acts.map((a) => ({
        title: a.title,
        subtitle: a.whyNow,
        dealId: a.dealId,
        href: a.dealId ? `/deals/${a.dealId}` : "/",
        metrics: [{ label: "Priority", value: String(a.priorityScore) }],
        evidence: a.sourceSignalIds.map((id) => db.signals.find((s) => s.id === id)?.title).filter(Boolean) as string[],
      })),
    };
  }

  // Fallback: no matched intent.
  return {
    ...base,
    intent: "UNKNOWN",
    headline: "I couldn't map that to a query yet. Try one of the examples.",
    cards: [],
  };
}

// Suggested prompts shown in the empty Command Bar (PRD 09.6 examples).
export const COMMAND_SUGGESTIONS = [
  "Show deals that got riskier this week",
  "Which commit deals have no economic buyer?",
  "Why did Globex change?",
  "Deals with a weak next step",
  "Show rejected stage proposals",
  "Find accounts with new funding and open opportunities",
  "What should I focus on?",
];
