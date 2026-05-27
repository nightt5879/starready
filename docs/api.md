# Node API

StarReady is primarily a CLI, but the core audit and report functions are exported for scripts and dashboards.

## auditRepository

```js
import { auditRepository } from "starready";

const result = await auditRepository(".", {
  ignoredDirs: ["fixtures"]
});

console.log(result.score);
```

## formatMarkdownReport

```js
import { auditRepository, formatMarkdownReport } from "starready";

const result = await auditRepository(".");
const markdown = formatMarkdownReport(result);
```

## formatSummary

```js
import { auditRepository, formatSummary } from "starready";

const result = await auditRepository(".");
console.log(formatSummary(result));
```

## loadConfig

```js
import { loadConfig } from "starready";

const { config, path } = await loadConfig(".");
```

The public API is intentionally small while the scoring model is still evolving before 1.0.
