"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, ChevronRight, Trophy } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import ProgressBar from "@/components/ui/ProgressBar";
import type { QuizQuestion, QuizResults, QuizAnswer } from "@/types";
import { cn, formatDuration } from "@/lib/utils";

export default function QuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [startTime] = useState(Date.now());
  const [questionStart, setQuestionStart] = useState(Date.now());
  const [results, setResults] = useState<QuizResults | null>(null);
  const [streak, setStreak] = useState(0);
  const [studySetId, setStudySetId] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("studyData");
    const savedSetId = sessionStorage.getItem("studySetId");
    if (!raw) { router.push("/upload"); return; }
    setQuestions(JSON.parse(raw) as QuizQuestion[]);
    if (savedSetId) setStudySetId(savedSetId);
  }, [router]);

  const saveResults = useCallback(async (result: QuizResults) => {
    if (!studySetId) return;
    try {
      await fetch("/api/quiz-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studySetId,
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctAnswers,
          accuracy: result.accuracy,
          timeTakenMs: result.timeTakenMs,
          answers: result.answers,
        }),
      });
    } catch {
      // Best-effort — don't block UI
    }
  }, [studySetId]);

  if (!questions.length) return null;

  const q = questions[current];
  const answered = selected !== null;
  const isCorrect = selected === q.correctIndex;

  function handleSelect(idx: number) {
    if (answered) return;
    setSelected(idx);
  }

  function handleNext() {
    if (!answered) return;
    const answer: QuizAnswer = {
      questionId: q.id,
      selectedIndex: selected!,
      isCorrect: selected === q.correctIndex,
      timeMs: Date.now() - questionStart,
    };
    const newAnswers = [...answers, answer];
    const newStreak = answer.isCorrect ? streak + 1 : 0;
    setStreak(newStreak);

    if (current + 1 >= questions.length) {
      const correct = newAnswers.filter((a) => a.isCorrect).length;
      const finalResults: QuizResults = {
        totalQuestions: questions.length,
        correctAnswers: correct,
        accuracy: Math.round((correct / questions.length) * 100),
        timeTakenMs: Date.now() - startTime,
        answers: newAnswers,
      };
      setResults(finalResults);
      saveResults(finalResults);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setQuestionStart(Date.now());
      setAnswers(newAnswers);
    }
  }

  // ── RESULTS SCREEN ──
  if (results) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center p-8 bg-gray-50">
          <div className="card p-10 max-w-lg w-full text-center animate-slide-up">
            <Trophy size={48} className="mx-auto mb-4 text-teal-400" />
            <h1 className="font-bold text-3xl text-ink mb-1">Quiz Complete!</h1>
            <p className="text-gray-600 mb-8">
              Finished in {formatDuration(results.timeTakenMs)}
            </p>

            <div className="text-6xl font-bold text-teal-400 mb-1">{results.accuracy}%</div>
            <p className="text-gray-400 text-sm mb-8">accuracy</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Correct",   val: results.correctAnswers,                              color: "text-green-400" },
                { label: "Wrong",     val: results.totalQuestions - results.correctAnswers,     color: "text-coral-400" },
                { label: "Questions", val: results.totalQuestions,                              color: "text-ink" },
              ].map(({ label, val, color }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4">
                  <div className={cn("text-2xl font-bold", color)}>{val}</div>
                  <div className="text-xs text-gray-400 mt-1">{label}</div>
                </div>
              ))}
            </div>

            <div className="card p-5 mb-6 bg-white border border-gray-100">
              <p className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3">Next study steps</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Review any missed questions and turn them into flashcards.</li>
                <li>• Use the same material to create a Feynman summary for deeper understanding.</li>
                <li>• Retry the quiz later to track improvement over time.</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button onClick={() => router.push("/upload")} className="btn-ghost flex-1">New study set</button>
              <button
                onClick={() => {
                  setCurrent(0); setSelected(null);
                  setAnswers([]); setResults(null); setStreak(0);
                }}
                className="btn-primary flex-1"
              >
                Retry quiz
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── QUIZ SCREEN ──
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50">
        <ProgressBar current={current + 1} total={questions.length} />

        <div className="max-w-4xl mx-auto px-6 py-8 flex gap-6">
          <div className="flex-1 card p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <span className="badge-teal">Multiple Choice</span>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>Question {current + 1} of {questions.length}</span>
                {streak >= 2 && (
                  <span className="text-teal-700 font-medium">🔥 {streak}-question streak</span>
                )}
              </div>
            </div>

            <h2 className="font-semibold text-xl text-ink leading-relaxed mb-7">{q.question}</h2>

            <div className="space-y-3 mb-6">
              {q.options.map((opt, idx) => {
                const isSelected = selected === idx;
                const isRight = idx === q.correctIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={answered}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                      !answered && "hover:border-teal-200 hover:bg-teal-50/30 cursor-pointer",
                      !answered && "bg-gray-50 border-gray-200",
                      answered && isRight && "bg-teal-50 border-teal-400",
                      answered && isSelected && !isRight && "bg-coral-50 border-coral-400",
                      answered && !isSelected && !isRight && "bg-gray-50 border-gray-100 opacity-60",
                    )}
                  >
                    <span className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                      answered && isRight ? "bg-teal-100 text-teal-700"
                        : answered && isSelected ? "bg-coral-100 text-coral-700"
                        : "bg-gray-100 text-gray-500"
                    )}>
                      {["A","B","C","D"][idx]}
                    </span>
                    <span className={cn(
                      "text-sm flex-1",
                      answered && isRight ? "text-teal-700 font-semibold" : "text-ink"
                    )}>
                      {opt}
                    </span>
                    {answered && isRight && <CheckCircle size={18} className="text-teal-400 shrink-0" />}
                    {answered && isSelected && !isRight && <XCircle size={18} className="text-coral-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className={cn(
                "p-4 rounded-xl text-sm leading-relaxed mb-6 animate-fade-in",
                isCorrect ? "bg-teal-50 text-teal-700 border border-teal-100"
                          : "bg-coral-50 text-coral-700 border border-coral-50"
              )}>
                <span className="font-semibold">{isCorrect ? "✓ Correct! " : "✗ Not quite. "}</span>
                {q.explanation}
              </div>
            )}

            <button
              onClick={handleNext}
              disabled={!answered}
              className="btn-primary w-full"
            >
              {current + 1 === questions.length ? "See results" : "Next question"}
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="w-56 shrink-0 space-y-4">
            <div className="card p-5 text-center">
              <p className="text-xs text-gray-400 mb-1">Accuracy</p>
              <p className="text-4xl font-bold text-teal-400">
                {answers.length
                  ? Math.round((answers.filter((a) => a.isCorrect).length / answers.length) * 100)
                  : "—"}%
              </p>
              <p className="text-xs text-gray-400 mt-1">so far</p>
            </div>
            {[
              { label: "Correct",   val: answers.filter((a) => a.isCorrect).length,  color: "text-green-400" },
              { label: "Wrong",     val: answers.filter((a) => !a.isCorrect).length, color: "text-coral-400" },
              { label: "Remaining", val: questions.length - answers.length - (answered ? 0 : 0), color: "text-gray-400" },
            ].map(({ label, val, color }) => (
              <div key={label} className="card p-3 flex justify-between items-center">
                <span className="text-xs text-gray-400">{label}</span>
                <span className={cn("text-sm font-semibold", color)}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
