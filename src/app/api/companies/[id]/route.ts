import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Helper: load a company that belongs to the user's workspace, or null.
async function owned(id: string, workspaceId: string) {
  const c = await prisma.account.findUnique({ where: { id } });
  return c && c.workspaceId === workspaceId ? c : null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { id } = await params;
  const company = await prisma.account.findUnique({
    where: { id },
    include: {
      contacts: { orderBy: { createdAt: "desc" } },
      deals: { orderBy: { createdAt: "desc" } },
      activities: { orderBy: { occurredAt: "desc" }, take: 20 },
    },
  });
  if (!company || company.workspaceId !== user.workspaceId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ company });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { id } = await params;
  if (!(await owned(id, user.workspaceId))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const b = await req.json().catch(() => ({}));
  const company = await prisma.account.update({
    where: { id },
    data: {
      name: b.name?.trim() || undefined,
      domain: b.domain?.trim() ?? undefined,
      industry: b.industry?.trim() ?? undefined,
      employeeCount: b.employeeCount !== undefined ? (b.employeeCount ? Number(b.employeeCount) : null) : undefined,
      location: b.location?.trim() ?? undefined,
    },
  });
  return NextResponse.json({ company });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { id } = await params;
  if (!(await owned(id, user.workspaceId))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.account.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
