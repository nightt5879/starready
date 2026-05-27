import fs from "node:fs/promises";
import path from "node:path";
import { auditRepository } from "./audit.js";
import { FORMATS, loadConfig, mergeConfig, validateScore } from "./config.js";
import { formatInitResult, initProject } from "./init.js";
import { formatMarkdownReport, formatSummary } from "./report.js";
import { VERSION } from "./version.js";

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

  if (options.version) {
    streams.stdout.write(`starready ${VERSION}\n`);
    return 0;
  }

  if (options.init) {
    const result = await initProject(options.target);
    streams.stdout.write(formatInitResult(result));
    return 0;
  }

  try {
    const configResult = await loadConfig(options.target, options.configPath, {
      disabled: options.noConfig
    });
    options = mergeConfig(configResult.config, options);
  } catch (error) {
    streams.stderr.write(`${error.message}\n`);
    return 2;
  }

  const result = await auditRepository(options.target, {
    ignoredDirs: options.ignoredDirs
  });
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
    ignoredDirs: [],
    configPath: "",
    noConfig: false,
    init: false,
    version: false,
    help: false,
    provided: new Set()
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg === "--version" || arg === "-v") {
      options.version = true;
      continue;
    }

    if (arg === "--init") {
      options.init = true;
      continue;
    }

    if (arg === "--config") {
      options.configPath = requireValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--no-config") {
      options.noConfig = true;
      continue;
    }

    if (arg === "--json") {
      options.format = "json";
      options.provided.add("format");
      continue;
    }

    if (arg === "--summary") {
      options.format = "summary";
      options.provided.add("format");
      continue;
    }

    if (arg === "--markdown") {
      options.format = "markdown";
      options.provided.add("format");
      const next = argv[index + 1];
      if (next && !next.startsWith("--")) {
        options.output = next;
        options.provided.add("output");
        index += 1;
      }
      continue;
    }

    if (arg === "--output" || arg === "-o") {
      options.output = requireValue(argv, index, arg);
      options.provided.add("output");
      index += 1;
      continue;
    }

    if (arg === "--fail-below") {
      const raw = requireValue(argv, index, arg);
      const value = Number(raw);
      validateScore(value, "--fail-below");
      options.failBelow = value;
      options.provided.add("failBelow");
      index += 1;
      continue;
    }

    if (arg === "--strict") {
      options.failBelow = 85;
      options.provided.add("failBelow");
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
  if (!FORMATS.has(format)) {
    throw new Error(`Unsupported output format: ${format}`);
  }

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
  --init                 Create .starready.json and a GitHub Actions workflow
  --config <file>        Load a specific StarReady config file
  --no-config            Ignore .starready.json
  --markdown [file]       Print Markdown, or write it to file when a path is provided
  --json                  Print JSON
  --summary               Print a compact text summary
  --output, -o <file>     Write the selected format to a file
  --fail-below <score>    Exit with code 1 when score is below the threshold
  --strict                Same as --fail-below 85
  --version, -v           Show the StarReady version
  --help, -h              Show this help

Examples:
  starready --init
  starready .
  starready . --config .starready.json
  starready ../my-repo --summary
  starready . --markdown STARREADY_REPORT.md --fail-below 80
  starready . --json --output starready.json
`;
}
