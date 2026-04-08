export interface Flashcard {
  id: string;
  material_id: string;
  question: string;
  answer: string;
  sm2_data: SM2Data;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  material_id: string;
  question: string;
  options?: string[]; // For multiple choice
  correct_answer: string;
  explanation: string;
  type: 'multiple-choice' | 'free-text';
  created_at: string;
}

export interface FeynmanSummary {
  id: string;
  material_id: string;
  content: string;
  key_concepts: string[];
  created_at: string;
}

export interface StudyMaterial {
  id: string;
  user_id: string;
  title: string;
  content: string;
  difficulty_score: number;
  created_at: string;
}

export interface SM2Data {
  repetitions: number;
  interval: number;
  ease_factor: number;
  next_review: string;
}
