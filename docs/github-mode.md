# GitHub Mode

GitHub mode audits a public repository without cloning it.

```bash
starready github nightt5879/starready --summary
```

You can also pass a GitHub URL:

```bash
starready github https://github.com/nightt5879/starready --markdown report.md
```

## What It Adds

GitHub mode runs the normal repository-surface checks against files from the default branch, then adds GitHub-specific checks:

- repository description and homepage
- topics
- releases
- discussions
- recent default-branch activity

## Authentication

Public repositories usually work without credentials. For higher rate limits, set `GITHUB_TOKEN`:

```bash
GITHUB_TOKEN=github_pat_... starready github owner/repo --summary
```

When running from GitHub Actions, use the built-in token:

```yaml
- run: npx starready github owner/repo --summary
  env:
    GITHUB_TOKEN: ${{ github.token }}
```

## Limits

GitHub mode is optimized for repository launch-readiness, not source-code quality or historical influence. Large established projects may score lower when their README assumes prior brand awareness or their project metadata lives outside the default repository surface.
