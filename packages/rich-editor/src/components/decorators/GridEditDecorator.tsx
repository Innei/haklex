import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import type { LexicalEditor } from 'lexical';
import { $getNodeByKey, $getRoot } from 'lexical';
import { LayoutGrid, Minus, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { $isGridContainerNode } from '../../nodes/GridContainerNode';
import { $isGridEditNode } from '../../nodes/GridEditNode';
import { gridClassNames, gridStyles } from '../../styles/grid.css';
import { clsx } from '../utils';

interface GridEditDecoratorProps {
  cellEditors: LexicalEditor[];
  cols: number;
  gap: string;
  nodeKey: string;
}

const COL_OPTIONS = [1, 2, 3, 4] as const;

export function GridEditDecorator({
  nodeKey,
  cols: initialCols,
  gap,
  cellEditors,
}: GridEditDecoratorProps) {
  const [editor] = useLexicalComposerContext();
  const [currentCols, setCurrentCols] = useState(initialCols);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isGridContainerNode(node)) {
          setCurrentCols(node.getCols());
        }
      });
    });
  }, [editor, nodeKey]);

  const handleSetCols = useCallback(
    (cols: number) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isGridContainerNode(node)) {
          node.setCols(cols);
        }
      });
    },
    [editor, nodeKey],
  );

  const handleAddRow = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isGridContainerNode(node)) {
        node.addCells(node.getCols());
      }
    });
  }, [editor, nodeKey]);

  const handleRemoveRow = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (!$isGridEditNode(node)) return;
      const cols = node.getCols();
      const editors = node.getCellEditors();
      if (editors.length <= cols) return;

      const lastRow = editors.slice(-cols);
      const allEmpty = lastRow.every((cellEditor) =>
        cellEditor.getEditorState().read(() => $getRoot().getTextContentSize() === 0),
      );
      if (!allEmpty) return;
      node.removeCells(cols);
    });
  }, [editor, nodeKey]);

  return (
    <>
      <div
        className={clsx(gridClassNames.toolbar, gridStyles.toolbar)}
        onMouseDown={(e) => e.preventDefault()}
      >
        <span className={clsx(gridClassNames.toolbarIcon, gridStyles.toolbarIcon)}>
          <LayoutGrid size={14} />
        </span>
        {COL_OPTIONS.map((n) => (
          <button
            aria-label={`${n} columns`}
            key={n}
            type="button"
            className={clsx(
              gridClassNames.colButton,
              gridStyles.colButton,
              n === currentCols && gridClassNames.colButtonActive,
              n === currentCols && gridStyles.colButtonActive,
            )}
            onClick={() => handleSetCols(n)}
          >
            {n}
          </button>
        ))}
        <div className={clsx(gridClassNames.toolbarDivider, gridStyles.toolbarDivider)} />
        <button
          aria-label="Add row"
          className={clsx(gridClassNames.actionButton, gridStyles.actionButton)}
          type="button"
          onClick={handleAddRow}
        >
          <Plus size={14} />
        </button>
        <button
          aria-label="Remove row"
          className={clsx(gridClassNames.actionButton, gridStyles.actionButton)}
          type="button"
          onClick={handleRemoveRow}
        >
          <Minus size={14} />
        </button>
      </div>
      <div
        className={clsx(gridClassNames.inner, gridStyles.inner)}
        style={{
          gridTemplateColumns: `repeat(${currentCols}, 1fr)`,
          gap,
        }}
      >
        {cellEditors.map((cellEditor, i) => (
          <div className={clsx(gridClassNames.cell, gridStyles.cell)} key={i}>
            <LexicalNestedComposer initialEditor={cellEditor}>
              <RichTextPlugin
                ErrorBoundary={LexicalErrorBoundary}
                contentEditable={
                  <ContentEditable
                    aria-placeholder=""
                    className={clsx(gridClassNames.cellEditable, gridStyles.cellEditable)}
                    placeholder={<span style={{ display: 'none' }} />}
                  />
                }
              />
              <ListPlugin />
              <LinkPlugin />
            </LexicalNestedComposer>
          </div>
        ))}
      </div>
    </>
  );
}
