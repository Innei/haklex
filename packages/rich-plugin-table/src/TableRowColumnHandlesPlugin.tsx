import { PortalThemeWrapper } from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getTableCellNodeFromLexicalNode,
  $isTableCellNode,
  $isTableSelection,
} from '@lexical/table';
import {
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  type BaseSelection,
  type LexicalEditor,
} from 'lexical';
import { Plus } from 'lucide-react';
import type { CSSProperties, ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import * as css from './styles.css';
import { $getTableHeaderState, $runTableAction, type TableAction } from './table-actions';
import { ColumnHandleMenu, RowHandleMenu } from './TableHandleMenus';

interface HandleLayout {
  appendColumn: CSSProperties;
  appendRow: CSSProperties;
  column: CSSProperties;
  isHeaderColumn: boolean;
  isHeaderRow: boolean;
  row: CSSProperties;
}

const HIDE_DELAY = 300;
const HANDLE_SIZE = 20;
const HANDLE_GAP = 6;
const APPEND_SIZE = 16;
const APPEND_GAP = 4;

function $selectionCellKey(selection: BaseSelection | null): string | null {
  if (!$isRangeSelection(selection) && !$isTableSelection(selection)) return null;
  const cell = $getTableCellNodeFromLexicalNode(selection.focus.getNode());
  return cell ? cell.getKey() : null;
}

function measure(editor: LexicalEditor, cellKey: string): HandleLayout | null {
  const cellEl = editor.getElementByKey(cellKey);
  const tableEl = cellEl?.closest('table');
  if (!cellEl || !tableEl || !cellEl.isConnected) return null;

  const header = editor.read(() => {
    const node = $getNodeByKey(cellKey);
    return $isTableCellNode(node) ? $getTableHeaderState(node) : null;
  });
  if (!header) return null;

  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const cell = cellEl.getBoundingClientRect();
  const table = tableEl.getBoundingClientRect();
  const clip = tableEl.parentElement?.getBoundingClientRect();
  const visibleRight = clip && clip.width > 0 ? Math.min(table.right, clip.right) : table.right;

  return {
    isHeaderColumn: header.column,
    isHeaderRow: header.row,
    row: {
      top: cell.top + scrollY + cell.height / 2 - HANDLE_SIZE / 2,
      left: table.left + scrollX - HANDLE_SIZE - HANDLE_GAP,
    },
    column: {
      top: table.top + scrollY - HANDLE_SIZE - HANDLE_GAP,
      left: cell.left + scrollX + cell.width / 2 - HANDLE_SIZE / 2,
    },
    appendRow: {
      top: table.bottom + scrollY + APPEND_GAP,
      left: table.left + scrollX,
      width: visibleRight - table.left,
      height: APPEND_SIZE,
    },
    appendColumn: {
      top: table.top + scrollY,
      left: visibleRight + scrollX + APPEND_GAP,
      width: APPEND_SIZE,
      height: table.height,
    },
  };
}

function TableRowColumnHandlesInner({ editor }: { editor: LexicalEditor }): ReactElement | null {
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [selectionKey, setSelectionKey] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [layout, setLayout] = useState<HandleLayout | null>(null);
  const [frozenKey, setFrozenKey] = useState<string | null>(null);
  const [editable, setEditable] = useState(() => editor.isEditable());

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overHandlesRef = useRef(false);

  const activeKey = menuOpen ? frozenKey : (hoverKey ?? selectionKey);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHoverClear = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      if (!overHandlesRef.current) setHoverKey(null);
    }, HIDE_DELAY);
  }, [clearHideTimer]);

  const remeasure = useCallback(() => {
    setLayout(activeKey ? measure(editor, activeKey) : null);
  }, [activeKey, editor]);

  useEffect(() => {
    remeasure();
  }, [remeasure]);

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    const onMouseMove = (e: MouseEvent) => {
      const cellEl = (e.target as HTMLElement).closest('td, th');
      if (!cellEl || !rootElement.contains(cellEl)) {
        if (!overHandlesRef.current) scheduleHoverClear();
        return;
      }
      clearHideTimer();
      const key = editor.read(() => {
        const node = $getNearestNodeFromDOMNode(cellEl);
        const cell = node ? $getTableCellNodeFromLexicalNode(node) : null;
        return cell ? cell.getKey() : null;
      });
      setHoverKey(key);
    };

    const onMouseLeave = () => {
      if (!overHandlesRef.current) scheduleHoverClear();
    };

    rootElement.addEventListener('mousemove', onMouseMove);
    rootElement.addEventListener('mouseleave', onMouseLeave);
    return () => {
      rootElement.removeEventListener('mousemove', onMouseMove);
      rootElement.removeEventListener('mouseleave', onMouseLeave);
      clearHideTimer();
    };
  }, [editor, clearHideTimer, scheduleHoverClear]);

  useEffect(() => editor.registerEditableListener(setEditable), [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      setSelectionKey(editorState.read(() => $selectionCellKey($getSelection())));
      remeasure();
    });
  }, [editor, remeasure]);

  useEffect(() => {
    window.addEventListener('scroll', remeasure, true);
    window.addEventListener('resize', remeasure);
    return () => {
      window.removeEventListener('scroll', remeasure, true);
      window.removeEventListener('resize', remeasure);
    };
  }, [remeasure]);

  const onMenuOpenChange = useCallback(
    (open: boolean) => {
      if (open) setFrozenKey(hoverKey ?? selectionKey);
      setMenuOpen(open);
    },
    [hoverKey, selectionKey],
  );

  const runAction = useCallback(
    (action: TableAction) => {
      if (!activeKey) return;
      editor.update(() => {
        const node = $getNodeByKey(activeKey);
        if ($isTableCellNode(node)) $runTableAction(node, action);
      });
    },
    [activeKey, editor],
  );

  const onHandlesEnter = useCallback(() => {
    overHandlesRef.current = true;
    clearHideTimer();
  }, [clearHideTimer]);

  const onHandlesLeave = useCallback(() => {
    overHandlesRef.current = false;
    scheduleHoverClear();
  }, [scheduleHoverClear]);

  const visible = layout !== null && editable;
  const floatingProps = {
    'className': css.floating,
    'data-visible': visible,
    'inert': !visible,
    'onMouseEnter': onHandlesEnter,
    'onMouseLeave': onHandlesLeave,
  };

  return (
    <>
      <div {...floatingProps} style={layout?.row}>
        <RowHandleMenu
          isHeader={layout?.isHeaderRow ?? false}
          onAction={runAction}
          onOpenChange={onMenuOpenChange}
        />
      </div>
      <div {...floatingProps} style={layout?.column}>
        <ColumnHandleMenu
          isHeader={layout?.isHeaderColumn ?? false}
          onAction={runAction}
          onOpenChange={onMenuOpenChange}
        />
      </div>
      <div {...floatingProps} style={layout?.appendRow}>
        <button
          aria-label="Add row"
          className={css.appendBar}
          title="Add row"
          type="button"
          onClick={() => runAction('append-row')}
        >
          <Plus size={12} />
        </button>
      </div>
      <div {...floatingProps} style={layout?.appendColumn}>
        <button
          aria-label="Add column"
          className={css.appendBar}
          title="Add column"
          type="button"
          onClick={() => runAction('append-column')}
        >
          <Plus size={12} />
        </button>
      </div>
    </>
  );
}

export function TableRowColumnHandlesPlugin(): ReactElement {
  const [editor] = useLexicalComposerContext();

  return createPortal(
    <PortalThemeWrapper>
      <TableRowColumnHandlesInner editor={editor} />
    </PortalThemeWrapper>,
    document.body,
  );
}
