# Contributing

Thanks for helping improve StarReady.

## Local Setup

```bash
npm install
npm test
node bin/starready.js . --summary
```

## Pull Requests

- Keep checks deterministic and local-first.
- Include tests for new scoring behavior.
- Prefer clear evidence and advice over clever scoring.
- Avoid network calls in the default audit path.

## Adding a Check

Add a check in `src/audit.js` with:

- a stable `id`
- a category
- a point weight
- evidence for the current state
- advice for the next action
