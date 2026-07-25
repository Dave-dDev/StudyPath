import { db } from "./db";

// ── Password hashing (PBKDF2 via Web Crypto) ──

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  const hashArray = new Uint8Array(hash);
  const saltArray = new Uint8Array(salt);
  // Format: iterations:salt:hash (all hex)
  return `100000:${bufToHex(saltArray)}:${bufToHex(hashArray)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [iterations, saltHex, hashHex] = stored.split(":");
  const salt = new Uint8Array(hexToBuf(saltHex));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: Number(iterations), hash: "SHA-256" },
    keyMaterial,
    256
  );
  return bufToHex(new Uint8Array(hash)) === hashHex;
}

function bufToHex(buf: Uint8Array): string {
  return [...buf].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// ── Session management ──

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function createSession(userId: string): Promise<string> {
  const sessionId = generateSessionId();
  const expiresAt = Math.floor((Date.now() + SESSION_DURATION_MS) / 1000);

  await db.execute({
    sql: "INSERT INTO session (id, user_id, expires_at) VALUES (?, ?, ?)",
    args: [sessionId, userId, expiresAt],
  });

  return sessionId;
}

export async function validateSession(sessionId: string): Promise<{ user: { id: string; email: string } | null; fresh: boolean }> {
  if (!sessionId) return { user: null, fresh: false };

  const result = await db.execute({
    sql: `SELECT s.id, s.expires_at, u.id as uid, u.email
          FROM session s JOIN user u ON s.user_id = u.id
          WHERE s.id = ?`,
    args: [sessionId],
  });

  if (result.rows.length === 0) return { user: null, fresh: false };

  const row = result.rows[0];
  const expiresAt = Number(row.expires_at) * 1000;

  if (Date.now() > expiresAt) {
    // Session expired — delete it
    await db.execute({ sql: "DELETE FROM session WHERE id = ?", args: [sessionId] });
    return { user: null, fresh: false };
  }

  // Refresh if within first 24 hours (mark as fresh)
  const createdAt = expiresAt - SESSION_DURATION_MS;
  const fresh = Date.now() - createdAt < 24 * 60 * 60 * 1000;

  return {
    user: { id: String(row.uid), email: String(row.email) },
    fresh,
  };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.execute({ sql: "DELETE FROM session WHERE id = ?", args: [sessionId] });
}

export async function deleteExpiredSessions(): Promise<void> {
  await db.execute({
    sql: "DELETE FROM session WHERE expires_at < ?",
    args: [Math.floor(Date.now() / 1000)],
  });
}

function generateSessionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── Cookie helpers ──

const SESSION_COOKIE = "studypath_session";

export function getSessionCookie(sessionId: string): string {
  return `${SESSION_COOKIE}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DURATION_MS / 1000}`;
}

export function getBlankSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function getSessionIdFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match?.[1] ?? null;
}
