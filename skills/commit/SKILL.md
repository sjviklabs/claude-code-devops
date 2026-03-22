---
name: commit
description: Create conventional commits with automatic scope detection, staged change analysis, and co-author attribution.
trigger: When the user says "commit", "commit this", or asks to create a git commit.
---

# Commit Skill

Create a well-structured conventional commit from the current staged and unstaged changes.

## Steps

1. Run `git status` to see all changed files (never use -uall flag)
2. Run `git diff` and `git diff --staged` to understand what changed
3. Run `git log --oneline -5` to match the repo's commit style
4. Analyze the changes and determine:
   - **Type**: feat, fix, refactor, docs, chore, test, style, perf, ci, build
   - **Scope**: infer from the primary directory or module affected (e.g., "api", "auth", "ui")
   - **Description**: concise summary of WHY, not WHAT (the diff shows the what)
5. Stage relevant files by name (never use `git add -A` or `git add .`)
6. Do NOT stage files that contain secrets (.env, credentials, tokens)
7. Create the commit using a HEREDOC for proper formatting:

```bash
git commit -m "$(cat <<'EOF'
type(scope): description

Optional body with context on WHY this change was made.

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

8. Run `git status` after commit to verify success

## Rules

- NEVER amend existing commits unless explicitly asked
- NEVER push after committing unless explicitly asked
- If a pre-commit hook fails, fix the issue and create a NEW commit (don't amend)
- If there are no changes to commit, say so and stop
- Warn if any staged file looks like it contains secrets
