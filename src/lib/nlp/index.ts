// ── Local NLP Engine ───────────────────────────────────
// TF-IDF keyword extraction + rule-based question/flashcard generation
// No external API calls, no ML models, fully offline

// ── Tokenization & Preprocessing ──────────────────────

const STOP_WORDS = new Set([
  "a","an","the","is","are","was","were","be","been","being",
  "have","has","had","do","does","did","will","would","shall",
  "should","may","might","must","can","could","of","in","to",
  "for","with","on","at","from","by","about","as","into",
  "through","during","before","after","above","below","between",
  "out","off","over","under","again","further","then","once",
  "here","there","when","where","why","how","all","each","every",
  "both","few","more","most","other","some","such","no","nor",
  "not","only","own","same","so","than","too","very","just",
  "because","but","and","or","if","while","that","this","these",
  "those","it","its","i","me","my","we","our","you","your",
  "he","him","his","she","her","they","them","their","what",
  "which","who","whom","up","also","like","much","well","even",
  "still","already","yet","though","although","however","therefore",
  "thus","hence","indeed","otherwise","instead","never","always",
  "often","sometimes","usually","generally","typically","mainly",
  "largely","mostly","especially","particularly","specifically",
  "approximately","about","around","nearly","roughly","almost",
  "quite","rather","fairly","pretty","really","actually","basically",
  "simply","merely","hardly","barely","scarcely","seldom","rarely",
  "once","twice","first","second","third","last","next","previous",
  "different","same","similar","other","another","such","every",
  "many","much","several","few","little","enough","less","least",
  "number","part","case","way","time","thing","people","person",
  "man","woman","day","year","world","life","hand","part","place",
  "case","week","company","system","program","question","work",
  "government","number","night","point","home","water","room",
  "mother","area","money","story","fact","month","lot","right",
  "study","book","eye","job","word","business","issue","side",
  "kind","head","house","service","friend","father","power",
  "hour","game","line","end","member","members","law","car",
  "city","community","name","president","team","minute","idea",
  "body","information","back","parent","face","others","level",
  "office","door","health","person","art","war","history","party",
  "result","change","morning","reason","research","girl","guy",
  "moment","air","teacher","force","education","food","state",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

export function splitSentences(text: string): string[] {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

// ── TF-IDF Keyword Extraction ─────────────────────────

function termFrequency(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  return freq;
}

export function extractKeywords(text: string, topN = 20): { word: string; score: number }[] {
  const tokens = tokenize(text);
  if (tokens.length === 0) return [];

  const tf = termFrequency(tokens);
  const totalTokens = tokens.length;

  // Simple TF-IDF: score = frequency / total, with a bonus for length
  const scored = Array.from(tf.entries()).map(([word, count]) => ({
    word,
    score: (count / totalTokens) * (1 + Math.min(word.length / 10, 0.5)),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN);
}

// ── Key Sentence Extraction ────────────────────────────

export function extractKeySentences(text: string, topN = 10): string[] {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return [];

  const keywords = new Set(extractKeywords(text, 30).map((k) => k.word));

  const scored = sentences.map((s) => {
    const tokens = tokenize(s);
    const keywordHits = tokens.filter((t) => keywords.has(t)).length;
    const lengthBonus = s.length > 60 && s.length < 200 ? 1 : 0;
    // Prefer sentences with definitions (contain "is", "are", "means", "refers to")
    const definitionBonus = /\b(is|are|means?|refers? to|defined as|known as)\b/i.test(s) ? 2 : 0;
    // Prefer sentences with numbers/dates (facts)
    const factBonus = /\d{4}|\d+%|\b\d+\b/.test(s) ? 0.5 : 0;

    return {
      sentence: s,
      score: keywordHits + lengthBonus + definitionBonus + factBonus,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN).map((s) => s.sentence);
}

// ── Noun Phrase Extraction (simple) ────────────────────

export function extractNounPhrases(text: string): string[] {
  const sentences = splitSentences(text);
  const phrases: string[] = [];

  for (const sentence of sentences) {
    // Look for "X is/are/was ..." patterns — likely defining a term
    const defs = sentence.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:is|are|was|were|means?|refers? to)\b/g);
    if (defs) {
      for (const d of defs) {
        const phrase = d.replace(/\s+(?:is|are|was|were|means?|refers? to)$/i, "").trim();
        if (phrase.length > 2 && phrase.length < 60) phrases.push(phrase);
      }
    }

    // Look for parenthetical definitions
    const parens = sentence.match(/\(([A-Za-z][A-Za-z\s-]{2,40})\)/g);
    if (parens) {
      for (const p of parens) {
        const phrase = p.slice(1, -1).trim();
        if (phrase.length > 2) phrases.push(phrase);
      }
    }
  }

  return [...new Set(phrases)];
}

// ── Concept Extraction ─────────────────────────────────

export interface Concept {
  term: string;
  definition: string;
  context: string;
}

export function extractConcepts(text: string, maxConcepts = 10): Concept[] {
  const sentences = splitSentences(text);
  const concepts: Concept[] = [];
  const seen = new Set<string>();

  for (const sentence of sentences) {
    // Pattern: "X is Y" — extract term and definition
    const match = sentence.match(
      /^([A-Z][A-Za-z][\w\s-]{1,50}?)\s+(?:is|are|was|were|refers? to|means?|defined as|known as)\s+(.+?)\.?\s*$/i
    );
    if (match) {
      const term = match[1].trim();
      const definition = match[2].trim();
      if (!seen.has(term.toLowerCase()) && term.length > 2 && definition.length > 10) {
        seen.add(term.toLowerCase());
        concepts.push({ term, definition, context: sentence });
      }
    }

    if (concepts.length >= maxConcepts) break;
  }

  return concepts;
}
