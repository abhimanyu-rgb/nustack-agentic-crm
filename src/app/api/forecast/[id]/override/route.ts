import { NextRequest, NextResponse } from "next/server";
import { overrideForecast, db } from "@/lib/store";
import type { ForecastCategory, OverrideReasonCode } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const category: ForecastCategory = body.category;
  const reasonCode: OverrideReasonCode = body.reasonCode ?? "OTHER";
  const note: string | undefined = body.note;
  const userId: string = body.userId ?? db.users.find((u) => u.role === "SALES_MANAGER")!.id;
  try {
    const deal = overrideForecast(id, userId, category, reasonCode, note);
    return NextResponse.json({ ok: true, deal });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
