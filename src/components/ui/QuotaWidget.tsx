"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Plan } from "@/types";

interface LimitMeter {
  used: number;
  max: number | null;
  window: "day" | "month";
}

interface UsageSummary {
  plan: Plan;
  usage: {
    generation: LimitMeter;
    study_set: LimitMeter;
    ingest: LimitMeter;
  };
}

const LABELS: Record<string, string> = {
  generation: "Generations",
  study_set: "Study sets",
  ingest: "Imports (file/URL)",
};

export default function QuotaWidget() {
  const [data, setData] = useState<UsageSummary | null>(null);

  const load = () => {
    fetch("/api/usage")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  if (!data) return null;

  if (data.plan === "pro") {
    return (
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-white text-xs font-medium">
        <span>⭐ Pro plan — unlimited generations, sets &amp; imports</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 rounded-xl bg-white border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-ink">Free plan usage</span>
        <Link href="/pricing" className="text-xs font-semibold text-teal-500 hover:text-teal-700">
          Upgrade ⭐
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(data.usage) as (keyof typeof data.usage)[]).map((key) => {
          const m = data.usage[key];
          if (m.max === null) return null;
          const pct = Math.min((m.used / m.max) * 100, 100);
          const exhausted = m.used >= m.max;
          return (
            <div key={key}>
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span className="truncate">{LABELS[key]}</span>
                <span className={exhausted ? "text-coral-500 font-semibold" : ""}>
                  {m.used}/{m.max}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${exhausted ? "bg-coral-400" : pct >= 66 ? "bg-amber-400" : "bg-teal-400"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
