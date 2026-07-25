import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Utility: merge Tailwind class names safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Utility: generate a random short ID */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Utility: truncate text to n words */
export function truncate(text: string, words = 20): string {
  const arr = text.split(" ");
  return arr.length > words ? arr.slice(0, words).join(" ") + "…" : text;
}

/** Utility: format a duration in ms to "m:ss" */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Utility: format a date to a relative string */
export function relativeDate(date: Date): string {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}
