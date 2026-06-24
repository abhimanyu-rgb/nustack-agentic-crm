import { NextRequest, NextResponse } from "next/server";
import { db, getUser } from "@/lib/store";
import { currentUser, UID_COOKIE, canSeeAllTeam } from "@/lib/currentUser";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = await currentUser();
  return NextResponse.json({
    me: { id: me.id, name: me.name, role: me.role },
    canSeeAllTeam: canSeeAllTeam(me.role),
    users: db.users.map((u) => ({ id: u.id, name: u.name, role: u.role })),
  });
}

// Switch active user (the "act as" control).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const uid: string = body.userId;
  if (!getUser(uid)) return NextResponse.json({ error: "unknown user" }, { status: 400 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(UID_COOKIE, uid, { httpOnly: false, sameSite: "lax", path: "/" });
  return res;
}
