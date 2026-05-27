import { auditContext } from "./audit.js";
import { findFirstFile } from "./files.js";

const GITHUB_API = "https://api.github.com";
const RAW_GITHUB = "https://raw.githubusercontent.com";

export async function auditGitHubRepository(input, options = {}) {
  const repoRef = parseGitHubRepository(input);
  const token = options.token ?? process.env.GITHUB_TOKEN ?? "";
  const repo = await githubJson(`/repos/${repoRef.owner}/${repoRef.repo}`, token);
  const branch = repo.default_branch;
  const tree = await githubJson(`/repos/${repoRef.owner}/${repoRef.repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`, token);
  const files = tree.tree
    .filter((entry) => entry.type === "blob")
    .map((entry) => ({
      path: entry.path,
      lowerPath: entry.path.toLowerCase(),
      size: entry.size ?? 0
    }))
    .sort((left, right) => left.path.localeCompare(right.path));
  const readmeFile = findFirstFile(files, ["README.md", "README"]);
  const packageFile = findFirstFile(files, ["package.json"]);
  const readme = readmeFile ? await githubRaw(repoRef, branch, readmeFile.path, token) : "";
  const packageText = packageFile ? await githubRaw(repoRef, branch, packageFile.path, token) : "";
  const packageJson = packageText ? parseJson(packageText) : null;
  const latestRelease = await optionalGithubJson(`/repos/${repoRef.owner}/${repoRef.repo}/releases/latest`, token);

  return auditContext({
    source: "github",
    root: `${repoRef.owner}/${repoRef.repo}`,
    url: repo.html_url,
    files,
    readmeFile,
    readme,
    packageJson,
    github: {
      description: repo.description ?? "",
      homepageUrl: repo.homepage ?? repo.html_url,
      topics: repo.topics ?? [],
      hasDiscussions: Boolean(repo.has_discussions),
      pushedAt: repo.pushed_at,
      latestRelease: latestRelease
        ? {
            tagName: latestRelease.tag_name,
            url: latestRelease.html_url
          }
        : null
    }
  });
}

export function parseGitHubRepository(input) {
  const trimmed = input.trim().replace(/\.git$/, "");
  const match = trimmed.match(/^(?:https?:\/\/github\.com\/)?([^/\s]+)\/([^/\s#?]+)$/i);

  if (!match) {
    throw new Error("GitHub repository must be owner/repo or https://github.com/owner/repo");
  }

  return {
    owner: match[1],
    repo: match[2]
  };
}

async function githubJson(apiPath, token) {
  const response = await fetch(`${GITHUB_API}${apiPath}`, {
    headers: githubHeaders(token)
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed (${response.status}) for ${apiPath}`);
  }

  return response.json();
}

async function optionalGithubJson(apiPath, token) {
  const response = await fetch(`${GITHUB_API}${apiPath}`, {
    headers: githubHeaders(token)
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`GitHub API request failed (${response.status}) for ${apiPath}`);
  }

  return response.json();
}

async function githubRaw(repoRef, branch, filePath, token) {
  const encodedPath = filePath.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(`${RAW_GITHUB}/${repoRef.owner}/${repoRef.repo}/${encodeURIComponent(branch)}/${encodedPath}`, {
    headers: githubHeaders(token)
  });

  if (!response.ok) {
    return "";
  }

  return response.text();
}

function githubHeaders(token) {
  const headers = {
    accept: "application/vnd.github+json",
    "user-agent": "starready"
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  return headers;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
