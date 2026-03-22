/**
 * Enforceability Scorer
 *
 * Tags each rule as enforceable-by-hook vs aspirational.
 * Anthropic's recommendation: if a rule CAN be a hook, it SHOULD be a hook.
 * CLAUDE.md is for guidance. Hooks are for guardrails.
 *
 * Hookable rules: patterns that can be caught by grep/regex on tool calls
 * (file operations, git commands, shell commands).
 * Aspirational rules: "write good code", "be helpful" — can't be automated.
 */

// Patterns that indicate a rule could be enforced by a hook
const HOOKABLE_PATTERNS = [
  {
    name: "git_push",
    pattern: /\b(?:never|don't|do not|must not).*(?:push|force.?push)\b/i,
    hookType: "PreToolUse (Bash)",
    suggestion: "Add a hook that blocks `git push --force` commands",
  },
  {
    name: "git_commit",
    pattern:
      /\b(?:never|don't|do not).*commit(?:.*(?:without|unless|before))?\b/i,
    hookType: "PreToolUse (Bash)",
    suggestion:
      "Add a pre-commit hook or PreToolUse hook for commit validation",
  },
  {
    name: "no_secrets",
    pattern:
      /\b(?:never|don't|do not).*(?:secret|credential|password|key|token).*(?:commit|push|code|file)\b/i,
    hookType: "PreToolUse (Write/Edit)",
    suggestion: "Add a hook that scans file writes for credential patterns",
  },
  {
    name: "destructive_commands",
    pattern:
      /\b(?:never|don't|do not|avoid).*(?:rm -rf|drop.*table|delete.*database|reset --hard|checkout --)\b/i,
    hookType: "PreToolUse (Bash)",
    suggestion: "Add a hook that blocks destructive shell commands",
  },
  {
    name: "file_restrictions",
    pattern:
      /\b(?:never|don't|do not).*(?:modify|edit|change|delete|touch|write).*(?:\.env|config|lock|migration)\b/i,
    hookType: "PreToolUse (Write/Edit)",
    suggestion: "Add a hook that blocks writes to protected file patterns",
  },
  {
    name: "install_packages",
    pattern:
      /\b(?:never|don't|do not).*(?:install|add).*(?:package|dependency|module)\b/i,
    hookType: "PreToolUse (Bash)",
    suggestion:
      "Add a hook that requires approval for npm/pip/cargo install commands",
  },
  {
    name: "send_email",
    pattern:
      /\b(?:never|don't|do not).*(?:send|reply|forward).*(?:email|message)\b/i,
    hookType: "PreToolUse (MCP)",
    suggestion: "Add a hook that blocks email send operations",
  },
  {
    name: "naming_convention",
    pattern:
      /\b(?:use|always).*(?:snake_case|camelCase|kebab-case|PascalCase)\b/i,
    hookType: "PostToolUse (Write/Edit)",
    suggestion: "Use an ESLint/Prettier rule instead of CLAUDE.md instruction",
  },
  {
    name: "max_file_length",
    pattern:
      /\b(?:max|maximum|no more than|under|limit).*\d+.*(?:line|loc|function|method)\b/i,
    hookType: "PostToolUse (Write/Edit)",
    suggestion:
      "Use a linter rule (e.g., ESLint max-lines) instead of CLAUDE.md instruction",
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

export function scoreEnforceability(content, lines) {
  const findings = [];
  let hookableCount = 0;
  let totalConstraints = 0;
  const hookableRules = [];

  // Count total constraint-like lines
  for (let i = 0; i < lines.length; i++) {
    if (isInCodeBlock(lines, i)) continue;
    const line = lines[i].trim();
    if (/\b(NEVER|MUST NOT|DON'T|DO NOT|ALWAYS|MUST)\b/.test(line)) {
      totalConstraints++;
    }
  }

  // Check which ones could be hooks
  for (const hookable of HOOKABLE_PATTERNS) {
    hookable.pattern.lastIndex = 0;
    if (hookable.pattern.test(content)) {
      hookableCount++;
      hookableRules.push(hookable);
    }
  }

  if (hookableCount >= 3) {
    findings.push({
      rule: "enforceability",
      severity: "info",
      message: `${hookableCount} rules could be hooks instead of instructions. Hooks are deterministic — CLAUDE.md rules are best-effort. Move guardrails to .claude/settings.json hooks.`,
      line: null,
    });
  }

  // Show specific hookable rules (max 3 most impactful)
  const topHookable = hookableRules.slice(0, 3);
  for (const rule of topHookable) {
    findings.push({
      rule: "enforceability",
      severity: "info",
      message: `Hookable rule detected (${rule.hookType}): ${rule.suggestion}`,
      line: null,
    });
  }

  return {
    findings,
    hookableCount,
    totalConstraints,
    enforceabilityGap: hookableCount,
  };
}
