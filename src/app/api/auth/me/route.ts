import { NextResponse } from "next/server";
import { getSessionIdFromCookies, validateSession } from "@/lib/auth";

export async function GET(request: Request) {
  const sessionId = getSessionIdFromCookies(request.headers.get("cookie"));
  if (!sessionId) {
    return NextResponse.json({ user: null });
  }

  const { user } = await validateSession(sessionId);
  return NextResponse.json({ user: user ?? null });
}
