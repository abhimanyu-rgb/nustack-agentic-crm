import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const companies = await prisma.account.findMany({
    where: { workspaceId: user.workspaceId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { deals: true, contacts: true } } },
  });
  return NextResponse.json({ companies });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.name?.trim()) return NextResponse.json({ error: "Company name is required." }, { status: 400 });
  const company = await prisma.account.create({
    data: {
      workspaceId: user.workspaceId,
      name: b.name.trim(),
      domain: b.domain?.trim() || null,
      industry: b.industry?.trim() || null,
      employeeCount: b.employeeCount ? Number(b.employeeCount) : null,
      location: b.location?.trim() || null,
      ownerId: user.id,
    },
  });
  return NextResponse.json({ company });
}
