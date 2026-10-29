import type { LexicalEditor } from 'lexical';
import {
  $getNearestNodeFromDOMNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_DOWN_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import type { RefObject } from 'react';
import { useEffect } from 'react';

import { focusFirstItem } from './roving';
import { findRubyAncestor } from './selection-state';
import type { FocusOrigin, ToolbarMode } from './use-inline-modes';

export function useEditorBindings({
  editor,
  editRuby,
  modeRef,
  openLink,
  toolbarRef,
  updateToolbar,
}: {
  editor: LexicalEditor;
  editRuby: (nodeKey: string, reading: string) => void;
  modeRef: RefObject<ToolbarMode>;
  openLink: (origin: FocusOrigin) => void;
  toolbarRef: RefObject<HTMLDivElement | null>;
  updateToolbar: () => void;
}) {
  useEffect(() => {
    const onRootClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (window.getSelection()?.isCollapsed === false) return;
      const ruby = editor.read(() => {
        const node = findRubyAncestor($getNearestNodeFromDOMNode(target));
        return node ? { key: node.getKey(), reading: node.getReading() } : null;
      });
      if (ruby) editRuby(ruby.key, ruby.reading);
    };
    let attachedRoot: HTMLElement | null = null;

    return mergeCleanups(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(updateToolbar);
      }),
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event) => {
          const isModK =
            event.key.toLowerCase() === 'k' &&
            (event.metaKey || event.ctrlKey) &&
            !event.altKey &&
            !event.shiftKey;
          const isAltF10 = event.key === 'F10' && event.altKey;
          if ((!isModK && !isAltF10) || modeRef.current.kind !== 'format') return false;
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || selection.isCollapsed()) return false;
          if (isAltF10 && !toolbarRef.current) return false;
          event.preventDefault();
          if (isAltF10) {
            queueMicrotask(() => focusFirstItem(toolbarRef.current));
            return true;
          }
          queueMicrotask(() => openLink('editor'));
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerRootListener((root) => {
        attachedRoot?.removeEventListener('click', onRootClick);
        attachedRoot = root;
        root?.addEventListener('click', onRootClick);
      }),
      () => attachedRoot?.removeEventListener('click', onRootClick),
    );
  }, [editRuby, editor, modeRef, openLink, toolbarRef, updateToolbar]);
}

function mergeCleanups(...cleanups: (() => void)[]) {
  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
