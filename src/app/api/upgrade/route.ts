import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { activatePro } from "@/lib/plans";

// POST: upgrade the signed-in user to Pro.
// NOTE: This is a mock checkout for development. For production, replace with
// a Stripe Checkout session: create the session here, redirect to Stripe, then
// set plan='pro' in a /api/webhooks/stripe handler on checkout.session.completed.
export async function POST() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await activatePro(user.id);

  return NextResponse.json({ ok: true, plan: "pro" });
}
