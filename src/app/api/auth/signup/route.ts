import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { setSessionCookie } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const existing = await db.execute({ sql: "SELECT id FROM user WHERE email = ?", args: [email] });
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  await db.execute({
    sql: "INSERT INTO user (id, email, password_hash) VALUES (?, ?, ?)",
    args: [id, email, passwordHash],
  });

  const sessionId = await createSession(id);
  const response = NextResponse.json({ user: { id, email } });
  response.headers.set("Set-Cookie", `studypath_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`);
  return response;
}
