import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { isPaystackConfigured, verifyTransaction, getProAmountKobo } from "@/lib/paystack";
import { grantProFromBilling } from "@/lib/plans";

// GET /api/paystack/verify?reference=...
// Called by the billing callback page after the user returns from Paystack.
export async function GET(req: NextRequest) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isPaystackConfigured()) {
    return NextResponse.json({ error: "Payments are not configured." }, { status: 503 });
  }

  const reference = new URL(req.url).searchParams.get("reference");
  if (!reference || !/^[a-zA-Z0-9_-]+$/.test(reference)) {
    return NextResponse.json({ error: "Invalid reference." }, { status: 400 });
  }

  try {
    const txn = await verifyTransaction(reference);

    if (txn.status !== "success") {
      return NextResponse.json({ error: "Payment was not successful." }, { status: 402 });
    }

    // Defense in depth: the transaction must belong to this user and amount must match
    if (txn.metadata?.user_id && txn.metadata.user_id !== user.id) {
      return NextResponse.json({ error: "Transaction does not match this account." }, { status: 400 });
    }
    if (getProAmountKobo() > 0 && txn.amount < getProAmountKobo()) {
      return NextResponse.json({ error: "Payment amount mismatch." }, { status: 400 });
    }

    const subscriptionManaged = Boolean(txn.subscription?.subscription_code || txn.plan?.plan_code);
    await grantProFromBilling(user.id, {
      subscriptionManaged,
      customerCode: txn.customer?.customer_code ?? null,
      subscriptionCode: txn.subscription?.subscription_code ?? null,
    });

    return NextResponse.json({ ok: true, plan: "pro" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment verification failed.";
    console.error("[/api/paystack/verify]", err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
