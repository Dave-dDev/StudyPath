# Adejumo Inioluwa
**Full-Stack Developer** | Lagos, Nigeria
inioluwa@example.com | +234-XXX-XXX-XXXX | linkedin.com/in/adejumo-inioluwa | github.com/Dave-dDev

---

## PROFESSIONAL SUMMARY

Full-stack developer with expertise in building AI-powered web applications using Next.js, TypeScript, and Python. Proven track record of designing and deploying production-grade systems with custom NLP engines, authentication, database persistence, and interactive UI. Self-directed learner who ships end-to-end features — from serverless infrastructure to responsive frontends with complex state management.

---

## TECHNICAL SKILLS

| Category | Skills |
|----------|--------|
| **Languages** | TypeScript, JavaScript, Python, SQL |
| **Frontend** | Next.js (15), React (19), Tailwind CSS, Framer Motion, HTML5, CSS3 |
| **Backend** | Next.js API Routes, REST API design, Middleware, Server Components |
| **AI / ML** | Local NLP (TF-IDF, keyword extraction), Gemini API, OpenAI API, Prompt Engineering, Groq |
| **Database** | Turso (SQLite edge), Supabase, PostgreSQL, Custom session management |
| **Auth & Security** | PBKDF2 (Web Crypto API), HttpOnly cookies, session management, CORS, bcrypt |
| **DevOps & Tools** | Git, Vercel, CI/CD, Docker, npm, Edge deployment |
| **Testing & QA** | Playwright, Jest, Cypress, OWASP ZAP, Lighthouse |
| **Core CS** | SM-2 Spaced Repetition Algorithm, TF-IDF, Data Structures & Algorithms |

---

## PROJECT

### StudyPath — AI-Powered Adaptive Study Platform
*Next.js 15 · TypeScript · Turso · Tailwind CSS · React 19 · Gemini API · Custom NLP*
[GitHub](https://github.com/Dave-dDev/studypath) | Full-stack portfolio project — 15+ commits, built over 2-week sprint cycle

**Overview:** Full-stack web application that transforms raw study notes into adaptive quizzes, SM-2 spaced-repetition flashcards, and Feynman-style summaries using a layered AI architecture with local NLP fallback.

**Key Contributions & Achievements:**

- **Architected a multi-provider AI layer** supporting Gemini, OpenAI, and Groq — built a unified adapter pattern with JSON repair heuristics, provider fallback, and token-limit handling. Replaced external AI with a **custom TF-IDF + rule-based NLP engine** eliminating API dependency and costs.

- **Implemented SM-2 spaced repetition algorithm from scratch** — built the full scheduler with ease-factor adjustment, interval calculation, and 4-grade review system. Achieved production-grade flashcard review with CSS 3D flip animations and progress tracking.

- **Designed and built custom authentication system** using PBKDF2 password hashing (100k iterations via Web Crypto API), HttpOnly session cookies with 30-day expiry, and server-side middleware route protection — all without third-party auth libraries.

- **Built 10+ REST API endpoints** handling CRUD for study sets, quiz results, flashcard progress, question bank, performance analytics, dashboard aggregation, and adaptive difficulty recommendation.

- **Developed adaptive difficulty engine** that analyzes last 20 quiz sessions and recommends optimal difficulty level using trend analysis and per-difficulty performance stats with 85% confidence thresholds.

- **Created comprehensive analytics dashboard** with accuracy-over-time bar charts, topic/difficulty breakdowns, study activity heatmap, and 7d/30d/90d time-range filtering — all with hover interactions and color-coded performance indicators.

- **Engineered local NLP pipeline** with TF-IDF keyword extraction, sentence tokenization, noun phrase extraction, and concept identification — powers rule-based generation of quizzes (3 strategies), flashcards (3 strategies), and Feynman summaries entirely offline.

- **Delivered polished UI/UX** with responsive grid layouts, CSS fade-in/slide-up animations, 3D card flip transforms, animated progress bars, custom design tokens (teal/purple/coral/amber palette), drag-and-drop file uploads, and toast notifications.

- **Added security hardening** by upgrading Next.js from 15.0.3 to 15.5.22 to patch CVE-2025-66478, implementing proper HTTP-only cookie attributes, and adding route-level access control via Next.js middleware.

**Tech highlights:** TypeScript throughout, server components, edge-compatible database, custom hooks, context-based auth state, React ErrorBoundary pattern, 404/error/loading states on every route.

---

## TECHNICAL ARTIFACTS

- **Custom PBKDF2 Authentication:** Password hashing with 100k iterations, salt generation, session token rotation
- **Local NLP Engine:** TF-IDF-based keyword extraction + rule-based content generation (no external API)
- **SM-2 Algorithm:** Pure TypeScript implementation with ease factor, interval, and repetition tracking
- **Multi-Provider AI Adapter:** Unified interface for Gemini, OpenAI, Groq, Ollama with provider selection via env var
- **Edge Database Schema:** 7-table Turso/SQLite schema with indexes, cascading deletes, and unique constraints

---

## EDUCATION

**Self-Directed Engineering Curriculum** | 2025–2026
- AI Career Strategy roadmap — Project #07 (StudyPath): Full-stack AI application
- Built 15+ production-grade projects spanning AI, full-stack web, and systems architecture

---

## CERTIFICATIONS & COURSES

- Google AI Studio — Gemini API Integration
- Web Security — OWASP Top 10, CVE remediation, HttpOnly cookies, PBKDF2

---

## ADDITIONAL INFORMATION

- **Open Source:** Active GitHub contributor with public portfolio
- **Methodology:** Agile/Scrum, feature-branch workflow, semantic commits
- **Interests:** AI-assisted learning tools, spaced repetition systems, developer tooling, edge computing
