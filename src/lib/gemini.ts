import type { Difficulty, Flashcard, FeynmanSummary, QuizQuestion } from "@/types";

const OLLAMA_HOST = process.env.OLLAMA_HOST?.trim() || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL?.trim() || "llama2";
const MAX_TOKENS = 1200;

interface OllamaChoice {
  message?: { content?: string };
  content?: string;
}

interface OllamaResponse {
  choices?: OllamaChoice[];
}

function cleanJsonOutput(response: string) {
  return response
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function extractJson<T>(text: string): T {
  const cleaned = cleanJsonOutput(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch (firstError) {
    const match = cleaned.match(/([\[{][\s\S]*?[\]}])/);
    if (!match) {
      throw new Error(`Unable to parse JSON response from Ollama: ${firstError}`);
    }
    return JSON.parse(match[1]) as T;
  }
}

function normalizeSourceText(text: string) {
  return text.trim().replace(/\s+/g, " ").slice(0, 8000);
}

function difficultyInstructions(difficulty: Difficulty) {
  switch (difficulty) {
    case "easy":
      return "Use simple language, short questions, and clear choices for beginner learners.";
    case "hard":
      return "Use precise terminology, deeper reasoning, and more challenging distractors for advanced learners.";
    case "medium":
    default:
      return "Use balanced language and moderate complexity appropriate for a typical learner.";
  }
}

function buildPrompt(body: string) {
  return `You are a helpful assistant that MUST return only valid JSON. Do not include markdown fences, explanations, or any text outside the JSON structure.

${body}`;
}

async function callOllama(prompt: string): Promise<string> {
  const endpoint = `${OLLAMA_HOST.replace(/\/$/, "")}/v1/chat/completions`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an assistant that returns only valid JSON and nothing else.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: MAX_TOKENS,
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`Ollama API error ${response.status}: ${bodyText}`);
  }

  const data = (await response.json()) as OllamaResponse;
  const choice = data.choices?.[0];
  const content = choice?.message?.content ?? choice?.content;

  if (!content || typeof content !== "string") {
    throw new Error("Ollama did not return a text response.");
  }

  return content;
}

function validateQuizQuestion(candidate: unknown): candidate is QuizQuestion {
  if (typeof candidate !== "object" || candidate === null) return false;
  const item = candidate as QuizQuestion;
  return (
    typeof item.id === "string" &&
    typeof item.question === "string" &&
    Array.isArray(item.options) &&
    item.options.length === 4 &&
    item.options.every((option) => typeof option === "string") &&
    typeof item.correctIndex === "number" &&
    item.correctIndex >= 0 &&
    item.correctIndex < 4 &&
    typeof item.explanation === "string"
  );
}

function validateFlashcard(candidate: unknown): candidate is Flashcard {
  if (typeof candidate !== "object" || candidate === null) return false;
  const item = candidate as Flashcard;
  return (
    typeof item.id === "string" &&
    typeof item.front === "string" &&
    typeof item.back === "string" &&
    typeof item.easeFactor === "number" &&
    typeof item.interval === "number" &&
    typeof item.repetitions === "number" &&
    typeof item.nextReview === "string"
  );
}

function validateFeynmanSummary(candidate: unknown): candidate is FeynmanSummary {
  if (typeof candidate !== "object" || candidate === null) return false;
  const item = candidate as FeynmanSummary;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.explanation === "string" &&
    Array.isArray(item.keyPoints) &&
    item.keyPoints.every((point) => typeof point === "string")
  );
}

function createFlashcardDefaults(card: unknown): Flashcard {
  const base = card as Flashcard;
  const nextReview = base.nextReview ? new Date(String(base.nextReview)) : new Date();
  return {
    id: base.id ?? crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    front: String(base.front ?? ""),
    back: String(base.back ?? ""),
    easeFactor: typeof base.easeFactor === "number" ? base.easeFactor : 2.5,
    interval: typeof base.interval === "number" ? base.interval : 1,
    repetitions: typeof base.repetitions === "number" ? base.repetitions : 0,
    nextReview: Number.isNaN(nextReview.getTime()) ? new Date() : nextReview,
  };
}

export async function generateQuiz(
  text: string,
  difficulty: Difficulty,
  count: number
): Promise<QuizQuestion[]> {
  const source = normalizeSourceText(text);
  const promptBody = `Create ${count} multiple-choice quiz questions from the following study material. ${difficultyInstructions(difficulty)}

Study material:
${source}

Return a JSON object with a single top-level key named "questions". Each question must include:\n- id\n- question\n- options (4 items)\n- correctIndex (0-3)\n- explanation\n
Example output format:\n{ "questions": [ { "id": "q1", "question": "...", "options": ["...","...","...","..."], "correctIndex": 0, "explanation": "..." } ] }`;

  const raw = await callOllama(buildPrompt(promptBody));
  const parsed = extractJson<{ questions: QuizQuestion[] } | QuizQuestion[]>(raw);
  const questions = Array.isArray(parsed) ? parsed : parsed.questions;

  if (!Array.isArray(questions)) {
    throw new Error("Ollama returned an invalid quiz structure.");
  }

  return questions.map((item, index) => {
    if (!validateQuizQuestion(item)) {
      throw new Error(`Invalid quiz question returned at index ${index}`);
    }
    return item;
  });
}

export async function generateFlashcards(
  text: string,
  difficulty: Difficulty,
  count: number
): Promise<Flashcard[]> {
  const source = normalizeSourceText(text);
  const promptBody = `Create ${count} two-sided study flashcards from the following material. ${difficultyInstructions(
    difficulty
  )}

Study material:\n${source}

Return a JSON array of flashcards. Each flashcard must include:\n- id\n- front\n- back\n- easeFactor\n- interval\n- repetitions\n- nextReview\n
Use a simple value for scheduling fields so the front-end can apply SM-2 after review.`;

  const raw = await callOllama(buildPrompt(promptBody));
  const parsed = extractJson<Flashcard[] | { cards: Flashcard[] }>(raw);
  const cards = Array.isArray(parsed) ? parsed : (parsed as { cards: Flashcard[] }).cards;

  if (!Array.isArray(cards)) {
    throw new Error("Ollama returned an invalid flashcard structure.");
  }

  return cards.map((item, index) => {
    if (!validateFlashcard(item)) {
      return createFlashcardDefaults(item);
    }
    return {
      ...item,
      nextReview: new Date(item.nextReview),
    };
  });
}

export async function generateFeynmanSummary(text: string): Promise<FeynmanSummary> {
  const source = normalizeSourceText(text);
  const promptBody = `Read the study material below and create a short Feynman-style explanation. Use clear, conversational language and return only valid JSON.

Study material:\n${source}

Return a JSON object with:\n- id\n- title\n- explanation\n- keyPoints (array of 3-5 short sentences)`;

  const raw = await callOllama(buildPrompt(promptBody));
  const summary = extractJson<FeynmanSummary>(raw);

  if (!validateFeynmanSummary(summary)) {
    throw new Error("Ollama returned an invalid Feynman summary.");
  }

  return summary;
}
