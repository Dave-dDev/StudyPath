import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

const FEATURES = [
  { icon: "🧠", title: "AI Quiz Generator",  desc: "MCQs, true/false, and short answer — tuned to your difficulty level.", bg: "bg-teal-50" },
  { icon: "🃏", title: "Smart Flashcards",   desc: "Spaced repetition powered by the SM-2 algorithm, so you review exactly what you need.", bg: "bg-purple-50" },
  { icon: "💡", title: "Feynman Summaries",  desc: "Ask the AI to explain any concept as simply as possible — great for deep understanding.", bg: "bg-amber-50" },
  { icon: "📈", title: "Progress Tracking",  desc: "Streak calendar, accuracy graphs, and \"due today\" reminders keep you on track.", bg: "bg-blue-50" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Teal hero background */}
      <div className="absolute top-0 left-0 right-0 h-[560px] bg-teal-50 -z-0" />

      <div className="relative z-10">
        <Navbar />

        {/* ── HERO ── */}
        <section className="flex flex-col items-center text-center pt-20 pb-16 px-4">
          {/* Badge */}
          <div className="badge-teal mb-6 text-[13px] px-4 py-2">
            ✨ &nbsp;Powered by Gemini AI
          </div>

          {/* H1 */}
          <h1 className="font-bold text-[52px] md:text-[62px] leading-[1.1] text-ink max-w-3xl mb-5">
            Turn Any Notes Into<br />Personalised Quizzes
          </h1>

          {/* Subheading */}
          <p className="text-lg text-gray-600 max-w-xl leading-relaxed mb-8">
            Paste a textbook chapter, lecture notes, or any document.
            StudyPath generates quizzes, flashcards, and Feynman summaries in seconds.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link href="/upload" className="btn-primary text-base px-7 py-3.5">
              Start studying — it&apos;s free
            </Link>
            <a href="#how" className="btn-secondary text-base px-6 py-3.5">
              Watch 2-min demo &nbsp;→
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>⭐ 4.8/5 rating</span>
            <span className="text-gray-200">·</span>
            <span>2,400+ students</span>
            <span className="text-gray-200">·</span>
            <span>Used in 40+ universities</span>
          </div>
        </section>

        {/* ── FEATURE CARDS ── */}
        <section className="max-w-7xl mx-auto px-8 pb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="how">
          {FEATURES.map(({ icon, title, desc, bg }) => (
            <div key={title} className={`${bg} rounded-2xl p-7`}>
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-semibold text-base text-ink mb-2">{title}</h3>
              <p className="text-sm text-gray-600 leading-5">{desc}</p>
            </div>
          ))}
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="max-w-4xl mx-auto px-8 pb-24 text-center">
          <div className="badge-teal mx-auto mb-4">How it works</div>
          <h2 className="font-bold text-3xl text-ink mb-12">Three steps to smarter studying</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Paste your notes", desc: "Upload a PDF, .txt file, or paste text directly. Any length works." },
              { step: "2", title: "Choose your mode", desc: "Quiz, flashcards, or Feynman summary — pick what fits your session." },
              { step: "3", title: "Study & track", desc: "The AI remembers what you find hard and reviews it more often." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-teal-400 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-ink mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="bg-teal-400 py-16 px-8 text-center">
          <h2 className="font-bold text-3xl text-white mb-4">Ready to study smarter?</h2>
          <p className="text-teal-50 mb-8 max-w-md mx-auto">Join 2,400+ students who are using AI to ace their exams. No credit card needed.</p>
          <Link href="/upload" className="inline-flex items-center bg-white text-teal-700 font-semibold px-8 py-4 rounded-xl hover:bg-teal-50 transition-colors">
            Get started free →
          </Link>
        </section>

        {/* ── FOOTER ── */}
        <footer className="bg-gray-50 py-6 text-center text-sm text-gray-400 border-t border-gray-100">
          © 2025 StudyPath · Built with Next.js, Gemini API &amp; Supabase
        </footer>
      </div>
    </div>
  );
}
