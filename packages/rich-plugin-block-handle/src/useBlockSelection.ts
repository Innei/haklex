import {
  $createNodeSelection,
  $getRoot,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COPY_COMMAND,
  CUT_COMMAND,
  DELETE_CHARACTER_COMMAND,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_DOWN_COMMAND,
  KEY_ESCAPE_COMMAND,
  type LexicalEditor,
  type LexicalNode,
  PASTE_COMMAND,
  PASTE_TAG,
  REMOVE_TEXT_COMMAND,
  SELECT_ALL_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useRef } from 'react';

import {
  buildBlockClipboardData,
  createDataTransferFromBlockClipboardData,
  getDataTransferFromPasteEvent,
  hasInsertableClipboardData,
  hasPasteableClipboardData,
  insertDataTransferForBlockSelectionPaste,
  isDataTransferOnlyPasteEvent,
  readNativeClipboardDataTransfer,
  removeTopLevelNodesAndCreatePasteTarget,
  removeTopLevelNodesAndRestoreSelection,
  replaceTopLevelNodesWithDataTransfer,
  setBlockClipboardDataTransfer,
  writeBlockClipboardDataToNativeClipboard,
} from './blockSelectionUtils';
import * as css from './styles.css';

function isPasteBeforeInputEvent(event: InputEvent): boolean {
  return event.inputType === 'insertFromPaste' || event.inputType === 'insertFromPasteAsQuotation';
}

function $getTopLevelKeys(): string[] {
  return $getRoot()
    .getChildren()
    .map((c) => c.getKey());
}

function getTopLevelKey(node: LexicalNode): string | null {
  let current: LexicalNode | null = node;
  while (current && current.getParent() && current.getParent() !== $getRoot()) {
    current = current.getParent();
  }

  return current?.getParent() === $getRoot() ? current.getKey() : null;
}

function $selectBlockRange(anchorKey: string, focusKey: string): void {
  const children = $getRoot().getChildren();
  const anchorIdx = children.findIndex((c) => c.getKey() === anchorKey);
  const focusIdx = children.findIndex((c) => c.getKey() === focusKey);
  if (anchorIdx === -1 || focusIdx === -1) return;

  const start = Math.min(anchorIdx, focusIdx);
  const end = Math.max(anchorIdx, focusIdx);
  const sel = $createNodeSelection();
  for (let i = start; i <= end; i++) {
    sel.add(children[i].getKey());
  }
  $setSelection(sel);
}

