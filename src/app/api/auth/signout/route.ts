import { NextResponse } from "next/server";
import { getSessionIdFromCookies, invalidateSession } from "@/lib/auth";

export async function POST(request: Request) {
  const sessionId = getSessionIdFromCookies(request.headers.get("cookie"));
  if (sessionId) await invalidateSession(sessionId);

  const response = NextResponse.json({ ok: true });
  response.headers.set("Set-Cookie", "studypath_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
  return response;
}
