import type { Difficulty, QuizQuestion, Flashcard, FeynmanSummary } from "@/types";
import { extractKeywords, extractKeySentences, extractConcepts, splitSentences, tokenize } from "./index";

// ── Helpers ────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

function makeId(prefix: string, index: number): string {
  return `${prefix}-${Date.now().toString(36)}-${index}`;
}

function sentenceToQuestion(sentence: string): string {
  // Convert a statement to a question
  let q = sentence
    .replace(/\.$/, "")
    .replace(/^(The |A |An )/, "")
    .trim();

  // Try to convert "X is Y" to "What is X?"
  const isMatch = q.match(/^(.+?)\s+(?:is|are|was|were)\s+(.+)/i);
  if (isMatch) {
    return `What ${isMatch[1].toLowerCase().includes(" ") ? "are" : "is"} ${isMatch[1].toLowerCase()}?`;
  }

  // Fallback: "What does the text say about..." or just add "?"
  if (q.length < 80) {
    return q + "?";
  }
  return `What is described in: "${q.slice(0, 60)}..."?`;
}

// ── Quiz Generation ────────────────────────────────────

export function generateQuizLocal(
  text: string,
  difficulty: Difficulty,
  count: number
): QuizQuestion[] {
  const keywords = extractKeywords(text, 40);
  const keySentences = extractKeySentences(text, count + 5);
  const allSentences = splitSentences(text);
  const questions: QuizQuestion[] = [];

  // Strategy 1: Definition-based questions ("What is X?")
  const conceptSentences = allSentences.filter((s) =>
    /\b(is|are|was|were|means?|refers? to|defined as)\b/i.test(s)
  );

  for (const sentence of pick(conceptSentences, Math.ceil(count * 0.5))) {
    if (questions.length >= count) break;
    const match = sentence.match(
      /([A-Z][A-Za-z][\w\s-]{1,50}?)\s+(?:is|are|was|were|refers? to|means?|defined as)\s+(.+?)\.?\s*$/i
    );
    if (!match) continue;

    const term = match[1].trim();
    const correctAnswer = match[2].trim().replace(/\.$/, "").slice(0, 120);
    if (correctAnswer.length < 5 || term.length < 2) continue;

    // Generate distractors from other keywords
    const otherKeywords = keywords.filter((k) => k.word.toLowerCase() !== term.toLowerCase());
    const distractorSentences = allSentences
      .filter((s) => s !== sentence && s.length > 20)
      .slice(0, 10);

    const distractors = [
      ...otherKeywords.slice(0, 3).map((k) => {
        const related = distractorSentences.find((s) => tokenize(s).includes(k.word));
        return related
          ? related.replace(/\.$/, "").slice(0, 120)
          : `The concept of ${k.word}`;
      }),
    ];

    // Pad with generic distractors if needed
    while (distractors.length < 3) {
      distractors.push(`Related concept ${distractors.length + 1}`);
    }

    const options = shuffle([correctAnswer, ...distractors.slice(0, 3)]);
    const correctIndex = options.indexOf(correctAnswer);

    questions.push({
      id: makeId("q", questions.length),
      question: `What is ${term.toLowerCase()}?`,
      options,
      correctIndex,
      explanation: `${term} is defined as: ${correctAnswer}.`,
    });
  }

  // Strategy 2: Key sentence completion / recall
  for (const sentence of pick(keySentences, count - questions.length)) {
    if (questions.length >= count) break;

    const tokens = tokenize(sentence);
    if (tokens.length < 3) continue;

    // Pick a keyword to blank out
    const kw = keywords.find((k) =>
      tokens.some((t) => t === k.word || k.word.includes(t))
    );
    if (!kw) continue;

    const blanked = sentence.replace(
      new RegExp(`\\b${kw.word}\\b`, "i"),
      "______"
    );

    if (blanked === sentence) continue;

    const correctAnswer = kw.word;
    const distractors = keywords
      .filter((k) => k.word !== correctAnswer)
      .slice(0, 5)
      .map((k) => k.word);

    const options = shuffle([
      correctAnswer,
      ...pick(distractors, Math.min(3, distractors.length)),
    ]);
    while (options.length < 4) {
      options.push(`option ${options.length + 1}`);
    }

    const correctIndex = options.indexOf(correctAnswer);

    questions.push({
      id: makeId("q", questions.length),
      question: blanked,
      options: options.slice(0, 4),
      correctIndex,
      explanation: `The correct answer is "${correctAnswer}". ${sentence}`,
    });
  }

  // Strategy 3: General recall questions
  if (questions.length < count && keySentences.length > 0) {
    for (const sentence of pick(keySentences, count - questions.length)) {
      if (questions.length >= count) break;
      const q = sentenceToQuestion(sentence);
      if (!q) continue;

      const tokens = tokenize(sentence);
      const correctAnswer = tokens.slice(0, 5).join(" ");
      const distractorWords = keywords
        .filter((k) => !tokens.includes(k.word))
        .slice(0, 5)
        .map((k) => k.word);

      const options = shuffle([
        correctAnswer || "Key concept from the text",
        ...pick(distractorWords, Math.min(3, distractorWords.length)),
      ]);
      while (options.length < 4) {
        options.push(`option ${options.length + 1}`);
      }

      questions.push({
        id: makeId("q", questions.length),
        question: q,
        options: options.slice(0, 4),
        correctIndex: options.indexOf(options.find((o) => o === correctAnswer) ?? options[0]),
        explanation: `The answer is found in: "${sentence.slice(0, 100)}..."`,
      });
    }
  }

  // Apply difficulty adjustments
  if (difficulty === "easy") {
    // Keep simpler questions, already balanced by strategy selection
  } else if (difficulty === "hard") {
    // Shuffle options more, prefer longer explanations
    for (const q of questions) {
      q.explanation = `${q.explanation} Consider the broader context and implications.`;
    }
  }

  return questions.slice(0, count);
}