export function useBlockSelection(editor: LexicalEditor) {
  const anchorKeyRef = useRef<string | null>(null);
  const focusKeyRef = useRef<string | null>(null);

  // Ownership ref: explicitly tracks which top-level keys are part of a
  // block-handle-initiated selection. Keyboard handlers and DOM class sync
  // only activate when this set is non-empty. This prevents hijacking
  // single-decorator NodeSelections (code-block click, image click, etc.).
  const blockSelectionKeysRef = useRef<Set<string>>(new Set());
  const latestBlockClipboardDataRef = useRef<Record<string, string> | null>(null);

  const clearBlockSelectionState = useCallback(() => {
    blockSelectionKeysRef.current = new Set();
    anchorKeyRef.current = null;
    focusKeyRef.current = null;
  }, []);

  const getTopLevelNodesByKeys = useCallback((keys: ReadonlySet<string>): LexicalNode[] => {
    if (keys.size === 0) return [];
    return $getRoot()
      .getChildren()
      .filter((node) => keys.has(node.getKey()));
  }, []);

  const getOwnedSelectionNodes = useCallback((): LexicalNode[] => {
    const ownedKeys = blockSelectionKeysRef.current;
    if (ownedKeys.size === 0) {
      const selection = $getSelection();
      if (!$isNodeSelection(selection)) return [];

      const selectedNodes = selection.getNodes();
      const topLevelFallbackNodes = selectedNodes.filter((node) => node.getParent() === $getRoot());

      if (
        topLevelFallbackNodes.length > 1 &&
        topLevelFallbackNodes.length === selectedNodes.length
      ) {
        return getTopLevelNodesByKeys(new Set(topLevelFallbackNodes.map((node) => node.getKey())));
      }

      return [];
    }

    const selection = $getSelection();
    if (!$isNodeSelection(selection)) {
      return getTopLevelNodesByKeys(ownedKeys);
    }

    return getTopLevelNodesByKeys(ownedKeys);
  }, [getTopLevelNodesByKeys]);

  const replaceBlockSelectionWithDataTransfer = useCallback(
    (dataTransfer: DataTransfer): boolean => {
      if (!hasInsertableClipboardData(dataTransfer)) {
        return false;
      }

      let handled = false;
      editor.update(
        () => {
          const nodes = getOwnedSelectionNodes();
          if (nodes.length === 0) {
            return;
          }

          handled = replaceTopLevelNodesWithDataTransfer(editor, nodes, dataTransfer);
          if (handled) {
            clearBlockSelectionState();
          }
        },
        { discrete: true, tag: PASTE_TAG },
      );

      return handled;
    },
    [clearBlockSelectionState, editor, getOwnedSelectionNodes],
  );

  const getCurrentBlockClipboardData = useCallback((): Record<string, string> | null => {
    let clipboardData: Record<string, string> | null = null;

    editor.getEditorState().read(() => {
      const nodes = getOwnedSelectionNodes();
      if (nodes.length === 0) return;

      clipboardData = buildBlockClipboardData(editor, nodes);
    });

    return clipboardData;
  }, [editor, getOwnedSelectionNodes]);

  const deleteBlocksByKeys = useCallback(
    (keys: readonly string[]) => {
      editor.update(
        () => {
          const nodes = getTopLevelNodesByKeys(new Set(keys));
          if (nodes.length === 0) return;

          removeTopLevelNodesAndRestoreSelection(nodes);
          clearBlockSelectionState();
        },
        { discrete: true },
      );
    },
    [clearBlockSelectionState, editor, getTopLevelNodesByKeys],
  );

  // ── DOM class sync + ownership validation ──
  useEffect(() => {
    let prevKeys = new Set<string>();

    const unregister = editor.registerUpdateListener(({ editorState }) => {
      const rootEl = editor.getRootElement();
      if (!rootEl) return;

      const nextKeys = new Set<string>();
      let isNodeSel = false;
      const rangeTopLevelKeys: string[] = [];
      let topLevelKeys: string[] = [];

      editorState.read(() => {
        const sel = $getSelection();
        if ($isNodeSelection(sel)) {
          isNodeSel = true;
          for (const node of sel.getNodes()) {
            nextKeys.add(node.getKey());
          }
        } else if ($isRangeSelection(sel)) {
          const anchorTopLevelKey = getTopLevelKey(sel.anchor.getNode());
          const focusTopLevelKey = getTopLevelKey(sel.focus.getNode());
          if (anchorTopLevelKey) rangeTopLevelKeys.push(anchorTopLevelKey);
          if (focusTopLevelKey && focusTopLevelKey !== anchorTopLevelKey) {
            rangeTopLevelKeys.push(focusTopLevelKey);
          }
        }
        topLevelKeys = $getTopLevelKeys();
      });

      // If the selection changed away from our owned set (e.g. undo/redo
      // restored a different selection, or user clicked a decorator),
      // relinquish ownership.
      if (blockSelectionKeysRef.current.size > 0) {
        if (!isNodeSel) {
          const owned = blockSelectionKeysRef.current;
          const rangeStillInsideOwnedBlocks =
            rangeTopLevelKeys.length > 0 && rangeTopLevelKeys.every((key) => owned.has(key));

          if (!rangeStillInsideOwnedBlocks) {
            clearBlockSelectionState();
          }
        } else {
          const owned = blockSelectionKeysRef.current;
          const stillOwned =
            nextKeys.size === owned.size && [...nextKeys].every((k) => owned.has(k));
          if (!stillOwned) {
            const topLevelSet = new Set(topLevelKeys);
            const restoredTopLevel = [...nextKeys].filter((k) => topLevelSet.has(k));

            if (restoredTopLevel.length > 1) {
              const indices = restoredTopLevel
                .map((k) => topLevelKeys.indexOf(k))
                .sort((a, b) => a - b);
              anchorKeyRef.current = topLevelKeys[indices[0]];
              focusKeyRef.current = topLevelKeys[indices.at(-1)!];
              blockSelectionKeysRef.current = new Set(restoredTopLevel);
            } else {
              clearBlockSelectionState();
            }
          }
        }
      }

      // Only apply highlight classes for our owned block selection.
      const topLevelKeySet = new Set(topLevelKeys);
      const highlightKeys =
        blockSelectionKeysRef.current.size > 0
          ? new Set([...blockSelectionKeysRef.current].filter((key) => topLevelKeySet.has(key)))
          : new Set<string>();

      for (const key of prevKeys) {
        if (!highlightKeys.has(key)) {
          editor.getElementByKey(key)?.classList.remove(css.blockSelected);
        }
      }
      for (const key of highlightKeys) {
        if (!prevKeys.has(key)) {
          editor.getElementByKey(key)?.classList.add(css.blockSelected);
        }
      }

      prevKeys = highlightKeys;
    });

    // Cleanup: remove all highlight classes on unmount.
    return () => {
      unregister();
      for (const key of prevKeys) {
        editor.getElementByKey(key)?.classList.remove(css.blockSelected);
      }
    };
  }, [clearBlockSelectionState, editor]);

  useEffect(() => {
    const rootEl = editor.getRootElement();
    if (!rootEl) return;

    const onPointerDown = (event: PointerEvent) => {
      if (blockSelectionKeysRef.current.size === 0) return;
      if (!(event.target instanceof Node) || !rootEl.contains(event.target)) return;

      clearBlockSelectionState();
    };

    rootEl.addEventListener('pointerdown', onPointerDown, true);
    return () => rootEl.removeEventListener('pointerdown', onPointerDown, true);
  }, [clearBlockSelectionState, editor]);

  // ── Nested editor focus guard ──
  // Clicking inside a nested Lexical editor (AlertQuoteEditNode, GridEditNode,
  // BannerEditNode) does NOT set a RangeSelection in the parent editor, so
  // block highlights would remain stale. Listen for focusin on the root and
  // clear block selection if focus moved into a nested contenteditable.
  useEffect(() => {
    const rootEl = editor.getRootElement();
    if (!rootEl) return;

    const onFocusIn = (e: FocusEvent) => {
      if (blockSelectionKeysRef.current.size === 0) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // If focus landed on a nested contenteditable (not the root itself),
      // clear block selection.
      const nestedEditable = target.closest('[contenteditable="true"]');
      if (nestedEditable && nestedEditable !== rootEl) {
        clearBlockSelectionState();
        editor.update(() => {
          const sel = $getSelection();
          if ($isNodeSelection(sel)) {
            $setSelection(null);
          }
        });
      }
    };

    rootEl.addEventListener('focusin', onFocusIn);
    return () => rootEl.removeEventListener('focusin', onFocusIn);
  }, [clearBlockSelectionState, editor]);

  useEffect(() => {
    const rootEl = editor.getRootElement();
    if (!rootEl) return;

    const onBeforeInput = (event: InputEvent) => {
      if (!isPasteBeforeInputEvent(event)) return;

      if (blockSelectionKeysRef.current.size === 0 || !event.dataTransfer) return;

      const handled = replaceBlockSelectionWithDataTransfer(event.dataTransfer);
      if (!handled) return;

      event.preventDefault();
      event.stopPropagation();
    };

    rootEl.addEventListener('beforeinput', onBeforeInput, true);
    return () => rootEl.removeEventListener('beforeinput', onBeforeInput, true);
  }, [editor, replaceBlockSelectionWithDataTransfer]);

  // ── Keyboard commands ──
  useEffect(() => {
    const unregKeyDown = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event) => {
        const key = event.key.toLowerCase();
        if (!event.metaKey && !event.ctrlKey && key !== 'escape') return false;
        if (!['a', 'c', 'v', 'x', 'escape'].includes(key)) return false;

        if (
          (event.metaKey || event.ctrlKey) &&
          key === 'v' &&
          blockSelectionKeysRef.current.size > 0
        ) {
          event.preventDefault();
          const cachedClipboardData = latestBlockClipboardDataRef.current
            ? { ...latestBlockClipboardDataRef.current }
            : null;

          void (async () => {
            const dataTransfer = cachedClipboardData
              ? createDataTransferFromBlockClipboardData(cachedClipboardData)
              : await readNativeClipboardDataTransfer();

            if (!dataTransfer) {
              return;
            }
            if (blockSelectionKeysRef.current.size === 0) {
              return;
            }

            replaceBlockSelectionWithDataTransfer(dataTransfer);
          })();
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );

    // Shift+ArrowDown: extend block selection downward.
    // Guard: only activate for our owned block selection.
    const unregShiftDown = editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      (event) => {
        if (!event?.shiftKey) return false;
        if (blockSelectionKeysRef.current.size === 0 || !focusKeyRef.current) return false;
        const sel = $getSelection();
        if (!$isNodeSelection(sel)) return false;

        const children = $getRoot().getChildren();
        const focusIdx = children.findIndex((c) => c.getKey() === focusKeyRef.current);
        if (focusIdx === -1 || focusIdx >= children.length - 1) return false;

        event.preventDefault();
        focusKeyRef.current = children[focusIdx + 1].getKey();
        $selectBlockRange(anchorKeyRef.current!, focusKeyRef.current);
        // Update ownership to match the new selection.
        const start = Math.min(
          children.findIndex((c) => c.getKey() === anchorKeyRef.current),
          focusIdx + 1,
        );
        const end = Math.max(
          children.findIndex((c) => c.getKey() === anchorKeyRef.current),
          focusIdx + 1,
        );
        blockSelectionKeysRef.current = new Set(
          children.slice(start, end + 1).map((c) => c.getKey()),
        );
        return true;
      },
      COMMAND_PRIORITY_CRITICAL,
    );

    // Shift+ArrowUp: extend block selection upward.
    const unregShiftUp = editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      (event) => {
        if (!event?.shiftKey) return false;
        if (blockSelectionKeysRef.current.size === 0 || !focusKeyRef.current) return false;
        const sel = $getSelection();
        if (!$isNodeSelection(sel)) return false;

        const children = $getRoot().getChildren();
        const focusIdx = children.findIndex((c) => c.getKey() === focusKeyRef.current);
        if (focusIdx === -1 || focusIdx <= 0) return false;

        event.preventDefault();
        focusKeyRef.current = children[focusIdx - 1].getKey();
        $selectBlockRange(anchorKeyRef.current!, focusKeyRef.current);
        const anchorIdx = children.findIndex((c) => c.getKey() === anchorKeyRef.current);
        const start = Math.min(anchorIdx, focusIdx - 1);
        const end = Math.max(anchorIdx, focusIdx - 1);
        blockSelectionKeysRef.current = new Set(
          children.slice(start, end + 1).map((c) => c.getKey()),
        );
        return true;
      },
      COMMAND_PRIORITY_CRITICAL,
    );

    // Progressive Cmd+A: current block → all blocks.
    const unregSelectAll = editor.registerCommand(
      SELECT_ALL_COMMAND,
      () => {
        if (blockSelectionKeysRef.current.size > 0) {
          const children = $getRoot().getChildren();
          const allKeys = children.map((c) => c.getKey());
          if (blockSelectionKeysRef.current.size >= allKeys.length) {
            return true;
          }
          anchorKeyRef.current = allKeys[0];
          focusKeyRef.current = allKeys.at(-1)!;
          blockSelectionKeysRef.current = new Set(allKeys);
          const nodeSel = $createNodeSelection();
          for (const key of allKeys) nodeSel.add(key);
          $setSelection(nodeSel);
          return true;
        }

        const sel = $getSelection();
        let topLevelKey: string | null = null;

        if ($isRangeSelection(sel)) {
          let node = sel.anchor.getNode();
          while (node.getParent() && node.getParent() !== $getRoot()) {
            node = node.getParent()!;
          }
          if (node.getParent() === $getRoot()) {
            topLevelKey = node.getKey();
          }
        } else if ($isNodeSelection(sel)) {
          const nodes = sel.getNodes();
          if (nodes.length > 0) {
            let node = nodes[0];
            while (node.getParent() && node.getParent() !== $getRoot()) {
              node = node.getParent()!;
            }
            if (node.getParent() === $getRoot()) {
              topLevelKey = node.getKey();
            }
          }
        }

        if (topLevelKey) {
          anchorKeyRef.current = topLevelKey;
          focusKeyRef.current = topLevelKey;
          blockSelectionKeysRef.current = new Set([topLevelKey]);
          const nodeSel = $createNodeSelection();
          nodeSel.add(topLevelKey);
          $setSelection(nodeSel);
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );

    // Escape: clear block selection (only if we own it).
    const unregEscape = editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      () => {
        if (blockSelectionKeysRef.current.size === 0) return false;

        clearBlockSelectionState();
        $setSelection(null);
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );

    const unregCopy = editor.registerCommand(
      COPY_COMMAND,
      (event) => {
        const clipboardEvent =
          event && typeof event === 'object' && 'clipboardData' in event ? event : null;

        const clipboardData = getCurrentBlockClipboardData();
        if (!clipboardData) return false;

        latestBlockClipboardDataRef.current = clipboardData;

        if (clipboardEvent?.clipboardData) {
          clipboardEvent.preventDefault();
          setBlockClipboardDataTransfer(clipboardEvent.clipboardData, clipboardData);
          return true;
        }

        if (
          event &&
          typeof event === 'object' &&
          'preventDefault' in event &&
          typeof event.preventDefault === 'function'
        ) {
          event.preventDefault();
        }

        writeBlockClipboardDataToNativeClipboard(editor, clipboardData);

        return true;
      },
      COMMAND_PRIORITY_CRITICAL,
    );

    const unregCut = editor.registerCommand(
      CUT_COMMAND,
      (event) => {
        const clipboardEvent =
          event && typeof event === 'object' && 'clipboardData' in event ? event : null;

        let keysToDelete: string[] = [];
        let clipboardData: Record<string, string> | null = null;

        editor.getEditorState().read(() => {
          const nodes = getOwnedSelectionNodes();
          if (nodes.length === 0) return;

          clipboardData = buildBlockClipboardData(editor, nodes);
          keysToDelete = nodes.map((node) => node.getKey());
        });

        if (keysToDelete.length === 0 || !clipboardData) return false;

        latestBlockClipboardDataRef.current = clipboardData;

        if (clipboardEvent?.clipboardData) {
          clipboardEvent.preventDefault();
          setBlockClipboardDataTransfer(clipboardEvent.clipboardData, clipboardData);
        } else {
          if (
            event &&
            typeof event === 'object' &&
            'preventDefault' in event &&
            typeof event.preventDefault === 'function'
          ) {
            event.preventDefault();
          }
          writeBlockClipboardDataToNativeClipboard(editor, clipboardData);
        }

        deleteBlocksByKeys(keysToDelete);
        return true;
      },
      COMMAND_PRIORITY_CRITICAL,
    );

    const unregPaste = editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        const clipboardData = getDataTransferFromPasteEvent(event);
        if (!clipboardData) {
          return false;
        }

        const dataTransferOnly = isDataTransferOnlyPasteEvent(event);
        const hasPasteData = dataTransferOnly
          ? hasInsertableClipboardData(clipboardData)
          : hasPasteableClipboardData(clipboardData);
        if (!hasPasteData) {
          return false;
        }

        const nodes = getOwnedSelectionNodes();
        if (nodes.length === 0) {
          return false;
        }

        removeTopLevelNodesAndCreatePasteTarget(nodes);
        clearBlockSelectionState();

        if (dataTransferOnly) {
          if (
            event &&
            typeof event === 'object' &&
            'preventDefault' in event &&
            typeof event.preventDefault === 'function'
          ) {
            event.preventDefault();
          }
          return insertDataTransferForBlockSelectionPaste(editor, clipboardData);
        }

        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );

    const handleDeleteBlocks = (
      payload: boolean | Event | InputEvent | KeyboardEvent | null | undefined,
    ) => {
      let keysToDelete: string[] = [];

      editor.getEditorState().read(() => {
        keysToDelete = getOwnedSelectionNodes().map((node) => node.getKey());
      });

      if (keysToDelete.length === 0) return false;

      if (
        payload &&
        typeof payload !== 'boolean' &&
        'preventDefault' in payload &&
        typeof payload.preventDefault === 'function'
      ) {
        payload.preventDefault();
      }
      deleteBlocksByKeys(keysToDelete);
      return true;
    };

    const unregBackspace = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      handleDeleteBlocks,
      COMMAND_PRIORITY_CRITICAL,
    );

    const unregDelete = editor.registerCommand(
      KEY_DELETE_COMMAND,
      handleDeleteBlocks,
      COMMAND_PRIORITY_CRITICAL,
    );

    const unregRemoveText = editor.registerCommand(
      REMOVE_TEXT_COMMAND,
      handleDeleteBlocks,
      COMMAND_PRIORITY_CRITICAL,
    );

    const unregDeleteCharacter = editor.registerCommand(
      DELETE_CHARACTER_COMMAND,
      handleDeleteBlocks,
      COMMAND_PRIORITY_CRITICAL,
    );

    return () => {
      unregKeyDown();
      unregShiftDown();
      unregShiftUp();
      unregSelectAll();
      unregEscape();
      unregCopy();
      unregCut();
      unregPaste();
      unregBackspace();
      unregDelete();
      unregRemoveText();
      unregDeleteCharacter();
    };
  }, [
    clearBlockSelectionState,
    deleteBlocksByKeys,
    editor,
    getCurrentBlockClipboardData,
    getOwnedSelectionNodes,
    replaceBlockSelectionWithDataTransfer,
  ]);

  // ── Public API ──
  const selectBlock = useCallback(
    (nodeKey: string, shiftKey: boolean) => {
      editor.update(() => {
        if (shiftKey && anchorKeyRef.current) {
          focusKeyRef.current = nodeKey;
          $selectBlockRange(anchorKeyRef.current, nodeKey);
          // Compute the full range for ownership.
          const children = $getRoot().getChildren();
          const anchorIdx = children.findIndex((c) => c.getKey() === anchorKeyRef.current);
          const focusIdx = children.findIndex((c) => c.getKey() === nodeKey);
          if (anchorIdx !== -1 && focusIdx !== -1) {
            const start = Math.min(anchorIdx, focusIdx);
            const end = Math.max(anchorIdx, focusIdx);
            blockSelectionKeysRef.current = new Set(
              children.slice(start, end + 1).map((c) => c.getKey()),
            );
          }
        } else {
          anchorKeyRef.current = nodeKey;
          focusKeyRef.current = nodeKey;
          blockSelectionKeysRef.current = new Set([nodeKey]);
          const sel = $createNodeSelection();
          sel.add(nodeKey);
          $setSelection(sel);
        }
      });
    },
    [editor],
  );

  const getSelectedKeys = useCallback((): string[] => {
    if (blockSelectionKeysRef.current.size === 0) return [];

    let keys: string[] = [];
    editor.getEditorState().read(() => {
      keys = getTopLevelNodesByKeys(blockSelectionKeysRef.current).map((node) => node.getKey());
    });

    return keys;
  }, [editor, getTopLevelNodesByKeys]);

  const deleteSelectedBlocks = useCallback(
    (fallbackNodeKey?: string | null) => {
      const selectedKeys = getSelectedKeys();
      const keys =
        selectedKeys.length > 0 ? selectedKeys : fallbackNodeKey ? [fallbackNodeKey] : [];

      if (keys.length === 0) return;
      deleteBlocksByKeys(keys);
    },
    [deleteBlocksByKeys, getSelectedKeys],
  );

  const isBlockSelectionActive = useCallback(
    (): boolean => blockSelectionKeysRef.current.size > 0,
    [],
  );

  return { selectBlock, getSelectedKeys, isBlockSelectionActive, deleteSelectedBlocks };
}
