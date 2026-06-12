# @haklex/rich-renderer-mention

Social mention badge renderer with platform-specific icons and styling.

## Installation

```bash
pnpm add @haklex/rich-renderer-mention
```

## Peer Dependencies

| Package          | Version   |
| ---------------- | --------- |
| `lexical`        | `^0.45.0` |
| `@lexical/react` | `^0.45.0` |
| `react`          | `>=19`    |
| `react-dom`      | `>=19`    |

## Usage

```tsx
import { MentionRenderer } from '@haklex/rich-renderer-mention/static';

// Register in a static RendererConfig
const rendererConfig = {
  // ...other renderers
  Mention: MentionRenderer,
};
```

For edit mode:

```tsx
import { MentionEditRenderer } from '@haklex/rich-renderer-mention';

const editRendererConfig = {
  // ...other renderers
  Mention: MentionEditRenderer,
};
```

### Configuring platform metadata

```tsx
import {
  MentionPlatformProvider,
  platformMetaMap,
  platformKeys,
} from '@haklex/rich-renderer-mention';

// Wrap your app with the provider to customize platform rendering
<MentionPlatformProvider>{children}</MentionPlatformProvider>;
```

## Exports

### Components

- `MentionRenderer` — Static (read-only) renderer for mention badges
- `MentionEditRenderer` — Edit (interactive) renderer with platform selection

### Context and Data

- `MentionPlatformProvider` — Provider for platform metadata configuration
- `platformMetaMap` — Map of platform names to their metadata (icons, colors, URLs)
- `platformKeys` — Array of all supported platform keys

### Sub-path Exports

| Path                                      | Description                  |
| ----------------------------------------- | ---------------------------- |
| `@haklex/rich-renderer-mention`           | Full exports (edit + static) |
| `@haklex/rich-renderer-mention/static`    | Static-only renderer         |
| `@haklex/rich-renderer-mention/style.css` | Stylesheet                   |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
