import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const studySetId = searchParams.get("study_set_id");

  let sql = "SELECT * FROM flashcard_progress WHERE user_id = ?";
  let args: (string | number)[] = [user.id];

  if (studySetId) {
    sql += " AND study_set_id = ?";
    args.push(studySetId);
  }

  const result = await db.execute({ sql, args });
  return NextResponse.json({ progress: result.rows });
}

export async function POST(request: NextRequest) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { studySetId, cards } = body;

  if (!studySetId || !Array.isArray(cards)) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  for (const card of cards) {
    const id = crypto.randomUUID();
    await db.execute({
      sql: `INSERT INTO flashcard_progress (id, user_id, study_set_id, card_id, ease_factor, interval_days, repetitions, next_review, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch())
            ON CONFLICT(user_id, study_set_id, card_id) DO UPDATE SET
              ease_factor = excluded.ease_factor,
              interval_days = excluded.interval_days,
              repetitions = excluded.repetitions,
              next_review = excluded.next_review,
              updated_at = unixepoch()`,
      args: [id, user.id, studySetId, card.cardId, card.easeFactor, card.interval, card.repetitions, Math.floor(new Date(card.nextReview).getTime() / 1000)],
    });
  }

  return NextResponse.json({ saved: cards.length });
}
