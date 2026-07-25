"use client";
import { Component, type ReactNode } from "react";
import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="card p-10 max-w-md w-full text-center">
            <div className="text-5xl mb-4">💥</div>
            <h1 className="font-bold text-2xl text-ink mb-2">Something went wrong</h1>
            <p className="text-gray-500 text-sm mb-2">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <p className="text-gray-400 text-xs mb-8">
              If this keeps happening, please try refreshing the page.
            </p>
            <div className="flex gap-3">
              <Link href="/" className="btn-ghost flex-1">
                <Home size={16} />
                Go home
              </Link>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="btn-primary flex-1"
              >
                <RefreshCw size={16} />
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
