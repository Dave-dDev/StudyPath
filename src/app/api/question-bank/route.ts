import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";

// GET: Retrieve questions from the bank (with optional filters)
export async function GET(request: NextRequest) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get("difficulty");
  const topic = searchParams.get("topic");
  const mistakesOnly = searchParams.get("mistakes") === "true";
  const limit = Math.min(Number(searchParams.get("limit") || "50"), 100);

  let sql = "SELECT * FROM question_bank WHERE user_id = ?";
  const args: (string | number)[] = [user.id];

  if (difficulty) {
    sql += " AND difficulty = ?";
    args.push(difficulty);
  }

  if (topic) {
    sql += " AND topic = ?";
    args.push(topic);
  }

  if (mistakesOnly) {
    sql += " AND times_correct < times_seen";
  }

  sql += " ORDER BY created_at DESC LIMIT ?";
  args.push(limit);

  const result = await db.execute({ sql, args });

  const questions = result.rows.map((row) => ({
    id: String(row.id),
    studySetId: String(row.study_set_id ?? ""),
    question: String(row.question),
    options: JSON.parse(String(row.options || "[]")),
    correctIndex: Number(row.correct_index),
    explanation: String(row.explanation ?? ""),
    difficulty: String(row.difficulty ?? "medium"),
    topic: String(row.topic ?? ""),
    timesSeen: Number(row.times_seen),
    timesCorrect: Number(row.times_correct),
    lastSeenAt: row.last_seen_at ? new Date(Number(row.last_seen_at) * 1000).toISOString() : null,
    createdAt: new Date(Number(row.created_at) * 1000).toISOString(),
  }));

  return NextResponse.json({ questions });
}

// POST: Save questions to the bank
export async function POST(request: NextRequest) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { questions, studySetId, topic } = body as {
    questions: { id: string; question: string; options: string[]; correctIndex: number; explanation: string; difficulty?: string }[];
    studySetId?: string;
    topic?: string;
  };

  if (!Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: "Questions array is required." }, { status: 400 });
  }

  let saved = 0;
  for (const q of questions) {
    const id = crypto.randomUUID();
    try {
      await db.execute({
        sql: `INSERT INTO question_bank (id, user_id, study_set_id, question, options, correct_index, explanation, difficulty, topic)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          user.id,
          studySetId ?? null,
          q.question,
          JSON.stringify(q.options),
          q.correctIndex,
          q.explanation ?? "",
          q.difficulty ?? "medium",
          topic ?? null,
        ],
      });
      saved++;
    } catch (err) {
      console.error("[question-bank] Failed to save question:", err);
    }
  }

  return NextResponse.json({ saved });
}

// PATCH: Update a question (mark as seen/correct)
export async function PATCH(request: NextRequest) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id, correct } = body as { id: string; correct: boolean };

  if (!id) {
    return NextResponse.json({ error: "Question ID required." }, { status: 400 });
  }

  const now = Math.floor(Date.now() / 1000);

  if (correct) {
    await db.execute({
      sql: "UPDATE question_bank SET times_seen = times_seen + 1, times_correct = times_correct + 1, last_seen_at = ? WHERE id = ? AND user_id = ?",
      args: [now, id, user.id],
    });
  } else {
    await db.execute({
      sql: "UPDATE question_bank SET times_seen = times_seen + 1, last_seen_at = ? WHERE id = ? AND user_id = ?",
      args: [now, id, user.id],
    });
  }

  return NextResponse.json({ ok: true });
}
