import { NextResponse } from "next/server";
import { sdrView } from "@/lib/views";
import { currentUser } from "@/lib/currentUser";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = await currentUser();
  // SDRs see their own suggestions; managers/admins see all (sdrUserId undefined).
  const scoped = me.role === "SDR" ? me.id : undefined;
  return NextResponse.json({ ...sdrView(scoped), me: { id: me.id, name: me.name, role: me.role } });
}
