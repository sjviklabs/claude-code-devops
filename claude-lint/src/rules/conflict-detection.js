/**
 * Conflict Detection
 *
 * Finds instructions that contradict each other.
 * "Always use TypeScript" + "Keep it simple, use vanilla JS" = conflict.
 * "Never commit without tests" + "Skip tests to save time" = conflict.
 *
 * Uses semantic opposition pairs: if both sides of a pair appear, flag it.
 */

// Each entry is a pair of patterns that contradict each other
const CONFLICT_PAIRS = [
  {
    name: "verbosity",
    a: {
      pattern: /\b(?:be concise|brief|short|terse|minimal)\b/i,
      label: "be concise",
    },
    b: {
      pattern:
        /\b(?:be detailed|thorough|comprehensive|verbose|explain.*fully)\b/i,
      label: "be detailed",
    },
  },
  {
    name: "autonomy",
    a: {
      pattern:
        /\b(?:ask before|confirm before|check with|get approval|wait for)\b/i,
      label: "ask before acting",
    },
    b: {
      pattern:
        /\b(?:don't ask|just do it|take initiative|act autonomously|without asking)\b/i,
      label: "act without asking",
    },
  },
  {
    name: "testing",
    a: {
      pattern: /\b(?:always.*test|never skip.*test|write tests|must.*test)\b/i,
      label: "always test",
    },
    b: {
      pattern:
        /\b(?:(?<!don't |never |do not )skip.*test|no tests needed|tests.*optional)\b/i,
      label: "skip tests",
    },
  },
  {
    name: "simplicity",
    a: {
      pattern:
        /\b(?:keep.*simple|minimal|avoid.*complex|KISS|don't over-?engineer)\b/i,
      label: "keep it simple",
    },
    b: {
      pattern:
        /\b(?:comprehensive|cover.*edge.*case|handle.*every|robust|production-?ready)\b/i,
      label: "be comprehensive",
    },
  },
  {
    name: "commenting",
    a: {
      pattern:
        /\b(?:add comments|document.*code|well-?commented|comment.*why)\b/i,
      label: "add comments",
    },
    b: {
      pattern:
        /\b(?:don't.*comment|no comments|self-?document|code.*speaks)\b/i,
      label: "don't add comments",
    },
  },
  {
    name: "error_handling",
    a: {
      pattern:
        /\b(?:handle.*error|error.*handling|try.*catch|graceful.*fail)\b/i,
      label: "handle all errors",
    },
    b: {
      pattern:
        /\b(?:don't.*error.*handling|skip.*error|let.*it.*fail|fail.*fast)\b/i,
      label: "fail fast / skip error handling",
    },
  },
  {
    name: "commits",
    a: {
      pattern:
        /\b(?:commit.*often|small.*commit|atomic.*commit|frequent.*commit)\b/i,
      label: "commit often",
    },
    b: {
      pattern: /\b(?:never commit|don't commit|no commit|only commit when)\b/i,
      label: "don't commit",
    },
  },
  {
    name: "abstraction",
    a: {
      pattern: /\b(?:DRY|don't repeat|extract.*helper|reusable|abstract)\b/i,
      label: "abstract/DRY",
    },
    b: {
      pattern:
        /\b(?:don't abstract|inline|duplicate.*ok|copy.*paste|avoid.*abstraction|premature abstraction)\b/i,
      label: "don't abstract",
    },
  },
];

function findLineNumber(content, pattern) {
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) return i + 1;
  }
  return null;
}

export function detectConflicts(content, lines) {
  const findings = [];

  // Filter out code blocks
  let filteredContent = "";
  let inCodeBlock = false;
  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      filteredContent += "\n";
      continue;
    }
    filteredContent += inCodeBlock ? "\n" : line + "\n";
  }

  for (const pair of CONFLICT_PAIRS) {
    const aMatch = pair.a.pattern.test(filteredContent);
    const bMatch = pair.b.pattern.test(filteredContent);

    if (aMatch && bMatch) {
      const lineA = findLineNumber(filteredContent, pair.a.pattern);
      const lineB = findLineNumber(filteredContent, pair.b.pattern);

      findings.push({
        rule: "conflict",
        severity: "warning",
        message: `Conflicting instructions: "${pair.a.label}" (L${lineA || "?"}) vs "${pair.b.label}" (L${lineB || "?"}). Claude will pick one unpredictably. Resolve the ambiguity.`,
        line: lineA,
      });
    }
  }

  return { findings, conflictCount: findings.length };
}
