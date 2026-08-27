import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Reveal from "@/components/landing/Reveal";
import RotatingWord from "@/components/landing/RotatingWord";
import HeroStage from "@/components/landing/HeroStage";
import FeatureCard from "@/components/landing/FeatureCard";
import Faq from "@/components/landing/Faq";

const FEATURES = [
  {
    icon: "🧠",
    iconBg: "bg-teal-50",
    title: "Quiz Generator",
    desc: "Paste any notes and get personalised multiple-choice, true/false, and short-answer questions — tuned to your difficulty level.",
    details: ["MCQ, true/false & short answer", "Difficulty tuned to you", "Instant scoring & explanations"],
  },
  {
    icon: "🃏",
    iconBg: "bg-purple-50",
    title: "Smart Flashcards",
    desc: "Spaced repetition powered by the SM-2 algorithm means you review cards at the exact moment you're about to forget them.",
    details: ["SM-2 spaced repetition", "Confidence-based scheduling", "Track mastery per card"],
  },
  {
    icon: "💡",
    iconBg: "bg-amber-50",
    title: "Feynman Summaries",
    desc: "Break any concept down into plain language. Inspired by the Feynman Technique, these summaries expose gaps in your understanding.",
    details: ["Plain-language explanations", "Concept gap detection", "Builds deep understanding"],
  },
  {
    icon: "📈",
    iconBg: "bg-blue-50",
    title: "Progress Analytics",
    desc: "See your accuracy over time, topic-by-topic breakdowns, difficulty trends, and a daily activity heatmap.",
    details: ["Accuracy & streak tracking", "Topic weakness reports", "Visual activity heatmap"],
  },
  {
    icon: "🔄",
    iconBg: "bg-green-50",
    title: "Adaptive Difficulty",
    desc: "The system analyses your recent sessions and recommends the right challenge level — never bored, never overwhelmed.",
    details: ["Session performance analysis", "Confidence-scored recommendations", "Auto-adjusts over time"],
  },
  {
    icon: "📋",
    iconBg: "bg-coral-50",
    title: "Question Bank & Review",
    desc: "Every question you get wrong is saved to your personal question bank. Revisit mistakes until they stick.",
    details: ["Auto-saves wrong answers", "Dedicated review page", "Targeted re-practice"],
  },
];

const SUBJECTS = [
  "Biology", "Calculus", "Psychology", "History", "Chemistry",
  "Economics", "Nursing", "Physics", "Literature", "Law",
  "Computer Science", "Anatomy",
];

