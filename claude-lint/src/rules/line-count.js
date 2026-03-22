/**
 * Line Count Checker
 *
 * HumanLayer best practice: keep CLAUDE.md between 60-300 lines.
 * Too short = not enough context. Too long = gets truncated or ignored.
 */

export function checkLineCount(lines) {
  const findings = [];
  const count = lines.length;

  if (count < 20) {
    findings.push({
      rule: "line-count",
      severity: "warning",
      message: `Only ${count} lines. CLAUDE.md files under 20 lines rarely provide enough context for Claude to work effectively.`,
      line: null,
    });
  } else if (count < 60) {
    findings.push({
      rule: "line-count",
      severity: "info",
      message: `${count} lines — on the shorter side. Best practice is 60-300 lines. Consider adding project context, commands, or conventions.`,
      line: null,
    });
  } else if (count > 500) {
    findings.push({
      rule: "line-count",
      severity: "warning",
      message: `${count} lines is long. Claude's instruction-following degrades past ~300 lines. Move task-specific guidance into separate agent docs or skills.`,
      line: null,
    });
  } else if (count > 300) {
    findings.push({
      rule: "line-count",
      severity: "info",
      message: `${count} lines — approaching the upper limit. Best practice is 60-300 lines. Consider splitting task-specific rules into separate files.`,
      line: null,
    });
  }

  return { findings };
}
