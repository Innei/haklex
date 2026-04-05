# Agent Selection Awareness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add block selection and text selection awareness to the AI agent context pipeline so the LLM sees what the user has selected.

**Architecture:** A unified `SelectionContextInjector` approach: block selection is marked inline in document XML via the LiteXML serializer (`selected="true"` attribute), text selection is injected as a separate `<text_selection>` section by a new `TextSelectionInjector` in the message engine. Selection is auto-captured from the editor at send time inside `useAgentLoop.run()`.

**Tech Stack:** TypeScript, Lexical 0.42, Vitest, `@haklex/rich-litexml`, `@haklex/rich-agent-core`, `@haklex/rich-ext-ai-agent`

**Spec:** `docs/superpowers/specs/2026-04-06-agent-selection-awareness-design.md`

---

## File Structure

| File                                                                  | Responsibility                                                                                                     |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `packages/rich-agent-core/src/protocol.ts`                            | New `CapturedSelection`, `CapturedTextSelection` types; extend `MessageEngineContext` and `DocumentContextOptions` |
| `packages/rich-agent-core/src/index.ts`                               | Export new types                                                                                                   |
| `packages/rich-litexml/src/serializer.ts`                             | Accept `selectedBlockIds` option, patch `selected="true"` on matching top-level blocks                             |
| `packages/rich-litexml/tests/serializer.test.ts`                      | Tests for `selectedBlockIds` behavior                                                                              |
| `packages/rich-agent-core/src/document-context.ts`                    | Forward `selectedBlockIds` to `serializeToXml`                                                                     |
| `packages/rich-editor/src/utils/comment-anchor.ts`                    | Export `$getRootBlock`, `$resolveSelectionPoint`, `$getTextOffsetInBlock`                                          |
| `packages/rich-editor/src/index.ts`                                   | Re-export new utilities                                                                                            |
| `packages/rich-ext-ai-agent/src/messageEngine.ts`                     | `TextSelectionInjector` class, `buildTextSelectionContext` helper, `processWithEditor` update                      |
| `packages/rich-ext-ai-agent/src/hooks/useAgentLoop.ts`                | Capture editor selection at send time                                                                              |
| `packages/rich-ext-ai-agent/src/prompts/document-tool-system-role.md` | Selection Context section                                                                                          |

---

### Task 1: Add Types to `@haklex/rich-agent-core`

**Files:**

- Modify: `packages/rich-agent-core/src/protocol.ts`
- Modify: `packages/rich-agent-core/src/index.ts`

- [ ] **Step 1: Add `CapturedSelection` and `CapturedTextSelection` types to `protocol.ts`**

In `packages/rich-agent-core/src/protocol.ts`, add after the `PageSelection` type (around line 62):

```typescript
export type CapturedSelection =
  | { type: 'block'; blockIds: string[] }
  | {
      type: 'text';
      text: string;
      anchorBlockId: string;
      anchorOffset: number;
      focusBlockId: string;
      focusOffset: number;
    };

export type CapturedTextSelection = {
  text: string;
  anchorBlockId: string;
  anchorOffset: number;
  focusBlockId: string;
  focusOffset: number;
  containingBlocksXml: string;
};
```

- [ ] **Step 2: Add `selectedBlockIds` to `DocumentContextOptions`**

In the same file, add to `DocumentContextOptions` (around line 52):

```typescript
export type DocumentContextOptions = {
  compact?: boolean;
  mode: 'full' | 'structure' | 'selection-window';
  selectedBlockIds?: Set<string>;
  windowSize?: number;
};
```

- [ ] **Step 3: Add `textSelection` to `MessageEngineContext`**

In the same file, add to `MessageEngineContext` (around line 91):

```typescript
export type MessageEngineContext = {
  messages: ChatMessage[];
  pageContentContext?: PageContentContext;
  initialContext?: MessageEngineInitialContext;
  stepContext?: MessageEngineStepContext;
  textSelection?: CapturedTextSelection;
};
```

- [ ] **Step 4: Export new types from `index.ts`**

In `packages/rich-agent-core/src/index.ts`, add `CapturedSelection` and `CapturedTextSelection` to the type exports from `'./protocol'`:

