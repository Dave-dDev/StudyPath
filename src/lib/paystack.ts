import { createHmac, timingSafeEqual } from "crypto";

// Server-side Paystack client (https://paystack.com/docs/api)

const PAYSTACK_API = "https://api.paystack.co";

export function isPaystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY && process.env.PAYSTACK_PRO_AMOUNT_KOBO);
}

export function getProAmountKobo(): number {
  return Number(process.env.PAYSTACK_PRO_AMOUNT_KOBO ?? 0);
}

export function getPriceLabel(): string {
  return process.env.PAYSTACK_PRICE_LABEL ?? "$9";
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

export interface InitializedTransaction {
  authorizationUrl: string;
  reference: string;
}

export async function initializeTransaction(opts: {
  email: string;
  userId: string;
  callbackUrl: string;
}): Promise<InitializedTransaction> {
  const body: Record<string, unknown> = {
    email: opts.email,
    amount: getProAmountKobo(),
    callback_url: opts.callbackUrl,
    metadata: { user_id: opts.userId },
  };

  const planCode = process.env.PAYSTACK_PLAN_CODE;
  if (planCode) body.plan = planCode;

  const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message ?? `Paystack initialize failed (${res.status})`);
  }

  return {
    authorizationUrl: String(json.data.authorization_url),
    reference: String(json.data.reference),
  };
}

export interface VerifiedTransaction {
  status: string;
  amount: number;
  reference: string;
  plan?: { plan_code?: string } | null;
  subscription?: { subscription_code?: string } | null;
  customer?: { customer_code?: string; email?: string } | null;
  metadata?: { user_id?: string } | null;
}

export async function verifyTransaction(reference: string): Promise<VerifiedTransaction> {
  const res = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: authHeaders(),
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message ?? `Paystack verify failed (${res.status})`);
  }

  return json.data as VerifiedTransaction;
}

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
