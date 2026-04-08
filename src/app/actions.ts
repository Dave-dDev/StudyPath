"use server";

import { Flashcard, QuizQuestion, FeynmanSummary, StudyMaterial, SM2Data } from '@/types';
import { gradeFreeTextAnswer as gradeAI } from '@/lib/ai-services';
import { supabase } from '@/lib/supabase';

export async function gradeFreeText(question: string, correctAnswer: string, userAnswer: string) {
  return await gradeAI(question, correctAnswer, userAnswer);
}

export async function saveStudyData(data: {
  material: Partial<StudyMaterial>,
  flashcards: Partial<Flashcard>[],
  quiz: Partial<QuizQuestion>[],
  summary: Partial<FeynmanSummary>
}) {
  const { data: materialData, error: mError } = await supabase
    .from('study_materials')
    .insert([data.material])
    .select()
    .single();

  if (mError) throw mError;

  const materialId = materialData.id;

  const [fRes, qRes, sRes] = await Promise.all([
    supabase.from('flashcards').insert(data.flashcards.map(f => ({ ...f, material_id: materialId }))),
    supabase.from('quiz_questions').insert(data.quiz.map(q => ({ ...q, material_id: materialId }))),
    supabase.from('feynman_summaries').insert({ ...data.summary, material_id: materialId })
  ]);

  if (fRes.error) throw fRes.error;
  if (qRes.error) throw qRes.error;
  if (sRes.error) throw sRes.error;
  return materialId;
}

export async function updateFlashcardSM2(id: string, sm2: SM2Data) {
  const { error } = await supabase
    .from('flashcards')
    .update({ sm2_data: sm2 })
    .eq('id', id);
  if (error) throw error;
}

export async function getStudyMaterialById(id: string, dueOnly: boolean = false) {
  const { data: material, error: mError } = await supabase
    .from('study_materials')
    .select('*')
    .eq('id', id)
    .single();
  if (mError) throw mError;

  let fQuery = supabase.from('flashcards').select('*').eq('material_id', id);
  if (dueOnly) {
    fQuery = fQuery.lte('sm2_data->>next_review', new Date().toISOString());
  }

  const [fRes, qRes, sRes] = await Promise.all([
    fQuery,
    supabase.from('quiz_questions').select('*').eq('material_id', id),
    supabase.from('feynman_summaries').select('*').eq('material_id', id).single()
  ]);

  return {
    material,
    flashcards: fRes.data || [],
    quiz: qRes.data || [],
    summary: sRes.data
  };
}

export async function processStudyMaterial(title: string, content: string) {
  // MOCK for verification if API key is missing
  if (!process.env.GEMINI_API_KEY) {
    const material: Partial<StudyMaterial> = { title, content, difficulty_score: 5 };
    const flashcards: Partial<Flashcard>[] = [
      { question: "What is at the center of the solar system?", answer: "The Sun" },
      { question: "How many planets are there?", answer: "Eight" }
    ];
    const quiz: Partial<QuizQuestion>[] = [
      {
        question: "Which is the red planet?",
        type: 'multiple-choice',
        options: ["Mars", "Venus", "Earth", "Jupiter"],
        correct_answer: "Mars",
        explanation: "Mars is known as the red planet due to iron oxide on its surface."
      }
    ];
    const summary: Partial<FeynmanSummary> = {
      content: "The solar system is like a big family where the Sun is the parent in the middle, and all the planets are children spinning around it.",
      key_concepts: ["Sun", "Planets", "Orbit"]
    };
    return { material, flashcards, quiz, summary };
  }

  const { calibrateDifficulty } = await import('@/lib/difficulty');
  const { generateFlashcards, generateQuiz, generateFeynmanSummary } = await import('@/lib/ai-services');

  const difficulty = calibrateDifficulty(content);

  const [flashcards, quiz, summary] = await Promise.all([
    generateFlashcards(content),
    generateQuiz(content),
    generateFeynmanSummary(content)
  ]);

  const material: Partial<StudyMaterial> = {
    title,
    content,
    difficulty_score: difficulty,
  };

  return { material, flashcards, quiz, summary };
}