```typescript
export type {
  AgentToolConfig,
  AgentToolResult,
  CapturedSelection,
  CapturedTextSelection,
  ChatMessage,
  DocumentContextOptions,
  // ... rest of existing exports
} from './protocol';
```

- [ ] **Step 5: Verify typecheck**

Run: `npx tsc --noEmit -p packages/rich-agent-core/tsconfig.json`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add packages/rich-agent-core/src/protocol.ts packages/rich-agent-core/src/index.ts
git commit -m "feat(agent-core): add CapturedSelection types and selection-aware context options"
```

---

### Task 2: LiteXML Serializer — `selectedBlockIds` Support

**Files:**

- Modify: `packages/rich-litexml/src/serializer.ts`
- Test: `packages/rich-litexml/tests/serializer.test.ts`

- [ ] **Step 1: Write failing tests for `selectedBlockIds`**

In `packages/rich-litexml/tests/serializer.test.ts`, add inside the `describe('serializeToXml', ...)` block:

```typescript
it('adds selected="true" to top-level blocks whose blockId is in selectedBlockIds', () => {
  const registry = new LitexmlRegistry();
  registry.registerWriter('paragraph', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'p',
      attrs: n.$?.blockId ? { id: n.$.blockId } : {},
      children: ctx.serializeChildren(n.children ?? []),
    };
  });
  const state = makeState([
    {
      type: 'paragraph',
      $: { blockId: 'p1' },
      children: [
        {
          type: 'text',
          text: 'first',
          format: 0,
          detail: 0,
          mode: 'normal',
          style: '',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      textFormat: 0,
      textStyle: '',
      version: 1,
    },
    {
      type: 'paragraph',
      $: { blockId: 'p2' },
      children: [
        {
          type: 'text',
          text: 'second',
          format: 0,
          detail: 0,
          mode: 'normal',
          style: '',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      textFormat: 0,
      textStyle: '',
      version: 1,
    },
    {
      type: 'paragraph',
      $: { blockId: 'p3' },
      children: [
        {
          type: 'text',
          text: 'third',
          format: 0,
          detail: 0,
          mode: 'normal',
          style: '',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      textFormat: 0,
      textStyle: '',
      version: 1,
    },
  ]);
  const xml = serializeToXml(state, registry, {
    compact: true,
    selectedBlockIds: new Set(['p1', 'p3']),
  });
  expect(xml).toBe(
    '<doc><p id="p1" selected="true">first</p><p id="p2">second</p><p id="p3" selected="true">third</p></doc>',
  );
});

it('does not add selected to nodes without blockId even if selectedBlockIds is provided', () => {
  const registry = new LitexmlRegistry();
  registry.registerWriter('paragraph', (_node, ctx) => {
    return { tag: 'p', children: ctx.serializeChildren((_node as any).children ?? []) };
  });
  const state = makeState([
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          text: 'no id',
          format: 0,
          detail: 0,
          mode: 'normal',
          style: '',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      textFormat: 0,
      textStyle: '',
      version: 1,
    },
  ]);
  const xml = serializeToXml(state, registry, {
    compact: true,
    selectedBlockIds: new Set(['nonexistent']),
  });
  expect(xml).toBe('<doc><p>no id</p></doc>');
});

it('does not add selected when selectedBlockIds is undefined', () => {
  const registry = new LitexmlRegistry();
  registry.registerWriter('paragraph', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'p',
      attrs: n.$?.blockId ? { id: n.$.blockId } : {},
      children: ctx.serializeChildren(n.children ?? []),
    };
  });
  const state = makeState([
    {
      type: 'paragraph',
      $: { blockId: 'p1' },
      children: [
        {
          type: 'text',
          text: 'hello',
          format: 0,
          detail: 0,
          mode: 'normal',
          style: '',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      textFormat: 0,
      textStyle: '',
      version: 1,
    },
  ]);
  const xml = serializeToXml(state, registry, { compact: true });
  expect(xml).toBe('<doc><p id="p1">hello</p></doc>');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run packages/rich-litexml/tests/serializer.test.ts`
Expected: The first test fails (no `selectedBlockIds` option exists yet)

- [ ] **Step 3: Change `XmlSerializerOptions` from type alias to interface**

In `packages/rich-litexml/src/serializer.ts`, change line 8 from:

```typescript
export type XmlSerializerOptions = XmlRenderOptions;
```

to:

```typescript
export interface XmlSerializerOptions extends XmlRenderOptions {
  selectedBlockIds?: Set<string>;
}
```

- [ ] **Step 4: Patch `selected="true"` on matching top-level blocks**

In `packages/rich-litexml/src/serializer.ts`, replace the `serializeToXml` function body. The key change: process each child inside the `flatMap` callback so we always know which source node produced which content, then add `selected="true"` to matching blocks:

```typescript
export function serializeToXml(
  state: SerializedEditorState,
  registry: LitexmlRegistry,
  options: XmlSerializerOptions = {},
): string {
  const root = state.root as any;
  const children: SerializedLexicalNode[] = root.children ?? [];
  const selectedBlockIds = options.selectedBlockIds;

  const ctx = createWriterContext(registry);
  const content = children.flatMap((child) => {
    const result = ctx.serializeNode(child);
    const items = Array.isArray(result) ? result : [result];

    if (!selectedBlockIds?.size) return items;

    const blockId = (child as any).$?.blockId;
    if (!blockId || !selectedBlockIds.has(blockId)) return items;

    return items.map((item): XmlContent => {
      if (typeof item === 'string' || 'cdata' in item) return item;
      return { ...item, attrs: { ...item.attrs, selected: 'true' } };
    });
  });

  if (options.compact) {
    return `<doc>${renderXml(content, 0, options)}</doc>`;
  }

  return `<doc>\n${renderXml(content, 1, options)}</doc>\n`;
}
```

This processes each child node individually inside `flatMap`, so we always have the correct source node → content mapping regardless of whether a writer returns a single item or array.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run packages/rich-litexml/tests/serializer.test.ts`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add packages/rich-litexml/src/serializer.ts packages/rich-litexml/tests/serializer.test.ts
git commit -m "feat(rich-litexml): add selectedBlockIds option to mark selected blocks in XML"
```

---

### Task 3: Forward `selectedBlockIds` Through `buildDocumentContext`

**Files:**

- Modify: `packages/rich-agent-core/src/document-context.ts`

- [ ] **Step 1: Pass `selectedBlockIds` from options to `serializeToXml`**

In `packages/rich-agent-core/src/document-context.ts`, update the function:

```typescript
import { createDefaultRegistry, serializeToXml } from '@haklex/rich-litexml';
import type { SerializedEditorState } from 'lexical';

import type { DocumentContextOptions } from './protocol';

export function buildDocumentContext(
  editorState: SerializedEditorState,
  options: DocumentContextOptions,
): string {
  const registry = createDefaultRegistry();
  return serializeToXml(editorState, registry, {
    compact: options.compact ?? true,
    selectedBlockIds: options.selectedBlockIds,
  });
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit -p packages/rich-agent-core/tsconfig.json`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-core/src/document-context.ts
git commit -m "feat(agent-core): forward selectedBlockIds to LiteXML serializer"
```

---

### Task 4: Export Selection Helpers From `@haklex/rich-editor`

**Files:**

- Modify: `packages/rich-editor/src/utils/comment-anchor.ts`
- Modify: `packages/rich-editor/src/index.ts`

- [ ] **Step 1: Export `$getRootBlock`, `$resolveSelectionPoint`, `$getTextOffsetInBlock`**

In `packages/rich-editor/src/utils/comment-anchor.ts`, add `export` to the three functions.

Change (around line 56):

```typescript
function $getRootBlock(node: LexicalNode): ElementNode | null {
```

to:

```typescript
export function $getRootBlock(node: LexicalNode): ElementNode | null {
```

Change (around line 69):

```typescript
function $resolveSelectionPoint(
```

to:

```typescript
export function $resolveSelectionPoint(
```

Change (around line 91):

```typescript
function $getTextOffsetInBlock(
```

to:

```typescript
export function $getTextOffsetInBlock(
```

- [ ] **Step 2: Re-export from `index.ts`**

In `packages/rich-editor/src/index.ts`, update the exports from `comment-anchor`:

```typescript
export type {
  AnchorError,
  AnchorResult,
  BlockAnchor,
  CommentAnchor,
  RangeAnchor,
} from './utils/comment-anchor';
export {
  $getRootBlock,
  $getTextOffsetInBlock,
  $resolveSelectionPoint,
  buildBlockAnchor,
  buildRangeAnchor,
} from './utils/comment-anchor';
```

- [ ] **Step 3: Verify typecheck**

Run: `npx tsc --noEmit -p packages/rich-editor/tsconfig.json`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add packages/rich-editor/src/utils/comment-anchor.ts packages/rich-editor/src/index.ts
git commit -m "feat(rich-editor): export selection offset helpers from comment-anchor"
```

---

### Task 5: `TextSelectionInjector` in Message Engine

**Files:**

- Modify: `packages/rich-ext-ai-agent/src/messageEngine.ts`

- [ ] **Step 1: Add `TextSelectionInjector` class**

In `packages/rich-ext-ai-agent/src/messageEngine.ts`, add a new import for `CapturedTextSelection`:

```typescript
import {
  BaseEveryUserContentProvider,
  BaseLastUserContentProvider,
  BaseSystemRoleProvider,
  BaseSystemRootProvider,
  buildDocumentContext,
  type CapturedTextSelection,
  type ChatMessage,
  type MessageEngineContext,
  MessagesEngine,
  type PageContentContext,
  type PageSelection,
  type PreparedMessages,
} from '@haklex/rich-agent-core';
```

Add the `TextSelectionInjector` class after `PageSelectionsInjector` (around line 133):

```typescript
class TextSelectionInjector extends BaseLastUserContentProvider {
  protected buildContent(context: MessageEngineContext) {
    const textSelection = context.textSelection;
    if (!textSelection) return null;

    const formatted = formatTextSelection(textSelection);
    if (!formatted) return null;

    return {
      content: formatted,
      contextType: 'text_selection',
    };
  }
}
```

Add the `formatTextSelection` helper function alongside the existing `formatPageSelections`:

```typescript
function formatTextSelection(selection: CapturedTextSelection): string {
  return `<text_selection>
<selected_text>${selection.text}</selected_text>
<anchor blockId="${selection.anchorBlockId}" offset="${selection.anchorOffset}" />
<focus blockId="${selection.focusBlockId}" offset="${selection.focusOffset}" />
<containing_blocks>
${selection.containingBlocksXml}
</containing_blocks>
</text_selection>`;
}
```

- [ ] **Step 2: Register `TextSelectionInjector` in processor chain**

In the `AgentMessagesEngine` constructor (around line 152), add the new injector:

```typescript
export class AgentMessagesEngine extends MessagesEngine {
  constructor(options: AgentMessagesEngineOptions = {}) {
    super([
      new DefaultSystemRoleInjector(normalizeSystemMessages(options.systemMessages)),
      new DocumentToolSystemInjector(options.toolSystemRole ?? defaultDocumentToolSystemRole),
      new PageSelectionsInjector(),
      new TextSelectionInjector(),
      new PageEditorContextInjector(),
    ]);
  }
```

- [ ] **Step 3: Verify typecheck**

Run: `npx tsc --noEmit -p packages/rich-ext-ai-agent/tsconfig.json`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add packages/rich-ext-ai-agent/src/messageEngine.ts
git commit -m "feat(ai-agent): add TextSelectionInjector to message engine pipeline"
```

---

### Task 6: `processWithEditor` API Update

**Files:**

- Modify: `packages/rich-ext-ai-agent/src/messageEngine.ts`

- [ ] **Step 1: Add `buildTextSelectionContext` helper**

In `packages/rich-ext-ai-agent/src/messageEngine.ts`, add these imports:

```typescript
import { createDefaultRegistry, serializeNodesToXml } from '@haklex/rich-litexml';
```

And add `CapturedSelection` to the existing `@haklex/rich-agent-core` import.

Add the helper function:

```typescript
function buildTextSelectionContext(
  editorState: SerializedEditorState,
  selection: Extract<CapturedSelection, { type: 'text' }>,
): CapturedTextSelection {
  const root = editorState.root as any;
  const children: any[] = root.children ?? [];

  const blockIds = new Set<string>();
  blockIds.add(selection.anchorBlockId);
  blockIds.add(selection.focusBlockId);

  // For cross-block selections, collect all blocks between anchor and focus
  if (selection.anchorBlockId !== selection.focusBlockId) {
    let inRange = false;
    for (const child of children) {
      const blockId = child.$?.blockId;
      if (blockId === selection.anchorBlockId || blockId === selection.focusBlockId) {
        blockIds.add(blockId);
        if (inRange) break;
        inRange = true;
      } else if (inRange && blockId) {
        blockIds.add(blockId);
      }
    }
  }

  const containingNodes = children.filter((child) => {
    const blockId = child.$?.blockId;
    return blockId && blockIds.has(blockId);
  });

  const registry = createDefaultRegistry();
  const containingBlocksXml = serializeNodesToXml(containingNodes, registry, { compact: true });

  return {
    text: selection.text,
    anchorBlockId: selection.anchorBlockId,
    anchorOffset: selection.anchorOffset,
    focusBlockId: selection.focusBlockId,
    focusOffset: selection.focusOffset,
    containingBlocksXml,
  };
}
```

- [ ] **Step 2: Update `processWithEditor` to accept and route selection**

Modify the `processWithEditor` method:

```typescript
processWithEditor(params: {
  editorState: SerializedEditorState;
  userInput: string;
  title?: string;
  selection?: CapturedSelection | null;
}): PreparedMessages {
  const userMessage: Extract<ChatMessage, { role: 'user' }> = {
    role: 'user',
    content: params.userInput,
    cacheBreakpoint: true,
  };

  const selectedBlockIds =
    params.selection?.type === 'block'
      ? new Set(params.selection.blockIds)
      : undefined;

  const textSelection =
    params.selection?.type === 'text'
      ? buildTextSelectionContext(params.editorState, params.selection)
      : undefined;

  return this.process({
    messages: [userMessage],
    pageContentContext: {
      metadata: { title: params.title ?? 'Current Document' },
      xml: buildDocumentContext(params.editorState, {
        mode: 'full',
        compact: true,
        selectedBlockIds,
      }),
    },
    textSelection,
  });
}
```

- [ ] **Step 3: Verify typecheck**

Run: `npx tsc --noEmit -p packages/rich-ext-ai-agent/tsconfig.json`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add packages/rich-ext-ai-agent/src/messageEngine.ts
git commit -m "feat(ai-agent): route selection through processWithEditor to injectors"
```

---

### Task 7: Selection Capture in `useAgentLoop`

**Files:**

- Modify: `packages/rich-ext-ai-agent/src/hooks/useAgentLoop.ts`

- [ ] **Step 1: Add selection capture imports**

In `packages/rich-ext-ai-agent/src/hooks/useAgentLoop.ts`, add imports:

```typescript
import {
  type AgentStore,
  type AgentToolConfig,
  type CapturedSelection,
  type ChatMessage,
  createAgentExecutor,
  createReviewBatch,
  createSnapshot,
  type LLMProvider,
} from '@haklex/rich-agent-core';
import { $getRootBlock, $getTextOffsetInBlock, $resolveSelectionPoint } from '@haklex/rich-editor';
import { blockIdState } from '@haklex/rich-editor/plugins';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getRoot,
  $getSelection,
  $getState,
  $isNodeSelection,
  $isRangeSelection,
  type SerializedEditorState,
} from 'lexical';
import { useCallback, useRef } from 'react';
```

- [ ] **Step 2: Add `$captureSelection` helper function**

Add before the `useAgentLoop` function:

```typescript
function $captureSelection(): CapturedSelection | null {
  const sel = $getSelection();
  const root = $getRoot();

  if ($isNodeSelection(sel)) {
    const rootChildKeys = new Set(root.getChildrenKeys());
    const blockIds: string[] = [];
    for (const node of sel.getNodes()) {
      if (!rootChildKeys.has(node.getKey())) continue;
      const blockId = $getState(node, blockIdState);
      if (blockId) blockIds.push(blockId);
    }
    return blockIds.length ? { type: 'block', blockIds } : null;
  }

  if ($isRangeSelection(sel) && !sel.isCollapsed()) {
    const anchorBlock = $getRootBlock(sel.anchor.getNode());
    const focusBlock = $getRootBlock(sel.focus.getNode());
    if (!anchorBlock || !focusBlock) return null;

    const anchorBlockId = $getState(anchorBlock, blockIdState);
    const focusBlockId = $getState(focusBlock, blockIdState);
    if (!anchorBlockId || !focusBlockId) return null;

    const anchorPoint = $resolveSelectionPoint(sel, 'anchor');
    const focusPoint = $resolveSelectionPoint(sel, 'focus');

    const anchorOffset = $getTextOffsetInBlock(anchorBlock, anchorPoint.node, anchorPoint.offset);
    const focusOffset = $getTextOffsetInBlock(focusBlock, focusPoint.node, focusPoint.offset);

    return {
      type: 'text',
      text: sel.getTextContent(),
      anchorBlockId,
      anchorOffset,
      focusBlockId,
      focusOffset,
    };
  }

  return null;
}
```

- [ ] **Step 3: Wire capture into `run()`**

In the `run` callback, after the existing `const serialized = editor.getEditorState().toJSON()` line, add selection capture and pass it to `processWithEditor`:

```typescript
const run = useCallback(
  async (userInput: string) => {
    try {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const serialized = editor.getEditorState().toJSON() as SerializedEditorState;
      const snapshot = createSnapshot(serialized);

      const selection = editor.getEditorState().read(() => $captureSelection());

      const messageEngine =
        options.messageEngine ??
        new AgentMessagesEngine({ systemMessages: options.systemMessages });
      const preparedMessages = messageEngine.processWithEditor({
        editorState: serialized,
        userInput,
        selection,
      });

      // ... rest of executor setup unchanged ...
```

- [ ] **Step 4: Verify typecheck**

Run: `npx tsc --noEmit -p packages/rich-ext-ai-agent/tsconfig.json`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add packages/rich-ext-ai-agent/src/hooks/useAgentLoop.ts
git commit -m "feat(ai-agent): capture editor selection at send time in useAgentLoop"
```

---

### Task 8: System Prompt Update

**Files:**

- Modify: `packages/rich-ext-ai-agent/src/prompts/document-tool-system-role.md`

- [ ] **Step 1: Append Selection Context section**

Add the following to the end of `packages/rich-ext-ai-agent/src/prompts/document-tool-system-role.md`:

```markdown
## Selection Context

The system may inject selection context when the user has an active selection in the editor.

### Block Selection

When the user has selected entire blocks, those blocks appear in the document XML with a `selected="true"` attribute. The user's request likely pertains to these blocks. Use the block IDs from the selected blocks when performing edits.

### Text Selection

When the user has selected a text range, a `<text_selection>` section is injected containing:

- `<selected_text>`: the exact text the user highlighted
- `<anchor>` and `<focus>`: the start and end points of the selection, with `blockId` and character `offset` within that block
- `<containing_blocks>`: the full XML of the block(s) that contain the selection

When editing in response to a text selection, use `replace_node` on the containing block, preserving content outside the selection range while modifying the selected portion.
```

- [ ] **Step 2: Commit**

```bash
git add packages/rich-ext-ai-agent/src/prompts/document-tool-system-role.md
git commit -m "docs(ai-agent): add selection context guidance to system prompt"
```

---

### Task 9: Verify Full Build

**Files:** None (verification only)

- [ ] **Step 1: Run typecheck across all affected packages**

Run: `npx tsc --noEmit -p packages/rich-litexml/tsconfig.json && npx tsc --noEmit -p packages/rich-agent-core/tsconfig.json && npx tsc --noEmit -p packages/rich-ext-ai-agent/tsconfig.json`
Expected: No errors

- [ ] **Step 2: Run LiteXML tests**

Run: `npx vitest run packages/rich-litexml/tests/`
Expected: All tests pass

- [ ] **Step 3: Run agent-core tests**

Run: `npx vitest run packages/rich-agent-core/tests/`
Expected: All tests pass

- [ ] **Step 4: Run lint on changed files**

Run: `npx eslint packages/rich-litexml/src/serializer.ts packages/rich-agent-core/src/protocol.ts packages/rich-agent-core/src/document-context.ts packages/rich-ext-ai-agent/src/messageEngine.ts packages/rich-ext-ai-agent/src/hooks/useAgentLoop.ts packages/rich-editor/src/utils/comment-anchor.ts`
Expected: No errors (or only pre-existing warnings)

- [ ] **Step 5: Run full build**

Run: `pnpm build:packages`
Expected: Build succeeds for all packages
