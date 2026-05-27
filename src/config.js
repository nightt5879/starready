import fs from "node:fs/promises";
import path from "node:path";

export const DEFAULT_CONFIG_FILE = ".starready.json";
export const FORMATS = new Set(["markdown", "json", "summary"]);

const ALLOWED_CONFIG_KEYS = new Set([
  "$schema",
  "failBelow",
  "format",
  "ignoredDirs",
  "output"
]);

export async function loadConfig(targetPath, configPath, options = {}) {
  if (options.disabled) {
    return { path: null, config: {} };
  }

  const root = path.resolve(targetPath);
  const resolvedPath = configPath
    ? path.resolve(configPath)
    : path.join(root, DEFAULT_CONFIG_FILE);

  let text;
  try {
    text = await fs.readFile(resolvedPath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { path: null, config: {} };
    }
    throw new Error(`Could not read config ${resolvedPath}: ${error.message}`);
  }

  let config;
  try {
    config = JSON.parse(text);
  } catch (error) {
    throw new Error(`Config ${resolvedPath} is not valid JSON: ${error.message}`);
  }

  validateConfig(config, resolvedPath);
  return { path: resolvedPath, config };
}

export function mergeConfig(config, cliOptions) {
  const provided = cliOptions.provided;

  return {
    ...cliOptions,
    format: provided.has("format") ? cliOptions.format : config.format ?? cliOptions.format,
    output: provided.has("output") ? cliOptions.output : config.output ?? cliOptions.output,
    failBelow: provided.has("failBelow") ? cliOptions.failBelow : config.failBelow ?? cliOptions.failBelow,
    ignoredDirs: config.ignoredDirs ?? []
  };
}

function validateConfig(config, configPath) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error(`Config ${configPath} must be a JSON object`);
  }

  for (const key of Object.keys(config)) {
    if (!ALLOWED_CONFIG_KEYS.has(key)) {
      throw new Error(`Config ${configPath} contains unsupported key "${key}"`);
    }
  }

  if (config.format !== undefined && !FORMATS.has(config.format)) {
    throw new Error(`Config ${configPath} format must be markdown, json, or summary`);
  }

  if (config.output !== undefined && (typeof config.output !== "string" || config.output.length === 0)) {
    throw new Error(`Config ${configPath} output must be a non-empty string`);
  }

  if (config.failBelow !== undefined) {
    validateScore(config.failBelow, `Config ${configPath} failBelow`);
  }

  if (config.ignoredDirs !== undefined) {
    if (!Array.isArray(config.ignoredDirs)) {
      throw new Error(`Config ${configPath} ignoredDirs must be an array of directory names`);
    }

    for (const ignoredDir of config.ignoredDirs) {
      if (typeof ignoredDir !== "string" || ignoredDir.length === 0 || ignoredDir.includes("/") || ignoredDir.includes("\\")) {
        throw new Error(`Config ${configPath} ignoredDirs entries must be plain directory names`);
      }
    }
  }
}

export function validateScore(value, label = "score") {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error(`${label} must be an integer from 0 to 100`);
  }
}
