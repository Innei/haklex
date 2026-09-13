import { deserializeNodesFromXml } from '@haklex/rich-litexml';
import type { SerializedLexicalNode } from 'lexical';

import { type LitexmlRegistryOptions, resolveLitexmlRegistry } from './litexml';
import type { AgentToolConfig, AgentToolResult } from './protocol';
import type { EditorSnapshot } from './snapshot';
import type { AgentOperation } from './types';

function extractText(node: SerializedLexicalNode): string {
  const n = node as any;
  if (n.text) return n.text;
  if (n.children) return n.children.map(extractText).join('');
  return '';
}

const STAGED_NOTE =
  'Staged for user review; the live document changes only after the user accepts. search_document already reflects staged edits — do not re-run the same edit to "make it stick".';

type StagedBlock = { blockId: string; node: SerializedLexicalNode };

// Ops are queued, not applied, so a search after an edit must overlay the
// queue on the snapshot or the model sees its own edit as "not taken".
function stagedBlocks(snapshot: EditorSnapshot, operations: AgentOperation[]): StagedBlock[] {
  let blocks: StagedBlock[] = snapshot.blockIds.map((blockId) => ({
    blockId,
    node: snapshot.getBlock(blockId)!,
  }));
  let inserted = 0;
  for (const op of operations) {
    if (op.op === 'replace') {
      blocks = blocks.map((b) => (b.blockId === op.blockId ? { ...b, node: op.node } : b));
    } else if (op.op === 'delete') {
      blocks = blocks.filter((b) => b.blockId !== op.blockId);
    } else {
      const staged = { blockId: `staged-${++inserted}`, node: op.node };
      if (op.position.type === 'root') {
        blocks.splice(op.position.index ?? blocks.length, 0, staged);
      } else {
        const anchor = op.position.blockId;
        const idx = blocks.findIndex((b) => b.blockId === anchor);
        if (idx === -1) blocks.push(staged);
        else blocks.splice(op.position.type === 'after' ? idx + 1 : idx, 0, staged);
      }
    }
  }
  return blocks;
}

