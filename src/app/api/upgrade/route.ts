import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { isPaystackConfigured, initializeTransaction } from "@/lib/paystack";

// POST: start a Paystack checkout for the signed-in user.
// Returns { authorizationUrl } — the client redirects there to pay.
export async function POST(req: NextRequest) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isPaystackConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Add PAYSTACK_SECRET_KEY and PAYSTACK_PRO_AMOUNT_KOBO to the environment." },
      { status: 503 }
    );
  }

  try {
    const origin = req.headers.get("origin") ?? "";
    const { authorizationUrl, reference } = await initializeTransaction({
      email: user.email,
      userId: user.id,
      callbackUrl: `${origin}/billing/callback`,
    });
    return NextResponse.json({ authorizationUrl, reference });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Could not start checkout.";
    console.error("[/api/upgrade]", err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
