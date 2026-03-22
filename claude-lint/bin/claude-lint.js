#!/usr/bin/env node

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { lint } from "../src/index.js";
import { formatReport } from "../src/formatter.js";

const args = process.argv.slice(2);

// Handle flags
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
claude-lint — Score your CLAUDE.md for common issues

Usage:
  claude-lint [path]           Lint a specific CLAUDE.md file
  claude-lint                  Auto-detect CLAUDE.md in current directory
  claude-lint --json           Output results as JSON

Options:
  --json       Output raw JSON instead of formatted report
  --no-color   Disable colored output
  -h, --help   Show this help message
  -v, --version  Show version

Examples:
  npx @sjviklabs/claude-lint
  npx @sjviklabs/claude-lint ./my-project/CLAUDE.md
  npx @sjviklabs/claude-lint --json | jq '.score'
`);
  process.exit(0);
}

if (args.includes("--version") || args.includes("-v")) {
  const pkg = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf-8"),
  );
  console.log(pkg.version);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const noColor = args.includes("--no-color") || process.env.NO_COLOR;
const filePaths = args.filter((a) => !a.startsWith("-"));

// Find the CLAUDE.md file
let targetPath;
if (filePaths.length > 0) {
  targetPath = resolve(filePaths[0]);
} else {
  // Auto-detect: check common locations
  const candidates = [
    "CLAUDE.md",
    ".claude/CLAUDE.md",
    resolve(
      process.env.HOME || process.env.USERPROFILE || "",
      ".claude/CLAUDE.md",
    ),
  ];
  targetPath = candidates.find((c) => existsSync(resolve(c)));
  if (targetPath) {
    targetPath = resolve(targetPath);
  }
}

if (!targetPath || !existsSync(targetPath)) {
  console.error(
    "No CLAUDE.md found. Provide a path or run from a directory containing one.",
  );
  process.exit(1);
}

const content = readFileSync(targetPath, "utf-8");
const results = lint(content, targetPath);

if (jsonOutput) {
  console.log(JSON.stringify(results, null, 2));
} else {
  console.log(formatReport(results, { color: !noColor }));
}

process.exit(results.score < 40 ? 1 : 0);
