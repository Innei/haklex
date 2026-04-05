# Agent Selection Awareness

Add block selection and text selection awareness to the AI agent's context pipeline, so the LLM understands what the user has selected when processing requests.

## Goals

- The agent automatically receives selection context when the user sends a message with an active selection
- Block selection: selected blocks are annotated inline in the document XML (`selected="true"`)
- Text selection: a `<text_selection>` section is injected with offset metadata and containing block XML
- Quick-action triggers (floating toolbar, slash menu) compose prompts that flow through the same auto-capture pipeline
- No new tools — existing `replace_node` / `insert_node` / `delete_node` are sufficient

## Non-Goals

- UI for quick-action buttons (floating toolbar "Ask AI" button, etc.) — separate task
- New selection-specific tools (`replace_selection`, etc.)
- Selection awareness in the static renderer

## Package Impact

| Package                     | Change                                                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `@haklex/rich-agent-core`   | New `CapturedSelection` type, `textSelection` field on `MessageEngineContext`, `selectedBlockIds` option on `DocumentContextOptions` |
| `@haklex/rich-litexml`      | `XmlSerializerOptions.selectedBlockIds` — serializer annotates matching blocks with `selected="true"`                                |
| `@haklex/rich-ext-ai-agent` | `TextSelectionInjector` in message engine, selection capture in `useAgentLoop`, system prompt update                                 |

## Design

### 1. Data Types (`@haklex/rich-agent-core`)

New `CapturedSelection` union type:

```typescript
type CapturedSelection =
  | { type: 'block'; blockIds: string[] }
  | {
      type: 'text';
      text: string;
      anchorBlockId: string;
      anchorOffset: number;
      focusBlockId: string;
      focusOffset: number;
    };
```

- **Block selection**: `blockId`s of selected top-level blocks, mapped from Lexical `NodeSelection` keys via `blockIdState`. Only direct children of `$getRoot()` are included — single-decorator `NodeSelection`s (code block click, image click) are ignored.
- **Text selection**: selected text string plus anchor/focus positions as `(blockId, offset)` pairs where offset is a character index into the block's `getTextContent()` (the concatenation of all descendant text nodes within that block).

New `CapturedTextSelection` type for the message engine context:

```typescript
type CapturedTextSelection = {
  text: string;
  anchorBlockId: string;
  anchorOffset: number;
  focusBlockId: string;
  focusOffset: number;
  containingBlocksXml: string;
};
```

New field on `MessageEngineContext`:

```typescript
type MessageEngineContext = {
  // ... existing fields ...
  textSelection?: CapturedTextSelection;
};
```

New field on `DocumentContextOptions`:

```typescript
type DocumentContextOptions = {
  // ... existing fields ...
  selectedBlockIds?: Set<string>;
};
```

### 2. Selection Capture (`useAgentLoop`)

Inside `run()`, after serializing the editor state, the hook reads the current selection:

```typescript
const selection = editor.getEditorState().read(() => {
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
    return blockIds.length ? ({ type: 'block', blockIds } as const) : null;
  }

  if ($isRangeSelection(sel) && !sel.isCollapsed()) {
    // Walk anchor/focus up to top-level parent blocks
    // Compute text offsets relative to block's getTextContent()
    // (adapt logic from buildRangeAnchor in comment-anchor.ts)
    return {
      type: 'text',
      text: sel.getTextContent(),
      anchorBlockId,
      anchorOffset,
      focusBlockId,
      focusOffset,
    } as const;
  }

  return null;
});
```

For text selection offset computation: the Lexical anchor/focus `offset` is relative to the immediate text node. We walk from the block's first descendant text position to the anchor/focus point and accumulate character offsets, producing an index into `block.getTextContent()`. This is similar to `buildRangeAnchor` in `comment-anchor.ts`.

For cross-block text selections (anchor and focus in different top-level blocks): iterate `$getRoot().getChildren()` from the anchor's block to the focus's block inclusive to collect all containing block IDs.

The captured selection is passed to `processWithEditor`:

```typescript
const preparedMessages = messageEngine.processWithEditor({
  editorState: serialized,
  userInput,
  selection,
});
```

### 3. LiteXML Serializer Changes (`@haklex/rich-litexml`)

`XmlSerializerOptions` gains:

```typescript
type XmlSerializerOptions = {
  compact?: boolean;
  selectedBlockIds?: Set<string>;
};
```

After a writer produces an `XmlElement` for a top-level node, the serializer checks if that node's `$.blockId` is in `selectedBlockIds`. If yes, it patches `selected="true"` onto the element's attributes. Individual writers remain unchanged.

Result in document XML:

