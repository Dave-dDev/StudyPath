import { db } from "./db";
import type { Plan } from "@/types";

// ── Plan definitions ──────────────────────────────────────

export type UsageAction = "generation" | "study_set" | "ingest";

export interface LimitDef {
  max: number;
  window: "day" | "month";
  label: string;
}

export const FREE_LIMITS: Record<UsageAction, LimitDef> = {
  generation: { max: 3, window: "day", label: "Study set generations per day" },
  study_set: { max: 10, window: "month", label: "Saved study sets per month" },
  ingest: { max: 5, window: "day", label: "File & URL imports per day" },
};

export const FREE_HISTORY_DAYS = 30;

export function limitMessage(action: UsageAction): string {
  const def = FREE_LIMITS[action];
  const windowLabel = def.window === "day" ? "today" : "this month";
  return `You've reached your free limit of ${def.max} ${def.label.toLowerCase()} (${windowLabel}). Upgrade to Pro for unlimited access.`;
}

// ── Lazy schema migration (runs once per process) ─────────

let schemaPromise: Promise<void> | null = null;

export function ensurePlanSchema(): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = migrate().catch((err) => {
      schemaPromise = null;
      throw err;
    });
  }
  return schemaPromise;
}

async function migrate(): Promise<void> {
  for (const sql of [
    "ALTER TABLE user ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'",
    "ALTER TABLE user ADD COLUMN plan_until INTEGER",
    "ALTER TABLE user ADD COLUMN paystack_customer TEXT",
    "ALTER TABLE user ADD COLUMN paystack_subscription TEXT",
  ]) {
    try {
      await db.execute(sql);
    } catch (err) {
      if (!String(err).toLowerCase().includes("duplicate column")) throw err;
    }
  }
  await db.execute(`CREATE TABLE IF NOT EXISTS usage_counters (
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    period TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, action, period)
  )`);
  await db.execute("CREATE INDEX IF NOT EXISTS idx_usage_counters_user ON usage_counters(user_id)");
}

// ── Plan helpers ──────────────────────────────────────────

export async function getUserPlan(userId: string): Promise<Plan> {
  await ensurePlanSchema();
  const res = await db.execute({
    sql: "SELECT plan, plan_until FROM user WHERE id = ?",
    args: [userId],
  });
  const row = res.rows[0];
  if (!row || String(row.plan) !== "pro") return "free";
  const until = row.plan_until == null ? null : Number(row.plan_until);
  if (until !== null && until <= Math.floor(Date.now() / 1000)) return "free";
  return "pro";
}

export async function activatePro(userId: string, durationDays: number | null = null): Promise<void> {
  await ensurePlanSchema();
  const planUntil = durationDays ? Math.floor(Date.now() / 1000) + durationDays * 86400 : null;
  await db.execute({
    sql: "UPDATE user SET plan = 'pro', plan_until = ? WHERE id = ?",
    args: [planUntil, userId],
  });
}

// Grant Pro from a confirmed payment. If `subscriptionManaged` is true the
// renewal webhook owns expiry, so plan_until is left open-ended.
export async function grantProFromBilling(
  userId: string,
  opts: {
    subscriptionManaged?: boolean;
    durationDays?: number;
    customerCode?: string | null;
    subscriptionCode?: string | null;
  } = {}
): Promise<void> {
  await ensurePlanSchema();
  const planUntil = opts.subscriptionManaged
    ? null
    : Math.floor(Date.now() / 1000) + (opts.durationDays ?? 32) * 86400;
  await db.execute({
    sql: `UPDATE user SET
            plan = 'pro',
            plan_until = ?,
            paystack_customer = COALESCE(?, paystack_customer),
            paystack_subscription = COALESCE(?, paystack_subscription)
          WHERE id = ?`,
    args: [planUntil, opts.customerCode ?? null, opts.subscriptionCode ?? null, userId],
  });
}

export async function revokePro(userId: string): Promise<void> {
  await db.execute({
    sql: "UPDATE user SET plan = 'free', plan_until = NULL, paystack_subscription = NULL WHERE id = ?",
    args: [userId],
  });
}

export async function findUserIdByEmail(email: string): Promise<string | null> {
  const res = await db.execute({ sql: "SELECT id FROM user WHERE email = ?", args: [email] });
  return res.rows.length > 0 ? String(res.rows[0].id) : null;
}

// ── Usage tracking / quota enforcement ────────────────────

export interface LimitStatus {
  allowed: boolean;
  used: number;
  max: number;
  window: "day" | "month";
}

function periodKey(window: "day" | "month"): string {
  const iso = new Date().toISOString();
  return window === "day" ? iso.slice(0, 10) : iso.slice(0, 7);
}

export async function checkLimit(userId: string, action: UsageAction): Promise<LimitStatus | null> {
  const plan = await getUserPlan(userId);
  if (plan === "pro") return null;
  const def = FREE_LIMITS[action];
  const res = await db.execute({
    sql: "SELECT count FROM usage_counters WHERE user_id = ? AND action = ? AND period = ?",
    args: [userId, action, periodKey(def.window)],
  });
  const used = res.rows.length > 0 ? Number(res.rows[0].count) : 0;
  return { allowed: used < def.max, used, max: def.max, window: def.window };
}

export async function recordUsage(userId: string, action: UsageAction): Promise<void> {
  await ensurePlanSchema();
  const def = FREE_LIMITS[action];
  await db.execute({
    sql: `INSERT INTO usage_counters (user_id, action, period, count) VALUES (?, ?, ?, 1)
          ON CONFLICT(user_id, action, period) DO UPDATE SET count = count + 1`,
    args: [userId, action, periodKey(def.window)],
  });
}

export interface UsageSummary {
  plan: Plan;
  usage: Record<UsageAction, { used: number; max: number | null; window: "day" | "month" }>;
  historyDays: number | null;
}

export async function getUsageSummary(userId: string): Promise<UsageSummary> {
  const plan = await getUserPlan(userId);
  const dayKey = periodKey("day");
  const monthKey = periodKey("month");

  const empty: UsageSummary = {
    plan,
    usage: {
      generation: { used: 0, max: plan === "pro" ? null : FREE_LIMITS.generation.max, window: "day" },
      study_set: { used: 0, max: plan === "pro" ? null : FREE_LIMITS.study_set.max, window: "month" },
      ingest: { used: 0, max: plan === "pro" ? null : FREE_LIMITS.ingest.max, window: "day" },
    },
    historyDays: plan === "pro" ? null : FREE_HISTORY_DAYS,
  };

  if (plan === "pro") return empty;

  const res = await db.execute({
    sql: `SELECT action, period, count FROM usage_counters
          WHERE user_id = ?
            AND ((action = 'generation' AND period = ?)
              OR (action = 'study_set' AND period = ?)
              OR (action = 'ingest' AND period = ?))`,
    args: [userId, dayKey, monthKey, dayKey],
  });

  for (const row of res.rows) {
    const action = String(row.action) as UsageAction;
    if (action in empty.usage) empty.usage[action].used = Number(row.count);
  }

  return empty;
}
