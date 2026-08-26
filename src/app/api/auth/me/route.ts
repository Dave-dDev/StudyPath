import { NextResponse } from "next/server";
import { getSessionIdFromCookies, validateSession } from "@/lib/auth";
import { getUserPlan, ensurePlanSchema } from "@/lib/plans";

export async function GET(request: Request) {
  const sessionId = getSessionIdFromCookies(request.headers.get("cookie"));
  if (!sessionId) {
    return NextResponse.json({ user: null });
  }

  const { user } = await validateSession(sessionId);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  let plan = "free";
  try {
    await ensurePlanSchema();
    plan = await getUserPlan(user.id);
  } catch {
    // Billing schema unavailable — default to free
  }

  return NextResponse.json({ user: { ...user, plan } });
}
