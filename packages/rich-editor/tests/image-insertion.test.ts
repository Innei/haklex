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
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  createEditor,
  type LexicalEditor,
} from 'lexical';
import { describe, expect, it, vi } from 'vitest';

import { ImageNode } from '../src/nodes/ImageNode';
import { createNestedEditor } from '../src/nodes/shared';
import { $withAdaptiveImageDisplayWidth } from '../src/utils/image-insertion';

vi.mock('../src/styles/theme', () => ({
  editorTheme: {},
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

describe('$withAdaptiveImageDisplayWidth in a nested editor', () => {
  function createRootEditorWithNestedChild(): { root: LexicalEditor; nested: LexicalEditor } {
    const root = createTestEditor();
    let nested: LexicalEditor | undefined;

    root.update(() => {
      nested = createNestedEditor('ImageInsertionNestedEditorTest');
    });

    if (!nested) throw new Error('nested editor was not created');
    return { root, nested };
  }

  it('adapts image payload inside a nested editor', () => {
    const { nested } = createRootEditorWithNestedChild();

    nested.update(() => {
      const paragraph = $createParagraphNode();
      const text = $createTextNode('inside nested editor');
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
      ).toBe(100);
    });
  });

  it('preserves explicit display width inside a nested editor', () => {
    const { nested } = createRootEditorWithNestedChild();

    nested.update(() => {
      const paragraph = $createParagraphNode();
      const text = $createTextNode('inside nested editor');
      paragraph.append(text);
      $getRoot().append(paragraph);
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
