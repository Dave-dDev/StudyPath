'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flashcard as FlashcardType } from '@/types';
interface FlashcardProps {
  flashcard: Partial<FlashcardType>;
  onGrade: (quality: number) => void;
}

export default function Flashcard({ flashcard, onGrade }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto h-64 perspective">
      <motion.div
        className="relative w-full h-full transition-all duration-500 preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front */}
        <div className="absolute inset-0 w-full h-full backface-hidden flex flex-col items-center justify-center p-6 bg-white border-2 border-indigo-100 rounded-2xl shadow-lg cursor-pointer">
          <span className="text-sm font-medium text-indigo-500 mb-4 uppercase tracking-wider">Question</span>
          <p className="text-xl font-semibold text-center text-gray-800">{flashcard.question}</p>
          <p className="mt-8 text-xs text-gray-400">Click to flip</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden flex flex-col items-center justify-center p-6 bg-indigo-50 border-2 border-indigo-200 rounded-2xl shadow-lg cursor-pointer"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <span className="text-sm font-medium text-indigo-500 mb-4 uppercase tracking-wider">Answer</span>
          <p className="text-lg text-center text-gray-700">{flashcard.answer}</p>

          <div className="mt-6 flex gap-2" onClick={(e) => e.stopPropagation()}>
             {[1, 2, 3, 4, 5].map((grade) => (
               <button
                 key={grade}
                 onClick={() => onGrade(grade)}
                 className="px-3 py-1 bg-white border border-indigo-200 rounded-md text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors text-sm"
               >
                 {grade}
               </button>
             ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
