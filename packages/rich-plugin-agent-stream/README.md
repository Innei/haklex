# @haklex/rich-plugin-agent-stream

Plays agent writes into a Haklex editor as a streaming reveal: the data lands in one update, the plugin reveals the new text character by character with a virtual caret.

## Installation

```bash
pnpm add @haklex/rich-plugin-agent-stream
```

## Usage

```tsx
import '@haklex/rich-plugin-agent-stream/style.css';
import { AgentStreamPlugin } from '@haklex/rich-plugin-agent-stream';

<RichEditor>
  <AgentStreamPlugin agentName="Claude" />
</RichEditor>;
```

With `@haklex/rich-collab-loro`, imports whose changes carry an `agent:` commit message (and are less than 15 seconds old) are played automatically. Older changes, such as those caught up after a reconnect, show at once.

Two things the writer must get right:

- Loro merges consecutive changes from the same peer with the same commit message, and the merged change keeps the first timestamp. A writer that reuses one peer for several agent writes must give each write a distinct message (for example `agent: <summary> #<n>`) or use a fresh peer per write; otherwise playback stops about 15 seconds into the session.
- The window compares the writer's clock with the viewer's. Pass `createLoroBinding(editor, doc, { agentLiveWindowSeconds })` to widen it when clocks may drift.

Without CRDT, wrap the write:

```ts
import { playAgentWrite } from '@haklex/rich-plugin-agent-stream';

playAgentWrite(editor, () => {
  $getRoot().append(paragraph);
});
```

## Props

| Prop               | Default | Meaning                                                    |
| ------------------ | ------- | ---------------------------------------------------------- |
| `agentName`        | `"AI"`  | Label above the caret                                      |
| `charsPerSecond`   | `80`    | Base reveal speed                                          |
| `maxSeconds`       | `3`     | Longest playback of one write; longer writes speed up      |
| `backlogSeconds`   | `6`     | Queued playback beyond this is shown at once               |
| `scrollContainer`  | nearest | Element followed while the caret moves                     |
| `onPlaybackChange` | —       | `({ playing, blockKey })` when playback starts/moves/stops |

Text blocks (paragraph, heading, quote) reveal character by character; other blocks appear when the reveal reaches them. Typing, pasting or clicking in the editor ends playback immediately. Browsers without the CSS Custom Highlight API show writes without playback.

## Peer Dependencies

| Package                    | Version   |
| -------------------------- | --------- |
| `@haklex/rich-style-token` | workspace |
| `@lexical/react`           | `^0.53.0` |
| `@lexical/rich-text`       | `^0.53.0` |
| `lexical`                  | `^0.53.0` |
| `react`                    | `>= 19`   |
| `react-dom`                | `>= 19`   |
