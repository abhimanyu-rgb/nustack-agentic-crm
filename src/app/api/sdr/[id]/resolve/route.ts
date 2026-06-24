import { NextRequest, NextResponse } from "next/server";
import { resolveOutreachSuggestion } from "@/lib/store";
import { currentUser } from "@/lib/currentUser";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const decision: "ACCEPTED" | "DISMISSED" = body.decision;
  if (!["ACCEPTED", "DISMISSED"].includes(decision)) {
    return NextResponse.json({ error: "invalid decision" }, { status: 400 });
  }
  const me = await currentUser();
  try {
    const result = resolveOutreachSuggestion(id, decision, me.id);
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
