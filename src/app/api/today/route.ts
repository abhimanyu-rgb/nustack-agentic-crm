import { NextResponse } from "next/server";
import { todayQueue } from "@/lib/views";
import { db } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const open = db.deals.filter((d) => d.status === "OPEN");
  const revenueAtRisk = open.filter((d) => d.scores.risk >= 60).reduce((n, d) => n + d.amount, 0);
  return NextResponse.json({
    queue: todayQueue(),
    header: {
      queueCount: db.actions.filter((a) => a.status === "PENDING").length,
      revenueAtRisk,
      user: db.users.find((u) => u.role === "AE")?.name,
    },
  });
}
