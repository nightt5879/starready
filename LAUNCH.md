# Launch Kit

## Short Description

StarReady is a local CLI that audits whether a GitHub repository is clear, trustworthy, and ready to share before launch.

## Demo Command

```bash
npx starready . --summary
```

## Announcement Draft

I built StarReady, a CLI that scores a repository's launch-readiness before you post it publicly. It checks the README, demo, install path, license, CI, tests, contribution files, and community signals, then returns a prioritized fix list.

## Launch Checklist

- Generate a fresh report with `npx starready . --markdown STARREADY_REPORT.md`.
- Add the score badge to the README.
- Record a short terminal GIF or screenshot.
- Publish one issue tagged `good first issue`.
- Share the repo with the demo command, not only the homepage.
