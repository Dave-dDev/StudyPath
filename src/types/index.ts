// ── Study Content Types ──────────────────────────────────

export type Difficulty = "easy" | "medium" | "hard";
export type StudyMode = "quiz" | "flashcards" | "feynman";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];          // always 4 options
  correctIndex: number;       // 0-3
  explanation: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  // SM-2 spaced repetition fields
  easeFactor: number;         // starts at 2.5
  interval: number;           // days until next review
  repetitions: number;        // number of successful reviews
  nextReview: Date | string;
}

export interface FeynmanSummary {
  id: string;
  title: string;
  explanation: string;        // ELI5-style explanation
  keyPoints: string[];
  analogy?: string;
}

export interface StudySet {
  id: string;
  title: string;
  sourceText: string;
  difficulty: Difficulty;
  createdAt: Date;
  questions?: QuizQuestion[];
  flashcards?: Flashcard[];
  summary?: FeynmanSummary;
}

// ── Quiz Session Types ────────────────────────────────────

export interface QuizAnswer {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  timeMs: number;
}

export interface QuizSession {
  studySetId: string;
  answers: QuizAnswer[];
  startedAt: Date;
  completedAt?: Date;
}

export interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;           // 0-100
  timeTakenMs: number;
  answers: QuizAnswer[];
}

// ── SM-2 Algorithm Types ──────────────────────────────────

export type SM2Grade = 0 | 1 | 2 | 3 | 4 | 5;
// 0-1: forgot completely, 2: hard, 3: medium, 4: easy, 5: perfect

export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
}

// ── Database Row Types ────────────────────────────────────

export interface StudySetRow {
  id: string;
  user_id: string;
  title: string;
  source_text: string;
  difficulty: Difficulty;
  mode: StudyMode;
  data: QuizQuestion[] | Flashcard[] | FeynmanSummary;
  created_at: string;
}

export interface QuizResultRow {
  id: string;
  user_id: string;
  study_set_id: string;
  total_questions: number;
  correct_answers: number;
  accuracy: number;
  time_taken_ms: number;
  answers: QuizAnswer[];
  created_at: string;
}

export interface FlashcardProgressRow {
  id: string;
  user_id: string;
  study_set_id: string;
  card_id: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string;
  updated_at: string;
}
