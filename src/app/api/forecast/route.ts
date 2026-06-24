import { NextResponse } from "next/server";
import { forecastView } from "@/lib/views";
import { currentUser, canSeeAllTeam } from "@/lib/currentUser";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = await currentUser();
  if (!canSeeAllTeam(me.role)) {
    return NextResponse.json({ error: "Access not allowed" }, { status: 403 });
  }
  return NextResponse.json(forecastView());
}
