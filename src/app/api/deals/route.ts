import { NextRequest, NextResponse } from "next/server";
import { db, getUser, getStage } from "@/lib/store";
import { dealSummary } from "@/lib/views";
import { currentUser, canSeeAllTeam } from "@/lib/currentUser";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const me = await currentUser();
  const seesAll = canSeeAllTeam(me.role);
  const sp = req.nextUrl.searchParams;
  const ownerParam = sp.get("owner");
  const riskParam = sp.get("risk"); // "high" -> risk >= 60
  const stageParam = sp.get("stage"); // stageId
  const forecastParam = sp.get("forecast"); // e.g. COMMIT

  // AEs are locked to their own deals. All-team roles may filter by owner (drill-down).
  const ownerFilter = seesAll ? ownerParam : me.id;
  let deals = db.deals.filter((d) => !ownerFilter || d.ownerId === ownerFilter);
  if (riskParam === "high") deals = deals.filter((d) => d.status === "OPEN" && d.scores.risk >= 60);
  if (stageParam) deals = deals.filter((d) => d.stageId === stageParam);
  if (forecastParam) deals = deals.filter((d) => d.forecastCategory === forecastParam);

  // Build a human label describing the active filter (for the page heading).
  const filters: string[] = [];
  if (riskParam === "high") filters.push("at risk");
  if (stageParam) filters.push(getStage(stageParam)?.name ?? "stage");
  if (forecastParam) filters.push(forecastParam.toLowerCase());

  return NextResponse.json({
    deals: deals.map(dealSummary),
    scope: seesAll ? (ownerParam ? "owner" : "team") : "self",
    ownerName: ownerFilter ? getUser(ownerFilter)?.name : undefined,
    filterLabel: filters.length ? filters.join(", ") : undefined,
  });
}
