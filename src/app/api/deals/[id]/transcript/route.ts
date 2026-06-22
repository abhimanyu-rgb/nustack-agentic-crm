import { NextRequest, NextResponse } from "next/server";
import { processTranscript } from "@/lib/store";

export const dynamic = "force-dynamic";

// The closed loop: transcript -> extract -> signals -> rescore -> stage proposal.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const text: string = body.transcript ?? "";
  if (!text.trim()) return NextResponse.json({ error: "transcript text required" }, { status: 400 });
  try {
    const result = await processTranscript(id, text);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
