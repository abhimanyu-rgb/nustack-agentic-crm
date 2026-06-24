import { NextRequest, NextResponse } from "next/server";
import { db, getUser } from "@/lib/store";
import { dealSummary } from "@/lib/views";
import { currentUser, canSeeAllTeam } from "@/lib/currentUser";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const me = await currentUser();
  const seesAll = canSeeAllTeam(me.role);
  const ownerParam = req.nextUrl.searchParams.get("owner");

  // AEs are locked to their own deals. All-team roles may filter by owner (drill-down).
  const ownerFilter = seesAll ? ownerParam : me.id;
  const deals = db.deals.filter((d) => !ownerFilter || d.ownerId === ownerFilter);

  return NextResponse.json({
    deals: deals.map(dealSummary),
    scope: seesAll ? (ownerParam ? "owner" : "team") : "self",
    ownerName: ownerFilter ? getUser(ownerFilter)?.name : undefined,
  });
}
