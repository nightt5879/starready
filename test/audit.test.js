import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { auditRepository } from "../src/audit.js";
import { formatMarkdownReport } from "../src/report.js";

test("scores an empty repository low and suggests fundamentals", async () => {
  const root = await makeFixture();
  const result = await auditRepository(root);

  assert.equal(result.score < 30, true);
  assert.equal(result.actions.some((action) => action.id === "readme.exists"), true);
  assert.equal(result.actions.some((action) => action.id === "trust.license"), true);
});

test("scores a polished CLI repository high", async () => {
  const root = await makeFixture({
    "README.md": `# Example CLI

[![CI](https://github.com/acme/example/actions/workflows/ci.yml/badge.svg)](https://github.com/acme/example/actions)
![Score](https://img.shields.io/badge/starready-95%2F100-brightgreen)

Example CLI helps maintainers audit a repository before launch so developers can understand the value quickly.

![Demo](docs/demo.svg)

## Why

Open-source maintainers lose adoption when visitors cannot tell what a project does, how to install it, or whether it is trustworthy.

## Quickstart

\`\`\`bash
npx example-cli .
\`\`\`

## Installation

\`\`\`bash
npm install -g example-cli
\`\`\`

## Usage

\`\`\`bash
example-cli . --summary
\`\`\`

## Examples

See examples/report.md.

## Roadmap

The roadmap focuses on GitHub topic checks and comparison reports.
`,
    "LICENSE": "MIT License",
    "SECURITY.md": "# Security\n\nReport issues privately.",
    "CONTRIBUTING.md": "# Contributing\n\nRun npm test.",
    "CHANGELOG.md": "# Changelog\n\n## 0.1.0\n\nInitial release.",
    "CODE_OF_CONDUCT.md": "# Code of Conduct\n\nBe respectful.",
    "LAUNCH.md": "# Launch\n\nUse this announcement copy.",
    ".gitignore": "node_modules\ncoverage\n",
    "package.json": JSON.stringify({
      name: "example-cli",
      type: "module",
      bin: { example: "./bin/example.js" },
      scripts: { start: "node bin/example.js", test: "node --test" },
      keywords: ["github", "stars", "cli", "audit", "launch"],
      engines: { node: ">=18" },
      license: "MIT"
    }),
    "bin/example.js": "console.log('hello')\n",
    "src/index.js": "export const ok = true;\n",
    "src/cli.js": "export function run() {}\n",
    "test/example.test.js": "import test from 'node:test';\n",
    "docs/demo.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>",
    "examples/report.md": "# Report\n",
    ".github/workflows/ci.yml": "name: CI\non: [push]\njobs: {}\n",
    ".github/ISSUE_TEMPLATE/bug_report.yml": "name: Bug report\n",
    ".github/ISSUE_TEMPLATE/feature_request.yml": "name: Feature request\n"
  });

  const result = await auditRepository(root);

  assert.equal(result.score >= 90, true);
  assert.equal(result.actions.length, 0);
});

test("formats Markdown reports with priorities and category table", async () => {
  const root = await makeFixture({
    "README.md": "# Tiny\n\nTiny helps developers test formatting.\n",
    "package.json": JSON.stringify({ name: "tiny", scripts: { test: "node --test" } })
  });
  const result = await auditRepository(root);
  const report = formatMarkdownReport(result);

  assert.match(report, /# StarReady Report/);
  assert.match(report, /## Priority fixes/);
  assert.match(report, /\| Category \| Score \| Earned \|/);
});

async function makeFixture(files = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "starready-"));

  for (const [relativePath, contents] of Object.entries(files)) {
    const absolutePath = path.join(root, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, contents, "utf8");
  }

  return root;
}
