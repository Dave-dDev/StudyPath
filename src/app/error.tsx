"use client";
import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="card p-10 max-w-md w-full text-center animate-slide-up">
        <div className="text-5xl mb-4">💥</div>
        <h1 className="font-bold text-2xl text-ink mb-2">Something went wrong</h1>
        <p className="text-gray-500 text-sm mb-2">
          {error.message || "An unexpected error occurred."}
        </p>
        {error.digest && (
          <p className="text-gray-400 text-xs mb-6 font-mono">Error ID: {error.digest}</p>
        )}
        <p className="text-gray-400 text-xs mb-8">
          If this keeps happening, try again or go back to the homepage.
        </p>
        <div className="flex gap-3">
          <Link href="/" className="btn-ghost flex-1">
            <Home size={16} />
            Go home
          </Link>
          <button onClick={reset} className="btn-primary flex-1">
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
