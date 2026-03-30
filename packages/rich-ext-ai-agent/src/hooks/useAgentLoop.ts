import {
  type AgentStore,
  type AgentToolConfig,
  buildDocumentContext,
  type ChatMessage,
  createAgentExecutor,
  createReviewBatch,
  createSnapshot,
  type LLMProvider,
} from '@haklex/rich-agent-core';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { SerializedEditorState } from 'lexical';
import { useCallback, useRef } from 'react';

import type { AgentActionConfig } from '../registry';

export type UseAgentLoopOptions = {
  provider: LLMProvider;
  store: AgentStore;
  tools?: AgentToolConfig[];
  systemMessages?: ChatMessage[];
};

export function useAgentLoop(options: UseAgentLoopOptions) {
  const [editor] = useLexicalComposerContext();
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (action: AgentActionConfig, userInput: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const serialized = editor.getEditorState().toJSON() as SerializedEditorState;
      const snapshot = createSnapshot(serialized);

      const prompt =
        typeof action.prompt === 'function'
          ? action.prompt({
              selection: null,
              getBlockByBlockId: (id) => snapshot.getBlock(id) ?? null,
              getDocumentStructure: () => serialized.root as any,
            })
          : action.prompt;

      const actionPrompt: ChatMessage = {
        role: 'user',
        content: `${prompt}\n\nUser instruction: ${userInput}`,
        cacheBreakpoint: true,
      };

      const documentMessage: ChatMessage = {
        role: 'user',
        content: `<document>\n${buildDocumentContext(serialized, { mode: 'full' })}</document>`,
      };

      const executor = createAgentExecutor({
        provider: options.provider,
        snapshot,
        store: options.store,
        tools: options.tools ?? [],
        systemMessages: options.systemMessages ?? [
          {
            role: 'system',
            content: `You are an AI editor agent that modifies a rich-text document using structured XML tools.

## Document Format

The document is provided as XML. Each block element has an \`id\` attribute you use to reference it.

### Block elements
- \`<p>\` paragraph
- \`<h1>\` to \`<h6>\` headings
- \`<blockquote>\` block quote
- \`<ul>\` / \`<ol>\` lists with \`<li>\` items. Checklists: \`<ul type="check"><li checked="true">...\`
- \`<hr />\` horizontal rule
- \`<table>\` with \`<tr>\`, \`<th>\`, \`<td>\`
- \`<codeblock lang="...">\` code block
- \`<img src="..." alt="..." />\` image
- \`<video src="..." />\` video
- \`<math display="block">\` block equation (KaTeX)
- \`<mermaid>\` mermaid diagram
- \`<alert type="note|tip|important|warning|caution">\` alert/callout
- \`<banner type="...">\` banner
- \`<details summary="...">\` collapsible section
- \`<linkcard url="..." />\` link card
- \`<embed url="..." />\` embed
- \`<gallery layout="grid|masonry|carousel">\` image gallery with \`<img>\` children
- \`<codesnippet>\` multi-file code with \`<file name="..." lang="...">\` children
- \`<footnotesection>\` with \`<def ref="...">\` children

### Inline elements (inside block elements)
- \`<b>\` bold, \`<i>\` italic, \`<u>\` underline, \`<s>\` strikethrough
- \`<code>\` inline code, \`<mark>\` highlight, \`<sub>\` subscript, \`<sup>\` superscript
- \`<a href="...">\` link
- \`<math>\` inline equation
- \`<mention platform="..." handle="...">\` mention
- \`<tag>\` tag
- \`<comment>\` HTML comment node
- \`<spoiler>\` spoiler text
- \`<ruby rt="...">\` ruby annotation
- \`<footnote ref="..." />\` footnote reference

### Opaque elements
\`<node type="..." data="..." />\` — unrecognized or complex nodes. Do NOT modify these.

## Tool Usage Rules

1. **Use the XML format** for insert_node and replace_node. Write proper block elements, not raw text with \\n.
2. **One block per replace_node call.** If replacing one block with multiple, the first replaces and extras insert after.
3. **insert_node supports multiple blocks** in one call. Write multiple XML elements in the xml parameter.
4. **Preserve document structure.** Don't merge separate paragraphs into one unless explicitly asked.
5. **Keep existing block IDs.** When modifying content within a block, use replace_node with the block's id.
6. **Do not invent block IDs** in your XML output — the system assigns them automatically.
7. **For bulk edits** (e.g. polishing an article), work block-by-block: replace each block that needs changes, delete blocks to remove, insert new blocks where needed.
8. **search_document** finds blocks by text content or type. Use it to locate blocks before modifying.
`,
            cacheBreakpoint: true,
          },
        ],
        signal: controller.signal,
      });

      const result = await executor.run(actionPrompt, documentMessage);

      if (result.operations.length > 0) {
        const revision = options.store.getState().reviewState?.documentRevision ?? 0;
        const batch = createReviewBatch(result.operations, serialized, revision);
        options.store.getState().addReviewBatch(batch);
        options.store.getState().addBubble({ type: 'diff_review', batchId: batch.id });
      }

      return result;
    },
    [editor, options],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { run, abort };
}
