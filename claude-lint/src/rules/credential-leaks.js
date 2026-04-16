/**
 * Credential Leak Detector
 *
 * Scans CLAUDE.md for patterns that look like exposed secrets.
 * AgentLinter data: ~1 in 5 workspaces have credentials in markdown files.
 * These bypass .gitignore since markdown isn't typically ignored.
 */

const CREDENTIAL_PATTERNS = [
  {
    name: "AWS Access Key",
    pattern: /AKIA[0-9A-Z]{16}/g,
  },
  {
    name: "AWS Secret Key",
    pattern:
      /(?:aws_secret_access_key|secret_key)\s*[=:]\s*['"]?[A-Za-z0-9/+=]{40}['"]?/gi,
  },
  {
    name: "Generic API Key",
    pattern: /(?:api[_-]?key|apikey)\s*[=:]\s*['"]?[A-Za-z0-9_\-]{20,}['"]?/gi,
  },
  {
    name: "Generic Secret/Token",
    pattern:
      /(?:secret|token|password|passwd|pwd)\s*[=:]\s*['"]?[A-Za-z0-9_\-!@#$%^&*]{8,}['"]?/gi,
  },
  {
    name: "Bearer Token",
    pattern: /Bearer\s+[A-Za-z0-9_\-./+=]{20,}/g,
  },
  {
    name: "Private Key Block",
    pattern: /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----/g,
  },
  {
    name: "GitHub Token",
    pattern: /gh[ps]_[A-Za-z0-9_]{36,}/g,
  },
  {
    name: "Slack Token",
    pattern: /xox[bporas]-[A-Za-z0-9-]{10,}/g,
  },
  {
    name: "Database Connection String",
    pattern:
      /(?:mongodb|postgres|mysql|redis):\/\/[^:@\s'"]+:[^@\s'"]+@[^\s'"]+/gi,
  },
  {
    name: "Hardcoded IP with Port",
    pattern:
      /\b(?:192\.168|10\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}:\d{2,5}\b/g,
  },
  {
    name: "Environment Variable Assignment",
    pattern:
      /(?:export\s+)?(?:API_KEY|SECRET_KEY|ACCESS_TOKEN|AUTH_TOKEN|DB_PASSWORD|DATABASE_URL)\s*=\s*['"]?[^\s'"]{8,}/gi,
  },
  {
    name: "Anthropic API Key",
    pattern: /sk-ant-[A-Za-z0-9_\-]{20,}/g,
  },
  {
    name: "OpenAI API Key",
    pattern: /sk-[A-Za-z0-9]{20,}/g,
  },
  {
    name: "HuggingFace Token",
    pattern: /hf_[A-Za-z0-9]{20,}/g,
  },
  {
    name: "Google Service Account Key",
    pattern: /"private_key":\s*"-----BEGIN/g,
  },
  {
    name: "Firebase/GCP Client ID",
    pattern: /\d{12}-[a-z0-9]{32}\.apps\.googleusercontent\.com/g,
  },
  {
    name: "Supabase Key",
    pattern: /sbp_[A-Za-z0-9]{40,}/g,
  },
  {
    name: "Vercel Token",
    pattern: /vercel_[A-Za-z0-9_\-]{20,}/gi,
  },
  {
    name: "D-ID API Key",
    pattern: /[A-Za-z0-9+/=]{20,}:[A-Za-z0-9_\-]{20,}/g,
  },
  {
    name: "fal.ai API Key",
    pattern:
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:[0-9a-f]{20,}/g,
  },
];

// Patterns that are OK (examples, placeholders)
const FALSE_POSITIVE_PATTERNS = [
  /your[_-]?api[_-]?key/i,
  /\$\{?\w+\}?/, // Variable references like $TOKEN or ${SECRET}
  /xxx+/i, // Redacted values
  /\.\.\./, // Truncated values
  /example|placeholder|changeme|todo|fixme|replace/i,
  /<[^>]+>/, // HTML-style placeholders like <YOUR_KEY>
  /sk-[.]{3,}/, // Redacted OpenAI keys
];

function isFalsePositive(match) {
  return FALSE_POSITIVE_PATTERNS.some((fp) => fp.test(match));
}

export function detectCredentialLeaks(content, lines) {
  const findings = [];

  for (const { name, pattern } of CREDENTIAL_PATTERNS) {
    // Reset regex state
    pattern.lastIndex = 0;
    let match;

    while ((match = pattern.exec(content)) !== null) {
      const matchText = match[0];

      if (isFalsePositive(matchText)) continue;

      // Find the line number
      const beforeMatch = content.substring(0, match.index);
      const lineNum = beforeMatch.split("\n").length;

      // Check if it's inside a code block that's clearly an example
      const line = lines[lineNum - 1] || "";
      if (isFalsePositive(line)) continue;

      // Redact the actual value for display
      const redacted =
        matchText.length > 12
          ? matchText.substring(0, 8) +
            "..." +
            matchText.substring(matchText.length - 4)
          : matchText.substring(0, 4) + "****";

      findings.push({
        rule: "credential-leak",
        severity: "critical",
        message: `Potential ${name} detected: ${redacted}`,
        line: lineNum,
      });
    }
  }

  return { findings };
}
