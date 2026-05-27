# npm Publishing

The `starready` package name is currently available, but publishing requires an authenticated npm account on the local machine or an npm automation token.

## Option A: Local Login

```bash
npm adduser --registry https://registry.npmjs.org/
npm whoami --registry https://registry.npmjs.org/
```

## Publish

```bash
npm run check
npm publish
```

## Verify

```bash
npm view starready version
npx starready --version
npx starready . --summary
```

## Option B: GitHub Actions

Create an npm automation token, then add it to the GitHub repository as `NPM_TOKEN`.

Run the workflow manually:

```text
Actions -> Publish npm -> Run workflow -> dry_run=false
```

The workflow runs:

- `npm ci`
- `npm run check`
- `npm publish --dry-run`
- `npm publish --provenance`

## Current State

`npm run release:check` runs tests, self-audit, and `npm publish --dry-run`. Actual publish requires either an authenticated npm session or the `NPM_TOKEN` GitHub secret.
