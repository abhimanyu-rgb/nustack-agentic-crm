import { NextRequest, NextResponse } from "next/server";
import { resolveAction, db } from "@/lib/store";
import type { OverrideReasonCode } from "@/lib/types";

export const dynamic = "force-dynamic";

// Approve / reject / dismiss an action card. Reject captures a reason code
// (PRD 10.7 — override in under 10s) which becomes a learning event.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const decision: "APPROVED" | "REJECTED" | "DISMISSED" = body.decision;
  const reasonCode: OverrideReasonCode | undefined = body.reasonCode;
  const note: string | undefined = body.note;
  const userId: string = body.userId ?? db.users.find((u) => u.role === "AE")!.id;

  if (!["APPROVED", "REJECTED", "DISMISSED"].includes(decision)) {
    return NextResponse.json({ error: "invalid decision" }, { status: 400 });
  }
  try {
    const result = resolveAction(id, userId, decision, reasonCode, note);
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
