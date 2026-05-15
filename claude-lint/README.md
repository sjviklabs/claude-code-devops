# claude-lint

Score your CLAUDE.md across 8 dimensions before Claude silently ignores it.

[Try it online](https://lint.stevenjvik.tech) | [npm](https://www.npmjs.com/package/@sjviklabs/claude-lint)

## Install

```bash
npx @sjviklabs/claude-lint          # run without installing
npm install -g @sjviklabs/claude-lint  # install globally
```

## What It Scores

claude-lint evaluates your CLAUDE.md across 8 weighted dimensions:

| Dimension          | Weight | What It Measures                                                                                                          |
| ------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| Clarity            | 20%    | Are instructions specific enough to change behavior? File paths, commands, measurable targets vs vague phrases            |
| Security           | 15%    | Credential patterns, API keys, connection strings, hardcoded IPs                                                          |
| Efficiency         | 15%    | Signal-to-noise ratio, bloat detection (content that belongs in tooling configs, not CLAUDE.md)                           |
| Completeness       | 12%    | Coverage of recommended sections (overview, commands, conventions, constraints)                                           |
| Enforceability     | 10%    | Rules that should be hooks, not prose. "Never force push" in CLAUDE.md is a suggestion. A PreToolUse hook is a guarantee. |
| Instruction Budget | 10%    | Claude follows ~175 instructions reliably. System prompt uses ~50. Are you within budget?                                 |
| Structure          | 10%    | Recommended sections, heading hierarchy, organization                                                                     |
| Consistency        | 8%     | Formatting style (heading, bullet, emphasis), terminology, contradictions                                                 |

### Rules (10 total)

| Rule                 | Severity     | What It Catches                                                            |
| -------------------- | ------------ | -------------------------------------------------------------------------- |
| `credential-leak`    | critical     | API keys, tokens, passwords, connection strings, private keys              |
| `clarity-score`      | warning/info | Per-instruction specificity scoring (12 signal types vs 4 vagueness types) |
| `vague-rule`         | warning      | "Be helpful", "write clean code", "follow best practices"                  |
| `conflict-detection` | warning      | Contradictory instructions (8 semantic opposition pairs)                   |
| `enforceability`     | info         | 9 hookable patterns that should be PreToolUse/PostToolUse hooks            |
| `bloat-detection`    | info/warning | Content that belongs in .editorconfig, .eslintrc, or README                |
| `consistency`        | info         | Mixed heading styles, bullet styles, emphasis patterns                     |
| `instruction-budget` | warning      | Instruction count vs ~175 effective limit                                  |
| `section-coverage`   | info/warning | Missing recommended sections (scope-aware for global vs project configs)   |
| `line-count`         | info/warning | Files too short (<20) or too long (>300 lines)                             |

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

The final score is a weighted average of all 8 dimensions (0-100 each), with penalties for detected conflicts and vague rules.

| Grade | Score  | Meaning                                |
| ----- | ------ | -------------------------------------- |
| A     | 90-100 | Solid config, Claude will follow it    |
| B     | 80-89  | Good, minor improvements possible      |
| C     | 70-79  | Needs work, some rules may be ignored  |
| D     | 60-69  | Significant issues                     |
| F     | 0-59   | Major problems (credentials, overload) |

Exit code 1 if score < 40 (for CI gates).

## Web Version

Paste your CLAUDE.md at [lint.stevenjvik.tech](https://lint.stevenjvik.tech). 100% client-side, your content never leaves your browser.

## Why This Exists

- Frontier LLMs reliably follow ~175 instructions. Claude Code's system prompt uses ~50, leaving you ~125.
- 40% of agent configs score below 60 on instruction clarity.
- ~1 in 5 workspaces have exposed credentials in markdown files.
- Rules like "never force push" in CLAUDE.md are suggestions. Hooks are guarantees. Most people don't know the difference.

## Want to go deeper?

The [Claude Code Field Manual](https://stevenjvik.gumroad.com/l/qdjszj) covers CLAUDE.md architecture, instruction budgeting, skill development, and security patterns across 17 chapters.

## License

MIT

Built at [SJVIK Labs](https://github.com/sjviklabs/claude-code-devops).
