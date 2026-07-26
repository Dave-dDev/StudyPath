import { NextRequest, NextResponse } from "next/server";
import { generateQuiz, generateFlashcards, generateFeynmanSummary, getProviderInfo } from "@/lib/ai";
import type { Difficulty, StudyMode } from "@/types";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, mode, difficulty = "medium", count } = body as {
      text: string;
      mode: StudyMode;
      difficulty: Difficulty;
      count?: number;
    };

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "Please provide at least 50 characters of text." },
        { status: 400 }
      );
    }
    if (!mode) {
      return NextResponse.json({ error: "Study mode is required." }, { status: 400 });
    }

    let data;

    switch (mode) {
      case "quiz":
        data = await withRetry(() => generateQuiz(text, difficulty, count ?? 10));
        break;
      case "flashcards":
        data = await withRetry(() => generateFlashcards(text, difficulty, count ?? 15));
        break;
      case "feynman":
        data = await withRetry(() => generateFeynmanSummary(text));
        break;
      default:
        return NextResponse.json({ error: "Invalid mode." }, { status: 400 });
    }

    const provider = getProviderInfo();
    return NextResponse.json({ success: true, mode, data, provider });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    console.error("[/api/generate]", err);

    if (message.includes("ECONNREFUSED") || message.includes("fetch failed")) {
      return NextResponse.json(
        { error: "The AI model is temporarily unavailable. Please check your API configuration and try again." },
        { status: 503 }
      );
    }
    if (message.includes("timeout")) {
      return NextResponse.json(
        { error: "The request timed out. The text might be too long. Try with shorter text." },
        { status: 408 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
