import type { Difficulty, Flashcard, FeynmanSummary, QuizQuestion } from "@/types";
import type { AIConfig, AIGenerator, ChatMessage } from "./types";
import { getAIConfig, extractJson, validateQuizQuestion, validateFlashcard, validateFeynmanSummary, createFlashcardDefaults } from "./types";
import { createOpenAICompatibleGenerator } from "./openai";
import { createGeminiGenerator } from "./gemini";
import { buildQuizPrompt, buildFlashcardPrompt, buildFeynmanPrompt, jsonSystemPrompt } from "./prompts";

let cachedGenerator: AIGenerator | null = null;

function getGenerator(): AIGenerator {
  if (cachedGenerator) return cachedGenerator;

  const config = getAIConfig();

  if (config.provider === "gemini") {
    cachedGenerator = createGeminiGenerator(config);
  } else {
    cachedGenerator = createOpenAICompatibleGenerator(config);
  }

  return cachedGenerator;
}

function getConfig(): AIConfig {
  return getAIConfig();
}

export async function generateQuiz(
  text: string,
  difficulty: Difficulty,
  count: number
): Promise<QuizQuestion[]> {
  const generator = getGenerator();
  const messages: ChatMessage[] = [
    { role: "system", content: jsonSystemPrompt() },
    { role: "user", content: buildQuizPrompt(text, difficulty, count) },
  ];

  const raw = await generator.chat(messages);
  const parsed = extractJson<{ questions: QuizQuestion[] } | QuizQuestion[]>(raw);
  const questions = Array.isArray(parsed) ? parsed : parsed.questions;

  if (!Array.isArray(questions)) {
    throw new Error("AI returned an invalid quiz structure.");
  }

  return questions.map((item, index) => {
    if (!validateQuizQuestion(item)) {
      throw new Error(`Invalid quiz question at index ${index}`);
    }
    return item;
  });
}

export async function generateFlashcards(
  text: string,
  difficulty: Difficulty,
  count: number
): Promise<Flashcard[]> {
  const generator = getGenerator();
  const messages: ChatMessage[] = [
    { role: "system", content: jsonSystemPrompt() },
    { role: "user", content: buildFlashcardPrompt(text, difficulty, count) },
  ];

  const raw = await generator.chat(messages);
  const parsed = extractJson<Flashcard[] | { cards: Flashcard[] }>(raw);
  const cards = Array.isArray(parsed) ? parsed : (parsed as { cards: Flashcard[] }).cards;

  if (!Array.isArray(cards)) {
    throw new Error("AI returned an invalid flashcard structure.");
  }

  return cards.map((item) => {
    if (!validateFlashcard(item)) {
      return createFlashcardDefaults(item);
    }
    return { ...item, nextReview: new Date(item.nextReview) };
  });
}

export async function generateFeynmanSummary(text: string): Promise<FeynmanSummary> {
  const generator = getGenerator();
  const messages: ChatMessage[] = [
    { role: "system", content: jsonSystemPrompt() },
    { role: "user", content: buildFeynmanPrompt(text) },
  ];

  const raw = await generator.chat(messages);
  const summary = extractJson<FeynmanSummary>(raw);

  if (!validateFeynmanSummary(summary)) {
    throw new Error("AI returned an invalid Feynman summary.");
  }

  return summary;
}

export function getProviderInfo(): { provider: string; model: string } {
  const config = getConfig();
  return { provider: config.provider, model: config.model };
}
