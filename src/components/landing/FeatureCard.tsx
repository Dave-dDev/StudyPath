"use client";
import { useRef, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: string;
  iconBg: string;
  title: string;
  desc: string;
  details: string[];
  className?: string;
}

export default function FeatureCard({ icon, iconBg, title, desc, details, className }: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={cn(
        "spotlight-card group bg-white rounded-2xl border border-gray-100 shadow-card p-7",
        "transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lifted hover:border-gray-200",
        className
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4",
          "transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6",
          iconBg
        )}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-base text-ink mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-5 mb-4">{desc}</p>
      <ul className="space-y-1.5">
        {details.map((d) => (
          <li key={d} className="flex items-center gap-2 text-xs font-medium text-ink">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
            {d}
          </li>
        ))}
      </ul>
    </div>
  );
}
