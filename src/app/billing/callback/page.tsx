"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function CallbackInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<"checking" | "success" | "error">("checking");
  const [message, setMessage] = useState("Confirming your payment…");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const reference = params.get("reference") ?? params.get("trxref");

    if (!reference) {
      setStatus("error");
      setMessage("No payment reference found.");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`);
        const json = await res.json();
        if (res.ok && json.ok) {
          await refreshUser();
          setStatus("success");
          setMessage("Payment confirmed — welcome to Pro!");
          setTimeout(() => router.replace("/pricing"), 1400);
        } else {
          setStatus("error");
          setMessage(json.error ?? "We couldn't verify this payment.");
        }
      } catch {
        setStatus("error");
        setMessage("Something went wrong while confirming your payment.");
      }
    })();
  }, [params, refreshUser, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="card p-10 max-w-md w-full text-center animate-slide-up">
        {status === "checking" && (
          <div className="mx-auto mb-6 h-12 w-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
        )}
        {status === "success" && <div className="text-5xl mb-4">🎉</div>}
        {status === "error" && <div className="text-5xl mb-4">😕</div>}
        <h1 className="font-bold text-xl text-ink mb-2">
          {status === "checking" ? "One moment…" : status === "success" ? "You're all set!" : "Payment issue"}
        </h1>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        {status === "error" && (
          <div className="flex flex-col gap-3">
            <button onClick={() => router.push("/pricing")} className="btn-primary text-sm">
              Back to pricing
            </button>
            <button onClick={() => router.push("/dashboard")} className="btn-ghost text-sm">
              Go to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BillingCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="h-12 w-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
