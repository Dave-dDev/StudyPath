/**
 * Logic to calibrate difficulty based on content complexity.
 * This is a simplified version that can be expanded.
 */
export function calibrateDifficulty(content: string): number {
  const words = content.trim().split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).length;
  const avgWordLength = content.length / words;

  // Simple heuristic: mix of length and density
  // Scale 1-10
  let score = 0;

  if (words > 1000) score += 4;
  else if (words > 500) score += 3;
  else if (words > 200) score += 2;
  else score += 1;

  if (avgWordLength > 6) score += 3;
  else if (avgWordLength > 5) score += 2;
  else score += 1;

  if (sentences / words < 0.05) score += 3; // Long complex sentences
  else if (sentences / words < 0.1) score += 2;
  else score += 1;

  return Math.min(Math.max(score, 1), 10);
}
