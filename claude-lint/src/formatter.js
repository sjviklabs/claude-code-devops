/**
 * CLI Output Formatter
 *
 * Produces a clean, scannable report with:
 * - Overall score and grade
 * - Grouped findings by severity
 * - Actionable fix suggestions
 * - Link to Field Manual for deeper guidance
 */

const SEVERITY_ICONS = {
  critical: "\u2718", // ✘
  warning: "\u26A0", // ⚠
  info: "\u2139", // ℹ
};

const SEVERITY_COLORS = {
  critical: "\x1b[31m", // red
  warning: "\x1b[33m", // yellow
  info: "\x1b[36m", // cyan
};

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";

function gradeColor(grade) {
  if (grade === "A" || grade === "B") return GREEN;
  if (grade === "C" || grade === "D") return YELLOW;
  return RED;
}

export function formatReport(results, options = {}) {
  const c = options.color !== false;
  const b = c ? BOLD : "";
  const d = c ? DIM : "";
  const r = c ? RESET : "";

  const lines = [];

  // Header
  lines.push("");
  lines.push(`${b}claude-lint${r} v0.2.0`);
  lines.push(`${d}${"─".repeat(50)}${r}`);
  lines.push(`File: ${results.file}`);
  lines.push(
    `Lines: ${results.lineCount} | Instructions: ~${results.instructionCount}`,
  );
  lines.push("");

  // Score
  const gc = c ? gradeColor(results.grade) : "";
  lines.push(`${b}Score: ${gc}${results.score}/100 (${results.grade})${r}`);
  lines.push("");

  // Summary bar
  const { critical, warning, info } = results.summary;
  const parts = [];
  if (critical > 0)
    parts.push(`${c ? SEVERITY_COLORS.critical : ""}${critical} critical${r}`);
  if (warning > 0)
    parts.push(`${c ? SEVERITY_COLORS.warning : ""}${warning} warnings${r}`);
  if (info > 0) parts.push(`${c ? SEVERITY_COLORS.info : ""}${info} info${r}`);
  if (parts.length === 0) parts.push(`${c ? GREEN : ""}No issues found${r}`);
  lines.push(parts.join("  "));
  lines.push("");

  // Dimensions breakdown
  if (results.dimensions) {
    lines.push(`${b}Dimensions:${r}`);
    lines.push("");
    for (const dim of Object.values(results.dimensions)) {
      const pct = dim.score;
      const dc = c ? (pct >= 80 ? GREEN : pct >= 60 ? YELLOW : RED) : "";
      const bar =
        "█".repeat(Math.round(pct / 5)) + "░".repeat(20 - Math.round(pct / 5));
      lines.push(`  ${dim.label.padEnd(20)} ${dc}${bar} ${pct}%${r}`);
    }
    lines.push("");
  }

  // Findings grouped by severity
  if (results.findings.length > 0) {
    lines.push(`${b}Findings:${r}`);
    lines.push("");

    for (const finding of results.findings) {
      const icon = SEVERITY_ICONS[finding.severity] || "?";
      const color = c ? SEVERITY_COLORS[finding.severity] || "" : "";
      const loc = finding.line ? `${d}L${finding.line}${r} ` : "";
      lines.push(`  ${color}${icon}${r} ${loc}${finding.message}`);
    }

    lines.push("");
  }

  // Recommendations
  if (results.score < 80) {
    lines.push(`${d}${"─".repeat(50)}${r}`);
    lines.push("");
    lines.push(`${b}Want to fix these?${r}`);
    lines.push(`The Claude Code Field Manual covers CLAUDE.md architecture,`);
    lines.push(`instruction budgeting, and security patterns in depth.`);
    lines.push(`https://stevenjvik.gumroad.com/l/qdjszj`);
    lines.push("");
  }

  // Footer
  lines.push(
    `${d}Built by Forge @ SJVIK Labs | github.com/sjviklabs/claude-code-devops${r}`,
  );
  lines.push("");

  return lines.join("\n");
}
