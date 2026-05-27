# Promotion Playbook

This playbook turns the launch drafts into channel-specific posting packages.

## Order

1. Publish the prepared X / Twitter post.
2. Publish the Reddit post to a community that accepts project launches.
3. Publish one Chinese community post.
4. Retry Hacker News after account creation or login works.

## Shared Rules

- Do not ask for stars, upvotes, comments, or engagement.
- Do not imply StarReady guarantees GitHub stars.
- Keep the pitch factual: StarReady audits launch-readiness signals for GitHub repositories.
- Use the GitHub repository as the primary link.
- Add the npm link when the platform supports body text.
- After each post, add the final URL to `docs/promotion-tracker.md`.

## X / Twitter

Status: draft already filled in Chrome, not published.

Text:

```text
I built StarReady: a zero-dependency CLI that audits whether your GitHub repo is ready to launch.

It checks README clarity, quickstart, license, CI, tests, community files, topics, releases, and activity.

npx starready .

https://github.com/nightt5879/starready
```

Optional image:

```text
docs/starready-demo.png
```

If image upload fails, enable file access for the Codex Chrome Extension or publish text-only.

## Reddit

Preferred community: `r/SideProject`.

Reason: this is a shipped side project and the post asks for feedback. Broad programming-news communities are more likely to treat launch posts as promotion.

Title:

```text
I made StarReady, a CLI that checks whether a GitHub repo is ready to launch
```

Body:

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

If `r/SideProject` cannot be selected in Reddit's composer, open the subreddit first, then use its create-post button to avoid losing the draft.

## Chinese Communities

Preferred first target: V2EX, node `分享创造` or `程序员`.

Title:

```text
StarReady: 检查你的 GitHub 项目是否适合公开发布
```

Body:

```text
我做了一个开源小工具 StarReady，用来检查一个 GitHub 项目是否已经适合公开发布。

它不是刷 star 工具，也不是代码质量扫描器，而是检查陌生开发者看到仓库后的关键路径：能不能一眼看懂、能不能信任、能不能马上运行、能不能知道如何贡献。

命令：

npx starready .
npx starready github owner/repo --summary

GitHub: https://github.com/nightt5879/starready
npm: https://www.npmjs.com/package/starready
```

If V2EX requires login, let the user log in manually and continue from the create-post page.

## Hacker News

Status: account creation returned `Sorry, account creation disabled.`

Retry steps:

1. Try from a normal home network or phone hotspot, without VPN or proxy.
2. Retry later instead of repeatedly submitting the create-account form.
3. If needed, email `hn@ycombinator.com`.

Email template:

```text
Subject: Unable to create a Hacker News account

Hi HN team,

I tried to create a Hacker News account to submit a Show HN post for a small open-source developer tool I built, but the create-account form returned:

"Sorry, account creation disabled."

Could you let me know whether account creation can be enabled for my network/account attempt, or whether there is a recommended way to proceed?

Thanks.
```

Show HN title:

```text
Show HN: StarReady - audit whether your GitHub repo is ready to launch
```

Main URL:

```text
https://github.com/nightt5879/starready
```
