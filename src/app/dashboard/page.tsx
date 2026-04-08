'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [sessions, setSessions] = useState<{id: string, title: string, created_at: string}[]>([]);

  useEffect(() => {
    async function fetchSessions() {
      const { data } = await supabase
        .from('study_materials')
        .select('id, title, created_at')
        .order('created_at', { ascending: false });

      if (data) setSessions(data);
    }
    fetchSessions();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Your Library</h1>
          <Link
            href="/"
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            New Material
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/study/${session.id}`}
              className="group p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-slate-400 uppercase">
                  {new Date(session.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{session.title}</h3>
              <p className="mt-2 text-slate-500 text-sm">Flashcards, Quizzes and Feynman Summary ready.</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
