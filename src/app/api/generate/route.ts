import { NextRequest, NextResponse } from "next/server";
import { generateQuizLocal, generateFlashcardsLocal, generateFeynmanLocal } from "@/lib/nlp/generate";
import type { Difficulty, StudyMode } from "@/types";

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
        data = generateQuizLocal(text, difficulty, count ?? 10);
        break;
      case "flashcards":
        data = generateFlashcardsLocal(text, difficulty, count ?? 15);
        break;
      case "feynman":
        data = generateFeynmanLocal(text);
        break;
      default:
        return NextResponse.json({ error: "Invalid mode." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      mode,
      data,
      provider: { provider: "local-nlp", model: "tf-idf + rules" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    console.error("[/api/generate]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