export function createDocumentTools(
  snapshot: EditorSnapshot,
  operations: AgentOperation[],
  options?: LitexmlRegistryOptions,
): AgentToolConfig[] {
  const registry = resolveLitexmlRegistry(options);

  const insertNodeTool: AgentToolConfig = {
    name: 'insert_node',
    description:
      'Insert one or more block nodes at a position relative to an existing block. The xml parameter should contain XML elements like <p>, <h2>, <ul>, <codeblock>, <img />, etc.',
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
        xml: { type: 'string', description: 'XML string containing block elements to insert' },
      },
      required: ['position', 'xml'],
    },
    describeCall: (params: unknown) => {
      const p = params as { position?: { type?: string; blockId?: string } };
      const pos = p.position;
      return pos?.blockId ? `inserting ${pos.type} block "${pos.blockId}"` : 'inserting node';
    },
    execute: async (params: unknown): Promise<AgentToolResult> => {
      const { position, xml } = params as { position: any; xml: string };
      if (!xml || typeof xml !== 'string') {
        return {
          ok: false,
          error: {
            error: 'invalid_xml',
            message: 'Missing or invalid "xml" parameter. Must be an XML string.',
          },
        };
      }
      if (position.type !== 'root' && !snapshot.getBlock(position.blockId)) {
        return {
          ok: false,
          error: {
            error: 'block_not_found',
            blockId: position.blockId,
            message: `Block "${position.blockId}" not found.`,
          },
        };
      }

      let nodes: SerializedLexicalNode[];
      try {
        nodes = deserializeNodesFromXml(xml, registry);
      } catch {
        return {
          ok: false,
          error: { error: 'xml_parse_error', message: 'Failed to parse XML string.' },
        };
      }

      if (nodes.length === 0) {
        return { ok: false, error: { error: 'empty_xml', message: 'XML produced no nodes.' } };
      }

      for (let i = 0; i < nodes.length; i++) {
        const pos = i === 0 ? position : { ...position, _insertIndex: i };
        operations.push({ op: 'insert', position: pos, node: nodes[i] });
      }

      return {
        ok: true,
        content: `Staged insert of ${nodes.length} node(s) ${position.type} block "${position.blockId ?? 'root'}". ${STAGED_NOTE}`,
      };
    },
  };

  const replaceNodeTool: AgentToolConfig = {
    name: 'replace_node',
    description:
      'Replace an existing block node by its blockId with new XML content. The xml should contain exactly one block element.',
    parameters: {
      type: 'object',
      properties: {
        blockId: { type: 'string' },
        xml: { type: 'string', description: 'XML string containing one block element' },
      },
      required: ['blockId', 'xml'],
    },
    describeCall: (params: unknown) => {
      const p = params as { blockId?: string };
      return p.blockId ? `replacing block "${p.blockId}"` : 'replacing node';
    },
    execute: async (params: unknown): Promise<AgentToolResult> => {
      const { blockId, xml } = params as { blockId: string; xml: string };
      if (!xml || typeof xml !== 'string') {
        return {
          ok: false,
          error: { error: 'invalid_xml', message: 'Missing or invalid "xml" parameter.' },
        };
      }
      const existing = snapshot.getBlock(blockId);
      if (!existing) {
        return {
          ok: false,
          error: { error: 'block_not_found', blockId, message: `Block "${blockId}" not found.` },
        };
      }

      let nodes: SerializedLexicalNode[];
      try {
        nodes = deserializeNodesFromXml(xml, registry);
      } catch {
        return {
          ok: false,
          error: { error: 'xml_parse_error', message: 'Failed to parse XML string.' },
        };
      }

      if (nodes.length === 0) {
        return { ok: false, error: { error: 'empty_xml', message: 'XML produced no nodes.' } };
      }

      const primaryNode = { ...nodes[0], $: { ...(nodes[0] as any).$, blockId } } as any;
      operations.push({ op: 'replace', blockId, node: primaryNode });

      for (let i = 1; i < nodes.length; i++) {
        operations.push({ op: 'insert', position: { type: 'after', blockId }, node: nodes[i] });
      }

      return {
        ok: true,
        content: `Staged replacement of block "${blockId}" (${nodes.length} node(s)). ${STAGED_NOTE}`,
      };
    },
  };

  const deleteNodeTool: AgentToolConfig = {
    name: 'delete_node',
    description: 'Delete an existing block node by its blockId',
    parameters: {
      type: 'object',
      properties: { blockId: { type: 'string' } },
      required: ['blockId'],
    },
    describeCall: (params: unknown) => {
      const p = params as { blockId?: string };
      return p.blockId ? `deleting block "${p.blockId}"` : 'deleting node';
    },
    execute: async (params: unknown): Promise<AgentToolResult> => {
      const { blockId } = params as { blockId: string };
      if (!snapshot.getBlock(blockId)) {
        return {
          ok: false,
          error: { error: 'block_not_found', blockId, message: `Block "${blockId}" not found.` },
        };
      }
      operations.push({ op: 'delete', blockId });
      return { ok: true, content: `Staged deletion of block "${blockId}". ${STAGED_NOTE}` };
    },
  };

  const searchDocumentTool: AgentToolConfig = {
    name: 'search_document',
    description:
      'Search for blocks in the document by text content or block type. Results include edits staged in this session that the user has not accepted yet.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        blockType: { type: 'string' },
      },
      required: ['query'],
    },
    describeCall: (params: unknown) => {
      const p = params as { query?: string; blockType?: string };
      const parts: string[] = [];
      if (p.query) parts.push(`"${p.query}"`);
      if (p.blockType) parts.push(`type=${p.blockType}`);
      return `searching ${parts.join(', ') || 'document'}`;
    },
    execute: async (params: unknown): Promise<AgentToolResult> => {
      const { query, blockType } = params as { query: string; blockType?: string };
      const matches: Array<{ blockId: string; nodeType: string; textContent: string }> = [];
      for (const { blockId, node: block } of stagedBlocks(snapshot, operations)) {
        const nodeType = (block as any).type ?? 'unknown';
        if (blockType && nodeType !== blockType) continue;
        const text = extractText(block);
        if (query && !text.toLowerCase().includes(query.toLowerCase())) continue;
        matches.push({ blockId, nodeType, textContent: text });
      }
      return { ok: true, content: JSON.stringify(matches) };
    },
  };

  return [insertNodeTool, replaceNodeTool, deleteNodeTool, searchDocumentTool];
}
