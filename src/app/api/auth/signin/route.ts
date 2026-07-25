import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const result = await db.execute({ sql: "SELECT id, password_hash FROM user WHERE email = ?", args: [email] });
  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const row = result.rows[0];
  const valid = await verifyPassword(password, String(row.password_hash));
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const sessionId = await createSession(String(row.id));
  const response = NextResponse.json({ user: { id: String(row.id), email } });
  response.headers.set("Set-Cookie", `studypath_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`);
  return response;
}