const STEPS = [
  { step: "1", title: "Paste your notes", desc: "Upload a PDF, .txt, or .md file, paste text, or fetch an article from a URL." },
  { step: "2", title: "Choose your mode", desc: "Quiz, flashcards, or Feynman summary — pick what fits your session." },
  { step: "3", title: "Study & track", desc: "Hard material comes back more often, and your analytics show what's sticking." },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything you need to start studying smarter.",
    features: [
      "3 study set generations per day",
      "10 saved study sets per month",
      "5 file & URL imports per day",
      "Quizzes, flashcards & Feynman summaries",
      "Basic analytics (30-day history)",
      "Question bank review",
    ],
    cta: "Get started free",
    ctaLink: "/login",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "Unlimited studying plus advanced learning analytics.",
    features: [
      "Unlimited generations, sets & imports",
      "Retention curves & weak-topic breakdown",
      "Exam-readiness score",
      "14-day study-time forecasts",
      "Unlimited review history",
      "Offline review with auto-sync",
    ],
    cta: "See Pro plan",
    ctaLink: "/pricing",
    highlighted: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <div className="relative z-10">
        <Navbar />

        {/* ── HERO ── */}
        <section className="relative pt-24 pb-10 px-4 overflow-hidden">
          {/* Layered backdrop */}
          <div className="absolute inset-0 bg-gradient-to-b from-teal-50 via-white to-white" />
          <div className="absolute -top-20 -left-24 w-96 h-96 rounded-full bg-teal-100/60 blur-3xl blob-glow pointer-events-none" />
          <div
            className="absolute top-16 -right-28 w-80 h-80 rounded-full bg-purple-50 blur-3xl blob-glow pointer-events-none"
            style={{ animationDelay: "-5s" }}
          />

          <div className="relative flex flex-col items-center text-center">
            <h1 className="font-bold text-[36px] sm:text-[52px] md:text-[60px] leading-[1.1] text-ink max-w-3xl mb-5">
              Turn any notes into
              <br />
              <RotatingWord
                className="text-teal-400"
                words={["quizzes.", "flashcards.", "summaries.", "study plans."]}
              />
            </h1>

            <p className="text-lg text-gray-600 max-w-xl leading-relaxed mb-8">
              Paste a textbook chapter, lecture notes, or any document.
              StudyPath turns it into quizzes, flashcards, and Feynman summaries in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link href="/upload" className="btn-primary btn-sheen text-base px-7 py-3.5">
                Start studying — it&apos;s free
              </Link>
              <a href="#how-it-works" className="btn-secondary text-base">
                See how it works ↓
              </a>
            </div>

            {/* Interactive product demo */}
            <HeroStage />
          </div>
        </section>

        {/* ── SUBJECT MARQUEE ── */}
        <section className="py-8 border-y border-gray-100 bg-white/70">
          <p className="text-center text-xs uppercase tracking-[0.22em] text-gray-400 mb-4">
            Made for every subject
          </p>
          <div className="marquee-mask overflow-hidden">
            <div className="marquee-track gap-3">
              {[...SUBJECTS, ...SUBJECTS].map((s, i) => (
                <span
                  key={`${s}-${i}`}
                  className="inline-flex items-center whitespace-nowrap px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-xs font-medium text-gray-600"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURE CARDS ── */}
        <section className="max-w-7xl mx-auto px-8 py-20" id="features">
          <Reveal className="text-center mb-12">
            <div className="badge-teal mx-auto mb-4">Features</div>
            <h2 className="font-bold text-3xl md:text-4xl text-ink mb-3">
              Everything you need to ace your exams
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              Six tools that work together to help you study smarter, not harder.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 80}>
                <FeatureCard {...f} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="max-w-5xl mx-auto px-8 pb-24 text-center" id="how-it-works">
          <Reveal>
            <div className="badge-teal mx-auto mb-4">How it works</div>
            <h2 className="font-bold text-3xl md:text-4xl text-ink mb-14">
              Three steps to smarter studying
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-7 left-[18%] right-[18%] h-0.5 rounded-full bg-gradient-to-r from-teal-100 via-teal-400 to-teal-100" />
            {STEPS.map(({ step, title, desc }, i) => (
              <Reveal key={step} delay={i * 120} className="relative">
                <div className="group flex flex-col items-center">
                  <div className="relative w-14 h-14 mb-5">
                    <div className="absolute inset-0 rounded-full bg-teal-400/25 scale-100 group-hover:scale-125 transition-transform duration-300" />
                    <div className="relative w-14 h-14 bg-teal-400 rounded-full flex items-center justify-center text-white font-bold text-lg ring-4 ring-white shadow-card group-hover:scale-110 transition-transform duration-300">
                      {step}
                    </div>
                  </div>
                  <h3 className="font-semibold text-ink mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-[260px]">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="max-w-4xl mx-auto px-8 pb-24" id="pricing">
          <Reveal className="text-center mb-12">
            <div className="badge-teal mx-auto mb-4">Pricing</div>
            <h2 className="font-bold text-3xl md:text-4xl text-ink mb-3">
              Start free. Upgrade when you&apos;re ready.
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              No hidden fees. No credit card required to get started.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {PLANS.map(({ name, price, period, description, features, cta, ctaLink, highlighted }, i) => (
              <Reveal key={name} delay={i * 100} className="h-full">
                <div
                  className={`relative h-full rounded-2xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                    highlighted
                      ? "bg-gradient-to-b from-teal-50 to-white border-2 border-teal-400 shadow-lifted"
                      : "bg-white border border-gray-100 shadow-card hover:shadow-lifted hover:border-gray-200"
                  }`}
                >
                  {highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-teal-400 text-white text-xs font-semibold whitespace-nowrap">
                      Best value
                    </span>
                  )}
                  <h3 className="font-semibold text-lg mb-1 text-ink">{name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-4xl font-bold text-ink">{price}</span>
                    <span className="text-sm text-gray-400">{period}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">{description}</p>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${highlighted ? "bg-teal-400" : "bg-teal-400"}`} />
                        <span className="text-ink">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={ctaLink}
                    className={highlighted ? "btn-primary btn-sheen text-sm w-full" : "btn-secondary text-sm w-full"}
                  >
                    {cta}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="max-w-5xl mx-auto px-8 pb-24" id="faq">
          <Reveal className="text-center mb-10">
            <div className="badge-teal mx-auto mb-4">FAQ</div>
            <h2 className="font-bold text-3xl md:text-4xl text-ink">Questions, answered</h2>
          </Reveal>
          <Reveal delay={100}>
            <Faq />
          </Reveal>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="banner-live py-20 px-8 text-center">
          <Reveal>
            <h2 className="font-bold text-3xl md:text-4xl text-white mb-4">Ready to study smarter?</h2>
            <p className="text-teal-50/90 mb-8 max-w-md mx-auto">
              Ace your exams with smarter study tools. No credit card needed.
            </p>
            <Link
              href="/login"
              className="btn-sheen inline-flex items-center bg-white text-teal-700 font-semibold px-8 py-4 rounded-xl hover:bg-teal-50 transition-all duration-200 hover:-translate-y-0.5 shadow-lifted"
            >
              Get started free →
            </Link>
          </Reveal>
        </section>

        {/* ── FOOTER ── */}
        <footer className="bg-gray-50 py-8 px-8 border-t border-gray-100">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-400">© {new Date().getFullYear()} StudyPath</span>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#features" className="hover:text-ink transition-colors">Features</a>
              <a href="#pricing" className="hover:text-ink transition-colors">Pricing</a>
              <a href="#faq" className="hover:text-ink transition-colors">FAQ</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
