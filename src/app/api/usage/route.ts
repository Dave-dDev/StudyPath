import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { getUsageSummary, recordUsage, checkLimit, limitMessage, FREE_LIMITS, type UsageAction } from "@/lib/plans";

// GET: current plan + usage counters (drives the quota widget)
export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const summary = await getUsageSummary(user.id);
  return NextResponse.json(summary);
}

// POST: record a client-side usage event (file upload) with quota check
export async function POST(request: NextRequest) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const action = body.action as UsageAction;

  if (!action || !(action in FREE_LIMITS)) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const limit = await checkLimit(user.id, action);
  if (limit && !limit.allowed) {
    return NextResponse.json(
      { error: limitMessage(action), code: "LIMIT_REACHED", limit },
      { status: 402 }
    );
  }

  await recordUsage(user.id, action);
  return NextResponse.json({ ok: true, action, limit });
}
