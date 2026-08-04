import {
  $createParagraphNode,
  $getRoot,
  $nodesOfType,
  createEditor,
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
} from 'lexical';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { scheduleGridCellAutoFocus } from '../src/components/decorators/gridAutoFocus';
import { $createGridEditNode, GridEditNode } from '../src/nodes/GridEditNode';
import { createNestedEditor } from '../src/nodes/shared';

vi.mock('../src/components/decorators/GridEditDecorator', () => ({
  GridEditDecorator: vi.fn(),
}));

vi.mock('../src/components/renderers/GridStaticDecorator', () => ({
  GridStaticDecorator: vi.fn(),
}));

vi.mock('../src/nodes/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/nodes/shared')>();
  return {
    ...actual,
    NESTED_EDITOR_NODES: [],
  };
});

vi.mock('../src/styles/grid.css', () => ({
  gridClassNames: { container: 'grid-container' },
  gridStyles: { container: 'grid-container-style' },
}));

vi.mock('../src/styles/shared.css', () => {
  const identityProxy = new Proxy({}, { get: (_target, prop: string) => prop });
  return {
    semanticClassNames: identityProxy,
    sharedStyles: identityProxy,
  };
});

vi.mock('../src/styles/katex.css', () => {
  const identityProxy = new Proxy({}, { get: (_target, prop: string) => prop });
  return {
    katexClassNames: identityProxy,
    katexStyles: identityProxy,
  };
});

vi.mock('../src/components/utils', () => ({
  clsx: (...args: Array<string | undefined | null | false>) => args.filter(Boolean).join(' '),
  getVariantClass: () => '',
}));

vi.mock('../src/styles/theme', () => ({
  editorTheme: {},
}));

