import { cn } from "@/lib/utils";

export default function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-teal-100 rounded-full" />
        <div className="absolute inset-0 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-sm text-gray-400 animate-pulse">Generating your study set…</p>
    </div>
  );
}
