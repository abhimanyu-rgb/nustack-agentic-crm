import { NextResponse } from "next/server";
import { commandView } from "@/lib/views";
import { currentUser, canSeeAllTeam } from "@/lib/currentUser";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = await currentUser();
  if (!canSeeAllTeam(me.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json(commandView());
}
