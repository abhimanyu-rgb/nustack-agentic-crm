import { NextResponse } from "next/server";
import { commandView } from "@/lib/views";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(commandView());
}
