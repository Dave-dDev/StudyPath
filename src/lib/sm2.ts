import type { SM2Grade, SM2Result, Flashcard } from "@/types";

/**
 * SM-2 Spaced Repetition Algorithm
 * https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 *
 * Grade:
 *   0-1 = forgotten (reset)
 *   2   = hard (minimum pass)
 *   3   = medium
 *   4   = easy
 *   5   = perfect (no hesitation)
 */
export function sm2(card: Flashcard, grade: SM2Grade): SM2Result {
  let { easeFactor, interval, repetitions } = card;

  if (grade < 3) {
    // Forgotten — reset repetitions but keep ease factor adjustment
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0)      interval = 1;
    else if (repetitions === 1) interval = 6;
    else                        interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  // Update ease factor (stays ≥ 1.3)
  easeFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { easeFactor, interval, repetitions, nextReview };
}

/** Return a human-readable label for a grade */
export function gradeLabel(grade: SM2Grade): string {
  return ["Again 😰", "Hard 😰", "Hard 🤔", "Medium 🤔", "Easy 😊", "Perfect 🧠"][grade];
}

/** Return the grade's interval preview text */
export function gradeIntervalPreview(card: Flashcard, grade: SM2Grade): string {
  const result = sm2(card, grade);
  const days = result.interval;
  if (days === 1) return "1 day";
  if (days < 7)   return `${days} days`;
  if (days < 14)  return "1 week";
  return `${Math.round(days / 7)} weeks`;
}
