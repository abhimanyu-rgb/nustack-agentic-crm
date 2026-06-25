import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Log a manual activity (note/email/meeting/call) or paste a transcript.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.type || !b.body?.trim()) {
    return NextResponse.json({ error: "Type and content are required." }, { status: 400 });
  }
  // Validate any linked deal/account belongs to the workspace.
  let accountId: string | null = b.accountId || null;
  if (b.dealId) {
    const deal = await prisma.deal.findUnique({ where: { id: b.dealId } });
    if (!deal || deal.workspaceId !== user.workspaceId) {
      return NextResponse.json({ error: "Invalid deal." }, { status: 400 });
    }
    accountId = accountId ?? deal.accountId;
  }
  const activity = await prisma.activity.create({
    data: {
      workspaceId: user.workspaceId,
      ownerId: user.id,
      dealId: b.dealId || null,
      accountId,
      type: b.type,
      source: "MANUAL",
      subject: b.subject?.trim() || null,
      body: b.body.trim(),
      occurredAt: b.occurredAt ? new Date(b.occurredAt) : new Date(),
    },
  });
  return NextResponse.json({ activity });
}
