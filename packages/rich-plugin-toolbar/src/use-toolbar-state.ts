import { $selectionTouchesSpoiler } from '@haklex/rich-editor/commands';
import { $isListNode } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelectionStyleValueForProperty } from '@lexical/selection';
import { $findMatchingParent } from '@lexical/utils';
import type { ElementFormatType, ElementNode } from 'lexical';
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
} from 'lexical';
import { useCallback, useEffect, useState } from 'react';

import { getBlockType } from './actions';
import type { BlockType } from './constants';

export interface ToolbarState {
  blockType: BlockType;
  canRedo: boolean;
  canUndo: boolean;
  elementFormat: ElementFormatType;
  fontFamily: string;
  isBold: boolean;
  isCode: boolean;
  isHighlight: boolean;
  isItalic: boolean;
  isSpoiler: boolean;
  isStrikethrough: boolean;
  isUnderline: boolean;
}

export const INITIAL_TOOLBAR_STATE: ToolbarState = {
  canUndo: false,
  canRedo: false,
  blockType: 'paragraph',
  fontFamily: '',
  elementFormat: 'left',
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,
  isCode: false,
  isHighlight: false,
  isSpoiler: false,
};

/**
 * Subscribe to selection/format/history changes and return a reactive ToolbarState.
 * Use inside a component mounted under a LexicalComposer (e.g. via `header={...}`
 * slot of the editor) so the lexical context is available.
 */
export function useToolbarState(): ToolbarState {
  const [editor] = useLexicalComposerContext();
  const [state, setState] = useState<ToolbarState>(INITIAL_TOOLBAR_STATE);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    const anchorNode = selection.anchor.getNode();
    let element =
      anchorNode.getKey() === 'root'
        ? anchorNode
        : ($findMatchingParent(anchorNode, (e) => {
            const parent = e.getParent();
            return parent !== null && $isRootOrShadowRoot(parent);
          }) ?? anchorNode.getTopLevelElementOrThrow());

    if ($isListNode(element)) {
      const parentList = $findMatchingParent(anchorNode, (node) => $isListNode(node));
      if (parentList) {
        element = parentList;
      }
    }

    const blockType = getBlockType(element as ElementNode);
    const fontFamily = $getSelectionStyleValueForProperty(selection, 'font-family', '');
    const elementFormat: ElementFormatType = $isElementNode(element)
      ? element.getFormatType()
      : 'left';

    const isBold = selection.hasFormat('bold');
    const isItalic = selection.hasFormat('italic');
    const isUnderline = selection.hasFormat('underline');
    const isStrikethrough = selection.hasFormat('strikethrough');
    const isCode = selection.hasFormat('code');
    const isHighlight = selection.hasFormat('highlight');
    const isSpoiler = $selectionTouchesSpoiler(selection);

    setState((prev) => ({
      ...prev,
      blockType,
      fontFamily,
      elementFormat,
      isBold,
      isItalic,
      isUnderline,
      isStrikethrough,
      isCode,
      isHighlight,
      isSpoiler,
    }));
  }, []);

  useEffect(() => {
    const unregisterUndo = editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setState((prev) => ({ ...prev, canUndo: payload }));
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
    const unregisterRedo = editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setState((prev) => ({ ...prev, canRedo: payload }));
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
    const unregisterUpdate = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
    return () => {
      unregisterUndo();
      unregisterRedo();
      unregisterUpdate();
    };
  }, [editor, updateToolbar]);

  return state;
}
