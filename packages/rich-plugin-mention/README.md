# @haklex/rich-plugin-mention

Mention typeahead plugin with platform selection for @-mentioning users across platforms (GitHub, Twitter, etc.).

## Installation

```bash
pnpm add @haklex/rich-plugin-mention
```

## Peer Dependencies

| Package          | Version   |
| ---------------- | --------- |
| `@lexical/react` | `^0.45.0` |
| `lexical`        | `^0.45.0` |
| `react`          | `>= 19`   |
| `react-dom`      | `>= 19`   |

## Usage

```tsx
import { MentionMenuPlugin } from '@haklex/rich-plugin-mention';
import '@haklex/rich-plugin-mention/style.css';

function Editor() {
  return (
    <RichEditor>
      <MentionMenuPlugin />
    </RichEditor>
  );
}
```

Typing `@` triggers a typeahead menu where users can select a platform and enter a username. The plugin ships with builtin platform definitions for common services.

```tsx
import { builtinPlatforms, getAllPlatforms, MentionMenuItem } from '@haklex/rich-plugin-mention';
import type { MentionPlatformDef, MentionMenuPluginProps } from '@haklex/rich-plugin-mention';

// Access builtin platforms
const platforms = builtinPlatforms;
const allPlatforms = getAllPlatforms();

// Define a custom platform
const customPlatform: MentionPlatformDef = {
  // ...
};
```

## Exports

| Export                   | Type            | Description                                         |
| ------------------------ | --------------- | --------------------------------------------------- |
| `MentionMenuPlugin`      | Component       | Main plugin component to render inside `RichEditor` |
| `MentionMenuItem`        | Component       | Individual menu item component                      |
| `builtinPlatforms`       | Constant        | Array of builtin platform definitions               |
| `getAllPlatforms`        | Function        | Returns all registered platforms                    |
| `MentionPlatformDef`     | TypeScript type | Platform definition interface                       |
| `MentionMenuPluginProps` | TypeScript type | Props type for `MentionMenuPlugin`                  |

## Sub-path Exports

| Path                                    | Description                                                 |
| --------------------------------------- | ----------------------------------------------------------- |
| `@haklex/rich-plugin-mention`           | Plugin component, menu items, platform utilities, and types |
| `@haklex/rich-plugin-mention/style.css` | Stylesheet                                                  |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
