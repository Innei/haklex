import type { MultilineElementTransformer } from '@lexical/markdown';
import {
  $createTableCellNode,
  $createTableNode,
  $createTableRowNode,
  TableCellHeaderStates,
} from '@lexical/table';
import { $createParagraphNode, $createTextNode } from 'lexical';

const TABLE_ROW_REG_EXP = /^\|(.+)\|\s*$/;
const TABLE_DIVIDER_REG_EXP = /^\|(?:\s*:?-+:?\s*\|)+\s*$/;

function parseCells(row: string): string[] {
  const match = row.match(TABLE_ROW_REG_EXP);
  if (!match) return [];
  return match[1].split('|').map((c) => c.trim());
}

export const TABLE_IMPORT_TRANSFORMER: MultilineElementTransformer = {
  dependencies: [],
  export: () => null,
  handleImportAfterStartMatch({ lines, rootNode, startLineIndex }) {
    // Need at least 2 lines (header + divider)
    if (startLineIndex + 1 >= lines.length) return null;

    // Check divider on the next line
    const dividerLine = lines[startLineIndex + 1];
    if (!TABLE_DIVIDER_REG_EXP.test(dividerLine)) return null;

    // Collect all consecutive table rows
    const headerCells = parseCells(lines[startLineIndex]);
    if (headerCells.length === 0) return null;

    let endLineIndex = startLineIndex + 1;
    const dataRows: string[][] = [];

    for (let i = startLineIndex + 2; i < lines.length; i++) {
      if (!TABLE_ROW_REG_EXP.test(lines[i])) break;
      dataRows.push(parseCells(lines[i]));
      endLineIndex = i;
    }

    // Build Lexical table
    const tableNode = $createTableNode();

    // Header row
    const headerRow = $createTableRowNode();
    for (const cell of headerCells) {
      const cellNode = $createTableCellNode(TableCellHeaderStates.ROW);
      const p = $createParagraphNode();
      p.append($createTextNode(cell));
      cellNode.append(p);
      headerRow.append(cellNode);
    }
    tableNode.append(headerRow);

    // Data rows
    for (const row of dataRows) {
      const rowNode = $createTableRowNode();
      for (let i = 0; i < headerCells.length; i++) {
        const cellNode = $createTableCellNode(TableCellHeaderStates.NO_STATUS);
        const p = $createParagraphNode();
        p.append($createTextNode(row[i] ?? ''));
        cellNode.append(p);
        rowNode.append(cellNode);
      }
      tableNode.append(rowNode);
    }

    rootNode.append(tableNode);

    return [true, endLineIndex];
  },
  regExpEnd: {
    optional: true,
    regExp: TABLE_ROW_REG_EXP,
  },
  regExpStart: TABLE_ROW_REG_EXP,
  replace: () => {},
  type: 'multiline-element',
};
