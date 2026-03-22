/**
 * Instruction Budget Analyzer
 *
 * Claude Code's system prompt contains ~50 built-in instructions.
 * Research shows frontier LLMs reliably follow 150-200 total instructions.
 * That leaves ~100-150 for user CLAUDE.md content.
 *
 * This analyzer counts imperative statements, MUST/NEVER/ALWAYS directives,
 * and bullet-point rules to estimate instruction load.
 */

// Patterns that indicate an instruction/directive
const IMPERATIVE_PATTERNS = [
  /^[-*]\s+\*\*?(MUST|NEVER|ALWAYS|DO NOT|DON'T|IMPORTANT)\*\*?/im,
  /^[-*]\s+(Use|Run|Set|Add|Create|Delete|Remove|Install|Configure|Enable|Disable|Check|Ensure|Make sure|Verify|Update|Keep|Avoid|Prefer|Include|Exclude)\b/im,
  /\b(MUST|SHALL|NEVER|ALWAYS|REQUIRED|MANDATORY)\b/g,
];

// Count rule-like lines (bullets, bold directives, table rows with instructions)
function countRuleLines(lines) {
  let count = 0;
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Track code blocks — don't count rules inside them
    if (trimmed.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    // Skip headings and empty lines
    if (trimmed.startsWith("#") || trimmed === "") continue;

    // Bullet point that starts with an imperative verb
    if (
      /^[-*]\s+\*{0,2}(Use|Run|Set|Add|Create|Delete|Remove|Install|Configure|Enable|Disable|Check|Ensure|Make sure|Verify|Update|Keep|Avoid|Prefer|Include|Exclude|Do not|Don't|Never|Always|Must|When|If|Only|No|Flag|Name|Stop|Bring|Surface|Challenge|Recommend|Disagree)\b/i.test(
        trimmed,
      )
    ) {
      count++;
      continue;
    }

    // Bold-prefixed behavioral rules: "**Bold text.** Rest of rule"
    if (/^[-*]?\s*\*\*[^*]+\*\*[.:]\s+\S/.test(trimmed)) {
      count++;
      continue;
    }

    // Table rows that contain instructions (pipe-delimited with action words)
    if (/^\|.*\|.*\|/.test(trimmed) && !/^[\|\s-]+$/.test(trimmed)) {
      // Only count data rows, not header separators
      if (
        /\b(run|check|read|scan|append|post|create|surface)\b/i.test(trimmed)
      ) {
        count++;
        continue;
      }
    }

    // Standalone sentences with strong directive words
    if (
      /\b(NEVER|MUST|ALWAYS|CRITICAL|IMPORTANT)\b/.test(trimmed) &&
      !trimmed.startsWith("|")
    ) {
      count++;
      continue;
    }
  }
  return count;
}

// Count strong directives (MUST, NEVER, ALWAYS, etc.)
function countStrongDirectives(content) {
  const matches = content.match(
    /\b(MUST|SHALL NOT|NEVER|ALWAYS|REQUIRED|MANDATORY|CRITICAL|IMPORTANT)\b/g,
  );
  return matches ? matches.length : 0;
}

// Count numbered list items that look like instructions
function countNumberedInstructions(lines) {
  let count = 0;
  for (const line of lines) {
    if (/^\s*\d+\.\s+\w/.test(line.trim())) {
      count++;
    }
  }
  return count;
}

export function analyzeInstructionBudget(content, lines) {
  const findings = [];

  const ruleLines = countRuleLines(lines);
  const strongDirectives = countStrongDirectives(content);
  const numberedInstructions = countNumberedInstructions(lines);

  // Estimate total instruction count
  // ruleLines catches most patterns; numbered items add ~70% (some are steps, not rules)
  // Deduplicate by taking max of ruleLines and numbered, not sum
  const instructionCount =
    ruleLines + Math.floor(Math.max(numberedInstructions - ruleLines, 0) * 0.5);

  // Claude Code system prompt uses ~50 instructions
  const systemInstructions = 50;
  const totalLoad = instructionCount + systemInstructions;
  const budget = 175; // Conservative middle estimate

  if (totalLoad > budget) {
    findings.push({
      rule: "instruction-budget",
      severity: "warning",
      message: `Estimated ${instructionCount} instructions + ~50 system = ${totalLoad} total. Claude reliably follows ~${budget}. Consider trimming.`,
      line: null,
    });
  } else if (totalLoad > budget * 0.8) {
    findings.push({
      rule: "instruction-budget",
      severity: "info",
      message: `Instruction budget at ${Math.round((totalLoad / budget) * 100)}% (${instructionCount} user + ~50 system). Room for ~${budget - totalLoad} more.`,
      line: null,
    });
  }

  if (strongDirectives > 15) {
    findings.push({
      rule: "directive-overload",
      severity: "warning",
      message: `${strongDirectives} strong directives (MUST/NEVER/ALWAYS). When everything is critical, nothing is. Prioritize the top 10.`,
      line: null,
    });
  } else if (strongDirectives > 8) {
    findings.push({
      rule: "directive-overload",
      severity: "info",
      message: `${strongDirectives} strong directives found. Still within healthy range but watch for growth.`,
      line: null,
    });
  }

  return { findings, instructionCount };
}
