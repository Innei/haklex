// @vitest-environment happy-dom
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import {
  $computeTableMapSkipCellCheck,
  $createTableNodeWithDimensions,
  $isTableNode,
  TableCellNode,
  TableNode,
  TableRowNode,
} from '@lexical/table';
import { $getRoot, type LexicalEditor } from 'lexical';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { TableRowColumnHandlesPlugin } from '../src/TableRowColumnHandlesPlugin';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  container?.remove();
  container = null;
  document.body.innerHTML = '';
});

function EditorCapture({ onEditor }: { onEditor: (editor: LexicalEditor) => void }) {
  const [editor] = useLexicalComposerContext();
  onEditor(editor);
  return null;
}

async function mountTable(): Promise<LexicalEditor> {
  let captured: LexicalEditor | null = null;
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(
      <LexicalComposer
        initialConfig={{
          namespace: 'TableHandlesTest',
          nodes: [TableNode, TableRowNode, TableCellNode],
          onError: (error) => {
            throw error;
          },
          editorState: () => {
            $getRoot().append($createTableNodeWithDimensions(2, 2, false));
          },
        }}
      >
        <RichTextPlugin
          ErrorBoundary={LexicalErrorBoundary}
          contentEditable={<ContentEditable />}
        />
        <TablePlugin />
        <TableRowColumnHandlesPlugin />
        <EditorCapture onEditor={(editor) => (captured = editor)} />
      </LexicalComposer>,
    );
  });
  return captured!;
}

function shape(editor: LexicalEditor): number[] {
  return editor.getEditorState().read(() => {
    const table = $getRoot().getFirstChild();
    if (!$isTableNode(table)) return [];
    return table.getChildren().map((row) => (row as TableRowNode).getChildrenSize());
  });
}

async function selectCell(editor: LexicalEditor, row: number, column: number) {
  await act(async () => {
    editor.update(() => {
      const table = $getRoot().getFirstChild();
      if (!$isTableNode(table)) return;
      const [map] = $computeTableMapSkipCellCheck(table, null, null);
      map[row][column].cell.selectStart();
    });
  });
}

describe('TableRowColumnHandlesPlugin', () => {
  it('labels the handles and keeps them hidden until a cell is active', async () => {
    await mountTable();
    const rowHandle = document.querySelector('[aria-label="Row actions"]');
    const columnHandle = document.querySelector('[aria-label="Column actions"]');
    expect(rowHandle).not.toBeNull();
    expect(columnHandle).not.toBeNull();
    expect(rowHandle?.parentElement?.getAttribute('data-visible')).toBe('false');
  });

  it('shows the handles for a hovered cell without throwing', async () => {
    await mountTable();
    const cell = [...document.querySelectorAll<HTMLElement>('td, th')].at(-1)!;
    const errors: unknown[] = [];
    const onError = (event: ErrorEvent) => errors.push(event.error);
    window.addEventListener('error', onError);
    await act(async () => {
      cell.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
    });
    window.removeEventListener('error', onError);
    expect(errors).toEqual([]);
    const rowHandle = document.querySelector('[aria-label="Row actions"]');
    expect(rowHandle?.parentElement?.getAttribute('data-visible')).toBe('true');
  });

  it('shows the handles for the cell holding the caret', async () => {
    const editor = await mountTable();
    await selectCell(editor, 1, 1);
    const rowHandle = document.querySelector('[aria-label="Row actions"]');
    expect(rowHandle?.parentElement?.getAttribute('data-visible')).toBe('true');
  });

  it('appends a column at the end from the column append bar', async () => {
    const editor = await mountTable();
    await selectCell(editor, 0, 0);
    const append = document.querySelector<HTMLButtonElement>('[aria-label="Add column"]');
    await act(async () => {
      append?.click();
    });
    expect(shape(editor)).toEqual([3, 3]);
  });

  it('appends a row at the end from the row append bar', async () => {
    const editor = await mountTable();
    await selectCell(editor, 0, 1);
    const append = document.querySelector<HTMLButtonElement>('[aria-label="Add row"]');
    await act(async () => {
      append?.click();
    });
    expect(shape(editor)).toEqual([2, 2, 2]);
  });
});
