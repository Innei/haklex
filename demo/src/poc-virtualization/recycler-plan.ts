import { allNodes, editorTheme, normalizeSerializedEditorState } from '@haklex/rich-editor/static';
import { DynamicNode } from '@haklex/rich-ext-dynamic/static';
import { $getRoot, type LexicalNode, type SerializedEditorState } from 'lexical';
import type { ReactNode } from 'react';

import { textToSlug } from '../../../packages/rich-compose/src/static-renderer/engine/renderBuiltinNode';
import { preprocessFootnotes } from '../../../packages/rich-compose/src/static-renderer/preprocess/footnote';
import {
  createHeadlessEditor,
  renderTree,
} from '../../../packages/rich-compose/src/static-renderer/RichRenderer';
import type { BuiltinNodeRenderer } from '../../../packages/rich-compose/src/static-renderer/types';

export interface BlockData {
  [key: string]: any;
  children?: BlockData[];
  type: string;
}

export interface PlanRow {
  data: BlockData;
  headingSeeds: Map<string, number>;
  id: string;
  node: LexicalNode;
  paths: Map<string, string>;
  pool: string;
}

export function createRenderPlan(value: SerializedEditorState) {
  const editor = createHeadlessEditor({
    nodes: [...allNodes, DynamicNode],
    theme: editorTheme,
    onError: (error) => {
      throw error;
    },
  });
  const normalized = normalizeSerializedEditorState(value);
  const state = editor.parseEditorState(normalized);
  editor.setEditorState(state);
  const raw = value.root.children as unknown as BlockData[];
  const slugs = new Map<string, number>();
  const rows = state.read(() =>
    $getRoot()
      .getChildren()
      .map((node, index): PlanRow => {
        const data = raw[index];
        const paths = new Map<string, string>();
        const headingSeeds = new Map<string, number>();
        const seen = new Set<string>();
        const walk = (child: LexicalNode, path: string) => {
          paths.set(child.getKey(), path);
          if (child.getType() === 'heading') {
            const slug = textToSlug(child.getTextContent());
            const count = slugs.get(slug) ?? 0;
            if (!seen.has(slug) && count) headingSeeds.set(slug, count);
            seen.add(slug);
            if (slug) slugs.set(slug, count + 1);
          }
          const children =
            (child as LexicalNode & { getChildren?: () => LexicalNode[] }).getChildren?.() ?? [];
          children.forEach((nested, i) => walk(nested, `${path}.${i}`));
        };
        walk(node, '0');
        return {
          data,
          node,
          paths,
          headingSeeds,
          id: data.$?.blockId || `block-${index}`,
          pool: `${data.type}:${data.type === 'dynamic' ? data.url : (data.tag ?? data.listType ?? '')}`,
        };
      }),
  );
  const render = (index: number, overrides: Record<string, BuiltinNodeRenderer>): ReactNode =>
    state.read(() => {
      const row = rows[index];
      return renderTree(
        row.node,
        editor,
        { namespace: 'recycler-poc', theme: editorTheme },
        new Map(row.headingSeeds),
        row.id,
        undefined,
        { builtinNodeOverrides: overrides },
      );
    });
  return { rows, render, value, footnotes: preprocessFootnotes(normalized) };
}

export type RenderPlan = ReturnType<typeof createRenderPlan>;
