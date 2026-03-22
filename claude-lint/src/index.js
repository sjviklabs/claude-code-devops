import { analyzeInstructionBudget } from "./rules/instruction-budget.js";
import { detectCredentialLeaks } from "./rules/credential-leaks.js";
import { flagVagueRules } from "./rules/vague-rules.js";
import { scoreSectionCoverage } from "./rules/section-coverage.js";
import { checkLineCount } from "./rules/line-count.js";

/**
 * Lint a CLAUDE.md file and return a scored report.
 * @param {string} content - Raw file contents
 * @param {string} filePath - Path to the file (for display)
 * @returns {object} Lint results with score, findings, and metadata
 */
export function lint(content, filePath) {
  const lines = content.split("\n");
  const findings = [];

  // Run all analyzers
  const budget = analyzeInstructionBudget(content, lines);
  const credentials = detectCredentialLeaks(content, lines);
  const vague = flagVagueRules(content, lines);
  const coverage = scoreSectionCoverage(content, lines);
  const lineCount = checkLineCount(lines);

  findings.push(...budget.findings);
  findings.push(...credentials.findings);
  findings.push(...vague.findings);
  findings.push(...coverage.findings);
  findings.push(...lineCount.findings);

  // Calculate overall score (0-100)
  // Start at 100, deduct for issues
  let score = 100;

  // Critical issues (credential leaks) are -20 each, capped at -60
  const criticalCount = findings.filter(
    (f) => f.severity === "critical",
  ).length;
  score -= Math.min(criticalCount * 20, 60);

  // Warnings are -5 each, capped at -30
  const warningCount = findings.filter((f) => f.severity === "warning").length;
  score -= Math.min(warningCount * 5, 30);

  // Info items are -2 each, capped at -10
  const infoCount = findings.filter((f) => f.severity === "info").length;
  score -= Math.min(infoCount * 2, 10);

  // Bonus for good coverage (up to +10)
  score += coverage.bonus || 0;

  score = Math.max(0, Math.min(100, score));

  return {
    file: filePath,
    score,
    grade: scoreToGrade(score),
    lineCount: lines.length,
    instructionCount: budget.instructionCount,
    findings: findings.sort(severityOrder),
    summary: {
      critical: criticalCount,
      warning: warningCount,
      info: infoCount,
    },
  };
}

function scoreToGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

const severityRank = { critical: 0, warning: 1, info: 2 };

function severityOrder(a, b) {
  return (severityRank[a.severity] ?? 3) - (severityRank[b.severity] ?? 3);
}
