import type { Difficulty, Flashcard, FeynmanSummary, QuizQuestion } from "@/types";

export type AIProvider = "openai" | "gemini" | "ollama";

export interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  model: string;
  baseUrl: string;
  maxTokens: number;
  temperature: number;
}

export interface ChatMessage {
  role: "system" | "user";
  content: string;
}

export interface ChatCompletionResponse {
  choices: { message?: { content?: string }; content?: string }[];
}

export interface AIGenerator {
  chat(messages: ChatMessage[]): Promise<string>;
}

// ── Validators ─────────────────────────────────────────

export function validateQuizQuestion(candidate: unknown): candidate is QuizQuestion {
  if (typeof candidate !== "object" || candidate === null) return false;
  const item = candidate as QuizQuestion;
  return (
    typeof item.id === "string" &&
    typeof item.question === "string" &&
    Array.isArray(item.options) &&
    item.options.length === 4 &&
    item.options.every((o) => typeof o === "string") &&
    typeof item.correctIndex === "number" &&
    item.correctIndex >= 0 &&
    item.correctIndex < 4 &&
    typeof item.explanation === "string"
  );
}

export function validateFlashcard(candidate: unknown): candidate is Flashcard {
  if (typeof candidate !== "object" || candidate === null) return false;
  const item = candidate as Flashcard;
  return (
    typeof item.id === "string" &&
    typeof item.front === "string" &&
    typeof item.back === "string" &&
    typeof item.easeFactor === "number" &&
    typeof item.interval === "number" &&
    typeof item.repetitions === "number"
  );
}

export function validateFeynmanSummary(candidate: unknown): candidate is FeynmanSummary {
  if (typeof candidate !== "object" || candidate === null) return false;
  const item = candidate as FeynmanSummary;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.explanation === "string" &&
    Array.isArray(item.keyPoints) &&
    item.keyPoints.every((p) => typeof p === "string")
  );
}

export function createFlashcardDefaults(card: unknown): Flashcard {
  const base = card as Record<string, unknown>;
  const nextReview = base.nextReview ? new Date(String(base.nextReview)) : new Date();
  return {
    id: String(base.id ?? crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    front: String(base.front ?? ""),
    back: String(base.back ?? ""),
    easeFactor: typeof base.easeFactor === "number" ? base.easeFactor : 2.5,
    interval: typeof base.interval === "number" ? base.interval : 1,
    repetitions: typeof base.repetitions === "number" ? base.repetitions : 0,
    nextReview: Number.isNaN(nextReview.getTime()) ? new Date() : nextReview,
  };
}

// ── JSON Parsing ───────────────────────────────────────

export function cleanJsonOutput(response: string): string {
  return response.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
}

export function extractJson<T>(text: string): T {
  const cleaned = cleanJsonOutput(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/([\[{][\s\S]*?[\]}])/);
    if (!match) throw new Error(`Unable to parse JSON from AI response`);
    return JSON.parse(match[1]) as T;
  }
}

// ── Prompt Helpers ─────────────────────────────────────

export function normalizeSourceText(text: string): string {
  return text.trim().replace(/\s+/g, " ").slice(0, 8000);
}

export function difficultyInstructions(difficulty: Difficulty): string {
  switch (difficulty) {
    case "easy":
      return "Use simple language, short questions, and clear choices for beginner learners.";
    case "hard":
      return "Use precise terminology, deeper reasoning, and more challenging distractors for advanced learners.";
    default:
      return "Use balanced language and moderate complexity appropriate for a typical learner.";
  }
}

export function jsonSystemPrompt(): string {
  return "You are an assistant that returns only valid JSON and nothing else.";
}

// ── Provider Config ────────────────────────────────────

export function getAIConfig(): AIConfig {
  const provider = (process.env.AI_PROVIDER?.trim()?.toLowerCase() || "ollama") as AIProvider;

  switch (provider) {
    case "openai":
      return {
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
        baseUrl: process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1",
        maxTokens: 1200,
        temperature: 0.1,
      };
    case "gemini":
      return {
        provider: "gemini",
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash",
        baseUrl: "https://generativelanguage.googleapis.com/v1beta",
        maxTokens: 1200,
        temperature: 0.1,
      };
    case "ollama":
    default:
      return {
        provider: "ollama",
        model: process.env.OLLAMA_MODEL?.trim() || "llama2",
        baseUrl: (process.env.OLLAMA_HOST?.trim() || "http://127.0.0.1:11434") + "/v1",
        maxTokens: 1200,
        temperature: 0.1,
      };
  }
}
