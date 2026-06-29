// Lightweight, explainable deal scoring over real DB data (Step 1).
// Pure function so it can run in API routes. Returns health + risk (0-100) with
// the factors that produced them, so the UI can show "why".
// (The richer agentic scoring in src/lib/agents/ lands when Step 2 wires real
// signals from email/calendar/transcripts.)

interface ScoreInput {
  stage: string;
  amount: number;
  forecastCategory: string;
  closeDate?: Date | string | null;
  contactsCount: number;        // buying committee size
  hasEconomicBuyer: boolean;    // a contact with ECONOMIC_BUYER role
  lastActivityAt?: Date | string | null;
  now?: Date;
}

export interface Factor { label: string; weight: number }
export interface DealScore {
  health: number;
  risk: number;
  healthFactors: Factor[];
  riskFactors: Factor[];
}

const STAGE_PROGRESS: Record<string, number> = {
  Prospecting: 10, Qualified: 25, Discovery: 40, "Solution Fit": 55,
  "Business Case": 70, Negotiation: 82, "Procurement / Legal": 92,
  "Closed Won": 100, "Closed Lost": 0,
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const daysBetween = (a: Date, b: Date) => Math.floor((a.getTime() - b.getTime()) / 864e5);

export function scoreDeal(input: ScoreInput): DealScore {
  const now = input.now ?? new Date();
  const healthFactors: Factor[] = [];
  const riskFactors: Factor[] = [];

  // --- Health ---
  let health = 40;
  const stageProg = STAGE_PROGRESS[input.stage] ?? 30;
  const stageContribution = Math.round(stageProg * 0.3);
  health += stageContribution;
  healthFactors.push({ label: `Stage: ${input.stage}`, weight: stageContribution });

  if (input.hasEconomicBuyer) { health += 12; healthFactors.push({ label: "Decision maker engaged", weight: 12 }); }
  if (input.contactsCount >= 2) { health += 8; healthFactors.push({ label: "Multi-threaded", weight: 8 }); }
  if (input.forecastCategory === "COMMIT") { health += 6; healthFactors.push({ label: "Forecast: Commit", weight: 6 }); }

  // --- Risk (higher = worse) ---
  let risk = 20;

  // Single-threaded / no committee.
  if (input.contactsCount === 0) { risk += 22; riskFactors.push({ label: "No contacts on deal", weight: 22 }); }
  else if (input.contactsCount === 1) { risk += 14; riskFactors.push({ label: "Single-threaded", weight: 14 }); }

  if (!input.hasEconomicBuyer) { risk += 14; riskFactors.push({ label: "No decision maker identified", weight: 14 }); }

  // Engagement decay: days since last activity.
  if (input.lastActivityAt) {
    const idle = daysBetween(now, new Date(input.lastActivityAt));
    if (idle >= 21) { risk += 20; riskFactors.push({ label: `No activity in ${idle} days`, weight: 20 }); }
    else if (idle >= 10) { risk += 10; riskFactors.push({ label: `Quiet for ${idle} days`, weight: 10 }); }
    else { health += 6; healthFactors.push({ label: "Recently active", weight: 6 }); }
  } else {
    risk += 12; riskFactors.push({ label: "No activity logged", weight: 12 });
  }

  // Close date in the past but still open.
  if (input.closeDate) {
    const d = daysBetween(new Date(input.closeDate), now);
    if (d < 0) { risk += 16; riskFactors.push({ label: "Close date is in the past", weight: 16 }); }
  }

  // Commit deal with high risk is extra concerning.
  if (input.forecastCategory === "COMMIT" && risk >= 50) {
    risk += 6; riskFactors.push({ label: "Commit deal under risk", weight: 6 });
  }

  return { health: clamp(health), risk: clamp(risk), healthFactors, riskFactors };
}
