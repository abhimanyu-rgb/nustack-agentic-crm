import { NextRequest, NextResponse } from "next/server";
import { runCommandBar, COMMAND_SUGGESTIONS } from "@/lib/agents/commandBar";
import { currentUser } from "@/lib/currentUser";

export const dynamic = "force-dynamic";

// Conversational query surface (PRD 09.6). Returns cited cards, role-scoped.
export async function GET() {
  // Empty state: return the suggestion prompts.
  return NextResponse.json({ suggestions: COMMAND_SUGGESTIONS });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const query: string = (body.query ?? "").toString();
  if (!query.trim()) return NextResponse.json({ error: "query required" }, { status: 400 });
  const me = await currentUser();
  const result = runCommandBar(query, me);
  return NextResponse.json(result);
}
