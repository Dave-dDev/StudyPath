import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";

// GET: Get recommended difficulty based on performance history
export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get last 20 quiz results
  const results = await db.execute({
    sql: `SELECT accuracy, difficulty, created_at FROM quiz_results qr
          LEFT JOIN study_sets ss ON qr.study_set_id = ss.id
          WHERE qr.user_id = ?
          ORDER BY qr.created_at DESC LIMIT 20`,
    args: [user.id],
  });

  // Get performance by difficulty from performance_log
  const perfLog = await db.execute({
    sql: `SELECT difficulty, AVG(accuracy) as avg_accuracy, COUNT(*) as count
          FROM performance_log
          WHERE user_id = ? AND mode = 'quiz'
          GROUP BY difficulty`,
    args: [user.id],
  });

  const difficultyStats: Record<string, { avg: number; count: number }> = {};
  perfLog.rows.forEach((row) => {
    difficultyStats[String(row.difficulty)] = {
      avg: Number(row.avg_accuracy),
      count: Number(row.count),
    };
  });

  // Calculate recent trend
  const recentAccuracies = results.rows.map((r) => Number(r.accuracy));
  const recentAvg = recentAccuracies.length > 0
    ? recentAccuracies.reduce((a, b) => a + b, 0) / recentAccuracies.length
    : 50;

  // Adaptive logic
  let recommended = "medium";
  let confidence = 0;

  if (recentAccuracies.length < 3) {
    // Not enough data — default to medium
    recommended = "medium";
    confidence = 0.3;
  } else {
    const last5 = recentAccuracies.slice(0, 5);
    const last5Avg = last5.reduce((a, b) => a + b, 0) / last5.length;

    if (last5Avg >= 85) {
      // Doing great — bump up
      recommended = "hard";
      confidence = Math.min(0.9, 0.5 + (last5Avg - 85) / 100);
    } else if (last5Avg >= 65) {
      // Solid — stay at medium or suggest hard if trending up
      const trendingUp = last5[0] > last5[last5.length - 1];
      recommended = trendingUp ? "hard" : "medium";
      confidence = 0.6;
    } else if (last5Avg >= 40) {
      // Struggling — stay medium but lower confidence
      recommended = "medium";
      confidence = 0.5;
    } else {
      // Really struggling — drop to easy
      recommended = "easy";
      confidence = Math.min(0.8, 0.4 + (65 - last5Avg) / 100);
    }

    // Override if we have strong difficulty-specific data
    const easyStats = difficultyStats["easy"];
    const mediumStats = difficultyStats["medium"];
    const hardStats = difficultyStats["hard"];

    if (easyStats && easyStats.count >= 3 && easyStats.avg >= 85) {
      recommended = "medium";
      confidence = Math.max(confidence, 0.7);
    }
    if (mediumStats && mediumStats.count >= 3 && mediumStats.avg >= 85) {
      recommended = "hard";
      confidence = Math.max(confidence, 0.7);
    }
    if (hardStats && hardStats.count >= 3 && hardStats.avg < 50) {
      recommended = "medium";
      confidence = Math.max(confidence, 0.7);
    }
  }

  return NextResponse.json({
    recommended,
    confidence: Math.round(confidence * 100) / 100,
    recentAccuracy: Math.round(recentAvg),
    totalSessions: results.rows.length,
    difficultyStats,
  });
}
