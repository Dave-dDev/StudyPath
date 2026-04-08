import { FeynmanSummary as FeynmanSummaryType } from '@/types';

interface FeynmanSummaryProps {
  summary: Partial<FeynmanSummaryType>;
}

export default function FeynmanSummary({ summary }: FeynmanSummaryProps) {
  return (
    <div className="w-full max-w-3xl mx-auto p-8 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-amber-200 rounded-lg">
          <svg className="w-6 h-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-amber-900">Feynman Summary</h2>
      </div>

      <div className="prose prose-amber max-w-none">
        <p className="text-lg leading-relaxed text-amber-800 whitespace-pre-wrap">
          {summary.content}
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-amber-200">
        <h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wider mb-4">Key Concepts</h3>
        <div className="flex flex-wrap gap-2">
          {summary.key_concepts?.map((concept) => (
            <span
              key={concept}
              className="px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-sm font-medium"
            >
              {concept}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