async function flushEditor(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

type FrameCallback = Parameters<Window['requestAnimationFrame']>[0];

function createFrameScheduler() {
  const frames: FrameCallback[] = [];

  return {
    cancelFrame: vi.fn(),
    get pendingFrames() {
      return frames.length;
    },
    requestFrame: vi.fn((callback: FrameCallback) => {
      frames.push(callback);
      return frames.length;
    }),
    runNextFrame() {
      const callback = frames.shift();
      if (!callback) {
        throw new Error('No scheduled frame');
      }
      callback(0);
    },
  };
}

class ExtraTestNode extends DecoratorNode<ReactElement | null> {
  static getType(): string {
    return 'extra-test-node';
  }

  static clone(node: ExtraTestNode): ExtraTestNode {
    return new ExtraTestNode(node.__key);
  }

  static importJSON(): ExtraTestNode {
    return new ExtraTestNode();
  }

  createDOM(_config: EditorConfig): HTMLElement {
    return {} as HTMLElement;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): ReactElement | null {
    return null;
  }
}

describe('createNestedEditor node registry inheritance', () => {
  it('inherits the active editor node registry inside an update context', () => {
    const editor = createEditor({
      namespace: 'CreateNestedEditorInheritTest',
      nodes: [GridEditNode, ExtraTestNode],
      onError: (error) => {
        throw error;
      },
    });

    editor.update(() => {
      const gridNode = $createGridEditNode(1);
      const [cellEditor] = gridNode.getCellEditors();

      expect(cellEditor._nodes.has(ExtraTestNode.getType())).toBe(true);
    });
  });

  it('falls back to NESTED_EDITOR_NODES outside an update context', () => {
    const fallbackEditor = createNestedEditor('CreateNestedEditorFallbackTest');

    expect(fallbackEditor._parentEditor).toBeNull();
    expect(fallbackEditor._nodes.has(ExtraTestNode.getType())).toBe(false);
  });
});

describe('GridEditNode insertion focus intent', () => {
  it('marks slash-menu inserted grids for first-cell focus on mount', async () => {
    const editor = createEditor({
      namespace: 'GridEditNodeSlashInsertTest',
      nodes: [GridEditNode],
      onError: (error) => {
        throw error;
      },
    });

    editor.update(() => {
      const paragraph = $createParagraphNode();
      $getRoot().append(paragraph);
      paragraph.selectStart();
    });

    await flushEditor();

    GridEditNode.slashMenuItems[0].onSelect(editor);

    await flushEditor();

    editor.getEditorState().read(() => {
      const [node] = $nodesOfType(GridEditNode);

      expect(node?.getShouldAutoFocusOnMount()).toBe(true);
    });
  });

  it('keeps the focus intent out of serialized grid data', () => {
    const editor = createEditor({
      namespace: 'GridEditNodeSerializationTest',
      nodes: [GridEditNode],
      onError: (error) => {
        throw error;
      },
    });

    editor.update(() => {
      const node = $createGridEditNode(2, undefined, { autoFocusOnMount: true });
      const json = node.exportJSON();
      const restored = GridEditNode.importJSON(json);

      expect('autoFocusOnMount' in json).toBe(false);
      expect(restored.getShouldAutoFocusOnMount()).toBe(false);
    });
  });
});

describe('scheduleGridCellAutoFocus', () => {
  it('clears the one-shot focus intent in-frame before focusing the first mounted cell', () => {
    const calls: string[] = [];
    const scheduler = createFrameScheduler();
    const focus = vi.fn(() => {
      calls.push('focus');
    });
    const update = vi.fn(() => {
      calls.push('update');
    });
    const clearAutoFocusIntent = vi.fn(() => {
      calls.push('clear');
    });
    const cellEditor = {
      focus,
      getRootElement: () => ({}),
      update,
    } as unknown as LexicalEditor;

    scheduleGridCellAutoFocus({
      cellEditors: [cellEditor],
      clearAutoFocusIntent,
      maxRootLookupAttempts: 0,
      requestFrame: scheduler.requestFrame,
      cancelFrame: scheduler.cancelFrame,
    });

    expect(calls).toEqual([]);

    scheduler.runNextFrame();

    expect(calls).toEqual(['clear', 'update', 'focus']);
    expect(update).toHaveBeenCalledWith(expect.any(Function), { discrete: true });
    expect(focus).toHaveBeenCalledWith();
  });

  it('waits for the nested editor root before focusing', () => {
    let rootElement: object | null = null;
    const scheduler = createFrameScheduler();
    const focus = vi.fn();
    const update = vi.fn();
    const clearAutoFocusIntent = vi.fn();
    const cellEditor = {
      focus,
      getRootElement: () => rootElement,
      update,
    } as unknown as LexicalEditor;

    scheduleGridCellAutoFocus({
      cellEditors: [cellEditor],
      clearAutoFocusIntent,
      maxRootLookupAttempts: 2,
      requestFrame: scheduler.requestFrame,
      cancelFrame: scheduler.cancelFrame,
    });

    scheduler.runNextFrame();

    expect(focus).not.toHaveBeenCalled();
    expect(clearAutoFocusIntent).not.toHaveBeenCalled();
    expect(scheduler.pendingFrames).toBe(1);

    rootElement = {};
    scheduler.runNextFrame();

    expect(focus).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(clearAutoFocusIntent).toHaveBeenCalledTimes(1);
  });

  it('cancels pending focus work on teardown', () => {
    const scheduler = createFrameScheduler();
    const focus = vi.fn();
    const update = vi.fn();
    const clearAutoFocusIntent = vi.fn();
    const cellEditor = {
      focus,
      getRootElement: () => ({}),
      update,
    } as unknown as LexicalEditor;

    const teardown = scheduleGridCellAutoFocus({
      cellEditors: [cellEditor],
      clearAutoFocusIntent,
      requestFrame: scheduler.requestFrame,
      cancelFrame: scheduler.cancelFrame,
    });

    teardown();
    scheduler.runNextFrame();

    expect(scheduler.cancelFrame).toHaveBeenCalledWith(1);
    expect(update).not.toHaveBeenCalled();
    expect(focus).not.toHaveBeenCalled();
    expect(clearAutoFocusIntent).not.toHaveBeenCalled();
  });
});
