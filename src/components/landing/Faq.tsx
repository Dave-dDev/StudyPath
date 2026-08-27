"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "Is StudyPath free to use?",
    a: "Yes. The free plan includes 3 study set generations per day, up to 10 saved study sets per month, and 5 file or URL imports per day — plus full access to quizzes, flashcards, Feynman summaries, and basic analytics. Upgrade to Pro anytime for unlimited usage and advanced insights.",
  },
  {
    q: "What can I upload or paste?",
    a: "PDFs, .txt and .md files up to 10 MB, plain text pasted directly, or a URL — StudyPath fetches and extracts the article content for you. The text becomes the source for your quizzes, flashcards, or summaries.",
  },
  {
    q: "How does spaced repetition work?",
    a: "Flashcards use the SM-2 algorithm: after each review you rate how well you knew the card, and the next review date is scheduled based on that. Cards you struggle with come back sooner; cards you know well are pushed further out. That's why reviewing takes less time while retention improves.",
  },
  {
    q: "Can I review my flashcards offline?",
    a: "Yes. If your connection drops mid-session, your reviews keep working and are saved locally. They sync back to your account automatically once you're online again.",
  },
  {
    q: "What do I get with Pro?",
    a: "Unlimited generations, study sets, and imports, plus advanced analytics: retention curves, weak-topic breakdowns, an exam-readiness score, and 14-day study-time forecasts. You also get unlimited performance history.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {FAQS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className={cn(
              "bg-white rounded-2xl border transition-colors duration-200",
              isOpen ? "border-teal-100 shadow-card" : "border-gray-100 hover:border-gray-200"
            )}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-semibold text-sm text-ink">{item.q}</span>
              <span
                className={cn(
                  "w-6 h-6 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-sm shrink-0 transition-transform duration-300",
                  isOpen && "rotate-45"
                )}
              >
                +
              </span>
            </button>
            <div className={cn("faq-body", isOpen && "open")}>
              <div>
                <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
