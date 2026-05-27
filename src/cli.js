import fs from "node:fs/promises";
import path from "node:path";
import { auditRepository } from "./audit.js";
import { formatMarkdownReport, formatSummary } from "./report.js";

export async function runCli(argv = process.argv.slice(2), streams = process) {
  let options;

  try {
    options = parseArgs(argv);
  } catch (error) {
    streams.stderr.write(`${error.message}\n\n${helpText()}`);
    return 2;
  }

  if (options.help) {
    streams.stdout.write(helpText());
    return 0;
  }

  const result = await auditRepository(options.target);
  const output = renderOutput(result, options.format);

  if (options.output) {
    const outputPath = path.resolve(options.output);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, output, "utf8");
    streams.stdout.write(formatSummary(result));
    streams.stdout.write(`\nWrote ${outputPath}\n`);
  } else {
    streams.stdout.write(output);
  }

  if (typeof options.failBelow === "number" && result.score < options.failBelow) {
    streams.stderr.write(`StarReady score ${result.score} is below required threshold ${options.failBelow}.\n`);
    return 1;
  }

  return 0;
}

function parseArgs(argv) {
  const options = {
    target: ".",
    format: "markdown",
    output: "",
    failBelow: null,
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg === "--json") {
      options.format = "json";
      continue;
    }

    if (arg === "--summary") {
      options.format = "summary";
      continue;
    }

    if (arg === "--markdown") {
      options.format = "markdown";
      const next = argv[index + 1];
      if (next && !next.startsWith("--")) {
        options.output = next;
        index += 1;
      }
      continue;
    }

    if (arg === "--output" || arg === "-o") {
      options.output = requireValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--fail-below") {
      const raw = requireValue(argv, index, arg);
      const value = Number(raw);
      if (!Number.isInteger(value) || value < 0 || value > 100) {
        throw new Error("--fail-below must be an integer from 0 to 100");
      }
      options.failBelow = value;
      index += 1;
      continue;
    }

    if (arg === "--strict") {
      options.failBelow = 85;
      continue;
    }

    if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    options.target = arg;
  }

  return options;
}

function requireValue(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function renderOutput(result, format) {
  if (format === "json") {
    return JSON.stringify(result, null, 2) + "\n";
  }

  if (format === "summary") {
    return formatSummary(result);
  }

  return formatMarkdownReport(result);
}

function helpText() {
  return `StarReady audits a repository for GitHub launch-readiness.

Usage:
  starready [path] [options]

Options:
  --markdown [file]       Print Markdown, or write it to file when a path is provided
  --json                  Print JSON
  --summary               Print a compact text summary
  --output, -o <file>     Write the selected format to a file
  --fail-below <score>    Exit with code 1 when score is below the threshold
  --strict                Same as --fail-below 85
  --help, -h              Show this help

Examples:
  starready .
  starready ../my-repo --summary
  starready . --markdown STARREADY_REPORT.md --fail-below 80
  starready . --json --output starready.json
`;
}
