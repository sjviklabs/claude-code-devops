# claude-lint

Score your CLAUDE.md for common issues before Claude ignores half of it.

## Install

```bash
npx @sjviklabs/claude-lint          # run without installing
npm install -g @sjviklabs/claude-lint  # install globally
```

## What It Checks

| Rule                 | Severity     | What It Catches                                                                       |
| -------------------- | ------------ | ------------------------------------------------------------------------------------- |
| `instruction-budget` | warning      | Too many instructions (Claude follows ~150-200 reliably, system uses ~50)             |
| `directive-overload` | info/warning | Excessive MUST/NEVER/ALWAYS (when everything is critical, nothing is)                 |
| `credential-leak`    | critical     | API keys, tokens, passwords, connection strings, private keys                         |
| `vague-rule`         | warning      | "Be helpful", "write clean code", "follow best practices" — rules Claude can't act on |
| `section-coverage`   | info/warning | Missing recommended sections (project overview, commands, conventions, constraints)   |
| `line-count`         | info/warning | Files too short (<20) or too long (>300 lines)                                        |

## Usage

```bash
# Auto-detect CLAUDE.md in current directory
claude-lint

# Lint a specific file
claude-lint ./my-project/CLAUDE.md

# JSON output (pipe to jq, CI scripts, etc.)
claude-lint --json

# No color (for CI/logging)
claude-lint --no-color
```

## Scoring

Score starts at 100 and deducts for issues:

- **Critical** (credential leaks): -20 each, max -60
- **Warning** (vague rules, budget overrun): -5 each, max -30
- **Info** (missing sections, line count): -2 each, max -10
- **Bonus** for good section coverage: up to +10

| Grade | Score  | Meaning                                |
| ----- | ------ | -------------------------------------- |
| A     | 90-100 | Solid config, Claude will follow it    |
| B     | 80-89  | Good, minor improvements possible      |
| C     | 70-79  | Needs work, some rules may be ignored  |
| D     | 60-69  | Significant issues                     |
| F     | 0-59   | Major problems (credentials, overload) |

Exit code 1 if score < 40 (for CI gates).

## Why This Exists

Research shows:

- Frontier LLMs reliably follow 150-200 instructions. Claude Code's system prompt uses ~50, leaving you ~100-150.
- 40% of agent configs score below 60 on instruction clarity.
- ~1 in 5 workspaces have exposed credentials in markdown files.
- AI-generated CLAUDE.md files show negative ROI vs. well-crafted human ones.

This tool helps you find and fix the issues that make Claude ignore your config.

## Want to go deeper?

The [Claude Code Field Manual](https://stevenjvik.gumroad.com/l/qdjszj) covers CLAUDE.md architecture, instruction budgeting, skill development, and security patterns across 17 chapters.

## License

MIT
