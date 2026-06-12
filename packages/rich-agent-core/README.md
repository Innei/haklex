# @haklex/rich-agent-core

Headless AI agent protocol for Lexical rich text editing. Provides a diff-aware editing engine, document context snapshots, LiteXML-based edits, and a Zustand-backed agent store — all framework-agnostic and UI-free.

## Installation

```bash
pnpm add @haklex/rich-agent-core
```

## Peer Dependencies

| Package               | Version   |
| --------------------- | --------- |
| `@haklex/rich-editor` | workspace |
| `lexical`             | `^0.45.0` |

## Usage

### Create an agent store

```ts
import { createAgentStore, createInitialAgentStoreState } from '@haklex/rich-agent-core';

const store = createAgentStore(
  createInitialAgentStoreState({
    // initial state configuration
  }),
);
```

### Build document context for the agent

```ts
import { buildDocumentContext } from '@haklex/rich-agent-core';

const context = buildDocumentContext(editorState, {
  /* options */
});
```

### Create an agent executor

```ts
import { createAgentExecutor } from '@haklex/rich-agent-core';

const executor = createAgentExecutor({
  store,
  provider: myProvider,
  config: {
    /* executor config */
  },
});

const result = await executor.execute({ prompt: 'Improve this paragraph' });
```

### Create document editing tools

```ts
import { createDocumentTools } from '@haklex/rich-agent-core';

const tools = createDocumentTools({ store, editor });
```

### Create and compare snapshots

```ts
import { createSnapshot, compareBlockContent } from '@haklex/rich-agent-core';

const snapshot = createSnapshot(editorState);
const hasChanged = compareBlockContent(snapshotA, snapshotB);
```

### Use selectors

```ts
import { agentStoreSelectors } from '@haklex/rich-agent-core';

const messages = agentStoreSelectors.messages(store.getState());
const status = agentStoreSelectors.status(store.getState());
```

## Exports

### Agent Store

| Export                                 | Description                              |
| -------------------------------------- | ---------------------------------------- |
| `createAgentStore(state)`              | Create a Zustand agent store             |
| `createInitialAgentStoreState(config)` | Create initial store state               |
| `agentStoreSelectors`                  | Typed selector functions for store state |
| `flattenActions(actions)`              | Flatten nested action groups             |

### Agent Executor

| Export                        | Description                                  |
| ----------------------------- | -------------------------------------------- |
| `createAgentExecutor(config)` | Create an agent executor for running prompts |
| `AgentExecutorConfig`         | Configuration type for the executor          |
| `AgentExecutorResult`         | Result type from executor runs               |

### Document Tools

| Export                                  | Description                                  |
| --------------------------------------- | -------------------------------------------- |
| `createDocumentTools(config)`           | Create document editing tools for the agent  |
| `buildDocumentContext(state, options?)` | Build document context for agent consumption |

### LiteXML Integration

| Export                              | Description                                               |
| ----------------------------------- | --------------------------------------------------------- |
| `createLitexmlEditHandler(config)`  | Create a handler that applies LiteXML edits to the editor |
| `createLitexmlParseHandler(config)` | Create a handler that parses LiteXML from agent responses |
| `createLitexmlRegistry(options?)`   | Create a LiteXML registry for agent use                   |
| `LitexmlRegistryOptions`            | Options for LiteXML registry creation                     |
| `LitexmlRegistryProvider`           | Provider interface for LiteXML registries                 |

### Provider

| Export                          | Description                            |
| ------------------------------- | -------------------------------------- |
| `createProvider(config)`        | Create an AI provider instance         |
| `createDirectTransport(config)` | Create a direct transport adapter      |
| `createProxyTransport(config)`  | Create a proxy transport adapter       |
| `ProviderType`                  | Union type of supported provider types |
| `TransportAdapter`              | Transport adapter interface            |

### Diff & Review

| Export                                   | Description                                   |
| ---------------------------------------- | --------------------------------------------- |
| `createDiffEngine(config)`               | Create a diff engine for edit operations      |
| `createReviewEngine(config)`             | Create a review engine for AI-suggested edits |
| `DiffEngineConfig`, `ReviewEngineConfig` | Configuration types                           |
| `DiffHunk`, `DiffResult`                 | Diff result types                             |
| `ReviewBlock`, `ReviewState`             | Review state types                            |

### Messages Engine

| Export                         | Description                             |
| ------------------------------ | --------------------------------------- |
| `createMessagesEngine(config)` | Create a messages engine for chat state |
| `MessagesEngineConfig`         | Configuration type                      |
| `ChatMessage`, `MessageRole`   | Message types                           |

### Snapshots

| Export                      | Description                            |
| --------------------------- | -------------------------------------- |
| `createSnapshot(state)`     | Create an editor state snapshot        |
| `compareBlockContent(a, b)` | Compare two snapshots by block content |
| `EditorSnapshot`            | Snapshot type                          |

### Types

| Export                                             | Description                       |
| -------------------------------------------------- | --------------------------------- |
| `AgentStore`, `AgentStoreState`, `AgentStoreSlice` | Store types                       |
| `AgentStoreStatus`                                 | Store status enum                 |
| `ChatBubble`                                       | Chat bubble type for UI rendering |
| `ToolCallGroupItem`, `ToolCallItemStatus`          | Tool call type definitions        |
| `StoreSetter`                                      | Store setter function type        |

### Selectors

| Export                          | Description              |
| ------------------------------- | ------------------------ |
| `agentStoreSelectors.messages`  | Get all messages         |
| `agentStoreSelectors.status`    | Get current store status |
| `agentStoreSelectors.session`   | Get current session info |
| `agentStoreSelectors.toolCalls` | Get tool call state      |
| `agentStoreSelectors.diff`      | Get diff review state    |
| `agentStoreSelectors.model`     | Get selected model info  |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
