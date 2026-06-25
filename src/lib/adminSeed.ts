// Idempotent seed for the demo accounts.
// - admin@nurix.ai (ADMIN): a multi-AE team workspace with companies, contacts
//   (linked to deals), deals and activities so the Command view has data.
// - abhimanyu@nurix.ai (AE): a clean empty workspace for real lead entry.
// Both use password 123456. Safe to call repeatedly (no-ops if users exist).

import { prisma } from "./db";
import { hashPassword } from "./auth";

export const ADMIN_EMAIL = "admin@nurix.ai";
const DEMO_PASSWORD = "123456";
const ABHIMANYU_EMAIL = "abhimanyu@nurix.ai";

// Pre-create abhimanyu's clean AE workspace (no demo data) if missing.
async function ensureAbhimanyu() {
  const existing = await prisma.user.findUnique({ where: { email: ABHIMANYU_EMAIL } });
  if (existing) return;
  const ws = await prisma.workspace.create({ data: { name: "Abhimanyu's workspace" } });
  await prisma.user.create({
    data: { email: ABHIMANYU_EMAIL, name: "Abhimanyu Singh", passwordHash: await hashPassword(DEMO_PASSWORD), role: "AE", workspaceId: ws.id },
  });
}

export async function ensureAdminSeed(): Promise<{ created: boolean }> {
  await ensureAbhimanyu();
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) return { created: false };

  const ws = await prisma.workspace.create({ data: { name: "Northwind Revenue (Demo)" } });

  const admin = await prisma.user.create({
    data: { email: ADMIN_EMAIL, name: "Alex Morgan", passwordHash: await hashPassword(DEMO_PASSWORD), role: "ADMIN", workspaceId: ws.id },
  });
  // A small AE team so Command shows cross-AE performance.
  const aeData = [
    { email: "sarah@northwind.demo", name: "Sarah Chen" },
    { email: "diego@northwind.demo", name: "Diego Alvarez" },
    { email: "nina@northwind.demo", name: "Nina Kapoor" },
  ];
  const aes = [] as { id: string; name: string }[];
  for (const a of aeData) {
    const u = await prisma.user.create({
      data: { email: a.email, name: a.name, passwordHash: await hashPassword(DEMO_PASSWORD), role: "AE", workspaceId: ws.id },
    });
    aes.push({ id: u.id, name: u.name });
  }
  const [sarah, diego, nina] = aes;

  // Companies.
  const acme = await prisma.account.create({ data: { workspaceId: ws.id, ownerId: sarah.id, name: "Acme Logistics", domain: "acme.example", industry: "Logistics", employeeCount: 1200, location: "Chicago, IL" } });
  const bright = await prisma.account.create({ data: { workspaceId: ws.id, ownerId: nina.id, name: "BrightCo", domain: "brightco.example", industry: "SaaS", employeeCount: 420, location: "Austin, TX" } });
  const globex = await prisma.account.create({ data: { workspaceId: ws.id, ownerId: diego.id, name: "Globex Manufacturing", domain: "globex.example", industry: "Manufacturing", employeeCount: 3000, location: "Detroit, MI" } });
  const initech = await prisma.account.create({ data: { workspaceId: ws.id, ownerId: nina.id, name: "Initech", domain: "initech.example", industry: "FinTech", employeeCount: 250, location: "San Jose, CA" } });

  // Contacts.
  const dana = await prisma.contact.create({ data: { workspaceId: ws.id, accountId: acme.id, name: "Dana Whitfield", email: "dana@acme.example", title: "VP of Sales", buyingRole: "ECONOMIC_BUYER" } });
  const leo = await prisma.contact.create({ data: { workspaceId: ws.id, accountId: acme.id, name: "Leo Park", email: "leo@acme.example", title: "Director of RevOps", buyingRole: "CHAMPION" } });
  const mia = await prisma.contact.create({ data: { workspaceId: ws.id, accountId: bright.id, name: "Mia Torres", email: "mia@brightco.example", title: "CRO", buyingRole: "ECONOMIC_BUYER" } });
  const raj = await prisma.contact.create({ data: { workspaceId: ws.id, accountId: globex.id, name: "Raj Mehta", email: "raj@globex.example", title: "IT Director", buyingRole: "TECHNICAL_BUYER" } });
  const quinn = await prisma.contact.create({ data: { workspaceId: ws.id, accountId: initech.id, name: "Quinn Adams", email: "quinn@initech.example", title: "VP Finance", buyingRole: "ECONOMIC_BUYER" } });

  // Deals with linked buying committees.
  const acmeDeal = await prisma.deal.create({ data: { workspaceId: ws.id, ownerId: sarah.id, accountId: acme.id, name: "Acme: Revenue Platform", stage: "Discovery", amount: 75000, forecastCategory: "BEST_CASE", healthScore: 61, riskScore: 38, closeDate: new Date("2026-08-15"), contacts: { connect: [{ id: dana.id }, { id: leo.id }] } } });
  const brightDeal = await prisma.deal.create({ data: { workspaceId: ws.id, ownerId: nina.id, accountId: bright.id, name: "BrightCo: Sales Productivity", stage: "Qualified", amount: 120000, forecastCategory: "PIPELINE", healthScore: 58, riskScore: 45, closeDate: new Date("2026-09-30"), contacts: { connect: [{ id: mia.id }] } } });
  const globexDeal = await prisma.deal.create({ data: { workspaceId: ws.id, ownerId: diego.id, accountId: globex.id, name: "Globex: Forecast Suite", stage: "Solution Fit", amount: 210000, forecastCategory: "COMMIT", healthScore: 52, riskScore: 68, closeDate: new Date("2026-07-31"), contacts: { connect: [{ id: raj.id }] } } });
  const initechDeal = await prisma.deal.create({ data: { workspaceId: ws.id, ownerId: nina.id, accountId: initech.id, name: "Initech: Pipeline Analytics", stage: "Business Case", amount: 95000, forecastCategory: "COMMIT", healthScore: 72, riskScore: 30, closeDate: new Date("2026-07-15"), contacts: { connect: [{ id: quinn.id }] } } });
  // A couple of closed deals so win-rate shows.
  await prisma.deal.create({ data: { workspaceId: ws.id, ownerId: nina.id, accountId: bright.id, name: "BrightCo: Pilot", stage: "Closed Won", amount: 30000, forecastCategory: "CLOSED", status: "WON", healthScore: 90, riskScore: 10, closeDate: new Date("2026-05-20") } });
  await prisma.deal.create({ data: { workspaceId: ws.id, ownerId: diego.id, accountId: globex.id, name: "Globex: CPQ", stage: "Closed Lost", amount: 150000, forecastCategory: "OMITTED", status: "LOST", healthScore: 30, riskScore: 85, closeDate: new Date("2026-05-10") } });

  // A few activities.
  await prisma.activity.createMany({
    data: [
      { workspaceId: ws.id, ownerId: sarah.id, dealId: acmeDeal.id, accountId: acme.id, type: "MEETING", subject: "Discovery call", body: "Confirmed forecast pain. EB (Dana) engaged. Next: technical review." },
      { workspaceId: ws.id, ownerId: diego.id, dealId: globexDeal.id, accountId: globex.id, type: "NOTE", subject: "Risk", body: "Single-threaded on IT only. Need to multi-thread to economic buyer." },
      { workspaceId: ws.id, ownerId: nina.id, dealId: initechDeal.id, accountId: initech.id, type: "EMAIL", subject: "Contract review", body: "Legal started MSA review. On track for July." },
    ],
  });

  // Touch unused refs to satisfy the linter without changing behavior.
  void admin; void brightDeal;
  return { created: true };
}
