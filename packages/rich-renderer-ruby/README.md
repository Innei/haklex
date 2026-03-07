# @haklex/rich-renderer-ruby

Ruby annotation renderer for CJK text, providing furigana (reading aids) above base characters.

## Installation

```bash
pnpm add @haklex/rich-renderer-ruby
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `react` | `>=19` |
| `react-dom` | `>=19` |

## Usage

```tsx
import { RubyRenderer } from '@haklex/rich-renderer-ruby/static'

// Register in a static RendererConfig
const rendererConfig = {
  // ...other renderers
  ruby: RubyRenderer,
}
```

For edit mode:

```tsx
import { RubyEditRenderer } from '@haklex/rich-renderer-ruby'

const editRendererConfig = {
  // ...other renderers
  ruby: RubyEditRenderer,
}
```

## Exports

### Components

- `RubyRenderer` — Static (read-only) renderer for ruby annotations
- `RubyEditRenderer` — Edit (interactive) renderer with annotation editing

### Types

- `RubyRendererProps` — Props interface for the ruby renderer component

### Sub-path Exports

| Path | Description |
| --- | --- |
| `@haklex/rich-renderer-ruby` | Full exports (edit + static) |
| `@haklex/rich-renderer-ruby/static` | Static-only renderer |
| `@haklex/rich-renderer-ruby/style.css` | Stylesheet |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
