# Contributing

Thanks for helping improve StarReady.

## Local Setup

```bash
npm install
npm test
npm run check
```

## Pull Requests

- Keep checks deterministic and local-first.
- Keep the zero-runtime-dependency install path unless a dependency removes real complexity.
- Include tests for new scoring behavior.
- Include CLI tests when changing flags, config loading, output formats, or exit codes.
- Prefer clear evidence and advice over clever scoring.
- Avoid network calls in the default audit path.

## Adding a Check

Add a check in `src/audit.js` with:

- a stable `id`
- a category
- a point weight
- evidence for the current state
- advice for the next action
