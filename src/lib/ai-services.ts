import { model } from './gemini';
import { Flashcard, QuizQuestion, FeynmanSummary } from '@/types';

export async function generateFlashcards(content: string): Promise<Partial<Flashcard>[]> {
  const prompt = `
    Based on the following content, generate 5-10 flashcards.
    Return the response as a valid JSON array of objects with "question" and "answer" keys.

    Content:
    ${content}
  `;

  const result = await model.generateContent(prompt);
  const text = await result.response.text();
  const jsonMatch = text.match(/\[.*\]/s);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
}

export async function generateQuiz(content: string): Promise<Partial<QuizQuestion>[]> {
  const prompt = `
    Based on the following content, generate 5 quiz questions.
    A mix of multiple-choice (with 4 options) and free-text questions.
    Return the response as a valid JSON array of objects with:
    "question", "type" ("multiple-choice" or "free-text"), "options" (array or null), "correct_answer", and "explanation".

    Content:
    ${content}
  `;

  const result = await model.generateContent(prompt);
  const text = await result.response.text();
  const jsonMatch = text.match(/\[.*\]/s);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
}

export async function generateFeynmanSummary(content: string): Promise<Partial<FeynmanSummary>> {
  const prompt = `
    Explain the following content using the Feynman Technique (explain it as if to a 12-year-old, focusing on core concepts and analogies).
    Return the response as a valid JSON object with "content" (the summary) and "key_concepts" (array of strings).

    Content:
    ${content}
  `;

  const result = await model.generateContent(prompt);
  const text = await result.response.text();
  const jsonMatch = text.match(/\{.*\}/s);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : { content: '', key_concepts: [] };
}

export async function gradeFreeTextAnswer(question: string, correctAnswer: string, userAnswer: string): Promise<number> {
  const prompt = `
    Grade the following user answer on a scale of 0 to 5, where 5 is perfect and 0 is completely wrong.
    Question: ${question}
    Correct Answer: ${correctAnswer}
    User Answer: ${userAnswer}

    Return only the number (0-5).
  `;

  const result = await model.generateContent(prompt);
  const text = await result.response.text();
  const grade = parseInt(text.trim());
  return isNaN(grade) ? 0 : Math.min(Math.max(grade, 0), 5);
}
