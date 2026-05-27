# Launch Posts

Use these drafts after npm publishing is complete and the README demo is visible.

## Hacker News

Title:

```text
Show HN: StarReady - audit whether your GitHub repo is ready to launch
```

Post:

```text
I built StarReady, a zero-dependency Node CLI that audits the public surface of a GitHub repository before launch.

It checks whether a visitor can understand, trust, install, and share a project quickly: README promise, demo, quickstart, license, CI, tests, contribution files, community templates, GitHub topics, releases, discussions, and recent activity.

The goal is not to fake popularity or predict stars. It is a practical pre-launch checklist that produces a score and prioritized fixes:

npx starready .
npx starready github owner/repo --summary

Repo: https://github.com/nightt5879/starready
npm: https://www.npmjs.com/package/starready
```

## Reddit

```text
I made StarReady, a CLI that audits whether a GitHub repo is ready to be shared publicly.

It scores the repository surface across first impression, product clarity, trust, engineering, community, and GitHub metadata. The output is meant to answer: "If a stranger lands here, can they understand it, trust it, and try it fast?"

Commands:

npx starready .
npx starready github owner/repo --summary

It is not a code quality scanner and does not promise stars. It is more like a launch-readiness checklist with CI support.

GitHub: https://github.com/nightt5879/starready
npm: https://www.npmjs.com/package/starready
```

## X / Twitter

```text
I built StarReady: a zero-dependency CLI that audits whether your GitHub repo is ready to launch.

It checks README clarity, demo, quickstart, license, CI, tests, community files, topics, releases, discussions, and activity.

npx starready .

https://github.com/nightt5879/starready
npm: https://www.npmjs.com/package/starready
```

## Chinese Communities

```text
我做了一个开源小工具 StarReady，用来检查一个 GitHub 项目是否已经适合公开发布。

它不是刷 star 工具，也不是代码质量扫描器，而是检查陌生开发者看到仓库后的关键路径：能不能一眼看懂、能不能信任、能不能马上运行、能不能知道如何贡献。

命令：

npx starready .
npx starready github owner/repo --summary

GitHub: https://github.com/nightt5879/starready
npm: https://www.npmjs.com/package/starready
```

## Demo Checklist

- Run `npx starready . --summary`.
- Run `npx starready github nightt5879/starready --summary`.
- Show `starready badge .`.
- Open one generated sample report from `docs/samples/`.
