import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

const FEATURES = [
  {
    icon: "🧠",
    title: "AI Quiz Generator",
    desc: "Paste any notes and get personalised multiple-choice, true/false, and short-answer questions — tuned to your difficulty level. The AI adapts based on your past performance so questions get harder as you improve.",
    details: ["MCQ, true/false & short answer", "Adaptive difficulty engine", "Instant scoring & explanations"],
    bg: "bg-teal-50",
  },
  {
    icon: "🃏",
    title: "Smart Flashcards",
    desc: "Spaced repetition powered by the SM-2 algorithm means you review cards at the exact moment you're about to forget them. No more cramming — just efficient, long-term retention.",
    details: ["SM-2 spaced repetition", "Confidence-based scheduling", "Track mastery per card"],
    bg: "bg-purple-50",
  },
  {
    icon: "💡",
    title: "Feynman Summaries",
    desc: "Ask the AI to break down any concept into plain language. Inspired by the Feynman Technique, these summaries expose gaps in your understanding so you can actually learn — not just memorise.",
    details: ["Plain-language explanations", "Concept gap detection", "Builds deep understanding"],
    bg: "bg-amber-50",
  },
  {
    icon: "📈",
    title: "Progress Analytics",
    desc: "See your accuracy over time, topic-by-topic breakdowns, difficulty trends, and a daily activity heatmap. Know exactly where you're strong and where to focus next.",
    details: ["Accuracy & streak tracking", "Topic weakness reports", "Visual activity heatmap"],
    bg: "bg-blue-50",
  },
  {
    icon: "🔄",
    title: "Adaptive Difficulty",
    desc: "The system analyses your last 20 sessions and recommends the right challenge level with a confidence score. You're always in the zone — never bored, never overwhelmed.",
    details: ["Session performance analysis", "Confidence-scored recommendations", "Auto-adjusts over time"],
    bg: "bg-green-50",
  },
  {
    icon: "📋",
    title: "Question Bank & Review",
    desc: "Every question you get wrong is saved to your personal question bank. Revisit mistakes on a dedicated review page until they stick. Never lose track of what tripped you up.",
    details: ["Auto-saves wrong answers", "Dedicated review page", "Targeted re-practice"],
    bg: "bg-coral-50",
  },
];

const PRICING_PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything you need to start studying smarter — no credit card required.",
    features: [
      "Unlimited quizzes",
      "Unlimited flashcards",
      "Feynman summaries",
      "Progress analytics",
      "Adaptive difficulty",
      "Question bank review",
    ],
    cta: "Get started free",
    ctaLink: "/login",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$5",
    period: "/month",
    description: "For power students who want priority AI and deeper analytics.",
    features: [
      "Everything in Free",
      "Priority AI generation (faster)",
      "Advanced analytics dashboard",
      "Export study data (PDF/CSV)",
      "Priority support",
    ],
    cta: "Coming soon",
    ctaLink: "#",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$12",
    period: "/month",
    description: "For study groups, tutors, and classrooms.",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Shared study sets",
      "Group progress overview",
      "Admin controls",
    ],
    cta: "Coming soon",
    ctaLink: "#",
    highlighted: false,
  },
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
            Powered by AI
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

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link href="/upload" className="btn-primary text-base px-7 py-3.5">
              Start studying — it&apos;s free
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>4.8/5 rating</span>
            <span className="text-gray-200">·</span>
            <span>2,400+ students</span>
            <span className="text-gray-200">·</span>
            <span>Used in 40+ universities</span>
          </div>
        </section>

        {/* ── FEATURE CARDS ── */}
        <section className="max-w-7xl mx-auto px-8 pb-20" id="features">
          <div className="text-center mb-12">
            <div className="badge-teal mx-auto mb-4">Features</div>
            <h2 className="font-bold text-3xl text-ink mb-3">Everything you need to ace your exams</h2>
            <p className="text-gray-600 max-w-lg mx-auto">Six powerful tools that work together to help you study smarter, not harder.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, title, desc, details, bg }) => (
              <div key={title} className={`${bg} rounded-2xl p-7`}>
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-semibold text-base text-ink mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-5 mb-4">{desc}</p>
                <ul className="space-y-1.5">
                  {details.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-xs font-medium text-ink">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="max-w-4xl mx-auto px-8 pb-20 text-center" id="how-it-works">
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

        {/* ── PRICING ── */}
        <section className="max-w-6xl mx-auto px-8 pb-24" id="pricing">
          <div className="text-center mb-12">
            <div className="badge-teal mx-auto mb-4">Pricing</div>
            <h2 className="font-bold text-3xl text-ink mb-3">Start free. Upgrade when you&apos;re ready.</h2>
            <p className="text-gray-600 max-w-lg mx-auto">No hidden fees. No credit card required to get started.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_PLANS.map(({ name, price, period, description, features, cta, ctaLink, highlighted }) => (
              <div
                key={name}
                className={`rounded-2xl p-8 flex flex-col ${
                  highlighted
                    ? "bg-teal-400 text-white ring-2 ring-teal-400 shadow-lifted"
                    : "bg-white border border-gray-100 shadow-card"
                }`}
              >
                <h3 className={`font-semibold text-lg mb-1 ${highlighted ? "text-white" : "text-ink"}`}>{name}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className={`text-4xl font-bold ${highlighted ? "text-white" : "text-ink"}`}>{price}</span>
                  <span className={`text-sm ${highlighted ? "text-teal-100" : "text-gray-400"}`}>{period}</span>
                </div>
                <p className={`text-sm mb-6 ${highlighted ? "text-teal-100" : "text-gray-600"}`}>{description}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${highlighted ? "bg-white" : "bg-teal-400"}`} />
                      <span className={highlighted ? "text-teal-50" : "text-ink"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={ctaLink}
                  className={`inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm transition-colors ${
                    highlighted
                      ? "bg-white text-teal-700 hover:bg-teal-50"
                      : "bg-teal-400 text-white hover:bg-teal-700"
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="bg-teal-400 py-16 px-8 text-center">
          <h2 className="font-bold text-3xl text-white mb-4">Ready to study smarter?</h2>
          <p className="text-teal-50 mb-8 max-w-md mx-auto">Join 2,400+ students who are using AI to ace their exams. No credit card needed.</p>
          <Link href="/login" className="inline-flex items-center bg-white text-teal-700 font-semibold px-8 py-4 rounded-xl hover:bg-teal-50 transition-colors">
            Get started free →
          </Link>
        </section>

        {/* ── FOOTER ── */}
        <footer className="bg-gray-50 py-6 text-center text-sm text-gray-400 border-t border-gray-100">
          © 2025 StudyPath · Built with Next.js &amp; AI
        </footer>
      </div>
    </div>
  );
}
