import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const studySetId = searchParams.get("study_set_id");

  let sql = "SELECT * FROM quiz_results WHERE user_id = ?";
  let args: (string | number)[] = [user.id];

  if (studySetId) {
    sql += " AND study_set_id = ?";
    args.push(studySetId);
  }

  sql += " ORDER BY created_at DESC";

  const result = await db.execute({ sql, args });
  return NextResponse.json({ results: result.rows });
}

export async function POST(request: NextRequest) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { studySetId, totalQuestions, correctAnswers, accuracy, timeTakenMs, answers } = body;

  if (!studySetId || totalQuestions == null || correctAnswers == null) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  await db.execute({
    sql: "INSERT INTO quiz_results (id, user_id, study_set_id, total_questions, correct_answers, accuracy, time_taken_ms, answers) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    args: [id, user.id, studySetId, totalQuestions, correctAnswers, accuracy, timeTakenMs, JSON.stringify(answers)],
  });

  return NextResponse.json({ result: { id } });
}
