import {
  $computeTableMapSkipCellCheck,
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $getTableNodeFromLexicalNodeOrThrow,
  $insertTableColumnAtNode,
  $insertTableRowAtNode,
  $setTableColumnIsHeader,
  $setTableRowIsHeader,
  TableCellHeaderStates,
  type TableCellNode,
} from '@lexical/table';

export type TableAction =
  | 'insert-row-above'
  | 'insert-row-below'
  | 'insert-column-left'
  | 'insert-column-right'
  | 'append-row'
  | 'append-column'
  | 'toggle-header-row'
  | 'toggle-header-column'
  | 'delete-row'
  | 'delete-column';

export interface TableHeaderState {
  column: boolean;
  row: boolean;
}

export function $getTableHeaderState(cell: TableCellNode): TableHeaderState {
  return {
    column: cell.hasHeaderState(TableCellHeaderStates.COLUMN),
    row: cell.hasHeaderState(TableCellHeaderStates.ROW),
  };
}

function $getCellPosition(cell: TableCellNode) {
  const table = $getTableNodeFromLexicalNodeOrThrow(cell);
  const [, position] = $computeTableMapSkipCellCheck(table, cell, null);
  return {
    startColumn: position?.startColumn ?? 0,
    startRow: position?.startRow ?? 0,
    table,
  };
}

function $getLastCells(cell: TableCellNode) {
  const table = $getTableNodeFromLexicalNodeOrThrow(cell);
  const [map] = $computeTableMapSkipCellCheck(table, null, null);
  const lastRow = map.at(-1) ?? [];
  return {
    lastColumnCell: map[0]?.at(-1)?.cell ?? null,
    lastRowCell: lastRow[0]?.cell ?? null,
  };
}

export function $runTableAction(cell: TableCellNode, action: TableAction): void {
  switch (action) {
    case 'insert-row-above': {
      $insertTableRowAtNode(cell, false);
      return;
    }
    case 'insert-row-below': {
      $insertTableRowAtNode(cell, true);
      return;
    }
    case 'insert-column-left': {
      $insertTableColumnAtNode(cell, false, false);
      return;
    }
    case 'insert-column-right': {
      $insertTableColumnAtNode(cell, true, false);
      return;
    }
    case 'append-row': {
      const { lastRowCell } = $getLastCells(cell);
      if (lastRowCell) $insertTableRowAtNode(lastRowCell, true);
      return;
    }
    case 'append-column': {
      const { lastColumnCell } = $getLastCells(cell);
      if (lastColumnCell) $insertTableColumnAtNode(lastColumnCell, true, false);
      return;
    }
    case 'toggle-header-row': {
      const { startRow, table } = $getCellPosition(cell);
      $setTableRowIsHeader(table, startRow, !$getTableHeaderState(cell).row);
      return;
    }
    case 'toggle-header-column': {
      const { startColumn, table } = $getCellPosition(cell);
      $setTableColumnIsHeader(table, startColumn, !$getTableHeaderState(cell).column);
      return;
    }
    case 'delete-row': {
      cell.selectStart();
      $deleteTableRowAtSelection();
      return;
    }
    case 'delete-column': {
      cell.selectStart();
      $deleteTableColumnAtSelection();
    }
  }
}
