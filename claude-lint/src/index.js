import { analyzeInstructionBudget } from "./rules/instruction-budget.js";
import { detectCredentialLeaks } from "./rules/credential-leaks.js";
import { flagVagueRules } from "./rules/vague-rules.js";
import { scoreSectionCoverage } from "./rules/section-coverage.js";
import { checkLineCount } from "./rules/line-count.js";
import { scoreClaritySpecificity } from "./rules/clarity-score.js";
import { detectConflicts } from "./rules/conflict-detection.js";
import { scoreEnforceability } from "./rules/enforceability.js";
import { detectBloat } from "./rules/bloat-detection.js";
import { checkConsistency } from "./rules/consistency.js";

/**
 * Lint a CLAUDE.md file and return a scored report.
 *
 * v2 scoring: weighted multi-dimensional analysis across 8 dimensions.
 * No single dimension dominates. A file must be good across the board.
 *
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
  const coverage = scoreSectionCoverage(content, lines, filePath);
  const lineCount = checkLineCount(lines);
  const clarity = scoreClaritySpecificity(content, lines);
  const conflicts = detectConflicts(content, lines);
  const enforceability = scoreEnforceability(content, lines);
  const bloat = detectBloat(content, lines);
  const consistency = checkConsistency(content, lines);

  // Collect all findings
  findings.push(...budget.findings);
  findings.push(...credentials.findings);
  findings.push(...vague.findings);
  findings.push(...coverage.findings);
  findings.push(...lineCount.findings);
  findings.push(...clarity.findings);
  findings.push(...conflicts.findings);
  findings.push(...enforceability.findings);
  findings.push(...bloat.findings);
  findings.push(...consistency.findings);

  // === Weighted Multi-Dimensional Scoring ===
  //
  // Each dimension scores 0-100 internally, then gets weighted.
  // Total score = weighted average across all dimensions.
  //
  // Dimensions and weights:
  //   Structure      (10%) — heading organization, nesting depth
  //   Clarity        (20%) — specificity, actionability of instructions
  //   Security       (15%) — credentials, exposure
  //   Completeness   (12%) — coverage of recommended sections
  //   Consistency    (8%)  — formatting, terminology
  //   Efficiency     (15%) — line count, bloat, signal/noise
  //   Enforceability (10%) — hookable rules identified
  //   Instruction Budget (10%) — within the ~175 instruction limit

  const dimensions = {};

  // Structure (10%): heading organization, nesting, section depth
  // Measures HOW WELL the file is organized (separate from WHAT it covers)
  const headingCount = lines.filter((l) => /^#{1,4}\s+\S/.test(l)).length;
  const hasNestedHeadings = lines.some((l) => /^#{2,4}\s+\S/.test(l));
  const hasTopLevel = lines.some((l) => /^#\s+\S/.test(l));
  let structureScore = 0;
  if (headingCount >= 4 && hasNestedHeadings && hasTopLevel)
    structureScore = 100;
  else if (headingCount >= 3 && hasNestedHeadings) structureScore = 85;
  else if (headingCount >= 2) structureScore = 65;
  else if (headingCount >= 1) structureScore = 40;
  else structureScore = 15;
  dimensions.structure = {
    score: structureScore,
    weight: 10,
    label: "Structure",
  };

  // Clarity (20%): from clarity scorer
  dimensions.clarity = {
    score: Math.min(100, clarity.clarityPercent || 50),
    weight: 20,
    label: "Clarity",
  };

  // Security (15%): 100 if no credential leaks, drops sharply
  const credentialFindings = findings.filter(
    (f) => f.rule === "credential-leak",
  ).length;
  dimensions.security = {
    score:
      credentialFindings === 0
        ? 100
        : Math.max(0, 100 - credentialFindings * 30),
    weight: 15,
    label: "Security",
  };

  // Completeness (12%): section coverage percentage
  dimensions.completeness = {
    score: coverage.coveragePercent,
    weight: 12,
    label: "Completeness",
  };

  // Consistency (8%): 100 minus deductions for inconsistencies
  dimensions.consistency = {
    score: Math.max(0, 100 - consistency.inconsistencyCount * 15),
    weight: 8,
    label: "Consistency",
  };

  // Efficiency (15%): based on line count sweet spot + bloat
  const lineScore =
    lines.length < 20
      ? 30
      : lines.length < 60
        ? 60
        : lines.length <= 300
          ? 100
          : lines.length <= 500
            ? 70
            : 40;
  const bloatPenalty = Math.min(30, bloat.bloatCount * 10);
  dimensions.efficiency = {
    score: Math.max(0, lineScore - bloatPenalty),
    weight: 15,
    label: "Efficiency",
  };

  // Enforceability (10%): lower if many hookable rules aren't hooks
  const enforceScore =
    enforceability.hookableCount === 0
      ? 100
      : enforceability.hookableCount <= 2
        ? 85
        : enforceability.hookableCount <= 4
          ? 70
          : 50;
  dimensions.enforceability = {
    score: enforceScore,
    weight: 10,
    label: "Enforceability",
  };

  // Instruction Budget (10%): based on staying within limits
  const totalLoad = (budget.instructionCount || 0) + 50;
  const budgetRatio = totalLoad / 175;
  const budgetScore =
    budgetRatio <= 0.8
      ? 100
      : budgetRatio <= 1.0
        ? 80
        : budgetRatio <= 1.2
          ? 60
          : 30;
  dimensions.budget = {
    score: budgetScore,
    weight: 10,
    label: "Instruction Budget",
  };

  // Conflict penalty: conflicts directly reduce overall score
  const conflictPenalty = conflicts.conflictCount * 5;

  // Vague rule penalty
  const vagueFindings = findings.filter((f) => f.rule === "vague-rule").length;
  const vaguePenalty = Math.min(10, vagueFindings * 2);

  // Calculate weighted score
  let totalWeight = 0;
  let weightedSum = 0;
  for (const dim of Object.values(dimensions)) {
    totalWeight += dim.weight;
    weightedSum += dim.score * dim.weight;
  }

  let score = Math.round(weightedSum / totalWeight);

  // Apply penalties
  score -= conflictPenalty;
  score -= vaguePenalty;

  score = Math.max(0, Math.min(100, score));

  return {
    file: filePath,
    version: "0.3.0",
    score,
    grade: scoreToGrade(score),
    lineCount: lines.length,
    instructionCount: budget.instructionCount,
    findings: findings.sort(severityOrder),
    dimensions,
    summary: {
      critical: findings.filter((f) => f.severity === "critical").length,
      warning: findings.filter((f) => f.severity === "warning").length,
      info: findings.filter((f) => f.severity === "info").length,
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
