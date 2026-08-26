"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/Card";
import toast from "react-hot-toast";
import { Lock } from "lucide-react";
import type { Plan } from "@/types";

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

interface RetentionPoint {
  weekStart: string;
  accuracy: number | null;
  sessions: number;
}

interface TopicAccuracy {
  topic: string;
  seen: number;
  accuracy: number;
}

interface AdvancedAnalytics {
  readiness: { score: number; factors: { key: string; label: string; value: number }[] };
  retentionCurve: RetentionPoint[];
  weakTopics: TopicAccuracy[];
  strongTopics: TopicAccuracy[];
  forecast: {
    days: { date: string; dueCards: number; estMinutes: number }[];
    totalDue: number;
    totalMinutes: number;
  };
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [plan, setPlan] = useState<Plan>("free");
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [advanced, setAdvanced] = useState<AdvancedAnalytics | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/performance?days=${days}`);
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      setStats(data.stats);
      if (data.plan) setPlan(data.plan);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [days, router]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const fetchAdvanced = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics-advanced");
      if (res.ok) {
        setAdvanced(await res.json());
      } else {
        setAdvanced(null);
      }
    } catch {
      setAdvanced(null);
    }
  }, []);

  useEffect(() => { fetchAdvanced(); }, [fetchAdvanced]);

  const isPro = plan === "pro";

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

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Analytics</h1>
              {!isPro && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Showing last 30 days · <Link href="/pricing" className="text-teal-500 font-semibold hover:underline">Upgrade for full history</Link>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {[7, 30, 90].map((d) => {
                const locked = !isPro && d > 30;
                return (
                  <button
                    key={d}
                    onClick={() => (locked ? router.push("/pricing") : setDays(d))}
                    className={`px-3 py-1 rounded-full text-sm inline-flex items-center gap-1 ${
                      days === d && !locked
                        ? "bg-teal-500/20 text-teal-400"
                        : locked
                          ? "bg-gray-100 text-gray-400 hover:text-gray-600"
                          : "bg-white text-gray-400 hover:text-gray-700 border border-gray-200"
                    }`}
                    title={locked ? "90-day history is a Pro feature" : undefined}
                  >
                    {locked && <Lock size={12} />}
                    {d}d
                  </button>
                );
              })}
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

          {/* PRO INSIGHTS */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-bold">Pro insights</h2>
              {!isPro && (
                <span className="text-[10px] font-semibold uppercase tracking-wide bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">
                  Pro
                </span>
              )}
            </div>

            {!isPro ? (
              <LockedProPanel />
            ) : advanced ? (
              <ProInsights data={advanced} />
            ) : (
              <Card className="p-8 text-center text-sm text-gray-400">Loading Pro insights…</Card>
            )}
          </section>

          {/* Accuracy over time chart */}
          {stats.accuracyOverTime.length > 0 && (
            <Card className="p-6 mb-8">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Accuracy Over Time</h2>
              <div className="relative h-48">
                <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-[10px] text-gray-500">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>
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

// ── Locked Pro panel (free users) ─────────────────────────

function LockedProPanel() {
  const router = useRouter();
  const cards = [
    { icon: "🎯", title: "Exam-readiness score", desc: "A single 0–100 score that tells you how prepared you are." },
    { icon: "📈", title: "Retention curves", desc: "See how your accuracy trends week over week." },
    { icon: "🧭", title: "Weak-topic breakdown", desc: "Find exactly which topics are holding you back." },
    { icon: "🗓", title: "Study-time forecasts", desc: "Know how many minutes you need over the next 14 days." },
  ];
  return (
    <div>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {cards.map((c) => (
          <Card key={c.title} className="p-5 relative overflow-hidden">
            <div className="flex items-start gap-3 opacity-60 select-none">
              <div className="text-2xl">{c.icon}</div>
              <div>
                <div className="font-semibold text-ink text-sm">{c.title}</div>
                <div className="text-xs text-gray-400 mt-1">{c.desc}</div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[3px]">
              <div className="flex items-center gap-2 text-teal-600 font-semibold text-sm bg-white border border-teal-200 rounded-full px-4 py-2 shadow">
                <Lock size={14} /> Unlock with Pro
              </div>
            </div>
          </Card>
        ))}
      </div>
      <button onClick={() => router.push("/pricing")} className="btn-primary w-full text-sm py-3">
        ⭐ Upgrade to unlock advanced analytics
      </button>
    </div>
  );
}

// ── Pro insights ──────────────────────────────────────────

function ProInsights({ data }: { data: AdvancedAnalytics }) {
  const { readiness, retentionCurve, weakTopics, strongTopics, forecast } = data;
  const curve = retentionCurve.filter((p) => p.accuracy !== null);
  const maxDue = Math.max(...forecast.days.map((d) => d.dueCards), 1);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        {/* Readiness */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Exam Readiness</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20 shrink-0">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <path d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32" fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
                <path
                  d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32"
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="3.5"
                  strokeDasharray={`${readiness.score}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-ink">
                {readiness.score}
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {readiness.score >= 80 ? "You're exam-ready. Keep it up!" : readiness.score >= 50 ? "You're getting close — focus on your weak topics." : "Build consistency to boost your score."}
            </p>
          </div>
          <div className="space-y-2">
            {readiness.factors.map((f) => (
              <div key={f.key}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-500">{f.label}</span>
                  <span className="font-semibold text-gray-700">{f.value}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-400 rounded-full" style={{ width: `${Math.min(f.value, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Retention curve */}
        <Card className="p-6 md:col-span-2">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Retention Curve (12 weeks)</h3>
          {curve.length >= 2 ? (
            <>
              <svg viewBox="0 0 100 42" preserveAspectRatio="none" className="w-full h-40">
                <polyline
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="1.5"
                  strokeDasharray="none"
                  points={curve.map((p, i) => {
                    const x = (i / (curve.length - 1)) * 100;
                    const y = 40 - (Number(p.accuracy) / 100) * 36;
                    return `${x},${y}`;
                  }).join(" ")}
                />
                {curve.map((p, i) => {
                  const x = (i / (curve.length - 1)) * 100;
                  const y = 40 - (Number(p.accuracy) / 100) * 36;
                  return <circle key={p.weekStart} cx={x} cy={y} r="1.2" fill="#0f766e" />;
                })}
              </svg>
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>{curve[0].weekStart}</span>
                <span>{curve[curve.length - 1].weekStart}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 py-10 text-center">Not enough weekly data yet — study over a few weeks to see trends.</p>
          )}
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Weak topics */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Weak Topics</h3>
          {weakTopics.length > 0 ? (
            <div className="space-y-3">
              {weakTopics.map((t) => (
                <div key={t.topic} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-300 truncate">{t.topic}</div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${t.accuracy}%` }} />
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-400 shrink-0">
                    {t.accuracy}%
                    <div className="text-[10px] text-gray-500">{t.seen}x seen</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-6 text-center">No weak topics detected yet.</p>
          )}
          {strongTopics.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Strong Topics</h4>
              <div className="space-y-2">
                {strongTopics.map((t) => (
                  <div key={t.topic} className="flex justify-between text-sm">
                    <span className="text-gray-300 truncate">{t.topic}</span>
                    <span className="text-teal-400 font-semibold">{t.accuracy}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Forecast */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Study Forecast (14 days)</h3>
            <span className="text-xs text-gray-400">≈ {forecast.totalMinutes} min · {forecast.totalDue} cards</span>
          </div>
          <div className="h-32 flex items-end gap-1 mb-1">
            {forecast.days.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                <div className="absolute -top-7 hidden group-hover:block bg-black text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10">
                  {d.date}: {d.dueCards} cards (~{d.estMinutes}m)
                </div>
                <div
                  className="w-full rounded-t bg-teal-400/80 hover:bg-teal-400 transition-all"
                  style={{ height: `${Math.max((d.dueCards / maxDue) * 100, d.dueCards > 0 ? 8 : 2)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>{forecast.days[0]?.date}</span>
            <span>{forecast.days[forecast.days.length - 1]?.date}</span>
          </div>
          <p className="text-xs text-gray-400 mt-3 leading-relaxed">
            Estimated time based on your spaced-repetition schedule (~10s per card).
          </p>
        </Card>
      </div>
    </div>
  );
}
