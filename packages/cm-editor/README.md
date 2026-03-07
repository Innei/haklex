# @haklex/cm-editor

Shared CodeMirror 6 editor utilities for the Haklex ecosystem.

## Installation

```bash
pnpm add @haklex/cm-editor
```

## Peer Dependencies

None. All CodeMirror dependencies are bundled.

## Usage

### Language Loading

```ts
import {
  getLanguageCandidates,
  languageAliases,
  loadLanguageExtension,
} from '@haklex/cm-editor'

// Resolve language aliases (e.g. "js" -> "javascript")
const candidates = getLanguageCandidates('js')

// Load a CodeMirror language extension dynamically
const extension = await loadLanguageExtension('typescript')
```

### Selection Utilities

```ts
import { isOnFirstLine, isOnLastLine } from '@haklex/cm-editor'

// Check cursor position relative to the document
const atTop = isOnFirstLine(editorState)
const atBottom = isOnLastLine(editorState)
```

### Theme

```ts
import { baseTheme, getThemeExtensions } from '@haklex/cm-editor'

// Apply the base theme or get full theme extensions for a color scheme
const extensions = getThemeExtensions('dark')
```

## Exports

### Language Utilities

| Export | Description |
| --- | --- |
| `getLanguageCandidates(alias)` | Resolve a language alias to candidate language names |
| `languageAliases` | Map of language alias strings |
| `loadLanguageExtension(lang)` | Dynamically load a CodeMirror language extension |

### Selection Utilities

| Export | Description |
| --- | --- |
| `isOnFirstLine(state)` | Check if the cursor is on the first line |
| `isOnLastLine(state)` | Check if the cursor is on the last line |

### Theme Utilities

| Export | Description |
| --- | --- |
| `baseTheme` | Base CodeMirror theme extension |
| `getThemeExtensions(scheme)` | Get theme extensions for a given color scheme |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
