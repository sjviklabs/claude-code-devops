# claude-lint — Product Hunt Launch Brief

## Tagline (60 chars max)

Score your CLAUDE.md before Claude ignores it

## One-liner

Free, open-source linter that scores your CLAUDE.md across 8 dimensions. Runs in your browser. Your content never leaves the page.

## Description

Most CLAUDE.md files are broken and nobody knows it.

I built an autonomous agent system that manages production infrastructure. 11 LXC containers, 7 agents, GPU inference stack. Along the way I discovered that Claude Code silently degrades when your CLAUDE.md has vague rules, contradictory instructions, or leaked credentials. No error messages. It just stops following your instructions.

claude-lint catches what you can't see:

**8 scoring dimensions:**

- Clarity — are your instructions specific enough to actually change behavior?
- Security — credential patterns, API keys, connection strings
- Structure — recommended sections for project vs global configs
- Completeness — coverage of what Claude needs to work effectively
- Consistency — formatting, terminology, no contradictions
- Efficiency — signal-to-noise ratio, bloat detection
- Enforceability — rules that should be hooks, not prose
- Instruction Budget — staying within Claude's ~175 instruction limit

**How it works:**

1. Paste your CLAUDE.md at lint.stevenjvik.tech (or run `npx @sjviklabs/claude-lint`)
2. Get a scored report with dimension breakdown
3. Fix the issues. Watch Claude actually follow your instructions.

100% client-side. Zero data collection. MIT licensed.

Built by Forge, an autonomous Claude Opus 4.6 agent at SJVIK Labs.

## Categories

- Developer Tools
- Artificial Intelligence
- Open Source

## Links

- Website: https://lint.stevenjvik.tech
- GitHub: https://github.com/sjviklabs/claude-code-devops
- npm: https://www.npmjs.com/package/@sjviklabs/claude-lint

## Maker's First Comment

I spent three months figuring out what makes Claude Code actually behave consistently. The answer wasn't more instructions. It was fewer, better instructions in the right places.

The problem is nobody tells you when your CLAUDE.md is broken. Claude doesn't throw errors when your rules are vague. It just quietly ignores them. "Follow best practices" does literally nothing. "Max 30 lines per function, extract helpers to utils/" changes behavior immediately.

So I built a linter. Started with 4 rules (credential leaks, vague phrases, section coverage, instruction budget). This week we shipped v2 with 8 weighted dimensions including conflict detection, enforceability scoring, and clarity analysis.

The enforceability dimension is the one nobody else does. It identifies rules in your CLAUDE.md that should actually be hooks. "Never force push" in CLAUDE.md is a suggestion. A PreToolUse hook that blocks `git push --force` is a guarantee. The linter tells you which rules belong where.

Try it: paste your CLAUDE.md and see what you get. Most people score 40-60 on their first try.

If you want to go deeper, the Claude Code Field Manual covers the architecture behind all of this across 17 chapters.

## Gallery Screenshots Needed

1. Hero shot — paste area with "Score My CLAUDE.md" button
2. Score card — 83/B result with dimension bars
3. Sample bad file — 48/F with critical findings
4. Dimension breakdown — 8 colored bars
5. CLI output — terminal with ASCII dimension bars

## Launch Timing

- Best days: Tuesday, Wednesday, Thursday
- Best time: 12:01 AM PT (Product Hunt resets daily)
- Prep: Have 5-10 people ready to upvote + comment in first hour
