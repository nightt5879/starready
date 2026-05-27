import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_IGNORED_DIRS = new Set([
  ".git",
  ".hg",
  ".svn",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".nuxt",
  ".svelte-kit",
  ".turbo",
  ".cache",
  "target",
  "vendor"
]);

const MAX_TEXT_FILE_BYTES = 1024 * 1024;

export function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

export async function collectFiles(root, options = {}) {
  const ignoredDirs = new Set([
    ...DEFAULT_IGNORED_DIRS,
    ...(options.ignoredDirs ?? [])
  ]);
  const files = [];

  async function walk(relativeDir) {
    const absoluteDir = path.join(root, relativeDir);
    let entries;

    try {
      entries = await fs.readdir(absoluteDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const relativePath = normalizePath(path.join(relativeDir, entry.name));

      if (entry.isDirectory()) {
        if (ignoredDirs.has(entry.name)) {
          continue;
        }
        await walk(relativePath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      try {
        const stat = await fs.stat(path.join(root, relativePath));
        files.push({
          path: relativePath,
          lowerPath: relativePath.toLowerCase(),
          size: stat.size
        });
      } catch {
        // Ignore files that disappear while the audit is running.
      }
    }
  }

  await walk("");
  return files.sort((left, right) => left.path.localeCompare(right.path));
}

export async function readTextFile(root, relativePath) {
  const absolutePath = path.join(root, relativePath);

  try {
    const stat = await fs.stat(absolutePath);
    if (stat.size > MAX_TEXT_FILE_BYTES) {
      return "";
    }
    return await fs.readFile(absolutePath, "utf8");
  } catch {
    return "";
  }
}

export async function readJsonFile(root, relativePath) {
  const text = await readTextFile(root, relativePath);
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function findFirstFile(files, candidates) {
  const wanted = new Set(candidates.map((candidate) => candidate.toLowerCase()));
  return files.find((file) => wanted.has(file.lowerPath)) ?? null;
}

export function countFiles(files, predicate) {
  return files.reduce((count, file) => count + (predicate(file) ? 1 : 0), 0);
}
