import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { runCli } from "../src/cli.js";

test("prints the version", async () => {
  const { streams, output } = createStreams();
  const exitCode = await runCli(["--version"], streams);

  assert.equal(exitCode, 0);
  assert.equal(output.stdout.trim(), "starready 0.2.0");
  assert.equal(output.stderr, "");
});

test("writes JSON output to a file", async () => {
  const root = await makeFixture({
    "README.md": "# Tiny\n\nTiny helps developers audit launch readiness.\n",
    "package.json": JSON.stringify({ name: "tiny", scripts: { test: "node --test" } })
  });
  const outputPath = path.join(root, "report.json");
  const { streams, output } = createStreams();

  const exitCode = await runCli([root, "--json", "--output", outputPath, "--no-config"], streams);
  const report = JSON.parse(await fs.readFile(outputPath, "utf8"));

  assert.equal(exitCode, 0);
  assert.equal(report.tool, "StarReady");
  assert.match(output.stdout, /Wrote /);
});

test("loads .starready.json and honors ignored directories", async () => {
  const root = await makeFixture({
    ".starready.json": JSON.stringify({
      format: "json",
      ignoredDirs: ["fixtures"]
    }),
    "README.md": "# Tiny\n\nTiny helps developers audit launch readiness.\n",
    "fixtures/extra.txt": "ignored"
  });
  const { streams, output } = createStreams();

  const exitCode = await runCli([root], streams);
  const report = JSON.parse(output.stdout);

  assert.equal(exitCode, 0);
  assert.equal(report.fileCount, 2);
  assert.equal(output.stderr, "");
});

test("fails when the score is below the configured threshold", async () => {
  const root = await makeFixture({
    ".starready.json": JSON.stringify({
      failBelow: 90,
      format: "summary"
    })
  });
  const { streams, output } = createStreams();

  const exitCode = await runCli([root], streams);

  assert.equal(exitCode, 1);
  assert.match(output.stderr, /below required threshold 90/);
});

test("initializes config and workflow without overwriting existing files", async () => {
  const root = await makeFixture({
    ".starready.json": "{\"failBelow\":70}\n"
  });
  const { streams, output } = createStreams();

  const exitCode = await runCli(["--init", root], streams);
  const config = await fs.readFile(path.join(root, ".starready.json"), "utf8");
  const workflow = await fs.readFile(path.join(root, ".github/workflows/starready.yml"), "utf8");

  assert.equal(exitCode, 0);
  assert.equal(config, "{\"failBelow\":70}\n");
  assert.match(workflow, /npx starready/);
  assert.match(output.stdout, /Already existed/);
});

async function makeFixture(files = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "starready-cli-"));

  for (const [relativePath, contents] of Object.entries(files)) {
    const absolutePath = path.join(root, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, contents, "utf8");
  }

  return root;
}

function createStreams() {
  const output = { stdout: "", stderr: "" };

  return {
    output,
    streams: {
      stdout: {
        write(chunk) {
          output.stdout += chunk;
        }
      },
      stderr: {
        write(chunk) {
          output.stderr += chunk;
        }
      }
    }
  };
}
