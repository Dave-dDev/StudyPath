"use client";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="card p-10 max-w-md w-full text-center animate-slide-up">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="font-bold text-2xl text-ink mb-2">Page not found</h1>
        <p className="text-gray-500 text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3">
          <button onClick={() => window.history.back()} className="btn-ghost flex-1">
            <ArrowLeft size={16} />
            Go back
          </button>
          <Link href="/" className="btn-primary flex-1">
            <Home size={16} />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
