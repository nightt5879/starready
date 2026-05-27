# Continuous Integration

StarReady is useful as a lightweight launch-readiness gate in GitHub Actions.

## Recommended Workflow

```yaml
name: StarReady

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx starready . --summary --fail-below 80
```

## Thresholds

| Threshold | Use case |
| --- | --- |
| `70` | Personal projects before a public launch. |
| `80` | Serious open-source releases. |
| `85` | Organization templates or flagship projects. |

Use `--strict` as a shorthand for `--fail-below 85`.
