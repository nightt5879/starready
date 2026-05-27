# Configuration

StarReady automatically reads `.starready.json` from the audited repository root. Command-line flags always win over config values.

## Example

```json
{
  "$schema": "https://raw.githubusercontent.com/nightt5879/starready/main/docs/starready.schema.json",
  "failBelow": 80,
  "format": "summary",
  "ignoredDirs": ["fixtures", "tmp"],
  "output": "STARREADY_REPORT.md"
}
```

## Fields

| Field | Type | Description |
| --- | --- | --- |
| `failBelow` | integer | Exit with code 1 when the score is lower than this value. |
| `format` | string | One of `markdown`, `json`, or `summary`. |
| `ignoredDirs` | string array | Extra directory names to skip while scanning. |
| `output` | string | Write the selected report format to a file. |

## Initialize a Project

```bash
npx starready --init
```

The initializer creates:

- `.starready.json`
- `.github/workflows/starready.yml`

Existing files are not overwritten.
