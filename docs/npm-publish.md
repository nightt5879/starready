# npm Publishing

The `starready` package name is currently available, but publishing requires an authenticated npm account on the local machine or an npm automation token.

## One-Time Login

```bash
npm adduser
npm whoami
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

## Current State

`npm run release:check` runs tests, self-audit, and `npm publish --dry-run`. Actual publish requires an authenticated npm session.
