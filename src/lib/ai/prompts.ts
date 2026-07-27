import type { Difficulty } from "@/types";
import { normalizeSourceText, difficultyInstructions, jsonSystemPrompt } from "./types";

export function buildQuizPrompt(text: string, difficulty: Difficulty, count: number): string {
  const source = normalizeSourceText(text);
  return `You must return ONLY valid JSON. No markdown, no explanation, no text outside the JSON.

Create ${count} multiple-choice quiz questions from the following study material. ${difficultyInstructions(difficulty)}

Study material:
${source}

Return a JSON object with a single top-level key named "questions". Each question must include:
- id (string, e.g. "q1")
- question (string)
- options (array of exactly 4 strings)
- correctIndex (0-3)
- explanation (string)

IMPORTANT: Return ONLY the JSON object. Do not wrap it in code fences. Do not add any text before or after.

Example:
{"questions":[{"id":"q1","question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]}`;
}

export function buildFlashcardPrompt(text: string, difficulty: Difficulty, count: number): string {
  const source = normalizeSourceText(text);
  return `You must return ONLY valid JSON. No markdown, no explanation, no text outside the JSON.

Create ${count} two-sided study flashcards from the following material. ${difficultyInstructions(difficulty)}

Study material:
${source}

Return a JSON array of flashcards. Each flashcard must include:
- id (string, e.g. "fc1")
- front (string — the question/prompt)
- back (string — the answer/explanation)
- easeFactor (number, default 2.5)
- interval (number, default 1)
- repetitions (number, default 0)
- nextReview (ISO date string, default today)

IMPORTANT: Return ONLY the JSON array. Do not wrap it in code fences. Do not add any text before or after.

Example: [{"id":"fc1","front":"...","back":"...","easeFactor":2.5,"interval":1,"repetitions":0,"nextReview":"2026-07-26"}]`;
}

export function buildFeynmanPrompt(text: string): string {
  const source = normalizeSourceText(text);
  return `You must return ONLY valid JSON. No markdown, no explanation, no text outside the JSON.

Read the study material below and create a short Feynman-style explanation. Use clear, conversational language.

Study material:
${source}

Return a JSON object with:
- id (string, e.g. "fn1")
- title (string)
- explanation (string — ELI5 style)
- keyPoints (array of 3-5 short sentences)
- analogy (string — optional real-world analogy)

IMPORTANT: Return ONLY the JSON object. Do not wrap it in code fences. Do not add any text before or after.

Example: {"id":"fn1","title":"...","explanation":"...","keyPoints":["...","...","..."],"analogy":"..."}`;
}

export { jsonSystemPrompt, normalizeSourceText, difficultyInstructions };
