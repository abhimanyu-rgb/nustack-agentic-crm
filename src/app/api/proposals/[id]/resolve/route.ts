import { NextRequest, NextResponse } from "next/server";
import { approveStageProposal, rejectStageProposal, db } from "@/lib/store";
import type { OverrideReasonCode } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const decision: "APPROVE" | "REJECT" = body.decision;
  const userId: string = body.userId ?? db.users.find((u) => u.role === "AE")!.id;
  const reasonCode: OverrideReasonCode = body.reasonCode ?? "OTHER";
  const note: string | undefined = body.note;
  try {
    const result =
      decision === "APPROVE"
        ? approveStageProposal(id, userId, note)
        : rejectStageProposal(id, userId, reasonCode, note);
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
