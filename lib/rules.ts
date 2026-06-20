export interface RuleResult {
  rule: number;
  rule_name?: string;
  finding: string;
  rationale?: string;
}

export interface TopWin {
  rule: number;
  rule_name?: string;
  impact: string;
  fix: string;
}

export interface SectionHeadings {
  hero?: string;
  problem?: string;
  solution?: string;
  social_proof?: string;
  cta?: string;
}

export interface RewrittenCopy {
  headline: string;
  subheadline: string;
  problem_section: string[];
  primary_cta: string;
  testimonial_suggestions: string[];
  sound_familiar?: string[];
  section_headings?: SectionHeadings;
}

export interface FullAnalysis {
  score: number;
  out_of: number;
  grade: string;
  headline: string;
  passes: RuleResult[];
  fails: RuleResult[];
  unable_to_assess: RuleResult[];
  top_3_wins?: TopWin[];
  biggest_win: string;
  rewritten_copy: RewrittenCopy;
}

export const RULE_NAMES: Record<number, string> = {
  1: "Google can tell what your page is about",
  2: "Your opening line tells visitors what they'll get",
  3: "You use real numbers, not vague claims",
  4: "There's one clear thing for visitors to do",
  5: "Your main button tells people what happens when they click it",
  6: "You acknowledge the customer's problem before pitching",
  7: "At least one real customer quote on your homepage",
  8: "Your customer quotes are specific",
  9: "You clearly state where you work",
  10: "Your main service is front and centre",
  11: "You show photos of your actual work",
  12: "You give at least a rough idea of your prices",
  13: "Contact details are visible the moment the page loads",
  14: "Your page sounds like it was written for your specific business",
  15: "You say what makes you different",
  16: "Getting in touch doesn't require filling in an essay",
  17: "Your strongest proof is the first thing people see",
  18: "You avoid meaningless filler words",
  19: "Your site looks like you're still in business",
  20: "Your opening line makes a claim someone could actually disagree with",
  21: "You tell people what happens after they get in touch",
  22: "Your page title and description in Google look professional",
};

export const GRADE_COLOURS: Record<string, string> = {
  A: "#10b981",
  B: "#3B6CF4",
  C: "#f59e0b",
  D: "#f59e0b",
  F: "#ef4444",
};

export function getRuleName(r: RuleResult): string {
  return r.rule_name ?? RULE_NAMES[r.rule] ?? `Rule ${r.rule}`;
}
