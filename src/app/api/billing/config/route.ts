import { NextResponse } from "next/server";
import { isPaystackConfigured, getPriceLabel } from "@/lib/paystack";

// GET /api/billing/config — public; lets the UI show the real price label
// and whether checkout is wired up.
export async function GET() {
  return NextResponse.json({
    configured: isPaystackConfigured(),
    priceLabel: getPriceLabel(),
    period: "/month",
  });
}
