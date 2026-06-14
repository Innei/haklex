// @vitest-environment happy-dom
import {
  $createTableCellNode,
  $createTableNode,
  $createTableRowNode,
  TableCellHeaderStates,
  TableCellNode,
  TableNode,
  TableRowNode,
} from '@lexical/table';
import { $createParagraphNode, $createTextNode, $getRoot, createEditor } from 'lexical';
import { describe, expect, it } from 'vitest';

import { ImageNode } from '../src/nodes/ImageNode';
import { $withAdaptiveImageDisplayWidth } from '../src/utils/image-insertion';

function createTestEditor() {
  return createEditor({
    namespace: 'ImageInsertionTest',
    nodes: [ImageNode, TableNode, TableRowNode, TableCellNode],
    onError: (error) => {
      throw error;
    },
  });
}

describe('$withAdaptiveImageDisplayWidth', () => {
  it('does not change image payload outside a table cell', () => {
    const editor = createTestEditor();

    editor.update(() => {
      const paragraph = $createParagraphNode();
      const text = $createTextNode('outside');
      paragraph.append(text);
      $getRoot().append(paragraph);
      text.select();

      expect(
        $withAdaptiveImageDisplayWidth({
          src: 'https://example.com/a.png',
          altText: 'a',
          width: 1200,
          height: 720,
        }).displayWidth,
      ).toBeUndefined();
    });
  });

  it('adapts image payload inside a table cell', () => {
    const editor = createTestEditor();

    editor.update(() => {
      const table = $createTableNode();
      const row = $createTableRowNode();
      const cell = $createTableCellNode(TableCellHeaderStates.NO_STATUS);
      const paragraph = $createParagraphNode();
      const text = $createTextNode('inside');

      paragraph.append(text);
      cell.append(paragraph);
      row.append(cell);
      table.append(row);
      $getRoot().append(table);
      text.select();

      expect(
        $withAdaptiveImageDisplayWidth({
          src: 'https://example.com/a.png',
          altText: 'a',
          width: 1200,
          height: 720,
        }).displayWidth,
      ).toBe(100);
    });
  });

  it('preserves explicit display width inside a table cell', () => {
    const editor = createTestEditor();

    editor.update(() => {
      const table = $createTableNode();
      const row = $createTableRowNode();
      const cell = $createTableCellNode(TableCellHeaderStates.NO_STATUS);
      const paragraph = $createParagraphNode();
      const text = $createTextNode('inside');

      paragraph.append(text);
      cell.append(paragraph);
      row.append(cell);
      table.append(row);
      $getRoot().append(table);
      text.select();

      expect(
        $withAdaptiveImageDisplayWidth({
          src: 'https://example.com/a.png',
          altText: 'a',
          width: 1200,
          height: 720,
          displayWidth: 45,
        }).displayWidth,
      ).toBe(45);
    });
  });
});
