'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { processStudyMaterial, saveStudyData } from './actions';

export default function Home() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await processStudyMaterial(title, content);
      // We can either save immediately or show a preview.
      // Let's save immediately to make it a real platform.
      try {
        const materialId = await saveStudyData(data);
        router.push(`/study/${materialId}`);
      } catch (dbError) {
        console.warn('Failed to save to Supabase, falling back to local preview', dbError);
        localStorage.setItem('currentStudy', JSON.stringify(data));
        router.push('/study/preview');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to process material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">StudyPath</h1>
          <p className="text-lg text-slate-600">Transform your notes into personalized study tools using AI.</p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Topic or Chapter Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. Introduction to Quantum Physics"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Your Notes / Textbook Chapter</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Paste your content here..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all shadow-lg ${
                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Content...
                </span>
              ) : (
                'Generate Study Path'
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
