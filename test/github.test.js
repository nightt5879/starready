import assert from "node:assert/strict";
import test from "node:test";
import { auditContext } from "../src/audit.js";
import { parseGitHubRepository } from "../src/github.js";

test("parses GitHub repository references", () => {
  assert.deepEqual(parseGitHubRepository("nightt5879/starready"), {
    owner: "nightt5879",
    repo: "starready"
  });
  assert.deepEqual(parseGitHubRepository("https://github.com/nightt5879/starready.git"), {
    owner: "nightt5879",
    repo: "starready"
  });
  assert.throws(() => parseGitHubRepository("not-a-repo"), /owner\/repo/);
});

test("adds GitHub surface checks when metadata is present", () => {
  const result = auditContext({
    source: "github",
    root: "nightt5879/starready",
    url: "https://github.com/nightt5879/starready",
    files: [
      { path: "README.md", lowerPath: "readme.md", size: 128 },
      { path: "LICENSE", lowerPath: "license", size: 128 },
      { path: "package.json", lowerPath: "package.json", size: 128 },
      { path: "bin/starready.js", lowerPath: "bin/starready.js", size: 128 },
      { path: ".github/workflows/ci.yml", lowerPath: ".github/workflows/ci.yml", size: 128 },
      { path: ".github/ISSUE_TEMPLATE/bug.yml", lowerPath: ".github/issue_template/bug.yml", size: 128 },
      { path: "SECURITY.md", lowerPath: "security.md", size: 128 },
      { path: "CONTRIBUTING.md", lowerPath: "contributing.md", size: 128 },
      { path: "CHANGELOG.md", lowerPath: "changelog.md", size: 128 },
      { path: "CODE_OF_CONDUCT.md", lowerPath: "code_of_conduct.md", size: 128 },
      { path: "LAUNCH.md", lowerPath: "launch.md", size: 128 },
      { path: "docs/demo.svg", lowerPath: "docs/demo.svg", size: 128 }
    ],
    readmeFile: { path: "README.md", lowerPath: "readme.md", size: 128 },
    readme: `# StarReady

[![CI](https://github.com/nightt5879/starready/actions/workflows/ci.yml/badge.svg)](https://github.com/nightt5879/starready/actions)

StarReady helps maintainers audit repository readiness before launch.

![Demo](docs/demo.svg)

## Why

This explains the problem for maintainers.

## Quickstart

\`\`\`bash
npx starready .
\`\`\`

## Installation

\`\`\`bash
npm install -g starready
\`\`\`

## Usage

\`\`\`bash
starready . --summary
\`\`\`

## Examples

See docs.

## Roadmap

More GitHub checks.
`,
    packageJson: {
      bin: { starready: "./bin/starready.js" },
      scripts: { test: "node --test" },
      keywords: ["github", "stars", "cli", "audit", "launch"],
      license: "MIT"
    },
    github: {
      description: "Audit repository launch-readiness before sharing.",
      homepageUrl: "https://github.com/nightt5879/starready#readme",
      topics: ["github", "stars", "open-source", "readme", "cli", "audit"],
      hasDiscussions: true,
      pushedAt: new Date().toISOString(),
      latestRelease: { tagName: "v0.3.0" }
    }
  });

  assert.equal(result.categories.some((category) => category.name === "GitHub surface"), true);
  assert.equal(result.checks.some((check) => check.id === "github.topics"), true);
});
