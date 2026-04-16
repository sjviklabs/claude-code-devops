/**
 * Clarity & Specificity Scorer
 *
 * Measures how actionable each instruction is.
 * "Write clean code" = low clarity. "Max 30 lines per function" = high clarity.
 * Goes beyond vague-rules by scoring the POSITIVE signal, not just flagging negatives.
 *
 * Scoring approach:
 * - Extract all instruction-like lines (bullets, bold directives, MUST/NEVER)
 * - Score each for specificity: does it contain measurable criteria, named tools,
 *   file paths, commands, or concrete examples?
 * - Return a 0-100 clarity percentage
 */

// Signals that make an instruction specific and actionable
const SPECIFICITY_SIGNALS = [
  {
    name: "file_path",
    pattern:
      /(?:\/[\w.-]+){2,}|[\w-]+\.(?:js|ts|py|md|json|yaml|yml|toml|sh|css|html)\b/i,
    weight: 3,
  },
  { name: "command", pattern: /`[^`]{3,}`/, weight: 3 },
  { name: "code_block", pattern: /```/, weight: 3 },
  {
    name: "number",
    pattern:
      /\b\d+\s*(?:lines?|files?|seconds?|minutes?|max|min|limit|ms|kb|mb)\b/i,
    weight: 3,
  },
  {
    name: "named_tool",
    pattern:
      /\b(?:eslint|prettier|jest|pytest|vitest|mocha|playwright|webpack|vite|astro|svelte|nextjs|next\.js|docker|git|npm|yarn|pnpm|bun|deno|pip|uv|cargo|make|terraform|ansible|k8s|kubectl|tailwind|turborepo|biome)\b/i,
    weight: 2,
  },
  {
    name: "format_spec",
    pattern:
      /\b(?:snake_case|camelCase|kebab-case|PascalCase|SCREAMING_SNAKE)\b/,
    weight: 3,
  },
  {
    name: "concrete_example",
    pattern: /(?:e\.g\.|for example|like|such as)\s+["`']?[\w/.-]+/i,
    weight: 2,
  },
  {
    name: "conditional",
    pattern: /\b(?:when|if|unless|except|only when|before|after)\b.*:/i,
    weight: 2,
  },
  {
    name: "specific_verb",
    pattern:
      /\b(?:append|prepend|replace|rename|delete|create|move|copy|import|export|run|execute|install|configure|enable|disable)\b/i,
    weight: 1,
  },
  {
    name: "negation_specific",
    pattern:
      /\b(?:never|don't|do not|must not)\b.*\b(?:commit|push|delete|merge|deploy|send|reply|forward|install)\b/i,
    weight: 2,
  },
  { name: "quoted_value", pattern: /"[^"]{2,}"|'[^']{2,}'/, weight: 1 },
  {
    name: "url_or_path",
    pattern: /(?:https?:\/\/|~\/|\.\/|\$HOME)\S+/,
    weight: 2,
  },
];

// Signals that make an instruction vague (already partially covered by vague-rules,
// but here we use them to pull DOWN the clarity score)
const VAGUENESS_SIGNALS = [
  {
    name: "hedge",
    pattern:
      /\b(?:try to|should probably|consider|might want to|could|may want)\b/i,
    weight: -2,
  },
  {
    name: "undefined_adjective",
    pattern:
      /\b(?:write|be|keep|make)\s+(?:good|clean|nice|proper|appropriate|reasonable)\b/i,
    weight: -1,
  },
  {
    name: "subjective",
    pattern: /\b(?:elegant|beautiful|well-written|readable|maintainable)\b/i,
    weight: -1,
  },
  { name: "etc", pattern: /\betc\.?\b/i, weight: -1 },
];

function isInCodeBlock(lines, lineNum) {
  let inBlock = false;
  for (let i = 0; i < lineNum && i < lines.length; i++) {
    if (lines[i].trim().startsWith("```")) {
      inBlock = !inBlock;
    }
  }
  return inBlock;
}

function isInstructionLine(line) {
  const trimmed = line.trim();
  if (trimmed === "" || trimmed.startsWith("#")) return false;

  // Skip table rows — they're data, not standalone instructions
  if (/^\|/.test(trimmed)) return false;
  // Skip short lines (context phrases, not instructions)
  if (trimmed.length < 20) return false;

  // Bullet points with substance
  if (/^[-*]\s+\S/.test(trimmed)) return true;
  // Bold-prefixed rules
  if (/^\*\*[^*]+\*\*[.:]\s+\S/.test(trimmed)) return true;
  // Numbered items
  if (/^\d+\.\s+\S/.test(trimmed)) return true;
  // Lines with strong directives
  if (/\b(MUST|NEVER|ALWAYS|IMPORTANT|CRITICAL)\b/.test(trimmed)) return true;

  return false;
}

export function scoreClaritySpecificity(content, lines) {
  const findings = [];
  const instructionScores = [];
  const lowClarityExamples = [];

  for (let i = 0; i < lines.length; i++) {
    if (isInCodeBlock(lines, i)) continue;
    if (!isInstructionLine(lines[i])) continue;

    const line = lines[i].trim();
    let score = 0;
    let maxPossible = 0;

    // Check specificity signals
    for (const signal of SPECIFICITY_SIGNALS) {
      maxPossible += signal.weight;
      if (signal.pattern.test(line)) {
        score += signal.weight;
      }
    }

    // Check vagueness signals
    for (const signal of VAGUENESS_SIGNALS) {
      if (signal.pattern.test(line)) {
        score += signal.weight; // negative weights
      }
    }

    // Normalize: 1 signal = decent (40-60%), 2 signals = good (70-85%), 3+ = excellent
    // Most real instructions have 1-2 specificity signals
    // Use diminishing returns curve: 1 signal ≈ 50%, 2 ≈ 70%, 3 ≈ 85%, 4+ ≈ 95%
    const normalizedScore = Math.max(
      0,
      Math.min(
        100,
        score <= 0 ? 0 : Math.round(100 * (1 - Math.exp(-score / 3))),
      ),
    );
    instructionScores.push({ line: i + 1, score: normalizedScore, text: line });

    if (normalizedScore < 20 && line.length > 15) {
      lowClarityExamples.push({ line: i + 1, text: line.substring(0, 80) });
    }
  }

  if (instructionScores.length === 0) {
    return { findings, clarityPercent: 0, instructionCount: 0 };
  }

  const avgClarity = Math.round(
    instructionScores.reduce((sum, s) => sum + s.score, 0) /
      instructionScores.length,
  );

  // Report low clarity
  if (avgClarity < 30) {
    findings.push({
      rule: "clarity",
      severity: "warning",
      message: `Low clarity score: ${avgClarity}%. Most instructions lack specific criteria, file paths, commands, or measurable targets.`,
      line: null,
    });
  } else if (avgClarity < 50) {
    findings.push({
      rule: "clarity",
      severity: "info",
      message: `Clarity score: ${avgClarity}%. Adding specific file paths, commands, or measurable limits would strengthen your instructions.`,
      line: null,
    });
  }

  // Show worst offenders (max 3)
  const worst = lowClarityExamples.slice(0, 3);
  for (const example of worst) {
    findings.push({
      rule: "clarity",
      severity: "info",
      message: `Low specificity: "${example.text}${example.text.length >= 80 ? "..." : ""}" — add concrete criteria or examples`,
      line: example.line,
    });
  }

  return {
    findings,
    clarityPercent: avgClarity,
    instructionCount: instructionScores.length,
  };
}
