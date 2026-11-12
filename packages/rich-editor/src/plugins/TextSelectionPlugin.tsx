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

const managedSelectionClasses = [
  css.nativeSelectionActive,
  css.nativeSelectionInactive,
  css.nativeSelectionHidden,
];

function getHighlightRegistry(): Map<string, Highlight> | null {
  if (typeof CSS === 'undefined' || !('highlights' in CSS) || typeof Highlight === 'undefined') {
    return null;
  }

  return (CSS as unknown as HighlightRegistry).highlights;
}

function clearManagedHighlight(rootElement?: HTMLElement | null): void {
  if (rootElement && rootElement !== activeHighlightOwner) {
    rootElement.classList.remove(...managedSelectionClasses);
    return;
  }

  const registry = getHighlightRegistry();
  registry?.delete(TEXT_SELECTION_HIGHLIGHT_NAME);
  registry?.delete(TEXT_SELECTION_INACTIVE_HIGHLIGHT_NAME);
  activeHighlightOwner?.classList.remove(...managedSelectionClasses);
  activeHighlightOwner = null;
}

export function TextSelectionPlugin() {
  const [editor] = useLexicalComposerContext();
  const store = useTextSelectionStore();
  const snapshot = useTextSelectionSnapshot();
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [rootHasFocus, setRootHasFocus] = useState(false);
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
      setRootHasFocus(Boolean(rootElement && activeElement === rootElement));
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
          // A caret paints no selection, so the class can stay: removing it and
          // adding it back on the next drag restyles the whole document twice.
          // Focus inside a nested editable or input needs its native selection back.
          const domSelection = rootElement.ownerDocument.getSelection();
          if (rootHasFocus && (!domSelection || domSelection.isCollapsed)) {
            if (activeHighlightOwner === rootElement) {
              registry?.delete(TEXT_SELECTION_HIGHLIGHT_NAME);
              registry?.delete(TEXT_SELECTION_INACTIVE_HIGHLIGHT_NAME);
            }
            return;
          }
          clearManagedHighlight(rootElement);
          return;
        }

        if (activeHighlightOwner && activeHighlightOwner !== rootElement) {
          activeHighlightOwner.classList.remove(...managedSelectionClasses);
        }

        const range = registry ? createDOMRangeFromTextSelection(rootElement, snapshot) : null;
        if (registry && !range) {
          clearManagedHighlight(rootElement);
          return;
        }

        const selectionClass = range
          ? css.nativeSelectionHidden
          : isEditorFocused
            ? css.nativeSelectionActive
            : css.nativeSelectionInactive;
        rootElement.classList.remove(
          ...managedSelectionClasses.filter((name) => name !== selectionClass),
        );
        rootElement.classList.add(selectionClass);
        activeHighlightOwner = rootElement;

        if (!registry || !range) {
          return;
        }

        const highlightName = isEditorFocused
          ? TEXT_SELECTION_HIGHLIGHT_NAME
          : TEXT_SELECTION_INACTIVE_HIGHLIGHT_NAME;
        const staleHighlightName = isEditorFocused
          ? TEXT_SELECTION_INACTIVE_HIGHLIGHT_NAME
          : TEXT_SELECTION_HIGHLIGHT_NAME;
        registry.delete(staleHighlightName);
        registry.set(highlightName, new Highlight(range));
      });
    };
    syncManagedHighlight();

    return cancelScheduledSync;
  }, [editor, isEditorFocused, rootHasFocus, snapshot]);

  // Clearing on every snapshot change toggles a `*::selection` class on the
  // root, which restyles the whole document twice per selection change.
  useEffect(() => () => clearManagedHighlight(editor.getRootElement()), [editor]);

  return null;
}
