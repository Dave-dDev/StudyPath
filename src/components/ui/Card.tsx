import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "active" | "surface";
  padding?: "sm" | "md" | "lg";
}

export function Card({
  children,
  className,
  variant = "default",
  padding = "md",
}: CardProps) {
  return (
    <>
      <div className={cn("card", `card-${variant}`, `card-p-${padding}`, className)}>
        {children}
      </div>
      <style>{`
        .card {
          background: var(--white);
          border: 1px solid var(--gray-100);
          border-radius: var(--radius-lg);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .card-default  { background: var(--white); border-color: var(--gray-100); }
        .card-active   { background: var(--teal-50); border-color: var(--teal-400); border-width: 2px; }
        .card-surface  { background: var(--surface); border-color: var(--gray-100); box-shadow: none; }
        .card-p-sm { padding: 12px 16px; }
        .card-p-md { padding: 20px 24px; }
        .card-p-lg { padding: 28px 32px; }
      `}</style>
    </>
  );
}
