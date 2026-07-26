"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/Card";
import toast from "react-hot-toast";

interface AccuracyPoint {
  date: string;
  accuracy: number;
  sessions: number;
}

interface DifficultyStat {
  difficulty: string;
  count: number;
  avgAccuracy: number;
}

interface TopicStat {
  topic: string;
  count: number;
  avgAccuracy: number;
}

interface PerformanceStats {
  totalSessions: number;
  avgAccuracy: number;
  accuracyOverTime: AccuracyPoint[];
  byDifficulty: DifficultyStat[];
  byTopic: TopicStat[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/performance?days=${days}`);
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      setStats(data.stats);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [days, router]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

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

  if (!stats || stats.totalSessions === 0) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="text-5xl mb-4">📊</div>
            <h1 className="text-2xl font-bold mb-2">No data yet</h1>
            <p className="text-gray-400 mb-6">Take some quizzes to see your analytics here.</p>
            <button onClick={() => router.push("/upload")} className="btn-primary">Create a study set</button>
          </div>
        </main>
      </div>
    );
  }

  const maxAccuracy = Math.max(...stats.accuracyOverTime.map((p) => p.accuracy), 1);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Analytics</h1>
            <div className="flex gap-2">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1 rounded-full text-sm ${days === d ? "bg-teal-500/20 text-teal-400" : "bg-white/5 text-gray-400 hover:text-white"}`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-5 text-center">
              <div className="text-3xl font-bold text-teal-400">{stats.totalSessions}</div>
              <div className="text-xs text-gray-400 mt-1">Total Sessions</div>
            </Card>
            <Card className="p-5 text-center">
              <div className="text-3xl font-bold text-teal-400">{stats.avgAccuracy}%</div>
              <div className="text-xs text-gray-400 mt-1">Avg Accuracy</div>
            </Card>
            <Card className="p-5 text-center">
              <div className="text-3xl font-bold text-teal-400">{stats.byDifficulty.length}</div>
              <div className="text-xs text-gray-400 mt-1">Difficulties Tried</div>
            </Card>
            <Card className="p-5 text-center">
              <div className="text-3xl font-bold text-teal-400">{stats.byTopic.length}</div>
              <div className="text-xs text-gray-400 mt-1">Topics Covered</div>
            </Card>
          </div>

          {/* Accuracy over time chart */}
          {stats.accuracyOverTime.length > 0 && (
            <Card className="p-6 mb-8">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Accuracy Over Time</h2>
              <div className="relative h-48">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-[10px] text-gray-500">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>
                {/* Chart area */}
                <div className="ml-12 h-full flex items-end gap-1">
                  {stats.accuracyOverTime.slice(-30).map((point, i) => {
                    const height = (point.accuracy / 100) * 100;
                    const color = point.accuracy >= 80 ? "bg-teal-400" : point.accuracy >= 50 ? "bg-amber-400" : "bg-red-400";
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group relative">
                        <div className="absolute -top-8 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                          {point.date}: {point.accuracy}% ({point.sessions} sessions)
                        </div>
                        <div
                          className={`w-full rounded-t ${color} transition-all hover:opacity-80`}
                          style={{ height: `${Math.max(height, 4)}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                {/* X-axis */}
                {stats.accuracyOverTime.length > 1 && (
                  <div className="ml-12 mt-1 flex justify-between text-[10px] text-gray-500">
                    <span>{stats.accuracyOverTime[0].date}</span>
                    <span>{stats.accuracyOverTime[stats.accuracyOverTime.length - 1].date}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* By Difficulty */}
            {stats.byDifficulty.length > 0 && (
              <Card className="p-6">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">By Difficulty</h2>
                <div className="space-y-4">
                  {stats.byDifficulty.map((d) => {
                    const colors: Record<string, string> = {
                      easy: "bg-green-400",
                      medium: "bg-amber-400",
                      hard: "bg-red-400",
                    };
                    return (
                      <div key={d.difficulty}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize text-gray-300">{d.difficulty}</span>
                          <span className="text-gray-400">{d.avgAccuracy}% ({d.count} sessions)</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${colors[d.difficulty] || "bg-teal-400"}`}
                            style={{ width: `${d.avgAccuracy}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* By Topic */}
            {stats.byTopic.length > 0 && (
              <Card className="p-6">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">By Topic</h2>
                <div className="space-y-3">
                  {stats.byTopic.slice(0, 8).map((t) => (
                    <div key={t.topic} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-300 truncate">{t.topic}</div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-teal-400 rounded-full"
                            style={{ width: `${t.avgAccuracy}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-400 shrink-0">
                        {t.avgAccuracy}%
                        <div className="text-[10px] text-gray-500">{t.count}x</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Activity heatmap */}
          {stats.accuracyOverTime.length > 0 && (
            <Card className="p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Study Activity (Last {days} Days)</h2>
              <div className="flex flex-wrap gap-1">
                {(() => {
                  const dayMap = new Map<string, number>();
                  stats.accuracyOverTime.forEach((p) => dayMap.set(p.date, p.sessions));
                  const today = new Date();
                  const cells = [];
                  for (let i = days - 1; i >= 0; i--) {
                    const d = new Date(today);
                    d.setDate(d.getDate() - i);
                    const key = d.toISOString().split("T")[0];
                    const count = dayMap.get(key) || 0;
                    const opacity = count === 0 ? 0.1 : Math.min(0.3 + count * 0.15, 1);
                    cells.push(
                      <div
                        key={key}
                        className="w-3 h-3 rounded-sm bg-teal-400 group relative"
                        style={{ opacity }}
                        title={`${key}: ${count} session${count !== 1 ? "s" : ""}`}
                      >
                        <div className="absolute -top-8 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                          {key}: {count} session{count !== 1 ? "s" : ""}
                        </div>
                      </div>
                    );
                  }
                  return cells;
                })()}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
