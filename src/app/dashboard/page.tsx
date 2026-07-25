"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface DashboardData {
  stats: {
    streak: number;
    dueCards: number;
    avgAccuracy: number;
    totalSets: number;
    totalQuizzes: number;
  };
  decks: { id: string; title: string; due: number; total: number }[];
  recentActivity: { icon: string; text: string; time: string }[];
  recentSets: { id: string; title: string; mode: string; difficulty: string; created_at: string }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          router.push("/login");
          return;
        }
        setData(json);
      })
      .catch(() => {
        // Fallback to empty state
        setData({
          stats: { streak: 0, dueCards: 0, avgAccuracy: 0, totalSets: 0, totalQuizzes: 0 },
          decks: [],
          recentActivity: [],
          recentSets: [],
        });
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (!data) return null;

  const STAT_CARDS = [
    { label: "Study streak",       val: `🔥 ${data.stats.streak} days`,    sub: `Personal best: ${data.stats.streak}`,     bg: "bg-coral-50" },
    { label: "Cards due today",    val: String(data.stats.dueCards),       sub: "From your decks",                        bg: "bg-purple-50" },
    { label: "Avg. accuracy",      val: `${data.stats.avgAccuracy}%`,      sub: `${data.stats.totalQuizzes} quizzes`,     bg: "bg-teal-50" },
    { label: "Study sets",         val: String(data.stats.totalSets),      sub: `${data.stats.totalQuizzes} quizzes taken`, bg: "bg-blue-50" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 overflow-y-auto">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <p className="font-semibold text-lg text-ink">Welcome back 👋</p>
          <Link href="/upload" className="btn-primary text-sm px-5 py-2">
            + New study set
          </Link>
        </div>

        <div className="p-8 max-w-6xl mx-auto">
          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {STAT_CARDS.map(({ label, val, sub, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-5 border border-gray-100`}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="font-bold text-2xl text-ink">{val}</p>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
              </div>
            ))}
          </div>

          {/* ── Due today ── */}
          {data.decks.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg text-ink">Due for review today</h2>
                <span className="text-xs text-gray-400">{data.stats.dueCards} cards across {data.decks.length} decks</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.decks.map((deck) => (
                  <div key={deck.id} className="card p-5 flex items-center gap-4 hover:border-gray-200 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-ink truncate">{deck.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{deck.due} cards due</span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400">{deck.total} total</span>
                      </div>
                    </div>
                    <Link href="/flashcards" className="btn-primary text-xs px-4 py-2 shrink-0">
                      Review →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Recent study sets ── */}
          {data.recentSets.length > 0 && (
            <div className="mb-8">
              <h2 className="font-semibold text-lg text-ink mb-4">Your study sets</h2>
              <div className="card overflow-hidden">
                {data.recentSets.map((set, i) => (
                  <div
                    key={set.id}
                    className={`flex items-center gap-3 px-5 py-3.5 text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <span className="text-base shrink-0">
                      {set.mode === "quiz" ? "📝" : set.mode === "flashcards" ? "🃏" : "💡"}
                    </span>
                    <span className="flex-1 text-ink font-medium truncate">{set.title}</span>
                    <span className="badge bg-gray-100 text-gray-600 text-[10px]">{set.difficulty}</span>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(set.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Recent activity ── */}
          {data.recentActivity.length > 0 && (
            <div>
              <h2 className="font-semibold text-lg text-ink mb-4">Recent activity</h2>
              <div className="card overflow-hidden">
                {data.recentActivity.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-5 py-3.5 text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <span className="text-base shrink-0">{item.icon}</span>
                    <span className="flex-1 text-ink">{item.text}</span>
                    <span className="text-xs text-gray-400 shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Empty state ── */}
          {data.stats.totalSets === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📚</div>
              <h2 className="font-bold text-xl text-ink mb-2">No study sets yet</h2>
              <p className="text-gray-500 text-sm mb-6">Upload your first notes to get started</p>
              <Link href="/upload" className="btn-primary">
                Create your first study set →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
