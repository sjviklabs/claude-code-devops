/**
 * Section Coverage Scorer
 *
 * Checks for recommended sections in a CLAUDE.md file.
 * Based on best practices from HumanLayer, Claude docs, and real-world usage.
 * Awards bonus points for good coverage rather than penalizing missing sections.
 */

const RECOMMENDED_SECTIONS = [
  {
    name: "Project Overview",
    patterns: [/^#+\s*(project|overview|about|description|what|purpose)/im],
    weight: 2,
    why: "Gives Claude context about what the project does",
  },
  {
    name: "Tech Stack / Dependencies",
    patterns: [
      /^#+\s*(tech|stack|dependencies|tools|requirements|setup)/im,
      /\b(node|python|rust|go|java|typescript)\b/i,
    ],
    weight: 1,
    why: "Prevents Claude from suggesting wrong tools or patterns",
  },
  {
    name: "Development Commands",
    patterns: [
      /^#+\s*(commands?|scripts?|development|getting started|quick\s*start)/im,
      /```(?:bash|sh|shell)/im,
    ],
    weight: 2,
    why: "Claude needs to know how to build, test, and run the project",
  },
  {
    name: "Architecture / Structure",
    patterns: [
      /^#+\s*(architect|structure|directory|layout|organization|components?)/im,
    ],
    weight: 1,
    why: "Helps Claude understand where things live and why",
  },
  {
    name: "Code Conventions",
    patterns: [
      /^#+\s*(conventions?|style|standards|patterns|rules|guidelines|coding)/im,
    ],
    weight: 2,
    why: "Prevents Claude from introducing inconsistent patterns",
  },
  {
    name: "Testing",
    patterns: [
      /^#+\s*(test|testing|specs?|quality)/im,
      /\b(jest|pytest|mocha|vitest|playwright)\b/i,
    ],
    weight: 1,
    why: "Claude needs to know how to run and write tests",
  },
  {
    name: "Behavioral Constraints",
    patterns: [
      /^#+\s*(constraints?|boundaries|don'?t|never|avoid|safety|security)/im,
      /\bNEVER\b/,
    ],
    weight: 2,
    why: "Guardrails prevent Claude from doing dangerous things",
  },
  {
    name: "Communication Preferences",
    patterns: [/^#+\s*(communication|tone|style|output|format|response)/im],
    weight: 1,
    why: "Sets expectations for how Claude should respond",
  },
];

export function scoreSectionCoverage(content, lines) {
  const findings = [];
  let coveredWeight = 0;
  let totalWeight = 0;
  const missing = [];
  const present = [];

  for (const section of RECOMMENDED_SECTIONS) {
    totalWeight += section.weight;
    const found = section.patterns.some((p) => p.test(content));

    if (found) {
      coveredWeight += section.weight;
      present.push(section.name);
    } else {
      missing.push(section);
    }
  }

  const coveragePercent = Math.round((coveredWeight / totalWeight) * 100);

  // Report missing high-weight sections as info
  for (const section of missing) {
    if (section.weight >= 2) {
      findings.push({
        rule: "section-coverage",
        severity: "info",
        message: `Missing recommended section: "${section.name}" - ${section.why}`,
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
      message: `Only ${coveragePercent}% section coverage (${present.length}/${RECOMMENDED_SECTIONS.length} sections). A well-structured CLAUDE.md covers project context, commands, conventions, and constraints.`,
      line: null,
    });
  }

  return {
    findings,
    bonus,
    coveragePercent,
    present,
    missing: missing.map((s) => s.name),
  };
}
