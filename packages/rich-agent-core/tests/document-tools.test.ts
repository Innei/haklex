import { describe, expect, it } from 'vitest';

import { createDocumentTools } from '../src/document-tools';
import type { EditorSnapshot } from '../src/snapshot';
import { createSnapshot } from '../src/snapshot';
import type { AgentOperation } from '../src/types';

function makeSnapshot(): { snapshot: EditorSnapshot; operations: AgentOperation[] } {
  const state = {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text: 'Hello world',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
          textFormat: 0,
          textStyle: '',
          $: { blockId: 'p1' },
        },
        {
          type: 'heading',
          children: [
            {
              type: 'text',
              text: 'Title',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
          textFormat: 0,
          textStyle: '',
          tag: 'h1',
          $: { blockId: 'h1' },
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
  };
  return { snapshot: createSnapshot(state as any), operations: [] };
}

describe('createDocumentTools', () => {
  it('returns 5 tools', () => {
    const { snapshot, operations } = makeSnapshot();
    const tools = createDocumentTools(snapshot, operations);
    expect(tools).toHaveLength(5);
    expect(tools.map((t) => t.name)).toEqual([
      'read_selection',
      'insert_node',
      'replace_node',
      'delete_node',
      'search_document',
    ]);
  });

  it('insert_node adds operation to accumulator', async () => {
    const { snapshot, operations } = makeSnapshot();
    const tools = createDocumentTools(snapshot, operations);
    const insertTool = tools.find((t) => t.name === 'insert_node')!;

    const result = await insertTool.execute({
      position: { type: 'after', blockId: 'p1' },
      node: { type: 'paragraph', children: [] },
    });

    expect(result.ok).toBe(true);
    expect(operations).toHaveLength(1);
    expect(operations[0].op).toBe('insert');
  });

  it('delete_node with valid blockId adds operation', async () => {
    const { snapshot, operations } = makeSnapshot();
    const tools = createDocumentTools(snapshot, operations);
    const deleteTool = tools.find((t) => t.name === 'delete_node')!;

    const result = await deleteTool.execute({ blockId: 'p1' });
    expect(result.ok).toBe(true);
    expect(operations).toHaveLength(1);
    expect(operations[0].op).toBe('delete');
  });

  it('delete_node with unknown blockId returns error', async () => {
    const { snapshot, operations } = makeSnapshot();
    const tools = createDocumentTools(snapshot, operations);
    const deleteTool = tools.find((t) => t.name === 'delete_node')!;

    const result = await deleteTool.execute({ blockId: 'nonexistent' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.error).toBe('block_not_found');
    }
  });

  it('search_document finds blocks by text query', async () => {
    const { snapshot, operations } = makeSnapshot();
    const tools = createDocumentTools(snapshot, operations);
    const searchTool = tools.find((t) => t.name === 'search_document')!;

    const result = await searchTool.execute({ query: 'Hello' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.content).toContain('p1');
    }
  });

  it('search_document filters by blockType', async () => {
    const { snapshot, operations } = makeSnapshot();
    const tools = createDocumentTools(snapshot, operations);
    const searchTool = tools.find((t) => t.name === 'search_document')!;

    const result = await searchTool.execute({ query: '', blockType: 'heading' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.content).toContain('h1');
      expect(result.content).not.toContain('p1');
    }
  });
});
