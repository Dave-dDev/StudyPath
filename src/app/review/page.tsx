"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import toast from "react-hot-toast";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: string;
  topic: string;
  timesSeen: number;
  timesCorrect: number;
}

export default function ReviewPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "mistakes">("mistakes");

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/question-bank?mistakes=${filter === "mistakes"}&limit=50`);
      const data = await res.json();
      setQuestions(data.questions || []);
      setCurrentIdx(0);
      setSelected(null);
      setShowExplanation(false);
      setCorrectCount(0);
      setWrongCount(0);
      setCompleted(false);
    } catch {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const current = questions[currentIdx];
  const progress = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;

  async function handleAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
    const correct = idx === current.correctIndex;

    if (correct) setCorrectCount((c) => c + 1);
    else setWrongCount((w) => w + 1);

    try {
      await fetch("/api/question-bank", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: current.id, correct }),
      });
    } catch {}
  }

  function handleNext() {
    if (currentIdx + 1 >= questions.length) {
      setCompleted(true);
    } else {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  }

  function handleRestart() {
    setCurrentIdx(0);
    setSelected(null);
    setShowExplanation(false);
    setCorrectCount(0);
    setWrongCount(0);
    setCompleted(false);
    fetchQuestions();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-400 border-t-transparent rounded-full" />
        </main>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="text-5xl mb-4">📝</div>
            <h1 className="text-2xl font-bold mb-2">No questions yet</h1>
            <p className="text-gray-400 mb-6">
              Take a quiz first to build your question bank, then come back to review your mistakes.
            </p>
            <Button onClick={() => router.push("/upload")}>Create a study set</Button>
          </div>
        </main>
      </div>
    );
  }

  if (completed) {
    const total = correctCount + wrongCount;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="text-5xl mb-4">{accuracy >= 80 ? "🎉" : accuracy >= 50 ? "💪" : "📚"}</div>
            <h1 className="text-3xl font-bold mb-4">Review Complete!</h1>
            <div className="flex gap-8 justify-center mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-teal-400">{accuracy}%</div>
                <div className="text-gray-400 text-sm">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400">{correctCount}</div>
                <div className="text-gray-400 text-sm">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-400">{wrongCount}</div>
                <div className="text-gray-400 text-sm">Wrong</div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleRestart} variant="secondary">Review again</Button>
              <Button onClick={() => router.push("/upload")}>New study set</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Review Mistakes</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("mistakes")}
                className={`px-3 py-1 rounded-full text-sm ${filter === "mistakes" ? "bg-red-500/20 text-red-400" : "bg-white/5 text-gray-400 hover:text-white"}`}
              >
                Mistakes ({questions.length})
              </button>
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-full text-sm ${filter === "all" ? "bg-teal-500/20 text-teal-400" : "bg-white/5 text-gray-400 hover:text-white"}`}
              >
                All Questions
              </button>
            </div>
          </div>

          <ProgressBar current={currentIdx + 1} total={questions.length} />

          <Card className="mt-6 p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-gray-400">
                {current.difficulty}
              </span>
              {current.topic && (
                <span className="px-2 py-0.5 rounded text-xs bg-teal-500/20 text-teal-400">
                  {current.topic}
                </span>
              )}
              <span className="text-xs text-gray-500 ml-auto">
                Seen {current.timesSeen}x · {current.timesCorrect} correct
              </span>
            </div>

            <h2 className="text-lg font-semibold mb-6">{current.question}</h2>

            <div className="space-y-3">
              {current.options.map((opt, idx) => {
                let bg = "bg-white/5 hover:bg-white/10 cursor-pointer";
                if (selected !== null) {
                  if (idx === current.correctIndex) bg = "bg-green-500/20 border-green-500/50";
                  else if (idx === selected) bg = "bg-red-500/20 border-red-500/50";
                  else bg = "bg-white/5 opacity-50";
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={selected !== null}
                    className={`w-full text-left p-4 rounded-xl border border-white/10 transition-all ${bg}`}
                  >
                    <span className="font-mono text-sm text-gray-400 mr-3">{String.fromCharCode(65 + idx)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="mt-6 p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
                <div className="text-sm font-semibold text-teal-400 mb-1">Explanation</div>
                <p className="text-gray-300 text-sm">{current.explanation}</p>
              </div>
            )}

            {selected !== null && (
              <div className="mt-6 flex justify-end">
                <Button onClick={handleNext}>
                  {currentIdx + 1 >= questions.length ? "See results" : "Next question"}
                </Button>
              </div>
            )}
          </Card>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
            <span>✅ {correctCount} correct</span>
            <span>❌ {wrongCount} wrong</span>
          </div>
        </div>
      </main>
    </div>
  );
}
