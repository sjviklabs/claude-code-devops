/**
 * Bloat Detection
 *
 * Flags content that belongs in tooling, not CLAUDE.md.
 * Anthropic's #1 recommendation: keep CLAUDE.md under 200 lines.
 * Most files are 3-5x too long because they duplicate what tooling handles.
 *
 * Categories:
 * - Code style rules → .editorconfig, ESLint, Prettier
 * - Git hooks → .husky, pre-commit
 * - Environment setup → README, Makefile, docker-compose
 * - Type definitions → TypeScript, JSDoc
 * - Boilerplate instructions → things Claude already knows
 */

const BLOAT_PATTERNS = [
  {
    name: "editorconfig_content",
    pattern:
      /\b(?:indent.*(?:2|4)\s*spaces|tab.*size|trailing\s*whitespace|end.*of.*line|charset.*utf)\b/i,
    suggestion: "Move to .editorconfig — Claude reads it automatically",
    category: "tooling",
  },
  {
    name: "eslint_rules",
    pattern:
      /\b(?:no-?unused-?vars|no-?console|semi-?colon|single quotes?|double quotes?|trailing comma)\b/i,
    suggestion: "Move to .eslintrc — linter rules shouldn't live in CLAUDE.md",
    category: "tooling",
  },
  {
    name: "prettier_config",
    pattern:
      /\b(?:print\s*width|tab\s*width|single\s*quote|bracket\s*spacing|arrow\s*parens)\b/i,
    suggestion: "Move to .prettierrc — Claude reads formatter configs",
    category: "tooling",
  },
  {
    name: "install_instructions",
    pattern:
      /\b(?:npm install|pip install|yarn add|cargo add|gem install|brew install|pnpm add|bun add|deno install)\b/i,
    suggestion: "Installation steps belong in README.md, not CLAUDE.md",
    category: "readme",
  },
  {
    name: "claude_knows_this",
    pattern:
      /\b(?:you are (?:a|an) (?:AI|language model|assistant)|you can use tools|you have access to)\b/i,
    suggestion:
      "Claude already knows this — remove meta-instructions about its own capabilities",
    category: "boilerplate",
  },
  {
    name: "obvious_instructions",
    pattern:
      /\b(?:read the file before editing|understand the code before changing|check for errors)\b/i,
    suggestion:
      "Claude does this by default — this instruction wastes context budget",
    category: "boilerplate",
  },
  {
    name: "type_definitions",
    pattern:
      /\b(?:interface\s+\w+\s*\{|type\s+\w+\s*=|@param\s*\{[^}]+\}|@returns?\s*\{[^}]+\})\b/,
    suggestion:
      "Type definitions belong in code, not CLAUDE.md — Claude reads source files",
    category: "code",
  },
  {
    name: "env_setup",
    pattern: /\b(?:docker-compose up|make build|vagrant up|docker build)\b/i,
    suggestion:
      "Environment setup belongs in README.md or Makefile, not CLAUDE.md",
    category: "readme",
  },
  {
    name: "long_examples",
    patterns_multi: true,
    detect: (content) => {
      // Count lines inside code blocks
      let inBlock = false;
      let codeLines = 0;
      const totalLines = content.split("\n").length;
      for (const line of content.split("\n")) {
        if (line.trim().startsWith("```")) {
          inBlock = !inBlock;
          continue;
        }
        if (inBlock) codeLines++;
      }
      return codeLines > totalLines * 0.4;
    },
    suggestion:
      "Over 40% code examples — move detailed examples to .claude/rules/ or skill files",
    category: "structure",
  },
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

export function detectBloat(content, lines) {
  const findings = [];
  const bloatItems = [];

  // Check pattern-based bloat
  for (const bloat of BLOAT_PATTERNS) {
    if (bloat.patterns_multi) {
      // Custom detection function
      if (bloat.detect(content)) {
        findings.push({
          rule: "bloat",
          severity: "info",
          message: `Bloat: ${bloat.suggestion}`,
          line: null,
        });
        bloatItems.push(bloat.name);
      }
      continue;
    }

    // Check line by line to skip code blocks
    for (let i = 0; i < lines.length; i++) {
      if (isInCodeBlock(lines, i)) continue;
      if (lines[i].trim().startsWith("#")) continue;

      bloat.pattern.lastIndex = 0;
      if (bloat.pattern.test(lines[i])) {
        findings.push({
          rule: "bloat",
          severity: "info",
          message: `Bloat (${bloat.category}): ${bloat.suggestion}`,
          line: i + 1,
        });
        bloatItems.push(bloat.name);
        break; // One finding per pattern
      }
    }
  }

  // Check for duplicate/redundant sections
  const headings = [];
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,4})\s+(.+)/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim().toLowerCase(),
        line: i + 1,
      });
    }
  }

  // Find duplicate heading text
  const seen = new Map();
  for (const h of headings) {
    const normalized = h.text.replace(/[^a-z0-9]/g, " ").trim();
    if (seen.has(normalized)) {
      findings.push({
        rule: "bloat",
        severity: "warning",
        message: `Duplicate section: "${h.text}" appears at L${seen.get(normalized)} and L${h.line}. Merge or remove one.`,
        line: h.line,
      });
    } else {
      seen.set(normalized, h.line);
    }
  }

  return {
    findings,
    bloatCount: bloatItems.length,
    bloatItems,
  };
}
