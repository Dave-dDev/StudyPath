"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Sidebar from "@/components/layout/Sidebar";
import ProgressBar from "@/components/ui/ProgressBar";
import type { Flashcard, SM2Grade } from "@/types";
import { sm2, gradeIntervalPreview } from "@/lib/sm2";
import { cn } from "@/lib/utils";
import { isOffline, queueOfflineUpdate, offlinePendingCount, flushOfflineQueue, type OfflineProgressUpdate } from "@/lib/offline";

const OFFLINE_DECK_KEY = "sp_offline_deck_v1";

const GRADES: { grade: SM2Grade; label: string; emoji: string; style: string }[] = [
  { grade: 1, label: "Again",  emoji: "😰", style: "bg-coral-50  text-coral-700  border-coral-400" },
  { grade: 3, label: "Hard",   emoji: "🤔", style: "bg-amber-50  text-amber-400  border-amber-400" },
  { grade: 4, label: "Easy",   emoji: "😊", style: "bg-teal-50   text-teal-700   border-teal-400"  },
  { grade: 5, label: "Perfect",emoji: "🧠", style: "bg-purple-50 text-purple-700 border-purple-400" },
];

export default function FlashcardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState({ again: 0, hard: 0, easy: 0, perfect: 0 });
  const [studySetId, setStudySetId] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);

  // Load deck from sessionStorage, falling back to the offline deck cache
  useEffect(() => {
    const raw = sessionStorage.getItem("studyData");
    const savedSetId = sessionStorage.getItem("studySetId");
    if (raw) {
      setCards(JSON.parse(raw) as Flashcard[]);
      if (savedSetId) setStudySetId(savedSetId);
      try {
        localStorage.setItem(
          OFFLINE_DECK_KEY,
          JSON.stringify({
            studySetId: savedSetId,
            cards: JSON.parse(raw),
            meta: JSON.parse(sessionStorage.getItem("studyMeta") ?? "{}"),
          })
        );
      } catch {}
      return;
    }
    try {
      const cached = localStorage.getItem(OFFLINE_DECK_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.cards) && parsed.cards.length > 0) {
          sessionStorage.setItem("studyData", JSON.stringify(parsed.cards));
          if (parsed.studySetId) {
            sessionStorage.setItem("studySetId", parsed.studySetId);
            setStudySetId(parsed.studySetId);
          }
          if (parsed.meta) sessionStorage.setItem("studyMeta", JSON.stringify(parsed.meta));
          setCards(parsed.cards as Flashcard[]);
          return;
        }
      }
    } catch {}
    router.push("/upload");
  }, [router]);

  // Track connectivity + auto-sync queued offline reviews
  useEffect(() => {
    setOffline(isOffline());
    setPendingSync(offlinePendingCount());

    const goOnline = async () => {
      setOffline(false);
      const synced = await flushOfflineQueue();
      setPendingSync(offlinePendingCount());
      if (synced > 0) toast.success(`Synced ${synced} offline review session${synced > 1 ? "s" : ""}`);
    };
    const goOffline = () => setOffline(true);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const saveProgress = useCallback(async (updatedCards: Flashcard[]) => {
    if (!studySetId) return;

    const payloadCards = updatedCards.map((c) => ({
      cardId: c.id,
      easeFactor: c.easeFactor,
      interval: c.interval,
      repetitions: c.repetitions,
      nextReview: c.nextReview instanceof Date ? c.nextReview.toISOString() : String(c.nextReview),
    }));

    const meta = sessionStorage.getItem("studyMeta");
    const parsed = meta ? JSON.parse(meta) : {};
    const total = stats.again + stats.hard + stats.easy + stats.perfect;
    const accuracy = total > 0 ? Math.round(((stats.easy + stats.perfect) / total) * 100) : 0;
    const performance = {
      mode: "flashcards",
      difficulty: parsed.difficulty || "medium",
      accuracy,
    };

    const queueIt = () => {
      const update: OfflineProgressUpdate = {
        studySetId,
        cards: payloadCards,
        performance,
        queuedAt: Date.now(),
      };
      queueOfflineUpdate(update);
      setPendingSync(offlinePendingCount());
    };

    if (isOffline()) {
      queueIt();
      toast("You're offline — progress saved locally and will sync automatically.", { icon: "📴", duration: 5000 });
      return;
    }

    try {
      const res = await fetch("/api/flashcard-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studySetId, cards: payloadCards }),
      });
      if (!res.ok) throw new Error("Sync failed");
      await fetch("/api/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studySetId, ...performance }),
      }).catch(() => {});
    } catch {
      queueIt();
    }
  }, [studySetId, stats]);

  const offlineBanner = (offline || pendingSync > 0) && (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-700 text-xs text-center py-2 px-4">
      {offline
        ? "📴 Offline mode — your reviews are saved locally and will sync when you're back online."
        : `⏳ ${pendingSync} offline review session${pendingSync > 1 ? "s" : ""} waiting to sync — reconnect to continue.`}
    </div>
  );

  if (!cards.length) return null;

  const card = cards[index];

  function handleGrade(grade: SM2Grade) {
    const updated = cards.map((c, i) =>
      i === index ? { ...c, ...sm2(c, grade) } : c
    );
    setCards(updated);

    const key = grade <= 1 ? "again" : grade <= 3 ? "hard" : grade <= 4 ? "easy" : "perfect";
    setStats((s) => ({ ...s, [key]: s[key as keyof typeof s] + 1 }));

    if (index + 1 >= cards.length) {
      setDone(true);
      saveProgress(updated);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  }

  // ── DONE SCREEN ──
  if (done) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col bg-gray-50">
          {offlineBanner}
          <div className="flex-1 flex items-center justify-center">
          <div className="card p-10 max-w-md w-full text-center animate-slide-up">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="font-bold text-2xl text-ink mb-2">Session complete!</h2>
            <p className="text-gray-400 text-sm mb-8">All {cards.length} cards reviewed</p>
            <div className="grid grid-cols-2 gap-3 mb-8 text-sm">
              {[
                { label: "Again",   val: stats.again,   color: "text-coral-400" },
                { label: "Hard",    val: stats.hard,    color: "text-amber-400" },
                { label: "Easy",    val: stats.easy,    color: "text-teal-400" },
                { label: "Perfect", val: stats.perfect, color: "text-purple-400" },
              ].map(({ label, val, color }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <div className={cn("text-xl font-bold", color)}>{val}</div>
                  <div className="text-xs text-gray-400">{label}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => router.push("/upload")} className="btn-ghost flex-1 text-sm">New set</button>
              <button
                onClick={() => { setIndex(0); setFlipped(false); setDone(false); setStats({ again:0, hard:0, easy:0, perfect:0 }); }}
                className="btn-primary flex-1 text-sm"
              >
                Review again
              </button>
            </div>
          </div>
          </div>
        </main>
      </div>
    );
  }

  // ── FLASHCARD SCREEN ──
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50">
        {offlineBanner}
        <ProgressBar current={index + 1} total={cards.length} />

        <div className="max-w-4xl mx-auto px-6 py-8 flex gap-6">
          <div className="flex-1">
            <div className="text-center mb-6">
              <h2 className="font-bold text-2xl text-ink">Flashcard Review</h2>
              <p className="text-sm text-gray-400 mt-1">
                Card {index + 1} of {cards.length}
              </p>
            </div>

            <div
              className={cn("flip-card w-full cursor-pointer mb-5", flipped && "flipped")}
              onClick={() => setFlipped((f) => !f)}
              style={{ height: 280 }}
            >
              <div className="flip-card-inner relative w-full h-full">
                <div className="flip-card-front absolute inset-0 card border-2 border-teal-100 flex flex-col items-center justify-center p-8 text-center">
                  <span className="badge-teal mb-4 text-[11px] tracking-widest uppercase">Question</span>
                  <p className="font-semibold text-xl text-ink leading-relaxed">{card.front}</p>
                  <p className="text-xs text-gray-400 mt-6">Click to reveal answer</p>
                </div>
                <div className="flip-card-back absolute inset-0 card border-2 border-purple-400 bg-purple-50 flex flex-col items-center justify-center p-8 text-center">
                  <span className="badge bg-purple-50 text-purple-700 mb-4 text-[11px] tracking-widest uppercase">Answer</span>
                  <p className="text-base text-ink leading-relaxed">{card.back}</p>
                </div>
              </div>
            </div>

            {!flipped && (
              <button
                onClick={() => setFlipped(true)}
                className="btn-primary w-full mb-5"
              >
                Reveal answer 👁
              </button>
            )}

            {flipped && (
              <div className="grid grid-cols-4 gap-3 animate-fade-in">
                {GRADES.map(({ grade, label, emoji, style }) => (
                  <button
                    key={grade}
                    onClick={() => handleGrade(grade)}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-xl border-2 font-medium text-sm transition-all hover:scale-105",
                      style
                    )}
                  >
                    <span className="text-xl mb-1">{emoji}</span>
                    <span>{label}</span>
                    <span className="text-[10px] opacity-70 mt-0.5">
                      {gradeIntervalPreview(card, grade)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-center gap-1.5 mt-6">
              {cards.slice(0, Math.min(cards.length, 20)).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    i < index ? "bg-teal-400" : i === index ? "bg-teal-700" : "bg-gray-200"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="w-52 shrink-0 space-y-4">
            <div className="card p-5">
              <p className="font-semibold text-sm text-ink mb-2">Spaced repetition</p>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Next review is calculated based on how well you knew this card.
              </p>
              {GRADES.map(({ label, grade }) => (
                <div key={grade} className="flex justify-between items-center py-1.5 text-xs border-b border-gray-100 last:border-0">
                  <span className="text-gray-400">{label} →</span>
                  <span className="font-semibold text-teal-700">{gradeIntervalPreview(card, grade)}</span>
                </div>
              ))}
            </div>

            <div className="card p-5">
              <p className="font-semibold text-sm text-ink mb-3">Session</p>
              {[
                { label: "Again",   val: stats.again,   color: "text-coral-400" },
                { label: "Easy",    val: stats.easy,    color: "text-teal-400" },
                { label: "Perfect", val: stats.perfect, color: "text-purple-400" },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex justify-between text-xs py-1">
                  <span className="text-gray-400">{label}</span>
                  <span className={cn("font-bold", color)}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
