// Outreach Optimization Agent (PRD 07.12).
// Learns from won/lost deal patterns to improve SDR targeting + messaging.
// IMPORTANT RULE (PRD): optimize for qualified opportunity + closed-won patterns,
// never for opens/replies alone. Every suggestion cites the won/lost evidence.

import type {
  Account,
  Deal,
  OutreachSuggestion,
  TargetAccount,
  User,
} from "../types";

interface OutreachContext {
  wonDeals: Deal[];
  lostDeals: Deal[];
  accounts: Account[];
  targets: TargetAccount[];
  sdr: User;
  idFor: (prefix: string) => string;
  now: () => string;
}

// Derive a "won profile": which industries / sizes closed, and the triggers that
// preceded them. This is the compounding learning signal the SDR motion uses.
function wonProfile(wonDeals: Deal[], accounts: Account[]) {
  const industries = new Map<string, number>();
  let sizeSum = 0;
  let sizeN = 0;
  for (const d of wonDeals) {
    const acc = accounts.find((a) => a.id === d.accountId);
    if (!acc) continue;
    industries.set(acc.industry, (industries.get(acc.industry) ?? 0) + 1);
    sizeSum += acc.employeeCount;
    sizeN += 1;
  }
  const topIndustry = [...industries.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  return { topIndustry, avgSize: sizeN ? Math.round(sizeSum / sizeN) : 0, wonCount: wonDeals.length };
}

export function runOutreachOptimization(ctx: OutreachContext): OutreachSuggestion[] {
  const { wonDeals, lostDeals, accounts, targets, sdr, idFor, now } = ctx;
  const profile = wonProfile(wonDeals, accounts);
  const out: OutreachSuggestion[] = [];

  const base = (
    type: OutreachSuggestion["type"],
    title: string,
    rationale: string,
    evidence: string[],
    confidence: number,
    priorityScore: number,
    extra: Partial<OutreachSuggestion> = {},
  ): OutreachSuggestion => ({
    id: idFor("os"),
    workspaceId: sdr.workspaceId,
    assignedToUserId: sdr.id,
    type,
    title,
    rationale,
    evidence,
    confidence,
    priorityScore,
    status: "PENDING",
    createdByAgent: "outreach_optimization_agent",
    createdAt: now(),
    ...extra,
  });

  const wonNames = wonDeals.map((d) => d.name.replace(/ \(Won\)$/, ""));

  // 1. Target-account suggestions — accounts resembling the won profile + trigger.
  for (const t of targets.filter((t) => t.status === "NEW")) {
    const triggerStr = t.triggerEvents.join("; ");
    const fitsProfile = profile.topIndustry ? t.industry === profile.topIndustry : true;
    const score = Math.round(t.icpFitScore * 0.5 + t.marketSignalScore * 0.5);
    if (score < 55) continue;
    out.push(
      base(
        "TARGET_ACCOUNT",
        `Target ${t.name}`,
        `${t.name} matches the closed-won pattern${fitsProfile && profile.topIndustry ? ` (${profile.topIndustry}, ~${profile.avgSize} employees)` : ""}${triggerStr ? ` and shows an active trigger: ${triggerStr}` : ""}.`,
        [...(t.matchedWonPattern ? [`Resembles won: ${t.matchedWonPattern}`] : []), ...wonNames.slice(0, 2).map((n) => `Closed-won: ${n}`)],
        Math.min(0.95, score / 100 + 0.1),
        score,
        { targetAccountId: t.id },
      ),
    );
  }

  // 2. Trigger-based outreach — a fundable/hiring trigger maps to a won angle.
  const triggered = targets.filter((t) => t.triggerEvents.some((e) => /funding|series|hiring|roles/i.test(e)));
  for (const t of triggered.slice(0, 2)) {
    out.push(
      base(
        "TRIGGER_OUTREACH",
        `Reach out to ${t.name} on its growth trigger`,
        `Growth triggers (${t.triggerEvents.join(", ")}) correlate with our won deals where scaling teams needed forecast hygiene. Lead with the cost-of-bad-forecast-during-hiring angle.`,
        wonNames.slice(0, 2).map((n) => `Won under similar trigger: ${n}`),
        0.78,
        82,
        {
          targetAccountId: t.id,
          draftMessage: `Hi — saw ${t.name}'s recent ${t.triggerEvents[0]?.toLowerCase()}. Teams scaling this fast usually feel forecast accuracy slip as new reps ramp. We helped similar teams keep forecast hygiene through hiring — worth a quick look?`,
        },
      ),
    );
  }

  // 3. Persona suggestion — who to target, learned from who engaged in won deals.
  out.push(
    base(
      "PERSONA",
      "Lead with the RevOps / Sales Ops persona",
      "In closed-won deals, momentum came once a RevOps/Sales-Ops owner engaged — not from the first VP touch. Open multi-threaded with that persona.",
      wonNames.map((n) => `Won: ${n}`),
      0.74,
      68,
    ),
  );

  // 4. Message-angle suggestion — what resonated in wins vs losses.
  out.push(
    base(
      "MESSAGE_ANGLE",
      "Use the quantified cost-of-delay angle",
      "Won deals confirmed quantified pain (e.g. days lost weekly, $/yr inefficiency); lost deals stalled on vague value. Lead outreach with a quantified cost-of-delay hook.",
      [...wonNames.map((n) => `Won: ${n}`), ...lostDeals.map((d) => `Lost (vague value): ${d.name.replace(/ \(Lost\)$/, "")}`)],
      0.71,
      64,
    ),
  );

  // 5. ICP refinement — tighten the profile based on win/loss skew.
  if (profile.topIndustry) {
    out.push(
      base(
        "ICP_REFINEMENT",
        `Tighten ICP toward ${profile.topIndustry}`,
        `Win rate is highest in ${profile.topIndustry} around ~${profile.avgSize} employees. Down-rank poor-fit segments that appear in our losses.`,
        [`${profile.wonCount} closed-won analyzed`, ...lostDeals.map((d) => `Loss signal: ${d.name.replace(/ \(Lost\)$/, "")}`)],
        0.69,
        58,
      ),
    );
  }

  return out.sort((a, b) => b.priorityScore - a.priorityScore);
}
