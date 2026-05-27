import path from "node:path";
import {
  collectFiles,
  countFiles,
  findFirstFile,
  readJsonFile,
  readTextFile
} from "./files.js";
import { VERSION } from "./version.js";

const CATEGORY_ORDER = [
  "First impression",
  "Product clarity",
  "Trust",
  "Engineering",
  "Community",
  "GitHub surface"
];

const CHECKS = [
  {
    id: "readme.exists",
    category: "First impression",
    title: "README exists",
    weight: 8,
    run: (context) =>
      grade(Boolean(context.readmeFile), "Found README at " + (context.readmeFile?.path ?? "none"), "Add a README.md with a crisp promise, demo, quickstart, and examples.")
  },
  {
    id: "readme.tagline",
    category: "First impression",
    title: "Crisp one-screen promise",
    weight: 5,
    run: (context) => {
      const firstParagraph = getFirstParagraph(context.readme);
      const hasPromise = /\b(for|helps|turns|audits|builds|generates|tracks|ships|makes)\b/i.test(firstParagraph);
      const compact = firstParagraph.length >= 40 && firstParagraph.length <= 220;
      return grade(
        hasPromise && compact,
        firstParagraph ? `Opening copy: "${truncate(firstParagraph, 90)}"` : "No opening promise found",
        "Put a 1-2 sentence promise near the top: who it helps, what it does, and why it matters."
      );
    }
  },
  {
    id: "readme.demo",
    category: "First impression",
    title: "Visual demo or screenshot",
    weight: 6,
    run: (context) => {
      const readmeHasImage = /!\[[^\]]*]\([^)]+\)|<img\b/i.test(context.readme);
      const demoAssets = countFiles(context.files, (file) =>
        /^docs\/.*\.(svg|png|jpe?g|gif|webp)$/i.test(file.path)
      );
      return grade(
        readmeHasImage || demoAssets > 0,
        readmeHasImage ? "README embeds a visual asset" : `${demoAssets} demo asset(s) found in docs/`,
        "Add a terminal screenshot, GIF, or product image so visitors understand the value in seconds."
      );
    }
  },
  {
    id: "readme.quickstart",
    category: "First impression",
    title: "Copy-paste quickstart",
    weight: 5,
    run: (context) => {
      const hasQuickstartHeading = hasHeading(context.readme, ["quickstart", "quick start", "getting started"]);
      const hasCopyCommand = /\b(npx|npm|pnpm|yarn|pipx|pip install|cargo install|go install|brew install)\b/i.test(context.readme);
      return grade(
        hasQuickstartHeading && hasCopyCommand,
        hasQuickstartHeading && hasCopyCommand ? "Quickstart heading and install command found" : "Quickstart is incomplete",
        "Add a short Quickstart section with one install command and one command that produces visible output."
      );
    }
  },
  {
    id: "readme.badges",
    category: "First impression",
    title: "Status badges",
    weight: 4,
    run: (context) => {
      const hasBadge = /shields\.io|github\/actions\/workflows|!\[[^\]]*(build|ci|npm|license|score|coverage)[^\]]*]/i.test(context.readme);
      return grade(hasBadge, hasBadge ? "README includes status badges" : "No badges found", "Add CI, package, license, and health badges near the title.")
    }
  },
  {
    id: "clarity.problem",
    category: "Product clarity",
    title: "Problem and audience are explicit",
    weight: 5,
    run: (context) => {
      const hasProblem = /\b(problem|why|motivation|pain|friction|for maintainers|for developers|for teams|use case)\b/i.test(context.readme);
      return grade(hasProblem, hasProblem ? "README explains the problem or audience" : "Problem framing missing", "Explain the painful workflow this project removes and who should care.")
    }
  },
  {
    id: "clarity.install",
    category: "Product clarity",
    title: "Install path is obvious",
    weight: 4,
    run: (context) => {
      const hasInstall = hasHeading(context.readme, ["install", "installation", "quickstart"]) && /\b(npx|npm install|pnpm add|yarn add|pip install|cargo install|go install|brew install)\b/i.test(context.readme);
      return grade(hasInstall, hasInstall ? "Installation command found" : "Install command missing", "Give the fastest supported install path first, then advanced options.")
    }
  },
  {
    id: "clarity.usage",
    category: "Product clarity",
    title: "Usage examples",
    weight: 5,
    run: (context) => {
      const codeBlocks = (context.readme.match(/```[\s\S]*?```/g) ?? []).length;
      const usageHeading = hasHeading(context.readme, ["usage", "examples", "commands"]);
      return grade(
        usageHeading && codeBlocks >= 2,
        `${codeBlocks} fenced code block(s) in README`,
        "Show 2-3 concrete examples with real input and output."
      );
    }
  },
  {
    id: "clarity.examples",
    category: "Product clarity",
    title: "Examples or docs directory",
    weight: 3,
    run: (context) => {
      const hasDocs = context.files.some((file) => /^docs\//i.test(file.path));
      const hasExamples = context.files.some((file) => /^examples\//i.test(file.path));
      return grade(hasDocs || hasExamples, hasDocs || hasExamples ? "docs/ or examples/ exists" : "No docs/ or examples/ directory", "Add examples/ for copyable workflows or docs/ for deeper explanation.")
    }
  },
  {
    id: "clarity.roadmap",
    category: "Product clarity",
    title: "Roadmap or differentiation",
    weight: 3,
    run: (context) => {
      const hasRoadmap = /\b(roadmap|comparison|alternatives|why not|versus|vs\.|different|tradeoff|limitations)\b/i.test(context.readme);
      return grade(hasRoadmap, hasRoadmap ? "Roadmap or differentiation found" : "No roadmap or differentiation found", "Add a small roadmap and explain when to choose this project over alternatives.")
    }
  },
  {
    id: "trust.license",
    category: "Trust",
    title: "Open-source license",
    weight: 6,
    run: (context) => {
      const licenseFile = findFirstFile(context.files, ["LICENSE", "LICENSE.md", "COPYING"]);
      const packageLicense = typeof context.packageJson?.license === "string";
      return grade(
        Boolean(licenseFile || packageLicense),
        licenseFile ? `Found ${licenseFile.path}` : packageLicense ? `package.json license: ${context.packageJson.license}` : "No license found",
        "Add an OSI-approved license so people can adopt the project safely."
      );
    }
  },
  {
    id: "trust.ci",
    category: "Trust",
    title: "Continuous integration",
    weight: 4,
    run: (context) => {
      const workflows = countFiles(context.files, (file) => /^\.github\/workflows\/.+\.ya?ml$/i.test(file.path));
      return grade(workflows > 0, workflows > 0 ? `${workflows} GitHub Actions workflow(s)` : "No GitHub Actions workflow found", "Add CI that runs tests on pull requests.")
    }
  },
  {
    id: "trust.tests",
    category: "Trust",
    title: "Runnable test suite",
    weight: 5,
    run: (context) => {
      const testFiles = countFiles(context.files, (file) => /(^|\/)(test|tests|spec)\/|(\.|-)(test|spec)\.[cm]?[jt]sx?$/i.test(file.path));
      const hasTestScript = typeof context.packageJson?.scripts?.test === "string";
      const score = testFiles > 0 && hasTestScript ? 1 : hasTestScript ? 0.5 : 0;
      return grade(score, `${testFiles} test file(s), test script: ${hasTestScript ? "yes" : "no"}`, "Add tests and expose them through a single command such as npm test.")
    }
  },
  {
    id: "trust.security",
    category: "Trust",
    title: "Security policy",
    weight: 3,
    run: (context) => {
      const policy = findFirstFile(context.files, ["SECURITY.md", ".github/SECURITY.md"]);
      return grade(Boolean(policy), policy ? `Found ${policy.path}` : "No security policy found", "Add SECURITY.md with supported versions and disclosure instructions.")
    }
  },
  {
    id: "trust.contributing",
    category: "Trust",
    title: "Contribution guide",
    weight: 3,
    run: (context) => {
      const guide = findFirstFile(context.files, ["CONTRIBUTING.md", ".github/CONTRIBUTING.md"]);
      return grade(Boolean(guide), guide ? `Found ${guide.path}` : "No contribution guide found", "Add CONTRIBUTING.md with local setup, tests, and review expectations.")
    }
  },
  {
    id: "trust.changelog",
    category: "Trust",
    title: "Changelog",
    weight: 3,
    run: (context) => {
      const changelog = findFirstFile(context.files, ["CHANGELOG.md", "HISTORY.md", "RELEASES.md"]);
      return grade(Boolean(changelog), changelog ? `Found ${changelog.path}` : "No changelog found", "Add a changelog so users can track releases and breaking changes.")
    }
  },
  {
    id: "engineering.manifest",
    category: "Engineering",
    title: "Language manifest",
    weight: 4,
    run: (context) => {
      const manifest = findFirstFile(context.files, ["package.json", "pyproject.toml", "Cargo.toml", "go.mod", "deno.json", "bun.lockb"]);
      return grade(Boolean(manifest), manifest ? `Found ${manifest.path}` : "No common manifest found", "Add the standard package manifest for the ecosystem.")
    }
  },
  {
    id: "engineering.commands",
    category: "Engineering",
    title: "Useful package commands",
    weight: 4,
    run: (context) => {
      const scripts = Object.keys(context.packageJson?.scripts ?? {});
      const hasCliBin = Boolean(context.packageJson?.bin);
      const binPaths = getPackageBinPaths(context.packageJson?.bin);
      const missingBins = binPaths.filter((binPath) => !hasFile(context.files, binPath));
      const hasValidCliBin = hasCliBin && missingBins.length === 0;
      const hasRunnableEntry = scripts.includes("start") || hasValidCliBin;
      const score = scripts.includes("test") && hasRunnableEntry ? 1 : scripts.length > 0 ? 0.5 : 0;
      const binEvidence = hasCliBin
        ? missingBins.length === 0
          ? "bin paths exist"
          : `missing bin paths: ${missingBins.join(", ")}`
        : "no bin";
      return grade(score, `Scripts: ${scripts.join(", ") || "none"}; ${binEvidence}`, "Expose start, test, build, or CLI commands and ensure package bin paths point to real files.")
    }
  },
  {
    id: "engineering.quality-config",
    category: "Engineering",
    title: "Quality configuration",
    weight: 3,
    run: (context) => {
      const config = findFirstFile(context.files, ["tsconfig.json", "eslint.config.js", ".eslintrc", ".prettierrc", "biome.json", "ruff.toml"]);
      const packageSignals = Boolean(context.packageJson?.type || context.packageJson?.engines);
      return grade(Boolean(config || packageSignals), config ? `Found ${config.path}` : packageSignals ? "package.json defines module type or engines" : "No quality config found", "Add runtime constraints, linting, formatting, or type-checking configuration.")
    }
  },
  {
    id: "engineering.gitignore",
    category: "Engineering",
    title: "Ignore generated files",
    weight: 2,
    run: (context) => {
      const ignoreFile = findFirstFile(context.files, [".gitignore"]);
      return grade(Boolean(ignoreFile), ignoreFile ? "Found .gitignore" : "No .gitignore found", "Add .gitignore for dependencies, build output, logs, and local environment files.")
    }
  },
  {
    id: "engineering.source-layout",
    category: "Engineering",
    title: "Clear source layout",
    weight: 3,
    run: (context) => {
      const sourceFiles = countFiles(context.files, (file) => /^(src|lib|bin|app)\//i.test(file.path));
      return grade(sourceFiles >= 2, `${sourceFiles} source file(s) in src/, lib/, bin/, or app/`, "Keep implementation files out of the repository root.")
    }
  },
  {
    id: "engineering.dependency-footprint",
    category: "Engineering",
    title: "Small dependency footprint",
    weight: 2,
    run: (context) => {
      const dependencies = Object.keys(context.packageJson?.dependencies ?? {});
      const devDependencies = Object.keys(context.packageJson?.devDependencies ?? {});
      const total = dependencies.length + devDependencies.length;
      const score = total <= 10 ? 1 : total <= 25 ? 0.5 : 0;
      return grade(score, `${dependencies.length} runtime and ${devDependencies.length} development dependencies`, "Keep the default install lightweight or explain why heavier dependencies are necessary.")
    }
  },
  {
    id: "community.issue-templates",
    category: "Community",
    title: "Issue templates",
    weight: 3,
    run: (context) => {
      const templates = countFiles(context.files, (file) => /^\.github\/ISSUE_TEMPLATE\//i.test(file.path));
      return grade(templates > 0, `${templates} issue template file(s)`, "Add issue templates for bug reports and feature requests.")
    }
  },
  {
    id: "community.code-of-conduct",
    category: "Community",
    title: "Code of conduct",
    weight: 2,
    run: (context) => {
      const coc = findFirstFile(context.files, ["CODE_OF_CONDUCT.md", ".github/CODE_OF_CONDUCT.md"]);
      return grade(Boolean(coc), coc ? `Found ${coc.path}` : "No code of conduct found", "Add a code of conduct so contributors know the expected collaboration standards.")
    }
  },
  {
    id: "community.keywords",
    category: "Community",
    title: "Discoverability metadata",
    weight: 2,
    run: (context) => {
      const keywords = context.packageJson?.keywords ?? [];
      return grade(Array.isArray(keywords) && keywords.length >= 5, `${Array.isArray(keywords) ? keywords.length : 0} package keyword(s)`, "Add searchable package keywords and mirror them as GitHub repository topics.")
    }
  },
  {
    id: "community.launch-assets",
    category: "Community",
    title: "Launch assets",
    weight: 3,
    run: (context) => {
      const launchFile = findFirstFile(context.files, ["LAUNCH.md", "docs/launch.md"]);
      const readmeHasShareCopy = /\b(hacker news|product hunt|reddit|launch|share|announcement)\b/i.test(context.readme);
      return grade(Boolean(launchFile || readmeHasShareCopy), launchFile ? `Found ${launchFile.path}` : readmeHasShareCopy ? "README includes launch language" : "No launch assets found", "Add launch copy, demo commands, and short social posts so others can explain the project.")
    }
  },
  {
    id: "github.description",
    category: "GitHub surface",
    title: "Repository description and homepage",
    weight: 3,
    githubOnly: true,
    run: (context) => {
      const description = context.github?.description ?? "";
      const homepage = context.github?.homepageUrl ?? "";
      const hasDescription = description.length >= 30 && description.length <= 160;
      const score = hasDescription && homepage ? 1 : hasDescription ? 0.5 : 0;
      return grade(score, `Description: ${description ? "yes" : "no"}; homepage: ${homepage ? "yes" : "no"}`, "Add a concise GitHub description and homepage/readme link so the repository card explains itself.")
    }
  },
  {
    id: "github.topics",
    category: "GitHub surface",
    title: "GitHub topics",
    weight: 4,
    githubOnly: true,
    run: (context) => {
      const topics = context.github?.topics ?? [];
      const score = topics.length >= 6 ? 1 : topics.length >= 3 ? 0.5 : 0;
      return grade(score, `${topics.length} topic(s): ${topics.join(", ") || "none"}`, "Add 6-8 specific repository topics for discovery.")
    }
  },
  {
    id: "github.release",
    category: "GitHub surface",
    title: "Published release",
    weight: 4,
    githubOnly: true,
    run: (context) => {
      const release = context.github?.latestRelease;
      return grade(Boolean(release), release ? `Latest release: ${release.tagName}` : "No GitHub release found", "Create a GitHub release so users can identify stable versions.")
    }
  },
  {
    id: "github.discussions",
    category: "GitHub surface",
    title: "Discussion channel",
    weight: 2,
    githubOnly: true,
    run: (context) =>
      grade(Boolean(context.github?.hasDiscussions), context.github?.hasDiscussions ? "Discussions enabled" : "Discussions disabled", "Enable GitHub Discussions for questions, ideas, and launch feedback.")
  },
  {
    id: "github.activity",
    category: "GitHub surface",
    title: "Recent activity",
    weight: 3,
    githubOnly: true,
    run: (context) => {
      const pushedAt = context.github?.pushedAt;
      const ageDays = pushedAt ? Math.floor((Date.now() - new Date(pushedAt).getTime()) / 86400000) : Infinity;
      const score = ageDays <= 30 ? 1 : ageDays <= 180 ? 0.5 : 0;
      return grade(score, pushedAt ? `Last push: ${pushedAt}` : "No push timestamp found", "Keep the default branch active so visitors see a maintained project.")
    }
  }
];

export async function auditRepository(targetPath = ".", options = {}) {
  const root = path.resolve(targetPath);
  const files = await collectFiles(root, options);
  const readmeFile = findFirstFile(files, ["README.md", "README"]);
  const readme = readmeFile ? await readTextFile(root, readmeFile.path) : "";
  const packageJson = await readJsonFile(root, "package.json");

  return auditContext({
    root,
    files,
    readmeFile,
    readme,
    packageJson
  });
}

export function auditContext(context) {
  const activeChecks = CHECKS.filter((check) => !check.githubOnly || context.github);
  const checks = activeChecks.map((check) => {
    const result = check.run(context);
    const score = clampScore(result.score);
    const earned = round(check.weight * score, 2);
    const missed = round(check.weight - earned, 2);

    return {
      id: check.id,
      category: check.category,
      title: check.title,
      weight: check.weight,
      score,
      earned,
      missed,
      status: getStatus(score),
      evidence: result.evidence,
      advice: result.advice
    };
  });

  const categories = CATEGORY_ORDER.map((name) => {
    const categoryChecks = checks.filter((check) => check.category === name);
    const weight = round(sum(categoryChecks.map((check) => check.weight)), 2);
    const earned = round(sum(categoryChecks.map((check) => check.earned)), 2);
    const score = weight > 0 ? Math.round((earned / weight) * 100) : 0;

    return {
      name,
      weight,
      earned,
      score,
      checks: categoryChecks
    };
  }).filter((category) => category.checks.length > 0);

  const totalWeight = sum(checks.map((check) => check.weight));
  const earnedWeight = sum(checks.map((check) => check.earned));
  const totalScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  const actions = checks
    .filter((check) => check.score < 1)
    .sort((left, right) => right.missed - left.missed)
    .slice(0, 8)
    .map((check) => ({
      id: check.id,
      title: check.title,
      category: check.category,
      impact: totalWeight > 0 ? round((check.missed / totalWeight) * 100, 2) : 0,
      advice: check.advice
    }));

  return {
    tool: "StarReady",
    version: VERSION,
    generatedAt: new Date().toISOString(),
    root: context.root,
    source: context.source ?? "local",
    url: context.url ?? null,
    fileCount: context.files.length,
    score: totalScore,
    grade: gradeFromScore(totalScore),
    summary: summaryFromScore(totalScore),
    categories,
    checks,
    actions
  };
}

function grade(value, evidence, advice) {
  if (typeof value === "boolean") {
    return { score: value ? 1 : 0, evidence, advice };
  }

  return { score: value, evidence, advice };
}

function clampScore(score) {
  if (Number.isNaN(score)) {
    return 0;
  }
  return Math.max(0, Math.min(1, score));
}

function getStatus(score) {
  if (score >= 1) {
    return "pass";
  }
  if (score > 0) {
    return "partial";
  }
  return "fail";
}

function gradeFromScore(score) {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "A-";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  if (score >= 70) return "B-";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

function summaryFromScore(score) {
  if (score >= 90) {
    return "Launch-ready: the repository has strong first-impression, trust, and contributor signals.";
  }
  if (score >= 75) {
    return "Strong base: a few visible polish gaps are still costing adoption momentum.";
  }
  if (score >= 55) {
    return "Promising but leaky: visitors can understand it, but trust or quickstart gaps may reduce conversion.";
  }
  return "Needs fundamentals: fix the README, license, install path, tests, and contribution signals first.";
}

function hasHeading(markdown, labels) {
  return labels.some((label) => {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`^#{1,4}\\s+.*\\b${escaped}\\b`, "im").test(markdown);
  });
}

function getFirstParagraph(markdown) {
  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) =>
      line &&
      !line.startsWith("#") &&
      !line.startsWith("[![") &&
      !line.startsWith("![") &&
      !line.startsWith("<p") &&
      !line.startsWith("<img")
    );

  return lines[0] ?? "";
}

function truncate(text, maxLength) {
  return text.length > maxLength ? text.slice(0, maxLength - 1) + "." : text;
}

function getPackageBinPaths(bin) {
  if (typeof bin === "string") {
    return [bin];
  }

  if (!bin || typeof bin !== "object" || Array.isArray(bin)) {
    return [];
  }

  return Object.values(bin).filter((value) => typeof value === "string");
}

function hasFile(files, filePath) {
  const normalized = filePath.replace(/\\/g, "/").replace(/^\.?\//, "").toLowerCase();
  return files.some((file) => file.lowerPath === normalized);
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function round(value, precision = 0) {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}
