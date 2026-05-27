# Real-World Calibration

StarReady was tested against real public repositories to check whether the output is useful across different project shapes.

| Repository | Score | Main signal |
| --- | ---: | --- |
| [nightt5879/starready](samples/nightt5879-starready.md) | 100 | Purpose-built launch surface with config, release, docs, and community files. |
| [expressjs/express](samples/expressjs-express.md) | 76 | Strong first impression, but community and contribution signals are less visible to the scanner. |
| [facebook/react](samples/facebook-react.md) | 64 | Strong trust signals, but the root README is not optimized as a copy-paste launch page. |
| [vercel/next.js](samples/vercel-nextjs.md) | 50 | Strong project, but the repository surface routes users elsewhere and does not look like a standalone launch page. |
| [sindresorhus/awesome](samples/sindresorhus-awesome.md) | 40 | Curated-list repositories are intentionally different from apps, libraries, or CLIs. |

## Calibration Notes

- StarReady measures launch-readiness, not popularity, historical importance, or code quality.
- A famous repository can score lower if its README assumes the visitor already knows the product.
- Curated lists and monorepos need custom profiles before scores should be interpreted strictly.
- This round led to a stricter engineering check: package `bin` entries now need to point to real files.
- GitHub mode added checks for topics, releases, discussions, activity, and repository card metadata.

## Next Calibration Targets

- Python libraries
- Rust CLIs
- template repositories
- AI app starter kits
- research repositories
