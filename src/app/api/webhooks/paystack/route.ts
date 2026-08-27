import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { grantProFromBilling, revokePro, findUserIdByEmail, ensurePlanSchema } from "@/lib/plans";

// POST /api/webhooks/paystack
// Paystack webhook events (https://paystack.com/docs/payments/webhooks):
// - charge.success     → grant/extend Pro (fires on purchase and every monthly renewal)
// - subscription.disable → subscription cancelled → revoke Pro
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: { event?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const data = (event.data ?? {}) as {
    customer?: { email?: string; customer_code?: string };
    plan?: { plan_code?: string } | Record<string, never>;
    subscription?: { subscription_code?: string };
  };
  const email = data.customer?.email;

  try {
    await ensurePlanSchema();

    if (event.event === "charge.success" && email) {
      const userId = await findUserIdByEmail(email);
      if (userId) {
        const hasSubscription = Boolean(
          data.subscription?.subscription_code ||
            (data.plan && Object.keys(data.plan).length > 0)
        );
        await grantProFromBilling(userId, {
          // Time-bounded: every successful renewal (monthly charge.success)
          // extends the window; cancellation stops the extensions.
          subscriptionManaged: false,
          durationDays: 32,
          customerCode: data.customer?.customer_code ?? null,
          subscriptionCode: data.subscription?.subscription_code ?? null,
        });
        if (hasSubscription) {
          console.log(`[paystack-webhook] Pro granted/renewed for ${email}`);
        }
      }
    }

    if (event.event === "subscription.disable" && email) {
      const userId = await findUserIdByEmail(email);
      if (userId) {
        await revokePro(userId);
        console.log(`[paystack-webhook] Pro revoked for ${email}`);
      }
    }
  } catch (err) {
    // Log but still return 200 for idempotent retries on known-user misses;
    // genuine DB failures should 500 so Paystack retries.
    console.error("[paystack-webhook]", err);
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }

  // Paystack expects a fast 200 response
  return NextResponse.json({ received: true });
}
