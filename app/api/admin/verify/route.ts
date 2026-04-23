import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const token = (body as { token?: unknown }).token;

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (token === process.env.ADMIN_SECRET) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
