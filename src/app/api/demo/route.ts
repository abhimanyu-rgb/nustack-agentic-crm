import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST: seed a handful of demo companies/contacts/deals into the user's own
// workspace so they can explore. DELETE: clear ALL data in their workspace.

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const ws = user.workspaceId;

  const acme = await prisma.account.create({
    data: { workspaceId: ws, ownerId: user.id, name: "Acme Logistics", domain: "acme.example", industry: "Logistics", employeeCount: 1200, location: "Chicago, IL" },
  });
  const bright = await prisma.account.create({
    data: { workspaceId: ws, ownerId: user.id, name: "BrightCo", domain: "brightco.example", industry: "SaaS", employeeCount: 420, location: "Austin, TX" },
  });
  const globex = await prisma.account.create({
    data: { workspaceId: ws, ownerId: user.id, name: "Globex Manufacturing", domain: "globex.example", industry: "Manufacturing", employeeCount: 3000, location: "Detroit, MI" },
  });

  await prisma.contact.createMany({
    data: [
      { workspaceId: ws, accountId: acme.id, name: "Dana Whitfield", email: "dana@acme.example", title: "VP of Sales", buyingRole: "ECONOMIC_BUYER" },
      { workspaceId: ws, accountId: acme.id, name: "Leo Park", email: "leo@acme.example", title: "Director of RevOps", buyingRole: "CHAMPION" },
      { workspaceId: ws, accountId: bright.id, name: "Mia Torres", email: "mia@brightco.example", title: "CRO", buyingRole: "ECONOMIC_BUYER" },
      { workspaceId: ws, accountId: globex.id, name: "Raj Mehta", email: "raj@globex.example", title: "IT Director", buyingRole: "TECHNICAL_BUYER" },
    ],
  });

  await prisma.deal.createMany({
    data: [
      { workspaceId: ws, ownerId: user.id, accountId: acme.id, name: "Acme: Revenue Platform", stage: "Discovery", amount: 75000, forecastCategory: "BEST_CASE", healthScore: 61, riskScore: 38, closeDate: new Date("2026-08-15") },
      { workspaceId: ws, ownerId: user.id, accountId: bright.id, name: "BrightCo: Sales Productivity", stage: "Qualified", amount: 120000, forecastCategory: "PIPELINE", healthScore: 58, riskScore: 45, closeDate: new Date("2026-09-30") },
      { workspaceId: ws, ownerId: user.id, accountId: globex.id, name: "Globex: Forecast Suite", stage: "Solution Fit", amount: 210000, forecastCategory: "COMMIT", healthScore: 52, riskScore: 68, closeDate: new Date("2026-07-31") },
    ],
  });

  return NextResponse.json({ ok: true, seeded: { companies: 3, contacts: 4, deals: 3 } });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const ws = user.workspaceId;
  // Order respects FK constraints (activities -> deals/contacts -> accounts).
  await prisma.activity.deleteMany({ where: { workspaceId: ws } });
  await prisma.deal.deleteMany({ where: { workspaceId: ws } });
  await prisma.contact.deleteMany({ where: { workspaceId: ws } });
  await prisma.account.deleteMany({ where: { workspaceId: ws } });
  return NextResponse.json({ ok: true });
}
