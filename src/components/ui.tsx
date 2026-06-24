// Shared presentational primitives.
import React from "react";

export function fmtMoney(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const scoreColor = (n: number, invert = false) => {
  const good = invert ? n <= 33 : n >= 67;
  const bad = invert ? n >= 67 : n <= 33;
  if (good) return "text-emerald-300 bg-emerald-500/10 border-emerald-500/30";
  if (bad) return "text-rose-300 bg-rose-500/10 border-rose-500/30";
  return "text-amber-300 bg-amber-500/10 border-amber-500/30";
};

export function ScoreChip({ label, value, invert = false, onClick }: { label: string; value: number; invert?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`flex flex-col items-start rounded-lg border px-3 py-2 text-left transition ${scoreColor(value, invert)} ${onClick ? "hover:brightness-125 cursor-pointer" : "cursor-default"}`}
    >
      <span className="text-[10px] uppercase tracking-wider opacity-70">{label}</span>
      <span className="text-xl font-semibold tabular-nums">{value}</span>
    </button>
  );
}

const badgeColors: Record<string, string> = {
  Risk: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  Stage: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  "Follow-up": "bg-sky-500/15 text-sky-300 border-sky-500/30",
  Forecast: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Market: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Commitment: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Stakeholder: "bg-teal-500/15 text-teal-300 border-teal-500/30",
};

// Display "Stakeholder" badge as "Contact" to match HubSpot vocabulary.
const badgeLabels: Record<string, string> = { Stakeholder: "Contact" };

export function badgeLabel(kind: string): string {
  return badgeLabels[kind] ?? kind;
}

export function Badge({ kind }: { kind: string }) {
  return (
    <span className={`rounded border px-2 py-0.5 text-[11px] font-medium ${badgeColors[kind] ?? "bg-edge text-gray-300 border-edge"}`}>
      {badgeLabel(kind)}
    </span>
  );
}

export function Confidence({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
      <span className="relative h-1.5 w-16 overflow-hidden rounded-full bg-edge">
        <span
          className={`absolute inset-y-0 left-0 rounded-full ${pct >= 80 ? "bg-emerald-400" : pct >= 60 ? "bg-amber-400" : "bg-rose-400"}`}
          style={{ width: `${pct}%` }}
        />
      </span>
      {pct}% confidence
    </span>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-edge bg-panel ${className}`}>{children}</div>;
}

export function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">{children}</h2>
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </div>
  );
}

// Buying roles displayed using HubSpot's "Buying role" vocabulary.
// (Internal codes stay PRD/MEDDPICC; only the label shown to users changes.)
const BUYING_ROLE_LABELS: Record<string, string> = {
  ECONOMIC_BUYER: "Decision maker",
  CHAMPION: "Champion",
  BLOCKER: "Blocker",
  TECHNICAL_BUYER: "Influencer", // technical evaluator
  LEGAL: "Legal & compliance",
  PROCUREMENT: "Budget holder",
  INFLUENCER: "Influencer",
  END_USER: "End user",
  UNKNOWN: "Other",
};

export function buyingRoleLabel(code: string): string {
  return BUYING_ROLE_LABELS[code] ?? code.replace(/_/g, " ").toLowerCase();
}

export const OVERRIDE_REASONS: { code: string; label: string }[] = [
  { code: "MISSING_ECONOMIC_BUYER", label: "Missing economic buyer" },
  { code: "WEAK_NEXT_STEP", label: "Next step is weak" },
  { code: "NO_BUDGET_CONFIRMATION", label: "Budget not confirmed" },
  { code: "WRONG_STAKEHOLDER_ROLE", label: "Wrong stakeholder role" },
  { code: "CUSTOMER_TIMING_WRONG", label: "Customer timing is wrong" },
  { code: "COMPETITOR_MISCLASSIFIED", label: "Competitor risk underestimated" },
  { code: "SENTIMENT_OVERWEIGHTED", label: "Agent overweighted sentiment" },
  { code: "OUTSIDE_SIGNAL_IRRELEVANT", label: "Outside signal irrelevant" },
  { code: "OTHER", label: "Other" },
];
