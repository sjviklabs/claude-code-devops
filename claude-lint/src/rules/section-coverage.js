/**
 * Section Coverage Scorer
 *
 * Checks for recommended sections in a CLAUDE.md file.
 * Based on best practices from HumanLayer, Claude docs, and real-world usage.
 * Awards bonus points for good coverage rather than penalizing missing sections.
 *
 * Distinguishes between global configs (~/.claude/CLAUDE.md) and project configs
 * (./CLAUDE.md). Global configs focus on identity, behavior, and conventions.
 * Project configs focus on commands, architecture, and testing.
 */

const RECOMMENDED_SECTIONS = [
  {
    name: "Project Overview",
    patterns: [
      /^#+\s*(?:\w+\s+)*(project|overview|about|description|what|purpose|who)/im,
    ],
    weight: 2,
    scope: "both",
    why: "Gives Claude context about what the project does",
    whyGlobal:
      "Gives Claude context about who you are and how to work with you",
  },
  {
    name: "Tech Stack / Dependencies",
    patterns: [
      /^#+\s*(tech|stack|dependencies|tools|requirements|setup)/im,
      /\b(node|python|rust|go|java|typescript)\b/i,
    ],
    weight: 1,
    scope: "both",
    why: "Prevents Claude from suggesting wrong tools or patterns",
  },
  {
    name: "Development Commands",
    patterns: [
      /^#+\s*(?:\w+\s+)*(commands?|scripts?|development|getting started|quick\s*start)/im,
      /```(?:bash|sh|shell)/im,
    ],
    weight: 2,
    scope: "project",
    weightGlobal: 0,
    why: "Claude needs to know how to build, test, and run the project",
  },
  {
    name: "Architecture / Structure",
    patterns: [
      /^#+\s*(?:\w+\s+)*(architect|structure|directory|layout|organization|components?)/im,
    ],
    weight: 1,
    scope: "project",
    weightGlobal: 0,
    why: "Helps Claude understand where things live and why",
  },
  {
    name: "Code Conventions",
    patterns: [
      /^#+\s*(?:\w+\s+)*(conventions?|style|standards|patterns|rules|guidelines|coding)/im,
    ],
    weight: 2,
    scope: "both",
    why: "Prevents Claude from introducing inconsistent patterns",
  },
  {
    name: "Testing",
    patterns: [
      /^#+\s*(test|testing|specs?|quality)/im,
      /\b(jest|pytest|mocha|vitest|playwright)\b/i,
    ],
    weight: 1,
    scope: "project",
    weightGlobal: 0,
    why: "Claude needs to know how to run and write tests",
  },
  {
    name: "Behavioral Constraints",
    patterns: [
      /^#+\s*(?:\w+\s+)*(constraints?|boundaries|don'?t|never|avoid|safety|security)/im,
      /\bNEVER\b/,
    ],
    weight: 2,
    scope: "both",
    why: "Guardrails prevent Claude from doing dangerous things",
  },
  {
    name: "Communication Preferences",
    patterns: [
      /^#+\s*(?:\w+\s+)*(communication|tone|style|output|format|response)/im,
    ],
    weight: 1,
    scope: "both",
    weightGlobal: 2,
    why: "Sets expectations for how Claude should respond",
    whyGlobal:
      "Global configs should define communication style across all projects",
  },
];

/**
 * Detect if this is a global CLAUDE.md based on content signals.
 * Global configs talk about the user, behavior, and identity.
 * Project configs talk about the codebase, commands, and architecture.
 */
function isGlobalConfig(content, filePath) {
  // Path-based detection
  if (filePath) {
    const normalized = filePath.replace(/\\/g, "/").toLowerCase();
    if (
      normalized.includes("/.claude/claude.md") ||
      normalized.includes("\\.claude\\claude.md") ||
      normalized.match(/[/\\]\.claude[/\\]claude\.md$/i)
    ) {
      return true;
    }
  }

  // Content-based heuristics: global configs have personal/behavioral focus
  const globalSignals = [
    /\b(who I'm working with|working with me|about me)\b/i,
    /\b(global rules?|global config|all projects?)\b/i,
    /\b(behavioral? constraints?|communication preferences?)\b/i,
    /\b(tone|personality|style of response)\b/i,
    /\b(advisory|pushback|disagree openly)\b/i,
  ];
  const globalScore = globalSignals.filter((p) => p.test(content)).length;

  return globalScore >= 2;
}

export function scoreSectionCoverage(content, lines, filePath) {
  const findings = [];
  const global = isGlobalConfig(content, filePath);

  let coveredWeight = 0;
  let totalWeight = 0;
  const missing = [];
  const present = [];

  for (const section of RECOMMENDED_SECTIONS) {
    // Use scope-adjusted weights for global configs
    const weight = global
      ? section.weightGlobal !== undefined
        ? section.weightGlobal
        : section.weight
      : section.weight;

    // Skip sections with 0 weight (not applicable to this config type)
    if (weight === 0) continue;

    totalWeight += weight;
    const found = section.patterns.some((p) => p.test(content));

    if (found) {
      coveredWeight += weight;
      present.push(section.name);
    } else {
      missing.push({ ...section, effectiveWeight: weight });
    }
  }

  const coveragePercent =
    totalWeight > 0 ? Math.round((coveredWeight / totalWeight) * 100) : 100;

  // Report missing high-weight sections as info
  for (const section of missing) {
    if (section.effectiveWeight >= 2) {
      const why = global && section.whyGlobal ? section.whyGlobal : section.why;
      findings.push({
        rule: "section-coverage",
        severity: "info",
        message: `Missing recommended section: "${section.name}" - ${why}`,
        line: null,
      });
    }
  }

  // Bonus for good coverage (up to +10 points)
  const bonus = coveragePercent >= 80 ? 10 : coveragePercent >= 60 ? 5 : 0;

  if (coveragePercent < 50) {
    findings.push({
      rule: "section-coverage",
      severity: "warning",
      message: `Only ${coveragePercent}% section coverage (${present.length}/${present.length + missing.length} sections). ${global ? "A well-structured global CLAUDE.md covers identity, conventions, constraints, and communication style." : "A well-structured CLAUDE.md covers project context, commands, conventions, and constraints."}`,
      line: null,
    });
  }

  return {
    findings,
    bonus,
    coveragePercent,
    present,
    missing: missing.map((s) => s.name),
    configType: global ? "global" : "project",
  };
}
