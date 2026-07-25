import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";

export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = Math.floor(Date.now() / 1000);

  const result = await db.execute({
    sql: `SELECT fp.*, ss.title as set_title FROM flashcard_progress fp
          JOIN study_sets ss ON fp.study_set_id = ss.id
          WHERE fp.user_id = ? AND fp.next_review <= ?
          ORDER BY fp.next_review ASC`,
    args: [user.id, now],
  });

  return NextResponse.json({ dueCards: result.rows });
}
