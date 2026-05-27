import fs from "node:fs/promises";
import path from "node:path";

const CONFIG_TEMPLATE = `{
  "$schema": "https://raw.githubusercontent.com/nightt5879/starready/main/docs/starready.schema.json",
  "failBelow": 80,
  "format": "summary",
  "ignoredDirs": []
}
`;

const WORKFLOW_TEMPLATE = `name: StarReady

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx starready . --summary --fail-below 80
`;

export async function initProject(targetPath = ".") {
  const root = path.resolve(targetPath);
  await fs.mkdir(root, { recursive: true });

  const files = [
    [".starready.json", CONFIG_TEMPLATE],
    [".github/workflows/starready.yml", WORKFLOW_TEMPLATE]
  ];

  const created = [];
  const skipped = [];

  for (const [relativePath, contents] of files) {
    const absolutePath = path.join(root, relativePath);
    const exists = await pathExists(absolutePath);

    if (exists) {
      skipped.push(relativePath);
      continue;
    }

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, contents, "utf8");
    created.push(relativePath);
  }

  return { root, created, skipped };
}

export function formatInitResult(result) {
  const lines = [`Initialized StarReady in ${result.root}.`];

  if (result.created.length > 0) {
    lines.push("", "Created:");
    for (const file of result.created) {
      lines.push(`- ${file}`);
    }
  }

  if (result.skipped.length > 0) {
    lines.push("", "Already existed:");
    for (const file of result.skipped) {
      lines.push(`- ${file}`);
    }
  }

  return lines.join("\n") + "\n";
}

async function pathExists(absolutePath) {
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}
