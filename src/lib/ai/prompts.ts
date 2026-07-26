import type { Difficulty } from "@/types";
import { normalizeSourceText, difficultyInstructions, jsonSystemPrompt } from "./types";

export function buildQuizPrompt(text: string, difficulty: Difficulty, count: number): string {
  const source = normalizeSourceText(text);
  return `Create ${count} multiple-choice quiz questions from the following study material. ${difficultyInstructions(difficulty)}

Study material:
${source}

Return a JSON object with a single top-level key named "questions". Each question must include:
- id (string)
- question (string)
- options (array of exactly 4 strings)
- correctIndex (0-3)
- explanation (string)

Example:
{ "questions": [ { "id": "q1", "question": "...", "options": ["...","...","...","..."], "correctIndex": 0, "explanation": "..." } ] }`;
}

export function buildFlashcardPrompt(text: string, difficulty: Difficulty, count: number): string {
  const source = normalizeSourceText(text);
  return `Create ${count} two-sided study flashcards from the following material. ${difficultyInstructions(difficulty)}

Study material:
${source}

Return a JSON array of flashcards. Each flashcard must include:
- id (string)
- front (string — the question/prompt)
- back (string — the answer/explanation)
- easeFactor (number, default 2.5)
- interval (number, default 1)
- repetitions (number, default 0)
- nextReview (ISO date string, default today)`;
}

export function buildFeynmanPrompt(text: string): string {
  const source = normalizeSourceText(text);
  return `Read the study material below and create a short Feynman-style explanation. Use clear, conversational language.

Study material:
${source}

Return a JSON object with:
- id (string)
- title (string)
- explanation (string — ELI5 style)
- keyPoints (array of 3-5 short sentences)
- analogy (string — optional real-world analogy)`;
}

export { jsonSystemPrompt, normalizeSourceText, difficultyInstructions };
