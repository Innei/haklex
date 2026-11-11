import type { ElementStyle } from '../model/defaults';
import type { BinaryFiles, ExcalidrawElement } from '../scene/types';

export type ToolType =
  | 'selection'
  | 'hand'
  | 'rectangle'
  | 'diamond'
  | 'ellipse'
  | 'arrow'
  | 'line'
  | 'freedraw'
  | 'text'
  | 'image'
  | 'frame'
  | 'eraser';

export interface Viewport {
  scrollX: number;
  scrollY: number;
  zoom: number;
}

export type SceneDoc = Record<string, unknown> & {
  appState?: Record<string, unknown>;
  elements: ExcalidrawElement[];
  files?: BinaryFiles;
};

export interface Doc {
  elements: readonly ExcalidrawElement[];
  files: BinaryFiles;
}

export interface EditorState extends Doc {
  canvasSize: { height: number; width: number };
  currentStyle: ElementStyle;
  editingFrameId: string | null;
  editingGroupId: string | null;
  editingLinearId: string | null;
  editingTextId: string | null;
  erasingIds: ReadonlySet<string>;
  gridSize: number | null;
  selectedIds: ReadonlySet<string>;
  selectedPointIndex: number | null;
  selectionBox: [number, number, number, number] | null;
  suggestedBindingId: string | null;
  tool: ToolType;
  toolLocked: boolean;
  viewBackgroundColor: string;
  viewport: Viewport;
}

export type DocUpdater = (doc: Doc) => Partial<Doc> | void;