```xml
<doc>
  <h1 id="abc">Title</h1>
  <p id="def" selected="true">This paragraph is block-selected</p>
  <p id="ghi" selected="true">This one too</p>
  <p id="jkl">This one is not selected</p>
</doc>
```

`buildDocumentContext` in `@haklex/rich-agent-core` passes selection through:

```typescript
buildDocumentContext(editorState, {
  mode: 'full',
  compact: true,
  selectedBlockIds: selection?.type === 'block' ? new Set(selection.blockIds) : undefined,
});
```

### 4. TextSelectionInjector (`@haklex/rich-ext-ai-agent`)

New `TextSelectionInjector` class extending `BaseLastUserContentProvider`, added to the `AgentMessagesEngine` processor chain.

Injector output format (injected into last user message):

```xml
<text_selection>
  <selected_text>the words the user highlighted</selected_text>
  <anchor blockId="abc123" offset="15" />
  <focus blockId="abc123" offset="42" />
  <containing_blocks>
    <p id="abc123">Full paragraph text with <b>formatting</b> preserved</p>
  </containing_blocks>
</text_selection>
```

For cross-block selections, `containing_blocks` includes all top-level blocks from the anchor's block to the focus's block inclusive (iterating `$getRoot().getChildren()` in document order).

Processor chain order in `AgentMessagesEngine`:

```typescript
super([
  new DefaultSystemRoleInjector(...),
  new DocumentToolSystemInjector(...),
  new PageSelectionsInjector(),      // existing: explicit user-attached selections
  new TextSelectionInjector(),       // new: auto-captured text selection
  new PageEditorContextInjector(),
]);
```

### 5. `processWithEditor` API Changes

Method signature expands:

```typescript
processWithEditor(params: {
  editorState: SerializedEditorState;
  userInput: string;
  title?: string;
  selection?: CapturedSelection | null;
}): PreparedMessages
```

Routing logic inside:

- **Block selection** → `selectedBlockIds` passed to `buildDocumentContext` so the serializer marks blocks inline
- **Text selection** → containing blocks extracted from serialized state by matching `$.blockId`, serialized to XML via `serializeNodesToXml`, packaged as `CapturedTextSelection` and set on the engine context for `TextSelectionInjector`

Helper function `buildTextSelectionContext(editorState, textSelection)` handles extracting containing block nodes and serializing them.

### 6. System Prompt Updates

New section appended to `document-tool-system-role.md`:

```markdown
## Selection Context

The system may inject selection context when the user has an active selection in the editor.

### Block Selection

When the user has selected entire blocks, those blocks appear in the document XML
with a `selected="true"` attribute. The user's request likely pertains to these blocks.
Use the block IDs from the selected blocks when performing edits.

### Text Selection

When the user has selected a text range, a `<text_selection>` section is injected containing:

- `<selected_text>`: the exact text the user highlighted
- `<anchor>` and `<focus>`: the start and end points of the selection, with `blockId` and
  character `offset` within that block
- `<containing_blocks>`: the full XML of the block(s) that contain the selection

When editing in response to a text selection, use `replace_node` on the containing block,
preserving content outside the selection range while modifying the selected portion.
```

No changes to `default-system-role.md`.

### 7. Quick-Action Triggers

The existing `builtInActions` registry has `edit-selection` with `when: 'selection'` and `placement: ['floating']`. When a quick-action is triggered:

1. The action's `prompt` function is evaluated with the current `AgentContext`
2. `useAgentLoop.run(composedPrompt)` is called — auto-capture in `run()` handles selection plumbing

No changes needed to the action registry or `AgentContext` type. New selection-aware actions (e.g., "Summarize selected blocks") are added to `builtInActions` with `when: 'selection'` — the injection pipeline handles the rest.

UI wiring for action buttons is a separate task.

## Data Flow Summary

```
User hits Send (with active selection)
  │
  ├─ useAgentLoop.run(userInput)
  │    │
  │    ├─ editor.getEditorState().toJSON()        → serialized state
  │    ├─ editor.getEditorState().read(...)        → CapturedSelection
  │    │
  │    └─ messageEngine.processWithEditor({
  │         editorState, userInput, selection
  │       })
  │         │
  │         ├─ Block selection path:
  │         │    buildDocumentContext(state, { selectedBlockIds })
  │         │      → serializeToXml(state, registry, { selectedBlockIds })
  │         │        → <p id="x" selected="true">...</p> in <doc>
  │         │
  │         ├─ Text selection path:
  │         │    buildTextSelectionContext(state, selection)
  │         │      → CapturedTextSelection { ..., containingBlocksXml }
  │         │        → set on engine context
  │         │          → TextSelectionInjector picks up
  │         │            → <text_selection>...</text_selection> in user msg
  │         │
  │         └─ this.process(context) → PreparedMessages → LLM
```
