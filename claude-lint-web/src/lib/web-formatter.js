/**
 * Web Formatter for claude-lint
 * HTML equivalent of the CLI ANSI formatter
 */

const SEVERITY_CONFIG = {
  critical: { icon: "!!", label: "Critical", class: "text-error" },
  warning: { icon: "!", label: "Warning", class: "text-warning" },
  info: { icon: "i", label: "Info", class: "text-info" },
};

function gradeColor(grade) {
  if (grade === "A" || grade === "B") return "text-emerald";
  if (grade === "C" || grade === "D") return "text-warning";
  return "text-error";
}

function severityIcon(severity) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
  return `<span class="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold ${cfg.class} bg-layer-2">${cfg.icon}</span>`;
}

export function formatFindings(findings) {
  if (!findings.length)
    return '<p class="text-text-variant text-sm">No issues found. Your CLAUDE.md is solid.</p>';

  return findings
    .map((f) => {
      const line = f.line
        ? `<span class="text-text-outline text-xs font-mono">L${f.line}</span>`
        : "";
      return `
      <div class="flex items-start gap-3 py-2">
        ${severityIcon(f.severity)}
        <div class="flex-1 min-w-0">
          <p class="text-text-primary text-sm">${escapeHtml(f.message)}</p>
        </div>
        ${line}
      </div>
    `;
    })
    .join("");
}

export function getUpsellTier(score) {
  if (score < 50)
    return {
      level: "critical",
      heading: "Your CLAUDE.md has critical issues.",
      body: "The Field Manual covers instruction budgeting, credential hygiene, and rule architecture across 17 chapters.",
      cta: "Fix These Issues",
    };
  if (score < 70)
    return {
      level: "warning",
      heading: "You're leaving performance on the table.",
      body: "Chapter 4 covers instruction budgeting. Chapter 7 covers security patterns. Get the full playbook.",
      cta: "Get the Field Manual",
    };
  if (score < 80)
    return {
      level: "close",
      heading: "Close to great.",
      body: "The Field Manual has the patterns to get you from good to bulletproof.",
      cta: "Level Up",
    };
  return {
    level: "good",
    heading: "Scored well?",
    body: "The Field Manual goes deeper on advanced patterns, multi-agent orchestration, and security hardening.",
    cta: "Go Deeper",
  };
}

export function gumroadUrl(score) {
  return `https://stevenjvik.gumroad.com/l/qdjszj?utm_source=claude-lint-web&utm_medium=tool&utm_campaign=score-${score}`;
}

export function shareText(score, grade) {
  return `My CLAUDE.md scored ${score}/100 (${grade}) on claude-lint. How does yours compare?\n\nhttps://lint.stevenjvik.tech`;
}

export function formatDimensions(dimensions) {
  if (!dimensions) return "";

  const items = Object.entries(dimensions).map(([key, dim]) => {
    const pct = dim.score;
    const barColor =
      pct >= 80 ? "bg-emerald" : pct >= 60 ? "bg-amber" : "bg-error";
    const textColor =
      pct >= 80 ? "text-emerald" : pct >= 60 ? "text-amber" : "text-error";
    return `
      <div class="flex items-center gap-3 py-1.5">
        <span class="text-text-variant text-xs font-mono w-36 shrink-0">${escapeHtml(dim.label)}</span>
        <div class="flex-1 bg-lowest rounded-full h-2 overflow-hidden">
          <div class="${barColor} h-full rounded-full transition-all duration-700" style="width: ${pct}%"></div>
        </div>
        <span class="${textColor} text-xs font-mono w-10 text-right">${pct}%</span>
      </div>
    `;
  });

  return items.join("");
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
