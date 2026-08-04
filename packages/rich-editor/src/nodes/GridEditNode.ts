import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  SerializedEditorState,
  SerializedLexicalNode,
} from 'lexical';
import { $getRoot, $insertNodes } from 'lexical';
import { LayoutGrid } from 'lucide-react';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { GridEditDecorator } from '../components/decorators/GridEditDecorator';
import type { SlashMenuItemConfig } from '../types/slash-menu';
import { GridContainerNode, type SerializedGridContainerNode } from './GridContainerNode';
import { createNestedEditor } from './shared';

interface LegacySerializedGridEditNode {
  cells?: SerializedEditorState[];
  children?: SerializedLexicalNode[];
  cols?: number;
  gap?: string | number;
  type?: string;
  version?: number;
}

interface GridEditNodeOptions {
  autoFocusOnMount?: boolean;
}

function createCellEditor(): LexicalEditor {
  return createNestedEditor('GridCell');
}

export class GridEditNode extends GridContainerNode {
  __cellEditors: LexicalEditor[];
  __autoFocusOnMount: boolean;

  static slashMenuItems: SlashMenuItemConfig[] = [
    {
      title: 'Grid',
      icon: createElement(LayoutGrid, { size: 20 }),
      description: 'Grid layout container',
      keywords: ['grid', 'columns', 'layout'],
      section: 'LAYOUT',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createGridEditNode(2, undefined, { autoFocusOnMount: true })]);
        });
      },
    },
  ];

  static clone(node: GridEditNode): GridEditNode {
    const cloned = new GridEditNode(node.__cols, node.__gap, node.__cellStates, node.__key, {
      autoFocusOnMount: node.__autoFocusOnMount,
    });
    cloned.__cellEditors = [...node.__cellEditors];
    return cloned;
  }

  constructor(
    cols = 2,
    gap?: string,
    cellStates?: SerializedEditorState[],
    key?: string,
    options?: GridEditNodeOptions,
  ) {
    super(cols, gap, cellStates, key);
    this.__autoFocusOnMount = options?.autoFocusOnMount ?? false;
    this.__cellEditors = this.__cellStates.map((state) => {
      const editor = createCellEditor();
      const editorState = editor.parseEditorState(state);
      editor.setEditorState(editorState);
      return editor;
    });
  }

  getCellEditors(): LexicalEditor[] {
    return this.getLatest().__cellEditors;
  }

  getShouldAutoFocusOnMount(): boolean {
    return this.getLatest().__autoFocusOnMount;
  }

  setShouldAutoFocusOnMount(autoFocusOnMount: boolean): void {
    const writable = this.getWritable() as GridEditNode;
    writable.__autoFocusOnMount = autoFocusOnMount;
  }

  setCols(cols: number): void {
    const writable = this.getWritable() as GridEditNode;
    const prev = writable.__cellEditors.length;
    writable.__cols = cols;
    if (cols > prev) {
      for (let i = prev; i < cols; i++) {
        const editor = createCellEditor();
        writable.__cellEditors.push(editor);
        const emptyState = {
          root: {
            children: [
              {
                type: 'paragraph',
                children: [],
                direction: null,
                format: '',
                indent: 0,
                textFormat: 0,
                textStyle: '',
                version: 1,
              },
            ],
            direction: null,
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        } as unknown as SerializedEditorState;
        writable.__cellStates.push(emptyState);
      }
    }
  }

  addCells(count: number): void {
    const writable = this.getWritable() as GridEditNode;
    for (let i = 0; i < count; i++) {
      const editor = createCellEditor();
      writable.__cellEditors.push(editor);
      const emptyState = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [],
              direction: null,
              format: '',
              indent: 0,
              textFormat: 0,
              textStyle: '',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      } as unknown as SerializedEditorState;
      writable.__cellStates.push(emptyState);
    }
  }

  removeCells(count: number): void {
    const writable = this.getWritable() as GridEditNode;
    const editors = writable.__cellEditors;
    const states = writable.__cellStates;
    const toRemove = Math.min(count, editors.length);
    for (let i = 0; i < toRemove; i++) {
      const editor = editors.at(-1);
      if (!editor) break;
      const isEmpty = editor.getEditorState().read(() => {
        return $getRoot().getTextContentSize() === 0;
      });
      if (!isEmpty) break;
      editors.pop();
      states.pop();
    }
  }

  static importJSON(
    _serializedNode: SerializedLexicalNode & Record<string, unknown>,
  ): GridEditNode {
    const serializedNode = _serializedNode as unknown as SerializedGridContainerNode;
    const legacy = serializedNode as LegacySerializedGridEditNode;
    const cols = legacy.cols || 2;
    const rawGap = legacy.gap;
    const gap = typeof rawGap === 'number' ? `${rawGap}px` : rawGap;

    if (legacy.cells && legacy.cells.length > 0) {
      return new GridEditNode(cols, gap, legacy.cells);
    }

    if (legacy.children) {
      const cellStates: SerializedEditorState[] = legacy.children.map((child) => {
        return {
          root: {
            children: [child],
            direction: null,
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        } as unknown as SerializedEditorState;
      });
      return new GridEditNode(cols, gap, cellStates);
    }

    return new GridEditNode(cols, gap);
  }

  exportJSON(): SerializedGridContainerNode {
    return {
      ...super.exportJSON(),
      type: 'grid-container',
      cols: this.__cols,
      gap: this.__gap,
      cells: this.__cellEditors.map((editor) => editor.getEditorState().toJSON()),
      version: 1,
    };
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(GridEditDecorator, {
      nodeKey: this.__key,
      cols: this.__cols,
      gap: this.__gap,
      cellEditors: this.__cellEditors,
      autoFocusOnMount: this.__autoFocusOnMount,
    });
  }
}

export function $createGridEditNode(
  cols = 2,
  gap?: string,
  options?: GridEditNodeOptions,
): GridEditNode {
  return new GridEditNode(cols, gap, undefined, undefined, options);
}

export function $isGridEditNode(node: LexicalNode | null | undefined): node is GridEditNode {
  return node instanceof GridEditNode;
}
