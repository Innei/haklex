# @haklex/rich-ext-poll

Reader-facing vote/poll widget extension. Single- or multi-choice polls with optional close time and result-visibility policy for the Haklex rich editor.

## Installation

```bash
pnpm add @haklex/rich-ext-poll
```

## Peer Dependencies

| Package                  | Version   |
| ------------------------ | --------- |
| `@haklex/rich-editor`    | workspace |
| `@haklex/rich-editor-ui` | workspace |
| `lexical`                | `^0.45.0` |
| `lucide-react`           | `^1.0.0`  |
| `react`                  | `>=19`    |

## Usage

### Register nodes

Editor (read + write):

```ts
import { pollEditNodes } from '@haklex/rich-ext-poll/edit';

const editorConfig = { nodes: [...pollEditNodes] };
```

Static / read-only:

```ts
import { pollNodes } from '@haklex/rich-ext-poll/node';

const staticConfig = { nodes: [...pollNodes] };
```

### Provide a data adapter

The renderer reads tallies and submits votes through a `PollDataAdapter`. Wrap the renderer with `PollDataProvider`:

```tsx
import { PollDataProvider } from '@haklex/rich-ext-poll/renderer';

<PollDataProvider adapter={myAdapter} initialStates={initial}>
  <RichRenderer value={state} />
</PollDataProvider>;
```

Without an adapter the renderer falls back to a static read-only display.

### Extract poll metadata for SSR

```ts
import { extractPolls } from '@haklex/rich-ext-poll/node';

const polls = extractPolls(serializedEditorState);
```

### Tree-shake the default renderer

The default `PollRenderer` is **not** statically imported by `PollNode`. To keep it out of your bundle, register only `pollNodes` and supply your own renderer through `RendererConfig`:

```ts
import { POLL_NODE_KEY, pollNodes } from '@haklex/rich-ext-poll/node';
import type { RichRendererModule } from '@haklex/rich-compose';

const lightPollModule: RichRendererModule = {
  name: 'poll',
  nodes: pollNodes,
  renderers: { [POLL_NODE_KEY]: MyLightPollRenderer },
};
```

`@haklex/rich-compose` ships a `pollModule` that lazy-loads the default renderer via `lazyRenderers`; importing the module above instead keeps the heavy default chunk out entirely.

### Import styles

```ts
import '@haklex/rich-ext-poll/style.css';
```

## Exports

### Nodes

| Export                                | Description                                     |
| ------------------------------------- | ----------------------------------------------- |
| `PollNode`                            | Static (read-only) poll node                    |
| `PollEditNode`                        | Edit-mode poll node with interactive UI         |
| `$createPollNode()` / `$isPollNode()` | Lexical helpers                                 |
| `pollNodes`                           | Array of static nodes for config registration   |
| `pollEditNodes`                       | Array of edit nodes for config registration     |
| `extractPolls(state)`                 | Extract poll metadata from editor state for SSR |

### Renderers

| Export              | Description                                 |
| ------------------- | ------------------------------------------- |
| `PollRenderer`      | Static poll renderer with vote display      |
| `PollEditDecorator` | Edit-mode decorator with poll configuration |
| `PollDataProvider`  | Context provider for vote tally adapter     |
| `usePollData()`     | Hook to access poll data context            |

### Slot Key

| Export          | Description                                        |
| --------------- | -------------------------------------------------- |
| `POLL_NODE_KEY` | `'Poll'` constant for `RendererConfig` slot lookup |

### Types

| Export               | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `PollChoice`         | Individual poll choice type                          |
| `PollConfig`         | Poll configuration (choices, close time, visibility) |
| `PollDataAdapter`    | Adapter interface for vote submission and tally      |
| `SerializedPollNode` | Serialized poll node type                            |

### Sub-path Exports

| Path                              | Description                                               |
| --------------------------------- | --------------------------------------------------------- |
| `@haklex/rich-ext-poll`           | Full exports (node + renderer + edit)                     |
| `@haklex/rich-ext-poll/node`      | Lightweight node + slot key + types — no default renderer |
| `@haklex/rich-ext-poll/renderer`  | Default `PollRenderer` (heavy) + `PollDataProvider`       |
| `@haklex/rich-ext-poll/edit`      | Edit-mode node + `PollEditDecorator`                      |
| `@haklex/rich-ext-poll/static`    | Convenience: node + renderer (SSR bundle)                 |
| `@haklex/rich-ext-poll/style.css` | Stylesheet                                                |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
