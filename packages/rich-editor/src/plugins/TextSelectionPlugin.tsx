import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_LOW, SELECTION_CHANGE_COMMAND } from 'lexical';
import { useEffect, useRef, useState } from 'react';

import { useTextSelectionSnapshot, useTextSelectionStore } from '../context/TextSelectionContext';
import { $captureTextSelection, createDOMRangeFromTextSelection } from '../utils/text-selection';
import {
  TEXT_SELECTION_HIGHLIGHT_NAME,
  TEXT_SELECTION_INACTIVE_HIGHLIGHT_NAME,
} from '../utils/text-selection-constants';
import * as css from './text-selection.css';

type HighlightRegistry = { highlights: Map<string, Highlight> };

let activeHighlightOwner: HTMLElement | null = null;

function getHighlightRegistry(): Map<string, Highlight> | null {
  if (typeof CSS === 'undefined' || !('highlights' in CSS) || typeof Highlight === 'undefined') {
    return null;
  }

  return (CSS as unknown as HighlightRegistry).highlights;
}

function clearManagedHighlight(rootElement?: HTMLElement | null): void {
  if (rootElement && rootElement !== activeHighlightOwner) {
    rootElement.classList.remove(css.nativeSelectionActive, css.nativeSelectionInactive);
    return;
  }

  const registry = getHighlightRegistry();
  registry?.delete(TEXT_SELECTION_HIGHLIGHT_NAME);
  registry?.delete(TEXT_SELECTION_INACTIVE_HIGHLIGHT_NAME);
  activeHighlightOwner?.classList.remove(css.nativeSelectionActive, css.nativeSelectionInactive);
  activeHighlightOwner = null;
}

export function TextSelectionPlugin() {
  const [editor] = useLexicalComposerContext();
  const store = useTextSelectionStore();
  const snapshot = useTextSelectionSnapshot();
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const frameRef = useRef<number | null>(null);
  const focusFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const syncSnapshot = () => {
      const rootElement = editor.getRootElement();
      if (!rootElement) {
        store.clearSnapshot();
        return;
      }

      const nextSnapshot = editor.getEditorState().read(() => $captureTextSelection());
      store.setSnapshot(nextSnapshot);
    };

    const syncFocusState = () => {
      const rootElement = editor.getRootElement();
      const activeElement = rootElement?.ownerDocument.activeElement;
      setIsEditorFocused(
        Boolean(rootElement && activeElement && rootElement.contains(activeElement)),
      );
    };

    const scheduleFocusStateSync = () => {
      if (focusFrameRef.current !== null) {
        cancelAnimationFrame(focusFrameRef.current);
      }

      focusFrameRef.current = requestAnimationFrame(() => {
        focusFrameRef.current = null;
        syncFocusState();
      });
    };

    const unregisterSelectionChange = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        syncSnapshot();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    const unregisterUpdate = editor.registerUpdateListener(() => {
      syncSnapshot();
    });

    const rootElement = editor.getRootElement();
    if (rootElement) {
      const onFocusIn = (event: FocusEvent) => {
        const target = event.target as HTMLElement | null;
        if (!target) return;

        const nestedEditable = target.closest('[contenteditable="true"]');
        if (nestedEditable && nestedEditable !== rootElement) {
          store.clearSnapshot();
          scheduleFocusStateSync();
          return;
        }

        scheduleFocusStateSync();
        syncSnapshot();
      };

      const onFocusOut = () => {
        scheduleFocusStateSync();
        syncSnapshot();
      };

      rootElement.addEventListener('focusin', onFocusIn);
      rootElement.addEventListener('focusout', onFocusOut);

      syncFocusState();
      syncSnapshot();

      return () => {
        unregisterSelectionChange();
        unregisterUpdate();
        if (focusFrameRef.current !== null) {
          cancelAnimationFrame(focusFrameRef.current);
          focusFrameRef.current = null;
        }
        rootElement.removeEventListener('focusin', onFocusIn);
        rootElement.removeEventListener('focusout', onFocusOut);
        store.clearSnapshot();
      };
    }

    syncFocusState();
    syncSnapshot();

    return () => {
      unregisterSelectionChange();
      unregisterUpdate();
      if (focusFrameRef.current !== null) {
        cancelAnimationFrame(focusFrameRef.current);
        focusFrameRef.current = null;
      }
      store.clearSnapshot();
    };
  }, [editor, store]);

  useEffect(() => {
    const registry = getHighlightRegistry();

    const cancelScheduledSync = () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };

    const syncManagedHighlight = () => {
      cancelScheduledSync();

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;

        const rootElement = editor.getRootElement();
        if (!rootElement) {
          clearManagedHighlight();
          return;
        }

        if (!snapshot) {
          clearManagedHighlight(rootElement);
          return;
        }

        if (activeHighlightOwner && activeHighlightOwner !== rootElement) {
          activeHighlightOwner.classList.remove(
            css.nativeSelectionActive,
            css.nativeSelectionInactive,
          );
        }

        const activeSelectionClass = isEditorFocused
          ? css.nativeSelectionActive
          : css.nativeSelectionInactive;
        const inactiveSelectionClass = isEditorFocused
          ? css.nativeSelectionInactive
          : css.nativeSelectionActive;
        const highlightName = isEditorFocused
          ? TEXT_SELECTION_HIGHLIGHT_NAME
          : TEXT_SELECTION_INACTIVE_HIGHLIGHT_NAME;
        const staleHighlightName = isEditorFocused
          ? TEXT_SELECTION_INACTIVE_HIGHLIGHT_NAME
          : TEXT_SELECTION_HIGHLIGHT_NAME;

        rootElement.classList.remove(inactiveSelectionClass);
        rootElement.classList.add(activeSelectionClass);
        activeHighlightOwner = rootElement;

        if (!registry) {
          return;
        }

        const range = createDOMRangeFromTextSelection(rootElement, snapshot);
        if (!range) {
          clearManagedHighlight(rootElement);
          return;
        }

        registry.delete(staleHighlightName);
        registry.set(highlightName, new Highlight(range));
      });
    };
    syncManagedHighlight();

    return () => {
      cancelScheduledSync();
      clearManagedHighlight(editor.getRootElement());
    };
  }, [editor, isEditorFocused, snapshot]);

  return null;
}
