import { NextResponse } from "next/server";
import { getApiSpec } from "@/lib/swagger";

export async function GET() {
  const spec = getApiSpec();
  return NextResponse.json(spec);
}
