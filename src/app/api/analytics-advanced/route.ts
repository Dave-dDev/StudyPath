import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";
import { getUserPlan, ensurePlanSchema } from "@/lib/plans";

const WEEK_SECONDS = 7 * 86400;
const AVG_SECONDS_PER_CARD = 10;

export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensurePlanSchema();
  const plan = await getUserPlan(user.id);
  if (plan !== "pro") {
    return NextResponse.json(
      { error: "Advanced analytics is a Pro feature.", code: "PLAN_REQUIRED", upgradeUrl: "/pricing" },
      { status: 402 }
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const ninetyDaysAgo = now - 90 * 86400;
  const fourteenDaysAgo = now - 14 * 86400;

  const [logsRes, topicRes, strongRes, progressRes] = await Promise.all([
    db.execute({
      sql: "SELECT accuracy, created_at FROM performance_log WHERE user_id = ? AND created_at >= ? ORDER BY created_at ASC",
      args: [user.id, ninetyDaysAgo],
    }),
    db.execute({
      sql: `SELECT COALESCE(topic, 'General') AS topic, SUM(times_seen) AS seen, SUM(times_correct) AS correct
            FROM question_bank WHERE user_id = ?
            GROUP BY COALESCE(topic, 'General') HAVING seen >= 3
            ORDER BY (correct * 1.0 / seen) ASC LIMIT 8`,
      args: [user.id],
    }),
    db.execute({
      sql: `SELECT COALESCE(topic, 'General') AS topic, SUM(times_seen) AS seen, SUM(times_correct) AS correct
            FROM question_bank WHERE user_id = ?
            GROUP BY COALESCE(topic, 'General') HAVING seen >= 3
            ORDER BY (correct * 1.0 / seen) DESC LIMIT 3`,
      args: [user.id],
    }),
    db.execute({
      sql: "SELECT next_review FROM flashcard_progress WHERE user_id = ?",
      args: [user.id],
    }),
  ]);

  const logs = logsRes.rows.map((r) => ({
    accuracy: Number(r.accuracy),
    createdAt: Number(r.created_at),
  }));

  // ── Retention curve: weekly accuracy, last 12 weeks ──
  const buckets: { accuracy: number; sessions: number }[] = Array.from({ length: 12 }, () => ({
    accuracy: 0,
    sessions: 0,
  }));
  for (const log of logs) {
    const weeksAgo = Math.floor((now - log.createdAt) / WEEK_SECONDS);
    if (weeksAgo < 0 || weeksAgo > 11) continue;
    const idx = 11 - weeksAgo;
    buckets[idx].accuracy += log.accuracy;
    buckets[idx].sessions++;
  }
  const retentionCurve = buckets.map((b, i) => {
    const weekStart = new Date((now - (11 - i) * WEEK_SECONDS) * 1000);
    return {
      weekStart: weekStart.toISOString().slice(0, 10),
      accuracy: b.sessions > 0 ? Math.round(b.accuracy / b.sessions) : null,
      sessions: b.sessions,
    };
  });

  // ── Weak & strong topics ──
  const mapTopics = (rows: typeof topicRes.rows) =>
    rows.map((r) => ({
      topic: String(r.topic),
      seen: Number(r.seen),
      accuracy: Math.round((Number(r.correct) / Number(r.seen)) * 100),
    }));
  const weakTopics = mapTopics(topicRes.rows);
  const strongTopics = mapTopics(strongRes.rows);

  // ── Exam readiness (0-100 heuristic) ──
  const recent = logs.filter((l) => l.createdAt >= fourteenDaysAgo);
  const recentAccuracy = recent.length > 0
    ? recent.reduce((s, l) => s + l.accuracy, 0) / recent.length
    : 0;
  const variance = recent.length > 0
    ? recent.reduce((s, l) => s + (l.accuracy - recentAccuracy) ** 2, 0) / recent.length
    : 10000;
  const consistency = recent.length >= 2 ? Math.max(0, 100 - Math.sqrt(variance) * 2) : 0;

  const allTopicRows = [...topicRes.rows, ...strongRes.rows];
  const seenTopics = new Set<string>();
  const masteredTopics = new Set<string>();
  for (const r of allTopicRows) {
    const topic = String(r.topic);
    seenTopics.add(topic);
    if (Number(r.correct) / Number(r.seen) >= 0.7) masteredTopics.add(topic);
  }
  const coverage = seenTopics.size > 0 ? (masteredTopics.size / seenTopics.size) * 100 : 0;

  const activeDays = new Set(logs.filter((l) => l.createdAt >= fourteenDaysAgo).map((l) => Math.floor(l.createdAt / 86400)));
  const volume = Math.min((activeDays.size / 10) * 100, 100);

  const readinessScore = Math.round(
    recentAccuracy * 0.4 + consistency * 0.2 + coverage * 0.2 + volume * 0.2
  );

  const readiness = {
    score: Math.min(readinessScore, 100),
    factors: [
      { key: "accuracy", label: "Recent accuracy (14d)", value: Math.round(recentAccuracy) },
      { key: "consistency", label: "Consistency", value: Math.round(consistency) },
      { key: "coverage", label: "Topic coverage", value: Math.round(coverage) },
      { key: "volume", label: "Study frequency", value: Math.round(volume) },
    ],
  };

  // ── Study forecast: due cards over next 14 days ──
  const startOfToday = Math.floor(now / 86400) * 86400;
  const dueBuckets = Array.from({ length: 14 }, () => 0);
  for (const row of progressRes.rows) {
    const ts = Number(row.next_review);
    const dayOffset = ts < startOfToday ? 0 : Math.floor((ts - startOfToday) / 86400);
    if (dayOffset >= 0 && dayOffset < 14) dueBuckets[dayOffset]++;
  }
  const totalDue = dueBuckets.reduce((s, n) => s + n, 0);
  const forecast = {
    days: dueBuckets.map((dueCards, i) => ({
      date: new Date((startOfToday + i * 86400) * 1000).toISOString().slice(0, 10),
      dueCards,
      estMinutes: Math.max(Math.round((dueCards * AVG_SECONDS_PER_CARD) / 60), dueCards > 0 ? 1 : 0),
    })),
    totalDue,
    totalMinutes: Math.round((totalDue * AVG_SECONDS_PER_CARD) / 60),
  };

  return NextResponse.json({ plan, readiness, retentionCurve, weakTopics, strongTopics, forecast });
}
