# @haklex/rich-agent-chat

Chat panel UI for AI agent interaction in the Haklex rich editor. Built on `@haklex/rich-agent-core`, it provides a ready-to-use chat interface with streaming message rendering, tool call visualization, and agent store integration.

## Installation

```bash
pnpm add @haklex/rich-agent-chat
```

## Peer Dependencies

| Package                   | Version   |
| ------------------------- | --------- |
| `@haklex/rich-agent-core` | workspace |
| `@haklex/rich-diff-core`  | workspace |
| `react`                   | `>=19`    |
| `react-dom`               | `>=19`    |

## Usage

### Basic chat panel

```tsx
import { ChatPanel, AgentStoreProvider, useAgentStore } from '@haklex/rich-agent-chat';
import '@haklex/rich-agent-chat/style.css';
import { createAgentStore } from '@haklex/rich-agent-core';

function EditorWithAgent() {
  const store = useMemo(() => createAgentStore(initialState), []);

  return (
    <AgentStoreProvider store={store}>
      <RichEditor>{/* editor plugins */}</RichEditor>
      <ChatPanel />
    </AgentStoreProvider>
  );
}
```

### Accessing the agent store

```tsx
import { useAgentStore } from '@haklex/rich-agent-chat';

function MyComponent() {
  const messages = useAgentStore((s) => s.messages);
  const status = useAgentStore((s) => s.status);

  return <div>Status: {status}</div>;
}
```

## Exports

### Components

| Export            | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| `ChatPanel`       | Full chat panel with message list, input, and tool call display |
| `ChatMessageList` | Renders a list of chat messages                                 |
| `ChatInput`       | Text input with send button and model selection                 |

### Context

| Export                     | Description                                  |
| -------------------------- | -------------------------------------------- |
| `AgentStoreProvider`       | React context provider for the agent store   |
| `useAgentStore(selector?)` | Zustand hook to access the agent store state |

### Types

| Export          | Description                                  |
| --------------- | -------------------------------------------- |
| `ChatBubble`    | Chat message display type                    |
| `ModelOption`   | AI model selection option                    |
| `ProviderGroup` | Grouped provider options for model selection |
| `SelectedModel` | Selected model with provider info            |

### Sub-path Exports

| Import Path                         | Description                                 |
| ----------------------------------- | ------------------------------------------- |
| `@haklex/rich-agent-chat`           | Full exports (components + context + types) |
| `@haklex/rich-agent-chat/style.css` | Compiled chat panel stylesheet              |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
