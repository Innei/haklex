import {
  $computeTableMapSkipCellCheck,
  $createTableNodeWithDimensions,
  $isTableNode,
  TableCellHeaderStates,
  TableCellNode,
  type TableNode,
  TableNode as TableNodeClass,
  TableRowNode,
} from '@lexical/table';
import { $getRoot, createEditor, type LexicalEditor } from 'lexical';
import { describe, expect, it } from 'vitest';

import { $getTableHeaderState, $runTableAction, type TableAction } from '../src/table-actions';

function createTableEditor(rows: number, columns: number): LexicalEditor {
  const editor = createEditor({
    namespace: 'table-actions-test',
    nodes: [TableNodeClass, TableRowNode, TableCellNode],
    onError: (error) => {
      throw error;
    },
  });
  editor.update(
    () => {
      $getRoot().append($createTableNodeWithDimensions(rows, columns, false));
    },
    { discrete: true },
  );
  return editor;
}

function $getTable(): TableNode {
  const table = $getRoot().getFirstChild();
  if (!$isTableNode(table)) throw new Error('expected a table');
  return table;
}

function runAt(editor: LexicalEditor, row: number, column: number, action: TableAction) {
  editor.update(
    () => {
      const [map] = $computeTableMapSkipCellCheck($getTable(), null, null);
      $runTableAction(map[row][column].cell, action);
    },
    { discrete: true },
  );
}

function shape(editor: LexicalEditor): number[] {
  return editor.getEditorState().read(() =>
    $getTable()
      .getChildren()
      .map((row) => (row as TableRowNode).getChildrenSize()),
  );
}

function cellText(editor: LexicalEditor): string[][] {
  return editor.getEditorState().read(() =>
    $getTable()
      .getChildren()
      .map((row) =>
        (row as TableRowNode).getChildren().map((cell) => (cell as TableCellNode).getTextContent()),
      ),
  );
}

describe('table column insert', () => {
  it('inserts a column to the left: one cell per row, row count unchanged', () => {
    const editor = createTableEditor(3, 2);
    runAt(editor, 1, 1, 'insert-column-left');
    expect(shape(editor)).toEqual([3, 3, 3]);
  });

  it('inserts a column to the right: one cell per row, row count unchanged', () => {
    const editor = createTableEditor(2, 3);
    runAt(editor, 0, 0, 'insert-column-right');
    expect(shape(editor)).toEqual([4, 4]);
  });

  it('inserts rows, not columns, for row actions', () => {
    const editor = createTableEditor(2, 2);
    runAt(editor, 0, 0, 'insert-row-below');
    expect(shape(editor)).toEqual([2, 2, 2]);
    expect(
      cellText(editor)
        .flat()
        .every((text) => text === ''),
    ).toBe(true);
  });
});

describe('table append and header actions', () => {
  it('appends a column after the last column regardless of the anchor cell', () => {
    const editor = createTableEditor(2, 2);
    editor.update(
      () => {
        const [map] = $computeTableMapSkipCellCheck($getTable(), null, null);
        map[0][0].cell.getFirstChildOrThrow().selectStart().insertText('a');
      },
      { discrete: true },
    );
    runAt(editor, 1, 0, 'append-column');
    expect(shape(editor)).toEqual([3, 3]);
    expect(cellText(editor)[0]).toEqual(['a', '', '']);
  });

  it('appends a row after the last row regardless of the anchor cell', () => {
    const editor = createTableEditor(2, 2);
    runAt(editor, 0, 1, 'append-row');
    expect(shape(editor)).toEqual([2, 2, 2]);
  });

  it('toggles the header state of a whole row', () => {
    const editor = createTableEditor(2, 3);
    runAt(editor, 1, 2, 'toggle-header-row');
    const isRowHeader = () =>
      editor.getEditorState().read(() => {
        const [map] = $computeTableMapSkipCellCheck($getTable(), null, null);
        return map[1].map(({ cell }) => cell.hasHeaderState(TableCellHeaderStates.ROW));
      });
    expect(isRowHeader()).toEqual([true, true, true]);
    runAt(editor, 1, 0, 'toggle-header-row');
    expect(isRowHeader()).toEqual([false, false, false]);
  });

  it('toggles the header state of a whole column', () => {
    const editor = createTableEditor(3, 2);
    runAt(editor, 2, 1, 'toggle-header-column');
    const isColumnHeader = () =>
      editor.getEditorState().read(() => {
        const [map] = $computeTableMapSkipCellCheck($getTable(), null, null);
        return map.map((row) => row[1].cell.hasHeaderState(TableCellHeaderStates.COLUMN));
      });
    expect(isColumnHeader()).toEqual([true, true, true]);
  });

  it('reports header state for the anchor cell', () => {
    const editor = createTableEditor(2, 2);
    runAt(editor, 0, 1, 'toggle-header-column');
    const state = editor.getEditorState().read(() => {
      const [map] = $computeTableMapSkipCellCheck($getTable(), null, null);
      return $getTableHeaderState(map[1][1].cell);
    });
    expect(state).toEqual({ column: true, row: false });
  });

  it('deletes the column of the anchor cell', () => {
    const editor = createTableEditor(2, 3);
    runAt(editor, 1, 1, 'delete-column');
    expect(shape(editor)).toEqual([2, 2]);
  });
});
