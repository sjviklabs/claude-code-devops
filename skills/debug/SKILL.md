---
name: debug
description: Systematic debugging workflow using scientific method. Hypothesis-driven, evidence-based, no random changes.
trigger: When the user says "debug this", "why is this broken", "this isn't working", or describes a bug.
---

# Debug Skill

Systematically diagnose and fix bugs using the scientific method. No random changes. No "try this and see."

## Protocol

### Phase 1: Observe

1. **Read the error.** The full error message, stack trace, or unexpected behavior description.
2. **Reproduce.** Run the failing command, test, or workflow. Confirm you can see the failure.
3. **Gather context.** Read the relevant source files. Check recent git changes (`git log --oneline -10`, `git diff HEAD~3`).

### Phase 2: Hypothesize

4. **State your hypothesis clearly** before making any changes.
   - "I believe the bug is caused by X because Y."
   - If you have multiple hypotheses, rank them by likelihood.

### Phase 3: Test

5. **Design a minimal test** for your top hypothesis.
   - Add a log statement, run a specific test, check a specific value.
   - Do NOT change the code to "fix" it yet. Confirm the root cause first.

6. **Run the test.** Does the evidence support or refute your hypothesis?
   - If supported: proceed to Phase 4.
   - If refuted: return to Phase 2 with new information.

### Phase 4: Fix

7. **Make the minimal change** that fixes the root cause.
   - Don't refactor surrounding code.
   - Don't fix other things you noticed along the way (note them separately).

8. **Verify the fix.** Run the original failing case. Run related tests.

9. **Check for regressions.** Run the full test suite if available.

### Phase 5: Document

10. **Summarize** what the bug was, what caused it, and why your fix works.

## Rules

- NEVER change code before you have a hypothesis
- NEVER change multiple things at once ("shotgun debugging")
- State findings as you go, not just at the end
- If you're stuck after 3 hypotheses, step back and re-examine assumptions
- If the bug is in a dependency or external service, say so early. Don't waste time on code that isn't the problem.
