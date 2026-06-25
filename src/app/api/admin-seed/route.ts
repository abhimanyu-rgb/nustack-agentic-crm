import { NextResponse } from "next/server";
import { ensureAdminSeed } from "@/lib/adminSeed";

export const dynamic = "force-dynamic";

// Idempotent: creates the demo admin workspace if it's missing. Public so it can
// be hit once to provision the demo login.
export async function POST() {
  try {
    const r = await ensureAdminSeed();
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
