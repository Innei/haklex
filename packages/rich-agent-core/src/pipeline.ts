import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';

import type { ChatMessage, DocumentContextOptions, MessagePipeline } from './protocol';

export function buildMessages(pipeline: MessagePipeline): ChatMessage[] {
  return [...pipeline.systemMessages, pipeline.actionPrompt, ...pipeline.turns];
}

function extractText(node: SerializedLexicalNode): string {
  const n = node as any;
  if (n.text) return n.text;
  if (n.children) return n.children.map(extractText).join('');
  return '';
}

function formatBlock(node: SerializedLexicalNode, full: boolean): string {
  const n = node as any;
  const blockId = n.$?.blockId ?? 'unknown';
  const type = n.type ?? 'unknown';
  if (full) {
    const text = extractText(node);
    return `[${blockId}] (${type}) ${text}`;
  }
  return `[${blockId}] (${type})`;
}

export function buildDocumentContext(
  editorState: SerializedEditorState,
  options: DocumentContextOptions,
  anchorBlockId?: string,
): string {
  const root = editorState.root as any;
  const children: SerializedLexicalNode[] = root.children ?? [];

  if (options.mode === 'full') {
    return children.map((c) => formatBlock(c, true)).join('\n');
  }

  if (options.mode === 'structure') {
    return children.map((c) => formatBlock(c, false)).join('\n');
  }

  // selection-window mode
  const windowSize = options.windowSize ?? 5;
  const anchorIndex = anchorBlockId
    ? children.findIndex((c) => (c as any).$?.blockId === anchorBlockId)
    : 0;
  const center = anchorIndex >= 0 ? anchorIndex : 0;
  const start = Math.max(0, center - windowSize);
  const end = Math.min(children.length, center + windowSize + 1);

  return children
    .map((c, i) => {
      const inWindow = i >= start && i < end;
      return formatBlock(c, inWindow);
    })
    .join('\n');
}
