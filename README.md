# 🧠 StudyPath — AI-Powered Study Tool

Turn any notes into personalised quizzes, flashcards, and Feynman summaries using Gemini AI.

Built as Project #07 from the [AI Career Strategy roadmap](https://studypath.vercel.app).

## ✨ Features

| Feature | Status |
|---------|--------|
| 📤 Text/PDF upload | ✅ Week 2 |
| 🤖 AI Quiz generation (Gemini) | ✅ Week 3 |
| 🃏 Flashcard generation + SM-2 | ✅ Week 7 |
| 💡 Feynman summaries | ✅ Week 4 |
| 🔐 Auth + persistence (Supabase) | 🔜 Week 6 |
| 📈 Analytics dashboard | 🔜 Week 8 |

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone https://github.com/yourusername/studypath
cd studypath
npm install

# 2. Set up environment
cp .env.local.example .env.local
# → Add your GEMINI_API_KEY from https://aistudio.google.com

# 3. Run development server
npm run dev
# → Open http://localhost:3000
```

## 🔑 Environment Variables

| Variable | Where to get it | Required |
|----------|----------------|----------|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com) | ✅ Week 3 |
| `NEXT_PUBLIC_SUPABASE_URL` | [Supabase Dashboard](https://supabase.com) | Week 6 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard | Week 6 |

## 🏗️ Architecture

```
src/
├── app/
│   ├── page.tsx           # Landing page
│   ├── upload/            # Step 1: Input notes
│   ├── quiz/              # Step 2a: MCQ quiz
│   ├── flashcards/        # Step 2b: SM-2 flashcards
│   ├── feynman/           # Step 2c: Feynman summary
│   ├── dashboard/         # User progress hub
│   └── api/generate/      # Gemini API route
├── components/
│   ├── layout/            # Navbar, Sidebar
│   └── ui/                # DifficultySelector, ProgressBar, Spinner
├── lib/
│   ├── gemini.ts          # All AI calls (typed)
│   ├── sm2.ts             # Spaced repetition algorithm
│   └── utils.ts           # Shared helpers
└── types/
    └── index.ts           # All TypeScript interfaces
```

## 🤖 AI Prompts

All AI calls live in `src/lib/gemini.ts`. Each function:
1. Sends a structured prompt with the user's text
2. Requests JSON-only output (no markdown fences)
3. Parses and validates the response
4. Returns typed TypeScript objects

**Prompt engineering decisions:**
- Difficulty modifier is injected per prompt (easy/medium/hard instructions differ)
- `cleanJSON()` strips accidental markdown wrapping from the model
- Text is truncated to 8,000 chars to stay within token limits

## 🧮 SM-2 Algorithm

The spaced repetition scheduler lives in `src/lib/sm2.ts`.

```
Grade 0-1 → forgotten  → reset to 1 day
Grade 2   → hard       → minimum pass
Grade 3   → medium     → normal progression
Grade 4   → easy       → accelerated interval
Grade 5   → perfect    → maximum acceleration
```

EaseFactor starts at 2.5 and adjusts after every review. Minimum EaseFactor: 1.3.

## 📅 Build Roadmap

| Week | Goal | Files |
|------|------|-------|
| 1 | Scaffold + deploy to Vercel | All files in this commit |
| 2 | File upload + text parsing | `upload/page.tsx` |
| 3 | Gemini API first call | `lib/gemini.ts`, `api/generate/` |
| 4 | 3 content modes | All mode pages |
| 5 | Streaming + error handling | API route improvements |
| 6 | Supabase auth + DB | `lib/supabase.ts` (coming) |
| 7 | SM-2 scheduler | `lib/sm2.ts` ✅ already done |
| 8 | Analytics + polish | Dashboard improvements |
| 9 | Launch + gather evidence | README case study section |

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 18, TypeScript, Tailwind CSS
- **AI:** Google Gemini 1.5 Flash (`@google/generative-ai`)
- **Database:** Supabase (PostgreSQL + Auth) — Week 6
- **Deployment:** Vercel
- **Animations:** Framer Motion
- **Spaced Repetition:** SM-2 algorithm (custom implementation)

## 📊 Interview Metrics (to track)

Track these in Vercel Analytics + a Google Form:

- [ ] Number of unique users
- [ ] Quizzes generated per day
- [ ] Average satisfaction score (Google Form)
- [ ] Most common difficulty chosen
- [ ] Retention after 7 days

---

Built by **Adejumo Inioluwa** as part of a structured AI + web dev learning journey.
