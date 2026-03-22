/**
 * Vague Rule Flagger
 *
 * AgentLinter data: 40% of agent configs score below 60 on clarity.
 * "Be helpful" provides insufficient guidance and causes quality degradation
 * without error messages. This analyzer detects weak, non-actionable instructions.
 */

const VAGUE_PHRASES = [
  {
    pattern: /\bbe helpful\b/i,
    suggestion:
      "Specify what 'helpful' means: response format, depth, audience",
  },
  {
    pattern: /\bbe concise\b/i,
    suggestion:
      "Define concise: max sentences per response? bullet points only? BLUF format?",
  },
  {
    pattern: /\bbe careful\b/i,
    suggestion:
      "Specify what to be careful about: which files, which operations, what could go wrong",
  },
  {
    pattern: /\bfollow best practices\b/i,
    suggestion:
      "Name the specific practices: 'use conventional commits' not 'follow best practices'",
  },
  {
    pattern: /\bwrite clean code\b/i,
    suggestion:
      "Define clean: naming convention? max function length? specific linter rules?",
  },
  {
    pattern: /\bwrite good\b/i,
    suggestion:
      "Define what 'good' means in this context with measurable criteria",
  },
  {
    pattern: /\bbe smart\b/i,
    suggestion: "Describe the specific behavior you want instead of 'be smart'",
  },
  {
    pattern: /\buse common sense\b/i,
    suggestion:
      "LLMs don't have common sense. Spell out the specific heuristic you mean.",
  },
  {
    pattern: /\bdo the right thing\b/i,
    suggestion: "Define 'right' with specific criteria or examples",
  },
  {
    pattern: /\bwhen appropriate\b/i,
    suggestion: "Define when it's appropriate: list conditions or triggers",
  },
  {
    pattern: /\bas needed\b/i,
    suggestion: "Specify the trigger: 'when tests fail' not 'as needed'",
  },
  {
    pattern: /\bif necessary\b/i,
    suggestion: "Define the conditions that make it necessary",
  },
  {
    pattern: /\btry to\b/i,
    suggestion:
      "Remove 'try to' - either instruct it or don't. 'Try to use TypeScript' should be 'Use TypeScript'",
  },
  {
    pattern: /\bplease\b/i,
    suggestion:
      "Politeness is noise in config files. Direct instructions are clearer.",
  },
  {
    pattern: /\bshould probably\b/i,
    suggestion:
      "Commit to the instruction or remove it. 'Should probably' signals uncertainty.",
  },
  {
    pattern: /\bconsider\b(?!\s+(?:the|whether|using|adding|removing))/i,
    suggestion: "Be direct: 'use X' instead of 'consider X'",
  },
];

// Don't flag vague phrases inside code blocks or quotes
function isInCodeBlock(lines, lineNum) {
  let inBlock = false;
  for (let i = 0; i < lineNum && i < lines.length; i++) {
    if (lines[i].trim().startsWith("```")) {
      inBlock = !inBlock;
    }
  }
  return inBlock;
}

export function flagVagueRules(content, lines) {
  const findings = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isInCodeBlock(lines, i)) continue;
    // Skip headings - they're structural, not instructions
    if (line.trim().startsWith("#")) continue;

    for (const { pattern, suggestion } of VAGUE_PHRASES) {
      // Reset regex
      pattern.lastIndex = 0;
      if (pattern.test(line)) {
        findings.push({
          rule: "vague-rule",
          severity: "warning",
          message: `Vague instruction: "${line.trim().substring(0, 60)}..." - ${suggestion}`,
          line: i + 1,
        });
        break; // One finding per line max
      }
    }
  }

  return { findings };
}
