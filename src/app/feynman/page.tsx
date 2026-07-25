"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import type { FeynmanSummary } from "@/types";

const NEXT_STEPS = [
  {
    title: "Turn this into flashcards",
    description: "Create review cards from the key points to memorize the most important facts.",
  },
  {
    title: "Take a quick quiz",
    description: "Test your recall and identify the ideas you should review again.",
  },
  {
    title: "Explain it aloud",
    description: "Use the analogy as a teaching prompt to make the concept stick.",
  },
];

export default function FeynmanPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<FeynmanSummary | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("studyData");
    if (!raw) { router.push("/upload"); return; }
    setSummary(JSON.parse(raw) as FeynmanSummary);
  }, [router]);

  if (!summary) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto animate-slide-up">
          <div className="badge bg-amber-50 text-amber-400 mb-4">💡 Feynman Summary</div>
          <h1 className="font-bold text-3xl text-ink mb-6">{summary.title}</h1>

          {/* Main explanation */}
          <div className="card p-8 mb-5">
            <p className="font-semibold text-sm text-gray-400 uppercase tracking-wider mb-3">Plain-language explanation</p>
            <p className="text-base text-ink leading-relaxed">{summary.explanation}</p>
          </div>

          {/* Key points */}
          <div className="card p-8 mb-5">
            <p className="font-semibold text-sm text-gray-400 uppercase tracking-wider mb-4">Key points</p>
            <ul className="space-y-3">
              {summary.keyPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-ink leading-relaxed">{pt}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Analogy */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8 mb-6">
            <p className="font-semibold text-sm text-amber-400 uppercase tracking-wider mb-3">The analogy</p>
            <p className="text-base text-ink leading-relaxed italic">&ldquo;{summary.analogy}&rdquo;</p>
          </div>

          <div className="card p-6 mb-6">
            <p className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3">How to use this summary</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Read the explanation aloud and explain it in your own words.</li>
              <li>• Review the key points one by one and pinpoint any gaps.</li>
              <li>• Use the analogy as a memory hook when revising later.</li>
            </ul>
          </div>

          <div className="grid gap-3 mb-8">
            {NEXT_STEPS.map((step) => (
              <div key={step.title} className="card p-5 border border-gray-100">
                <p className="font-semibold text-sm text-ink mb-2">{step.title}</p>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Link href="/upload" className="btn-ghost flex-1 text-center">New study set</Link>
            <Link href="/upload" className="btn-primary flex-1 text-center">Generate quiz from this →</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
