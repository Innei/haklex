# @haklex/rich-ext-chat

Static chat-snapshot blocks for assistant / conversation transcripts. Renders multi-participant message lists with variant-aware bubble styling.

## Installation

```bash
pnpm add @haklex/rich-ext-chat
```

## Peer Dependencies

| Package   | Version   |
| --------- | --------- |
| `lexical` | `^0.44.0` |
| `react`   | `>= 19`   |

## Usage

### Register nodes

Edit (read + write):

```ts
import { chatEditNodes } from '@haklex/rich-ext-chat/edit';

const editorConfig = { nodes: [...chatEditNodes] };
```

Static / read-only:

```ts
import { chatNodes } from '@haklex/rich-ext-chat/node';

const staticConfig = { nodes: [...chatNodes] };
```

### Use renderers

```tsx
import { ChatEditRenderer } from '@haklex/rich-ext-chat/edit';
import { ChatRenderer } from '@haklex/rich-ext-chat/renderer';
```

### Tree-shake the default renderer

```ts
import { CHAT_NODE_KEY, chatNodes } from '@haklex/rich-ext-chat/node';
import type { RichRendererModule } from '@haklex/rich-compose';

const lightModule: RichRendererModule = {
  name: 'chat',
  nodes: chatNodes,
  renderers: { [CHAT_NODE_KEY]: MyLightChat },
};
```

### Import styles

```ts
import '@haklex/rich-ext-chat/style.css';
```

## Exports

### Nodes

- `ChatNode` -- static (read-only) node
- `ChatEditNode` -- edit node
- `$createChatNode()` / `$isChatNode()` -- Lexical helpers
- `chatNodes` -- array of static nodes for config registration
- `chatEditNodes` -- array of edit nodes for config registration

### Renderers

- `ChatRenderer` -- static renderer
- `ChatEditRenderer` -- edit renderer with participant management

### Slot Key

- `CHAT_NODE_KEY` -- `'Chat'` constant for `RendererConfig` slot lookup

### Types

- `ChatMessage`, `ChatParticipant`, `ChatParticipantKind`, `ChatVariant`
- `ChatRendererProps` (also flowed into `RendererConfig.Chat` via module augmentation)
- `SerializedChatNode`

## Sub-path Exports

| Path                              | Description                                               |
| --------------------------------- | --------------------------------------------------------- |
| `@haklex/rich-ext-chat`           | Full exports (node + renderer + edit)                     |
| `@haklex/rich-ext-chat/node`      | Lightweight node + slot key + types — no default renderer |
| `@haklex/rich-ext-chat/renderer`  | Default `ChatRenderer` (heavy)                            |
| `@haklex/rich-ext-chat/edit`      | Edit-mode node + `ChatEditRenderer`                       |
| `@haklex/rich-ext-chat/static`    | Convenience: node + renderer (SSR bundle)                 |
| `@haklex/rich-ext-chat/style.css` | Stylesheet                                                |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
