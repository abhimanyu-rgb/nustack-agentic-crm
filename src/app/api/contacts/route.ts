import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const accountId = req.nextUrl.searchParams.get("accountId");
  const contacts = await prisma.contact.findMany({
    where: { workspaceId: user.workspaceId, ...(accountId ? { accountId } : {}) },
    orderBy: { createdAt: "desc" },
    include: { account: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ contacts });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.name?.trim()) return NextResponse.json({ error: "Contact name is required." }, { status: 400 });
  // Validate account belongs to workspace if provided.
  if (b.accountId) {
    const acc = await prisma.account.findUnique({ where: { id: b.accountId } });
    if (!acc || acc.workspaceId !== user.workspaceId) {
      return NextResponse.json({ error: "Invalid company." }, { status: 400 });
    }
  }
  const contact = await prisma.contact.create({
    data: {
      workspaceId: user.workspaceId,
      accountId: b.accountId || null,
      name: b.name.trim(),
      email: b.email?.trim() || null,
      title: b.title?.trim() || null,
      phone: b.phone?.trim() || null,
      buyingRole: b.buyingRole || null,
    },
  });
  return NextResponse.json({ contact });
}
