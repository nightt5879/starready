import path from "node:path";

export function formatSummary(result) {
  const lines = [
    `StarReady ${result.score}/100 (${result.grade})`,
    result.summary,
    "",
    "Category scores:"
  ];

  for (const category of result.categories) {
    lines.push(`- ${category.name}: ${category.score}/100`);
  }

  if (result.actions.length > 0) {
    lines.push("", "Top fixes:");
    for (const action of result.actions.slice(0, 5)) {
      lines.push(`- +${action.impact} pts: ${action.advice}`);
    }
  }

  return lines.join("\n") + "\n";
}

export function formatBadge(result, options = {}) {
  const url = badgeUrl(result.score);
  if (options.markdown === false) {
    return `${url}\n`;
  }
  return `![StarReady score](${url})\n`;
}

export function formatMarkdownReport(result) {
  const lines = [
    "# StarReady Report",
    "",
    `**Score:** ${result.score}/100 (${result.grade})`,
    "",
    `![StarReady score](${badgeUrl(result.score)})`,
    "",
    result.summary,
    "",
    `Audited \`${path.basename(result.root) || result.root}\` at \`${result.generatedAt}\`.`,
    "",
    "## Priority fixes",
    ""
  ];

  if (result.actions.length === 0) {
    lines.push("No priority fixes. Keep shipping useful releases and collecting user feedback.");
  } else {
    for (const action of result.actions) {
      lines.push(`- **+${action.impact} pts** (${action.category}) ${action.advice}`);
    }
  }

  lines.push(
    "",
    "## Category scores",
    "",
    "| Category | Score | Earned |",
    "| --- | ---: | ---: |"
  );

  for (const category of result.categories) {
    lines.push(`| ${escapePipes(category.name)} | ${category.score}/100 | ${category.earned}/${category.weight} |`);
  }

  lines.push("", "## Checks", "");

  for (const category of result.categories) {
    lines.push(`### ${category.name}`, "");
    lines.push("| Status | Check | Points | Evidence |");
    lines.push("| --- | --- | ---: | --- |");

    for (const check of category.checks) {
      lines.push(
        `| ${statusLabel(check.status)} | ${escapePipes(check.title)} | ${check.earned}/${check.weight} | ${escapePipes(check.evidence)} |`
      );
    }

    lines.push("");
  }

  lines.push(
    "## How to improve the score",
    "",
    "StarReady rewards visible adoption signals: a clear promise, a fast demo, a trustworthy project surface, and a low-friction contributor path. It does not buy, fake, or guarantee stars."
  );

  return lines.join("\n") + "\n";
}

function statusLabel(status) {
  if (status === "pass") return "pass";
  if (status === "partial") return "partial";
  return "fail";
}

function badgeColor(score) {
  if (score >= 90) return "brightgreen";
  if (score >= 75) return "green";
  if (score >= 60) return "yellow";
  if (score >= 45) return "orange";
  return "red";
}

function badgeUrl(score) {
  return `https://img.shields.io/badge/starready-${score}%2F100-${badgeColor(score)}`;
}

function escapePipes(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}
