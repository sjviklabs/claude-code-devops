/**
 * Consistency Analysis
 *
 * Checks that terminology, formatting patterns, and style references
 * are consistent throughout the CLAUDE.md.
 *
 * Inconsistency confuses the model. If you call it "CLAUDE.md" in one place
 * and "claude config" in another, Claude doesn't know they're the same thing.
 */

// Check for inconsistent terminology pairs
const TERMINOLOGY_PAIRS = [
  {
    name: "project_name",
    variants: [
      /\bCLAUDE\.md\b/g,
      /\bclaude\.md\b/g,
      /\bclaude config\b/gi,
      /\bclaude file\b/gi,
    ],
    threshold: 2,
    message:
      "Inconsistent naming: mix of CLAUDE.md casing/terminology. Pick one and stick with it.",
  },
  {
    name: "instruction_format",
    variants: [
      { pattern: /^[-*]\s+\*\*[^*]+\*\*[.:]/m, name: "bold-prefix bullets" },
      { pattern: /^[-*]\s+[A-Z][^*\n]+$/m, name: "plain bullets" },
      { pattern: /^\d+\.\s+/m, name: "numbered lists" },
    ],
    threshold: 3,
    message: null, // Dynamic: detected below
  },
];

// Check for formatting inconsistencies
function checkFormattingConsistency(lines) {
  const findings = [];

  // Check heading style consistency
  const hashHeadings = [];
  const underlineHeadings = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^#{1,6}\s+/.test(lines[i])) hashHeadings.push(i + 1);
    if (i > 0 && /^[=-]{3,}$/.test(lines[i].trim()) && lines[i - 1].trim()) {
      underlineHeadings.push(i + 1);
    }
  }
  if (hashHeadings.length > 0 && underlineHeadings.length > 0) {
    findings.push({
      rule: "consistency",
      severity: "info",
      message: `Mixed heading styles: ATX (# Heading) and Setext (underline) headings. Use one style consistently.`,
      line: underlineHeadings[0],
    });
  }

  // Check bullet style consistency
  let dashBullets = 0;
  let starBullets = 0;
  for (const line of lines) {
    if (/^\s*-\s+/.test(line)) dashBullets++;
    if (/^\s*\*\s+[^*]/.test(line)) starBullets++;
  }
  if (dashBullets > 3 && starBullets > 3) {
    findings.push({
      rule: "consistency",
      severity: "info",
      message: `Mixed bullet styles: ${dashBullets} dash (-) and ${starBullets} asterisk (*) bullets. Pick one.`,
      line: null,
    });
  }

  // Check separator style consistency
  let dashSeparators = 0;
  let starSeparators = 0;
  for (const line of lines) {
    if (/^---+$/.test(line.trim())) dashSeparators++;
    if (/^\*\*\*+$/.test(line.trim())) starSeparators++;
  }
  if (dashSeparators > 0 && starSeparators > 0) {
    findings.push({
      rule: "consistency",
      severity: "info",
      message: `Mixed horizontal rule styles. Use --- or *** consistently.`,
      line: null,
    });
  }

  return findings;
}

// Check for contradictory emphasis (some rules bold, some not)
function checkEmphasisConsistency(lines) {
  const findings = [];
  let boldRules = 0;
  let plainRules = 0;

  let inCodeBlock = false;
  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const trimmed = line.trim();
    if (/^[-*]\s+\*\*[^*]+\*\*[.:]\s+\S/.test(trimmed)) boldRules++;
    else if (/^[-*]\s+[A-Z][a-z]/.test(trimmed) && trimmed.length > 30)
      plainRules++;
  }

  // Only flag if there's a significant mix (not just 1-2 exceptions)
  if (boldRules > 5 && plainRules > 5) {
    findings.push({
      rule: "consistency",
      severity: "info",
      message: `Mixed rule formatting: ${boldRules} bold-prefix rules and ${plainRules} plain rules. Consistent formatting improves scanning.`,
      line: null,
    });
  }

  return findings;
}

export function checkConsistency(content, lines) {
  const findings = [];

  findings.push(...checkFormattingConsistency(lines));
  findings.push(...checkEmphasisConsistency(lines));

  // Limit total consistency findings to avoid noise
  const capped = findings.slice(0, 4);
  const inconsistencyCount = findings.length;

  return {
    findings: capped,
    inconsistencyCount,
  };
}
