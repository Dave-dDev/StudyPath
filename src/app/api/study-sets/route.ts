import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";
import { checkLimit, recordUsage, limitMessage } from "@/lib/plans";

export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db.execute({
    sql: "SELECT * FROM study_sets WHERE user_id = ? ORDER BY created_at DESC",
    args: [user.id],
  });

  return NextResponse.json({ sets: result.rows });
}

export async function POST(request: NextRequest) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, sourceText, difficulty, mode, data } = body;

  if (!title || !mode) {
    return NextResponse.json({ error: "Title and mode are required." }, { status: 400 });
  }

  const limit = await checkLimit(user.id, "study_set");
  if (limit && !limit.allowed) {
    return NextResponse.json(
      { error: limitMessage("study_set"), code: "LIMIT_REACHED", limit },
      { status: 402 }
    );
  }

  const id = crypto.randomUUID();
  await db.execute({
    sql: "INSERT INTO study_sets (id, user_id, title, source_text, difficulty, mode, data) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [id, user.id, title, sourceText ?? "", difficulty ?? "medium", mode, JSON.stringify(data)],
  });

  if (limit) await recordUsage(user.id, "study_set");

  return NextResponse.json({ set: { id, title, mode, difficulty, created_at: new Date().toISOString() } });
}
