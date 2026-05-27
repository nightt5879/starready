# Promotion Tracker

This file tracks StarReady launch promotion after the npm release.

## Launch Facts

- Project: StarReady
- GitHub: https://github.com/nightt5879/starready
- npm: https://www.npmjs.com/package/starready
- Current npm version: 0.3.0
- GitHub discussion announcement: https://github.com/nightt5879/starready/discussions/3
- Demo image: `docs/starready-demo.png`
- Platform playbook: `docs/promotion-playbook.md`

## Status

| Channel | Status | Target | Notes |
| --- | --- | --- | --- |
| GitHub Discussions | Published | Project community | Announcement is live. |
| Hacker News | Blocked by account creation | https://news.ycombinator.com/submit | The create-account flow returned "Sorry, account creation disabled." Retry later from a normal network or contact hn@ycombinator.com. |
| Reddit | Draft filled in Chrome | Relevant programming/open-source communities | Title and body are prepared; community selection still needs manual confirmation. |
| X / Twitter | Draft filled in Chrome | Personal/account audience | The single-post draft is prepared; publish only after final confirmation. A PNG demo image is available but was not uploaded because Chrome extension file access is disabled. |
| Chinese communities | Waiting for login | V2EX, Juejin, Zhihu, or similar | V2EX redirected to sign-in. Use the Chinese draft from `docs/launch-posts.md` after login. |
| Product Hunt | Prepared | Product Hunt launch flow | Second-wave launch package is in `docs/promotion-playbook.md`. |
| DEV Community | Prepared | DEV article editor | Second-wave article package is in `docs/promotion-playbook.md`. |

## Posting Rules

- Do not imply StarReady guarantees stars.
- Lead with the practical value: repo launch-readiness, trust signals, quickstart quality, and GitHub surface polish.
- Prefer the GitHub repository link as the main URL because it lets visitors inspect the project immediately.
- Include the npm link where the platform supports body text.
- Record every published URL in this tracker after posting.

## Follow-Up Checklist

- [x] Publish npm package.
- [x] Publish GitHub discussion announcement.
- [ ] Retry Hacker News Show HN post after account creation/login works.
- [ ] Choose a Reddit community and publish one Reddit post.
- [ ] Confirm and publish one X / Twitter post.
- [ ] Publish one Chinese community post.
- [ ] Prepare or schedule a Product Hunt launch.
- [ ] Publish a DEV Community write-up.
- [ ] Add posted links below.

## Posting Queue

1. Reddit
   - Suggested title: `I made StarReady, a CLI that checks whether a GitHub repo is ready to launch`
   - Body: use the Reddit draft in `docs/launch-posts.md`.
   - Best first target: `r/SideProject`, because project launch posts and feedback requests fit its audience better than broad programming-news communities.
   - Backup targets: open-source or CLI-tool communities where self-promotion is explicitly allowed.
2. X / Twitter
   - Body: use the X / Twitter draft in `docs/launch-posts.md`.
   - Add `docs/starready-demo.png` if browser file upload is available.
3. Chinese communities
   - Suggested title: `StarReady: 检查你的 GitHub 项目是否适合公开发布`
   - Body: use the Chinese Communities draft in `docs/launch-posts.md`.
   - Best fit: V2EX `create`/`programmer`, Juejin article/post, or Zhihu idea/article.
4. Hacker News
   - Suggested title: `Show HN: StarReady - audit whether your GitHub repo is ready to launch`
   - Main URL: https://github.com/nightt5879/starready
   - Retry after account creation is available.

## Published Links

- GitHub Discussions: https://github.com/nightt5879/starready/discussions/3
