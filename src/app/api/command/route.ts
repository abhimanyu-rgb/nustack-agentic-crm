import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const LEADERSHIP = new Set(["ADMIN", "SALES_MANAGER", "REVOPS"]);
const STAGE_ORDER = ["Prospecting", "Qualified", "Discovery", "Solution Fit", "Business Case", "Negotiation", "Procurement / Legal"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (!LEADERSHIP.has(user.role)) return NextResponse.json({ error: "Access not allowed" }, { status: 403 });

  const ws = user.workspaceId;
  const [aes, deals] = await Promise.all([
    prisma.user.findMany({ where: { workspaceId: ws, role: "AE" } }),
    prisma.deal.findMany({ where: { workspaceId: ws } }),
  ]);
  const open = deals.filter((d) => d.status === "OPEN");
  const avg = (n: number[]) => (n.length ? Math.round(n.reduce((a, b) => a + b, 0) / n.length) : 0);

  const perAE = aes.map((ae) => {
    const mine = open.filter((d) => d.ownerId === ae.id);
    const won = deals.filter((d) => d.ownerId === ae.id && d.status === "WON");
    const lost = deals.filter((d) => d.ownerId === ae.id && d.status === "LOST");
    const atRisk = mine.filter((d) => d.riskScore >= 60);
    return {
      id: ae.id,
      name: ae.name,
      openCount: mine.length,
      pipelineValue: mine.reduce((n, d) => n + d.amount, 0),
      commitValue: mine.filter((d) => d.forecastCategory === "COMMIT").reduce((n, d) => n + d.amount, 0),
      avgRisk: avg(mine.map((d) => d.riskScore)),
      avgHealth: avg(mine.map((d) => d.healthScore)),
      atRiskCount: atRisk.length,
      atRiskValue: atRisk.reduce((n, d) => n + d.amount, 0),
      winRate: won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) : 0,
    };
  });

  const funnel = STAGE_ORDER.map((stage) => {
    const inStage = open.filter((d) => d.stage === stage);
    return { stage, count: inStage.length, value: inStage.reduce((n, d) => n + d.amount, 0), avgRisk: avg(inStage.map((d) => d.riskScore)) };
  });

  return NextResponse.json({
    company: {
      name: user.workspace.name,
      aeCount: aes.length,
      openCount: open.length,
      totalPipeline: open.reduce((n, d) => n + d.amount, 0),
      commitValue: open.filter((d) => d.forecastCategory === "COMMIT").reduce((n, d) => n + d.amount, 0),
      atRiskValue: open.filter((d) => d.riskScore >= 60).reduce((n, d) => n + d.amount, 0),
      avgRisk: avg(open.map((d) => d.riskScore)),
    },
    perAE,
    funnel,
  });
}
