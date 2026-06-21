export function calculateGrade(score: number, outOf: number): string {
  const pct = score / outOf;
  if (pct >= 0.9) return "A";
  if (pct >= 0.8) return "B";
  if (pct >= 0.6) return "C";
  if (pct >= 0.4) return "D";
  return "F";
}
