-- StudyPath Database Schema (Turso/SQLite)

-- Users table
CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Sessions table
CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);

-- Study sets
CREATE TABLE IF NOT EXISTS study_sets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source_text TEXT,
  difficulty TEXT,
  mode TEXT,
  data TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Quiz results
CREATE TABLE IF NOT EXISTS quiz_results (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  study_set_id TEXT REFERENCES study_sets(id) ON DELETE CASCADE,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  accuracy REAL NOT NULL,
  time_taken_ms INTEGER NOT NULL,
  answers TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Flashcard progress
CREATE TABLE IF NOT EXISTS flashcard_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  study_set_id TEXT REFERENCES study_sets(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  ease_factor REAL DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(user_id, study_set_id, card_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_study_sets_user ON study_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user ON flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_review ON flashcard_progress(next_review);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_study ON flashcard_progress(user_id, study_set_id);
CREATE INDEX IF NOT EXISTS idx_session_user ON session(user_id);
CREATE INDEX IF NOT EXISTS idx_session_expires ON session(expires_at);

-- Question bank (saved quiz questions for review)
CREATE TABLE IF NOT EXISTS question_bank (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  study_set_id TEXT REFERENCES study_sets(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  options TEXT NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium',
  topic TEXT,
  times_seen INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  last_seen_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Adaptive difficulty tracking (per topic/difficulty performance)
CREATE TABLE IF NOT EXISTS performance_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  study_set_id TEXT REFERENCES study_sets(id) ON DELETE SET NULL,
  mode TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  accuracy REAL NOT NULL,
  time_taken_ms INTEGER,
  topic TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_question_bank_user ON question_bank(user_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_difficulty ON question_bank(user_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_question_bank_topic ON question_bank(user_id, topic);
CREATE INDEX IF NOT EXISTS idx_performance_log_user ON performance_log(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_log_mode ON performance_log(user_id, mode);
CREATE INDEX IF NOT EXISTS idx_performance_log_created ON performance_log(user_id, created_at);