// ── Flashcard Generation ───────────────────────────────

export function generateFlashcardsLocal(
  text: string,
  difficulty: Difficulty,
  count: number
): Flashcard[] {
  const concepts = extractConcepts(text, count);
  const keywords = extractKeywords(text, count * 2);
  const keySentences = extractKeySentences(text, count);
  const flashcards: Flashcard[] = [];

  // Strategy 1: Concept definitions
  for (const concept of concepts) {
    if (flashcards.length >= count) break;
    const back = concept.definition.length > 200
      ? concept.definition.slice(0, 197) + "..."
      : concept.definition;

    flashcards.push({
      id: makeId("fc", flashcards.length),
      front: concept.term,
      back,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReview: new Date(),
    });
  }

  // Strategy 2: Key sentences as Q&A
  for (const sentence of keySentences) {
    if (flashcards.length >= count) break;

    const q = sentenceToQuestion(sentence);
    if (!q || flashcards.some((f) => f.front === q)) continue;

    const a = sentence.length > 200 ? sentence.slice(0, 197) + "..." : sentence;

    flashcards.push({
      id: makeId("fc", flashcards.length),
      front: q,
      back: a,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReview: new Date(),
    });
  }

  // Strategy 3: Keyword pairs
  for (const kw of keywords) {
    if (flashcards.length >= count) break;
    if (flashcards.some((f) => f.front.toLowerCase().includes(kw.word))) continue;

    // Find a sentence containing this keyword
    const context = splitSentences(text).find((s) =>
      tokenize(s).includes(kw.word)
    );
    if (!context) continue;

    flashcards.push({
      id: makeId("fc", flashcards.length),
      front: `What is "${kw.word}"?`,
      back: context.length > 200 ? context.slice(0, 197) + "..." : context,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReview: new Date(),
    });
  }

  // Difficulty adjustments
  if (difficulty === "hard") {
    // Make backs shorter (more recall required)
    for (const card of flashcards) {
      if (card.back.length > 80) {
        card.back = card.back.slice(0, 77) + "...";
      }
    }
  } else if (difficulty === "easy") {
    // Add hints
    for (const card of flashcards) {
      if (card.front.startsWith("What is")) {
        card.back = `${card.back} (Hint: Think about the key definition.)`;
      }
    }
  }

  return flashcards.slice(0, count);
}

// ── Feynman Summary Generation ─────────────────────────

export function generateFeynmanLocal(text: string): FeynmanSummary {
  const concepts = extractConcepts(text, 5);
  const keywords = extractKeywords(text, 10);
  const keySentences = extractKeySentences(text, 5);

  // Build title from first concept or keyword
  const title = concepts.length > 0
    ? concepts[0].term
    : keywords.length > 0
      ? keywords[0].word.charAt(0).toUpperCase() + keywords[0].word.slice(1)
      : "Key Concept";

  // Build explanation from definitions
  const definitions = concepts.map((c) => `${c.term}: ${c.definition}`);
  const explanation = definitions.length > 0
    ? definitions.join(" ") + " In simple terms, this topic covers the fundamental ideas that are essential to understanding the subject matter."
    : keySentences.slice(0, 2).join(" ") + " To put it simply, these are the core ideas you need to remember.";

  // Key points from top sentences
  const keyPoints = keySentences.slice(0, 5).map((s) => {
    // Trim to a short sentence
    const trimmed = s.length > 120 ? s.slice(0, 117) + "..." : s;
    return trimmed.replace(/\.$/, "");
  });

  // Generate analogy from context
  const analogy = concepts.length > 0
    ? `Think of ${concepts[0].term.toLowerCase()} like a building block — each concept builds on the previous one to create a complete understanding.`
    : "Think of this topic like a puzzle — each piece of information connects to form the bigger picture.";

  return {
    id: makeId("fn", 0),
    title,
    explanation,
    keyPoints: keyPoints.length > 0 ? keyPoints : ["Key concept from the text", "Important to understand", "Builds on related ideas"],
    analogy,
  };
}
