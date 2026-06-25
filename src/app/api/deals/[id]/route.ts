import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { id } = await params;
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      account: { select: { id: true, name: true, contacts: true } },
      contacts: { orderBy: { createdAt: "asc" } }, // buying committee on this deal
      activities: { orderBy: { occurredAt: "desc" } },
    },
  });
  if (!deal || deal.workspaceId !== user.workspaceId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ deal });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.deal.findUnique({ where: { id } });
  if (!existing || existing.workspaceId !== user.workspaceId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const b = await req.json().catch(() => ({}));
  const deal = await prisma.deal.update({
    where: { id },
    data: {
      name: b.name?.trim() || undefined,
      stage: b.stage || undefined,
      amount: b.amount !== undefined ? Number(b.amount) : undefined,
      closeDate: b.closeDate !== undefined ? (b.closeDate ? new Date(b.closeDate) : null) : undefined,
      forecastCategory: b.forecastCategory || undefined,
      status: b.status || undefined,
      accountId: b.accountId !== undefined ? (b.accountId || null) : undefined,
    },
  });
  return NextResponse.json({ deal });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.deal.findUnique({ where: { id } });
  if (!existing || existing.workspaceId !== user.workspaceId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.deal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
