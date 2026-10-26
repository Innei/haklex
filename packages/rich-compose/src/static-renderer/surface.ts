import type { SerializedBlock } from '@haklex/rich-editor/recycler';
import type { LexicalEditor } from 'lexical';
import type { ComponentType, ReactNode } from 'react';

export interface RendererBlock {
  data: SerializedBlock;
  id: string;
  index: number;
}

export interface RendererRow {
  blocks: RendererBlock[];
  data: SerializedBlock;
  id: string;
  pool: string;
}

export interface RendererDocument {
  editor: LexicalEditor;
  headingRows: Map<string, number>;
  nodePath: (key?: string) => string;
  render: (index: number, slot?: number) => ReactNode;
  renderAll: () => ReactNode;
  rows: RendererRow[];
}

export interface RendererSurfaceProps {
  document: RendererDocument;
}
export type RendererSurface = ComponentType<RendererSurfaceProps>;
