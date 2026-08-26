"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Sidebar from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { Check } from "lucide-react";

const FREE_FEATURES = [
  "3 study set generations / day",
  "10 saved study sets / month",
  "5 file & URL imports / day",
  "Spaced-repetition flashcards (SM-2)",
  "Basic analytics (30-day history)",
  "Mistake review bank",
];

const PRO_FEATURES = [
  "Unlimited generations, sets & imports",
  "Advanced analytics",
  "Retention curves & trends",
  "Weak-topic breakdown",
  "Exam-readiness score",
  "Study-time forecasts",
  "Unlimited review history (90+ days)",
  "Offline review with auto-sync",
];

export default function PricingPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const isPro = user?.plan === "pro";

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const res = await fetch("/api/upgrade", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upgrade failed");
      await refreshUser();
      toast.success("You're now on Pro! Enjoy unlimited access ⭐");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setUpgrading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-ink mb-2">Choose your plan</h1>
            <p className="text-gray-500">Start free. Upgrade when you want deeper insight and no limits.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Free */}
            <Card className="p-8 flex flex-col">
              <h2 className="text-lg font-bold text-ink mb-1">Free</h2>
              <p className="text-4xl font-bold text-ink mb-1">$0<span className="text-base font-medium text-gray-400">/mo</span></p>
              <p className="text-sm text-gray-400 mb-6">Everything you need to start studying.</p>
              <ul className="space-y-3 mb-8">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check size={16} className="text-teal-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                {isPro ? (
                  <Link href="/upload" className="btn-ghost w-full text-sm text-center block">← Back to studying</Link>
                ) : (
                  <div className="w-full text-center text-sm font-medium text-gray-400 border border-gray-200 rounded-xl py-3">
                    Current plan
                  </div>
                )}
              </div>
            </Card>

            {/* Pro */}
            <Card className="p-8 flex flex-col relative border-2 !border-teal-400 shadow-lg">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-teal-500 text-white text-xs font-semibold">
                Most powerful
              </span>
              <h2 className="text-lg font-bold text-ink mb-1">Pro ⭐</h2>
              <p className="text-4xl font-bold text-ink mb-1">$9<span className="text-base font-medium text-gray-400">/mo</span></p>
              <p className="text-sm text-gray-400 mb-6">Unlimited studying + advanced learning analytics.</p>
              <ul className="space-y-3 mb-8">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <Check size={16} className="text-teal-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                {isPro ? (
                  <div className="w-full text-center text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-xl py-3">
                    ✓ You&apos;re on Pro
                  </div>
                ) : (
                  <button
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    className="btn-primary w-full text-sm disabled:opacity-60"
                  >
                    {upgrading ? "Upgrading..." : "Upgrade to Pro"}
                  </button>
                )}
              </div>
            </Card>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            This checkout is a development preview — no card is required. Payment processing (Stripe) can be wired in to
            <code className="mx-1">/api/upgrade</code>.
          </p>
        </div>
      </main>
    </div>
  );
}
