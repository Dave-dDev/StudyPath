"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const DEMO_CARDS = [
  {
    subject: "Biology",
    front: "Which organelle produces most of the cell's energy?",
    back: "Mitochondria — the site of cellular respiration and ATP production.",
  },
  {
    subject: "Calculus",
    front: "What is the derivative of x² with respect to x?",
    back: "2x — apply the power rule: bring the exponent down, subtract one.",
  },
  {
    subject: "Psychology",
    front: "What does the spacing effect describe?",
    back: "Information is retained better when review is spread out over time, not crammed.",
  },
];

const AUTO_FLIP_MS = 3000;
const RESUME_DELAY_MS = 9000;

export default function HeroStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef(true);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef(0);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Auto flip-through demo
  useEffect(() => {
    const t = setInterval(() => {
      if (!autoRef.current) return;
      tickRef.current += 1;
      if (tickRef.current % 2 === 1) {
        setFlipped(true);
      } else {
        setFlipped(false);
        setCardIdx((i) => (i + 1) % DEMO_CARDS.length);
      }
    }, AUTO_FLIP_MS);
    return () => clearInterval(t);
  }, []);

  // Mouse parallax (skipped for reduced motion / coarse pointers)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      el.style.setProperty("--px", x.toFixed(3));
      el.style.setProperty("--py", y.toFixed(3));
    };
    const onLeave = () => {
      el.style.setProperty("--px", "0");
      el.style.setProperty("--py", "0");
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  useEffect(() => () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  }, []);

  function handleClick() {
    autoRef.current = false;
    setFlipped((f) => !f);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      autoRef.current = true;
    }, RESUME_DELAY_MS);
  }

  const card = DEMO_CARDS[cardIdx];

  return (
    <div
      ref={stageRef}
      className="relative w-full max-w-3xl mx-auto h-[320px] sm:h-[400px] select-none"
    >
      {/* Glow under the stage */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[60%] rounded-full bg-teal-100/70 blur-3xl blob-glow" />

      {/* Flashcard */}
      <div
        className={cn("flip-card absolute left-1/2 top-1/2 w-[260px] sm:w-[420px] h-[190px] sm:h-[220px] cursor-pointer", flipped && "flipped")}
        style={{ transform: "translate(-50%, -50%) translate3d(calc(var(--px, 0) * -8px), calc(var(--py, 0) * -6px), 0)" }}
        onClick={handleClick}
        role="button"
        aria-label={flipped ? "Show question" : "Reveal answer"}
      >
        <div className="flip-card-inner relative w-full h-full">
          <div className="flip-card-front absolute inset-0 card border-2 border-teal-100 flex flex-col items-center justify-center p-5 sm:p-7 text-center shadow-lifted">
            <span className="badge-teal mb-3 sm:mb-4 text-[10px] tracking-widest uppercase">Question · {card.subject}</span>
            <p className="font-semibold text-base sm:text-xl text-ink leading-snug">{card.front}</p>
            <p className="text-[11px] text-gray-400 mt-3 sm:mt-5">Tap to reveal answer</p>
          </div>
          <div className="flip-card-back absolute inset-0 card border-2 border-purple-400 bg-purple-50 flex flex-col items-center justify-center p-5 sm:p-7 text-center shadow-lifted">
            <span className="badge bg-purple-50 text-purple-700 mb-3 sm:mb-4 text-[10px] tracking-widest uppercase">Answer</span>
            <p className="text-[13px] sm:text-base text-ink leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>

      {/* Floating chip: SM-2 scheduling (top-left) */}
      <div
        className="absolute left-0 top-1 z-10"
        style={{ transform: "translate3d(calc(var(--px, 0) * 14px), calc(var(--py, 0) * 10px), 0)", transition: "transform 0.2s ease-out" }}
      >
        <div className="anim-float flex items-center gap-2 sm:gap-2.5 bg-white border border-gray-100 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-lifted">
          <span className="text-lg sm:text-xl">🃏</span>
          <div className="text-left">
            <div className="text-[11px] sm:text-xs font-semibold text-ink">Spaced repetition</div>
            <div className="hidden sm:block text-[11px] text-gray-400">Next review in 3 days</div>
          </div>
        </div>
      </div>

      {/* Floating chip: quiz option (top-right) */}
      <div
        className="absolute right-0 top-3 z-10"
        style={{ transform: "translate3d(calc(var(--px, 0) * 18px), calc(var(--py, 0) * 12px), 0)", transition: "transform 0.2s ease-out" }}
      >
        <div className="anim-float-slow flex items-center gap-2 bg-white border border-teal-100 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-lifted">
          <span className="w-5 h-5 rounded-full bg-teal-400 text-white text-[10px] font-bold flex items-center justify-center">✓</span>
          <span className="text-[11px] sm:text-xs font-medium text-ink">Correct · +1 mastery</span>
        </div>
      </div>

      {/* Floating chip: streak (bottom-right) */}
      <div
        className="absolute right-0 bottom-2 z-10"
        style={{ transform: "translate3d(calc(var(--px, 0) * 12px), calc(var(--py, 0) * 16px), 0)", transition: "transform 0.2s ease-out" }}
      >
        <div className="anim-float flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-lifted">
          <span className="text-base sm:text-lg">🔥</span>
          <span className="text-[11px] sm:text-xs font-semibold text-ink">Study streak kept alive</span>
        </div>
      </div>

      {/* Floating chip: accuracy (bottom-left) */}
      <div
        className="absolute left-1 bottom-6 z-10"
        style={{ transform: "translate3d(calc(var(--px, 0) * 16px), calc(var(--py, 0) * 14px), 0)", transition: "transform 0.2s ease-out" }}
      >
        <div className="anim-float-slow flex items-center gap-2 sm:gap-2.5 bg-white border border-gray-100 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-lifted">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-400 text-[10px] sm:text-xs font-bold">92%</div>
          <div className="text-left">
            <div className="text-[10px] sm:text-[11px] text-gray-400">Quiz accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
}
