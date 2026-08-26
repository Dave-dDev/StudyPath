import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";
import { getUserPlan, ensurePlanSchema, FREE_HISTORY_DAYS } from "@/lib/plans";

// GET: Retrieve performance history
export async function GET(request: NextRequest) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensurePlanSchema();
  const plan = await getUserPlan(user.id);

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const requestedDays = Number(searchParams.get("days") || "30");
  const historyDays = plan === "pro" ? 365 : FREE_HISTORY_DAYS;
  const days = Math.min(requestedDays, historyDays);
  const historyCapped = requestedDays > days;

  const since = Math.floor(Date.now() / 1000) - days * 86400;

  let sql = "SELECT * FROM performance_log WHERE user_id = ? AND created_at >= ?";
  const args: (string | number)[] = [user.id, since];

  if (mode) {
    sql += " AND mode = ?";
    args.push(mode);
  }

  sql += " ORDER BY created_at DESC";

  const result = await db.execute({ sql, args });

  const logs = result.rows.map((row) => ({
    id: String(row.id),
    studySetId: String(row.study_set_id ?? ""),
    mode: String(row.mode),
    difficulty: String(row.difficulty),
    accuracy: Number(row.accuracy),
    timeTakenMs: Number(row.time_taken_ms ?? 0),
    topic: String(row.topic ?? ""),
    createdAt: new Date(Number(row.created_at) * 1000).toISOString(),
  }));

  // Aggregate stats
  const totalSessions = logs.length;
  const avgAccuracy = totalSessions > 0
    ? Math.round(logs.reduce((sum, l) => sum + l.accuracy, 0) / totalSessions)
    : 0;

  // Accuracy over time (group by day)
  const byDay: Record<string, { total: number; sum: number }> = {};
  logs.forEach((l) => {
    const day = l.createdAt.split("T")[0];
    if (!byDay[day]) byDay[day] = { total: 0, sum: 0 };
    byDay[day].total++;
    byDay[day].sum += l.accuracy;
  });

  const accuracyOverTime = Object.entries(byDay)
    .map(([date, v]) => ({ date, accuracy: Math.round(v.sum / v.total), sessions: v.total }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // By difficulty
  const byDifficulty: Record<string, { count: number; sum: number }> = {};
  logs.forEach((l) => {
    if (!byDifficulty[l.difficulty]) byDifficulty[l.difficulty] = { count: 0, sum: 0 };
    byDifficulty[l.difficulty].count++;
    byDifficulty[l.difficulty].sum += l.accuracy;
  });

  const byDifficultyStats = Object.entries(byDifficulty).map(([diff, v]) => ({
    difficulty: diff,
    count: v.count,
    avgAccuracy: Math.round(v.sum / v.count),
  }));

  // By topic
  const byTopic: Record<string, { count: number; sum: number }> = {};
  logs.filter((l) => l.topic).forEach((l) => {
    if (!byTopic[l.topic]) byTopic[l.topic] = { count: 0, sum: 0 };
    byTopic[l.topic].count++;
    byTopic[l.topic].sum += l.accuracy;
  });

  const byTopicStats = Object.entries(byTopic)
    .map(([topic, v]) => ({
      topic,
      count: v.count,
      avgAccuracy: Math.round(v.sum / v.count),
    }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    plan,
    historyDays,
    historyCapped,
    logs,
    stats: { totalSessions, avgAccuracy, accuracyOverTime, byDifficulty: byDifficultyStats, byTopic: byTopicStats },
  });
}

// POST: Log a performance entry
export async function POST(request: NextRequest) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { studySetId, mode, difficulty, accuracy, timeTakenMs, topic } = body;

  if (!mode || accuracy == null) {
    return NextResponse.json({ error: "Mode and accuracy are required." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO performance_log (id, user_id, study_set_id, mode, difficulty, accuracy, time_taken_ms, topic)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, user.id, studySetId ?? null, mode, difficulty ?? "medium", accuracy, timeTakenMs ?? 0, topic ?? null],
  });

  return NextResponse.json({ id });
}
