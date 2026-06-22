import { NextResponse } from "next/server";
import { forecastView } from "@/lib/views";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(forecastView());
}
