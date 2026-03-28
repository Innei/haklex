import type { SerializedLexicalNode } from 'lexical';

import type { AgentToolConfig, AgentToolResult } from './protocol';
import type { EditorSnapshot } from './snapshot';
import type { AgentOperation } from './types';

function extractText(node: SerializedLexicalNode): string {
  const n = node as any;
  if (n.text) return n.text;
  if (n.children) return n.children.map(extractText).join('');
  return '';
}

export function createDocumentTools(
  snapshot: EditorSnapshot,
  operations: AgentOperation[],
  readSelection?: () => { text: string; anchorBlockId: string; focusBlockId: string } | null,
): AgentToolConfig[] {
  const readSelectionTool: AgentToolConfig = {
    name: 'read_selection',
    description: 'Read the current text selection and its block IDs',
    parameters: { type: 'object', properties: {} },
    execute: async (): Promise<AgentToolResult> => {
      const sel = readSelection?.();
      if (!sel) {
        return { ok: true, content: 'No selection active.' };
      }
      return {
        ok: true,
        content: JSON.stringify({
          text: sel.text,
          anchorBlockId: sel.anchorBlockId,
          focusBlockId: sel.focusBlockId,
        }),
      };
    },
  };

  const insertNodeTool: AgentToolConfig = {
    name: 'insert_node',
    description: 'Insert a new block node at a position relative to an existing block',
    parameters: {
      type: 'object',
      properties: {
        position: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['after', 'before', 'root'] },
            blockId: { type: 'string' },
            index: { type: 'number' },
          },
          required: ['type'],
        },
        node: { type: 'object' },
      },
      required: ['position', 'node'],
    },
    execute: async (params: unknown): Promise<AgentToolResult> => {
      const { position, node } = params as { position: any; node: SerializedLexicalNode };
      if (position.type !== 'root' && !snapshot.getBlock(position.blockId)) {
        return {
          ok: false,
          error: {
            error: 'block_not_found',
            blockId: position.blockId,
            message: `Block "${position.blockId}" not found in document.`,
          },
        };
      }
      const op: AgentOperation = { op: 'insert', position, node };
      operations.push(op);
      return {
        ok: true,
        content: `Inserted node ${position.type} block "${position.blockId ?? 'root'}"`,
      };
    },
  };

  const replaceNodeTool: AgentToolConfig = {
    name: 'replace_node',
    description: 'Replace an existing block node by its blockId',
    parameters: {
      type: 'object',
      properties: {
        blockId: { type: 'string' },
        node: { type: 'object' },
      },
      required: ['blockId', 'node'],
    },
    execute: async (params: unknown): Promise<AgentToolResult> => {
      const { blockId, node } = params as { blockId: string; node: SerializedLexicalNode };
      const existing = snapshot.getBlock(blockId);
      if (!existing) {
        return {
          ok: false,
          error: {
            error: 'block_not_found',
            blockId,
            message: `Block "${blockId}" not found in document.`,
          },
        };
      }
      const op: AgentOperation = { op: 'replace', blockId, node };
      operations.push(op);
      return { ok: true, content: `Replaced block "${blockId}"` };
    },
  };

  const deleteNodeTool: AgentToolConfig = {
    name: 'delete_node',
    description: 'Delete an existing block node by its blockId',
    parameters: {
      type: 'object',
      properties: {
        blockId: { type: 'string' },
      },
      required: ['blockId'],
    },
    execute: async (params: unknown): Promise<AgentToolResult> => {
      const { blockId } = params as { blockId: string };
      const existing = snapshot.getBlock(blockId);
      if (!existing) {
        return {
          ok: false,
          error: {
            error: 'block_not_found',
            blockId,
            message: `Block "${blockId}" not found in document.`,
          },
        };
      }
      const op: AgentOperation = { op: 'delete', blockId };
      operations.push(op);
      return { ok: true, content: `Deleted block "${blockId}"` };
    },
  };

  const searchDocumentTool: AgentToolConfig = {
    name: 'search_document',
    description: 'Search for blocks in the document by text content or block type',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        blockType: { type: 'string' },
      },
      required: ['query'],
    },
    execute: async (params: unknown): Promise<AgentToolResult> => {
      const { query, blockType } = params as { query: string; blockType?: string };
      const matches: Array<{ blockId: string; nodeType: string; textContent: string }> = [];

      for (const blockId of snapshot.blockIds) {
        const block = snapshot.getBlock(blockId)!;
        const nodeType = (block as any).type ?? 'unknown';
        if (blockType && nodeType !== blockType) continue;
        const text = extractText(block);
        if (query && !text.toLowerCase().includes(query.toLowerCase())) continue;
        matches.push({ blockId, nodeType, textContent: text });
      }

      return { ok: true, content: JSON.stringify(matches) };
    },
  };

  return [readSelectionTool, insertNodeTool, replaceNodeTool, deleteNodeTool, searchDocumentTool];
}
