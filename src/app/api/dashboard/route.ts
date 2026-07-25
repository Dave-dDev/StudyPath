import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";

export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = Math.floor(Date.now() / 1000);

  const [setsResult, resultsResult, progressResult] = await Promise.all([
    db.execute({ sql: "SELECT id, title, mode, difficulty, created_at FROM study_sets WHERE user_id = ? ORDER BY created_at DESC", args: [user.id] }),
    db.execute({ sql: "SELECT id, accuracy, created_at FROM quiz_results WHERE user_id = ? ORDER BY created_at DESC", args: [user.id] }),
    db.execute({ sql: "SELECT card_id, ease_factor, interval_days, next_review, study_set_id FROM flashcard_progress WHERE user_id = ?", args: [user.id] }),
  ]);

  const sets = setsResult.rows;
  const results = resultsResult.rows;
  const progress = progressResult.rows;

  const totalSets = sets.length;
  const totalQuizzes = results.length;
  const avgAccuracy = totalQuizzes > 0
    ? Math.round(results.reduce((sum: number, r: Record<string, unknown>) => sum + Number(r.accuracy), 0) / totalQuizzes)
    : 0;

  const dueCards = progress.filter((p) => Number(p.next_review) <= now).length;

  // Streak calculation
  const activityDays = new Set<string>();
  results.forEach((r) => activityDays.add(new Date(Number(r.created_at) * 1000).toDateString()));
  sets.forEach((s) => activityDays.add(new Date(Number(s.created_at) * 1000).toDateString()));

  let streak = 0;
  const date = new Date();
  while (activityDays.has(date.toDateString())) {
    streak++;
    date.setDate(date.getDate() - 1);
  }

  // Recent activity
  const activity: { icon: string; text: string; time: string }[] = [];
  results.slice(0, 5).forEach((r) => {
    activity.push({
      icon: "✅",
      text: `Completed a quiz · ${r.accuracy}% accuracy`,
      time: new Date(Number(r.created_at) * 1000).toLocaleDateString(),
    });
  });
  sets.slice(0, 5).forEach((s) => {
    activity.push({
      icon: s.mode === "quiz" ? "📝" : s.mode === "flashcards" ? "🃏" : "💡",
      text: `Generated ${s.title}`,
      time: new Date(Number(s.created_at) * 1000).toLocaleDateString(),
    });
  });
  activity.sort((a, b) => b.time.localeCompare(a.time));

  // Decks with due cards
  const decksBySet = new Map<string, { title: string; due: number; total: number }>();
  progress.forEach((p) => {
    const setId = String(p.study_set_id ?? "unknown");
    const existing = decksBySet.get(setId) ?? { title: "Study Set", due: 0, total: 0 };
    existing.total++;
    if (Number(p.next_review) <= now) existing.due++;
    decksBySet.set(setId, existing);
  });
  sets.forEach((s) => {
    const deck = decksBySet.get(String(s.id));
    if (deck) deck.title = String(s.title);
  });

  const decks = Array.from(decksBySet.entries())
    .map(([id, d]) => ({ id, ...d }))
    .filter((d) => d.total > 0)
    .sort((a, b) => b.due - a.due);

  return NextResponse.json({
    stats: { streak, dueCards, avgAccuracy, totalSets, totalQuizzes },
    decks,
    recentActivity: activity.slice(0, 10),
    recentSets: sets.slice(0, 10).map((s) => ({
      id: s.id, title: s.title, mode: s.mode, difficulty: s.difficulty, created_at: s.created_at,
    })),
  });
}
