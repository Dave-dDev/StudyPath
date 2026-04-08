'use client';

import { useState } from 'react';
import { QuizQuestion } from '@/types';

interface QuizItemProps {
  question: Partial<QuizQuestion>;
  onAnswer: (quality: number, userAnswer?: string) => void;
}

export default function QuizItem({ question, onAnswer }: QuizItemProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [freeText, setFreeText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    if (question.type === 'multiple-choice') {
      const correct = selectedOption === question.correct_answer;
      onAnswer(correct ? 5 : 0);
    } else {
      onAnswer(-1, freeText); // -1 indicates needs AI grading
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{question.question}</h3>

      {question.type === 'multiple-choice' ? (
        <div className="space-y-3">
          {question.options?.map((option) => (
            <button
              key={option}
              disabled={submitted}
              onClick={() => setSelectedOption(option)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedOption === option
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-indigo-300'
              } ${
                submitted && option === question.correct_answer ? 'bg-green-50 border-green-500' : ''
              } ${
                submitted && selectedOption === option && option !== question.correct_answer ? 'bg-red-50 border-red-500' : ''
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          disabled={submitted}
          className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
          placeholder="Type your answer here..."
        />
      )}

      {!submitted && (
        <button
          onClick={handleSubmit}
          className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Submit Answer
        </button>
      )}

      {submitted && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="font-semibold text-blue-800">Explanation:</p>
          <p className="text-blue-700 mt-1">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
