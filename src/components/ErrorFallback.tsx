"use client";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface ErrorFallbackProps {
  error?: string;
  onRetry?: () => void;
}

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="card p-8 max-w-md mx-auto text-center">
      <AlertTriangle size={32} className="mx-auto mb-3 text-amber-400" />
      <h3 className="font-semibold text-ink mb-2">Something went wrong</h3>
      <p className="text-gray-500 text-sm mb-4">
        {error || "An unexpected error occurred. Please try again."}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary text-sm">
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}

export function ApiErrorFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorFallback
      error="Failed to load data. Please check your connection and try again."
      onRetry={onRetry}
    />
  );
}

export function GeminiErrorFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorFallback
      error="The AI model is temporarily unavailable. Please try again in a moment."
      onRetry={onRetry}
    />
  );
}
