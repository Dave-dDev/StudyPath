'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Flashcard from '@/components/Flashcard';
import QuizItem from '@/components/QuizItem';
import FeynmanSummary from '@/components/FeynmanSummary';
import { StudyMaterial, Flashcard as FlashcardType, QuizQuestion, FeynmanSummary as FeynmanSummaryType } from '@/types';
import { calculateSM2, INITIAL_SM2_DATA } from '@/lib/sm2';
import { gradeFreeText, getStudyMaterialById, updateFlashcardSM2 } from '@/app/actions';

type StudyData = {
  material: Partial<StudyMaterial>;
  flashcards: Partial<FlashcardType>[];
  quiz: Partial<QuizQuestion>[];
  summary: Partial<FeynmanSummaryType>;
};

export default function StudySession() {
  const { id } = useParams();
  const [data, setData] = useState<StudyData | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'quiz'>('summary');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dueOnly, setDueOnly] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (id === 'preview') {
        const saved = localStorage.getItem('currentStudy');
        if (saved) {
          setData(JSON.parse(saved));
        }
      } else {
        try {
          const fetched = await getStudyMaterialById(id as string, dueOnly);
          setData(fetched);
        } catch (e) {
          console.error('Failed to fetch study data', e);
        }
      }
    }
    loadData();
  }, [id, dueOnly]);

  if (!data) return <div className="p-10 text-center">Loading Study Session...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{data.material.title}</h1>
            <p className="text-slate-500">Difficulty: {data.material.difficulty_score}/10</p>
          </div>

          <nav className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
            <button
              onClick={() => { setActiveTab('summary'); setCurrentIndex(0); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'summary' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Summary
            </button>
            <button
              onClick={() => { setActiveTab('flashcards'); setCurrentIndex(0); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'flashcards' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Flashcards
            </button>
            <button
              onClick={() => { setActiveTab('quiz'); setCurrentIndex(0); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'quiz' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Quiz
            </button>
          </nav>
        </header>

        {activeTab === 'flashcards' && id !== 'preview' && (
          <div className="mb-6 flex justify-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dueOnly}
                onChange={(e) => setDueOnly(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm font-medium text-slate-700">Show Due Only</span>
            </label>
          </div>
        )}

        <div className="space-y-8">
          {activeTab === 'summary' && (
            <FeynmanSummary summary={data.summary} />
          )}

          {activeTab === 'flashcards' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between text-slate-500 max-w-md mx-auto">
                <span>Card {currentIndex + 1} of {data.flashcards.length}</span>
                <div className="flex gap-2">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(i => i - 1)}
                    className="p-1 disabled:opacity-30"
                  >
                    ← Previous
                  </button>
                  <button
                    disabled={currentIndex === data.flashcards.length - 1}
                    onClick={() => setCurrentIndex(i => i + 1)}
                    className="p-1 disabled:opacity-30"
                  >
                    Next →
                  </button>
                </div>
              </div>
              <Flashcard
                flashcard={data.flashcards[currentIndex]}
                onGrade={async (q) => {
                  const flashcard = data.flashcards[currentIndex];
                  const currentSM2 = flashcard.sm2_data || INITIAL_SM2_DATA;
                  const nextSM2 = calculateSM2(q, currentSM2);
                  console.log('Next SM-2:', nextSM2);

                  if (flashcard.id) {
                    await updateFlashcardSM2(flashcard.id, nextSM2);
                  }
                }}
              />
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between text-slate-500 max-w-2xl mx-auto">
                <span>Question {currentIndex + 1} of {data.quiz.length}</span>
                <div className="flex gap-2">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(i => i - 1)}
                    className="p-1 disabled:opacity-30"
                  >
                    ← Previous
                  </button>
                  <button
                    disabled={currentIndex === data.quiz.length - 1}
                    onClick={() => setCurrentIndex(i => i + 1)}
                    className="p-1 disabled:opacity-30"
                  >
                    Next →
                  </button>
                </div>
              </div>
              <QuizItem
                question={data.quiz[currentIndex]}
                onAnswer={async (quality, userAnswer) => {
                  if (quality === -1 && userAnswer) {
                    const aiGrade = await gradeFreeText(
                      data.quiz[currentIndex].question || '',
                      data.quiz[currentIndex].correct_answer || '',
                      userAnswer
                    );
                    console.log('AI Grade:', aiGrade);
                  } else {
                    console.log('Grade:', quality);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
