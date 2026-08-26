// Client-side offline review queue.
// Progress recorded while the network is down is stored in localStorage and
// flushed to the server automatically once the connection returns.

export interface OfflineProgressUpdate {
  studySetId: string;
  cards: {
    cardId: string;
    easeFactor: number;
    interval: number;
    repetitions: number;
    nextReview: string;
  }[];
  performance?: {
    mode: string;
    difficulty: string;
    accuracy: number;
  };
  queuedAt: number;
}

const QUEUE_KEY = "sp_offline_progress_v1";

function safeRead(): OfflineProgressUpdate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(queue: OfflineProgressUpdate[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Storage full/unavailable — drop silently
  }
}

export function isOffline(): boolean {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

export function getOfflineQueue(): OfflineProgressUpdate[] {
  return safeRead();
}

export function offlinePendingCount(): number {
  return safeRead().length;
}

export function queueOfflineUpdate(update: OfflineProgressUpdate) {
  const queue = safeRead();
  queue.push(update);
  safeWrite(queue);
}

export function clearOfflineQueue() {
  safeWrite([]);
}

// Flush queued updates to the server. Returns the number synced.
export async function flushOfflineQueue(): Promise<number> {
  const queue = safeRead();
  if (queue.length === 0) return 0;

  const remaining: OfflineProgressUpdate[] = [];
  let synced = 0;

  for (const item of queue) {
    try {
      const res = await fetch("/api/flashcard-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studySetId: item.studySetId, cards: item.cards }),
      });
      if (res.ok) {
        synced++;
        if (item.performance) {
          await fetch("/api/performance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studySetId: item.studySetId, ...item.performance }),
          }).catch(() => {});
        }
      } else {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }

  safeWrite(remaining);
  return synced;
}
