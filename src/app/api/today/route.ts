import { NextResponse } from "next/server";
import { todayQueue } from "@/lib/views";
import { db } from "@/lib/store";
import { currentUser, canSeeAllTeam } from "@/lib/currentUser";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = await currentUser();
  const seesAll = canSeeAllTeam(me.role);

  // AEs see only actions assigned to them; managers/admins see the whole team's.
  let queue = todayQueue();
  if (!seesAll) queue = queue.filter((a) => a!.assignedToUserId === me.id);

  // Revenue at risk reflects the user's scope.
  const open = db.deals.filter((d) => d.status === "OPEN" && (seesAll || d.ownerId === me.id));
  const revenueAtRisk = open.filter((d) => d.scores.risk >= 60).reduce((n, d) => n + d.amount, 0);

  return NextResponse.json({
    queue,
    header: {
      queueCount: queue.length,
      revenueAtRisk,
      user: me.name,
      scope: seesAll ? "team" : "self",
    },
  });
}
