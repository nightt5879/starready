# Badges

StarReady can generate a Shields badge from a local audit.

## Markdown Badge

```bash
starready badge .
```

Example:

```md
![StarReady score](https://img.shields.io/badge/starready-100%2F100-brightgreen)
```

## Badge URL

```bash
starready badge . --url
```

Use the URL form when another tool or README generator needs only the image source.

## Recommended Workflow

Generate the badge after every meaningful release:

```bash
npm run check
starready badge .
```

The badge should be treated as a launch-readiness snapshot, not as a permanent quality claim.
