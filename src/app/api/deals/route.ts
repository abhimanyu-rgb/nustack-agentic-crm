import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { dealSummary } from "@/lib/views";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ deals: db.deals.map(dealSummary) });
}
