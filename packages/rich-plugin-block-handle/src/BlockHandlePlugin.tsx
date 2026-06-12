import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@haklex/rich-editor-ui';
import { usePortalTheme } from '@haklex/rich-style-token';
import { $createCodeNode } from '@lexical/code-core';
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import type { LexicalEditor } from 'lexical';
import {
  $createParagraphNode,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
} from 'lexical';
import {
  ArrowDown,
  ArrowUp,
  Code2,
  Copy,
  GripVertical,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Plus,
  TextQuote,
  Trash2,
  Type,
} from 'lucide-react';
import type { ComponentType, MouseEvent as ReactMouseEvent, ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import * as css from './styles.css';
import { useBlockSelection } from './useBlockSelection';

const DRAG_DATA_KEY = 'application/x-rich-editor-drag';
const HIDE_DELAY = 300;
const HANDLE_OFFSET = 52;

interface HandlePosition {
  left: number;
  nodeKey: string | null;
  top: number;
  visible: boolean;
}

interface DropLineState {
  left: number;
  top: number;
  visible: boolean;
  width: number;
}

interface TurnIntoItem {
  icon: ComponentType<{ size?: number }>;
  key: string;
  label: string;
}

const TURN_INTO_ITEMS: TurnIntoItem[] = [
  { key: 'paragraph', label: 'Text', icon: Type },
  { key: 'h1', label: 'Heading 1', icon: Heading1 },
  { key: 'h2', label: 'Heading 2', icon: Heading2 },
  { key: 'h3', label: 'Heading 3', icon: Heading3 },
  { key: 'bullet', label: 'Bullet List', icon: List },
  { key: 'numbered', label: 'Numbered List', icon: ListOrdered },
  { key: 'todo', label: 'To-do', icon: ListChecks },
  { key: 'quote', label: 'Quote', icon: TextQuote },
  { key: 'divider', label: 'Divider', icon: Minus },
  { key: 'code', label: 'Code', icon: Code2 },
];

function getBlockElement(editor: LexicalEditor, target: HTMLElement): HTMLElement | null {
  const rootElement = editor.getRootElement();
  if (!rootElement) return null;
  let current: HTMLElement | null = target;
  while (current && current !== rootElement) {
    if (current.parentElement === rootElement) return current;
    current = current.parentElement;
  }
  return null;
}

function getNearestBlockByY(rootElement: HTMLElement, clientY: number): HTMLElement | null {
  const blocks = [...rootElement.children].filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  );
  if (!blocks.length) return null;

  let nearestBlock: HTMLElement | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const block of blocks) {
    const rect = block.getBoundingClientRect();
    if (rect.height <= 0) continue;
    if (clientY >= rect.top && clientY <= rect.bottom) return block;

    const distance = clientY < rect.top ? rect.top - clientY : clientY - rect.bottom;
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestBlock = block;
    }
  }

  return nearestBlock;
}

function getDropTargetBlock(
  editor: LexicalEditor,
  rootElement: HTMLElement,
  event: DragEvent,
): HTMLElement | null {
  const rootRect = rootElement.getBoundingClientRect();
  if (rootRect.width <= 0 || rootRect.height <= 0) return null;
  if (event.clientY < rootRect.top || event.clientY > rootRect.bottom) {
    return null;
  }

  const points: Array<{ x: number; y: number }> = [{ x: event.clientX, y: event.clientY }];
  const clampedX = Math.min(rootRect.right - 1, Math.max(rootRect.left + 1, event.clientX));
  if (clampedX !== event.clientX) {
    points.unshift({ x: clampedX, y: event.clientY });
  }

  for (const point of points) {
    const element = document.elementFromPoint(point.x, point.y);
    if (!(element instanceof HTMLElement)) continue;
    const block = getBlockElement(editor, element);
    if (block) return block;
  }

  const { target } = event;
  if (target instanceof HTMLElement) {
    const block = getBlockElement(editor, target);
    if (block) return block;
  }

  return getNearestBlockByY(rootElement, event.clientY);
}

function toPagePosition(rect: DOMRect) {
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
  };
}

function $cloneNode(node: import('lexical').LexicalNode): import('lexical').LexicalNode {
  const Klass = node.constructor as any;
  const serialized = node.exportJSON();
  const clone = Klass.importJSON(serialized);
  if ($isElementNode(node) && $isElementNode(clone)) {
    for (const child of node.getChildren()) {
      clone.append($cloneNode(child));
    }
  }
  return clone;
}

function BlockHandleInner({ editor }: { editor: LexicalEditor }): ReactElement | null {
  const { className: portalClassName, theme } = usePortalTheme();
  const [handle, setHandle] = useState<HandlePosition>({
    visible: false,
    top: 0,
    left: 0,
    nodeKey: null,
  });
  const [dropLine, setDropLine] = useState<DropLineState>({
    visible: false,
    top: 0,
    left: 0,
    width: 0,
  });

  const activeBlockRef = useRef<HTMLElement | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveringHandleRef = useRef(false);
  const menuOpenCountRef = useRef(0);
  const dragPreviewRef = useRef<HTMLElement | null>(null);
  const draggingBlockRef = useRef<HTMLElement | null>(null);
  const draggingBlockKeysRef = useRef<string[] | null>(null);

  const { selectBlock, getSelectedKeys, deleteSelectedBlocks } = useBlockSelection(editor);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      if (!hoveringHandleRef.current && menuOpenCountRef.current === 0) {
        activeBlockRef.current = null;
        setHandle((state) => ({ ...state, visible: false, nodeKey: null }));
      }
    }, HIDE_DELAY);
  }, [clearHideTimer]);

  const onHandleEnter = useCallback(() => {
    hoveringHandleRef.current = true;
    clearHideTimer();
  }, [clearHideTimer]);

  const onHandleLeave = useCallback(() => {
    hoveringHandleRef.current = false;
    scheduleHide();
  }, [scheduleHide]);

  const onMenuOpenChange = useCallback(
    (open: boolean) => {
      menuOpenCountRef.current += open ? 1 : -1;
      if (!open) scheduleHide();
      else clearHideTimer();
    },
    [clearHideTimer, scheduleHide],
  );

  const updatePositionFromBlock = useCallback(
    (block?: HTMLElement | null) => {
      if (block !== undefined) activeBlockRef.current = block;
      const element = activeBlockRef.current;
      if (!element || !element.isConnected) {
        activeBlockRef.current = null;
        setHandle((state) => (state.visible ? { ...state, visible: false, nodeKey: null } : state));
        return;
      }

      const rootElement = editor.getRootElement();
      if (!rootElement) return;

      const blockRect = element.getBoundingClientRect();
      const rootRect = rootElement.getBoundingClientRect();
      const page = toPagePosition(blockRect);

      let nodeKey: string | null = null;
      editor.read(() => {
        const node = $getNearestNodeFromDOMNode(element);
        if (node) nodeKey = node.getKey();
      });

      setHandle({
        visible: true,
        top: page.top,
        left: toPagePosition(rootRect).left - HANDLE_OFFSET,
        nodeKey,
      });
    },
    [editor],
  );

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    let rafId: number | null = null;

    const onMouseMove = (event: MouseEvent) => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const target = event.target as HTMLElement;
        const block = getBlockElement(editor, target);
        if (block) {
          clearHideTimer();
          updatePositionFromBlock(block);
        }
      });
    };

    const onMouseLeave = () => {
      if (!hoveringHandleRef.current && menuOpenCountRef.current === 0) {
        scheduleHide();
      }
    };

    rootElement.addEventListener('mousemove', onMouseMove);
    rootElement.addEventListener('mouseleave', onMouseLeave);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rootElement.removeEventListener('mousemove', onMouseMove);
      rootElement.removeEventListener('mouseleave', onMouseLeave);
      clearHideTimer();
    };
  }, [clearHideTimer, editor, scheduleHide, updatePositionFromBlock]);

  useEffect(() => {
    const update = () => updatePositionFromBlock();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [updatePositionFromBlock]);

  useEffect(
    () => editor.registerUpdateListener(() => updatePositionFromBlock()),
    [editor, updatePositionFromBlock],
  );

  const handleAddBlock = useCallback(() => {
    if (!handle.nodeKey) return;
    editor.update(() => {
      const node = $getNodeByKey(handle.nodeKey!);
      if (!node) return;
      const paragraph = $createParagraphNode();
      node.insertAfter(paragraph);
      paragraph.selectStart();
    });
  }, [editor, handle.nodeKey]);

  const handleTurnInto = useCallback(
    (type: string) => {
      const { nodeKey } = handle;
      if (!nodeKey) return;

      if (['bullet', 'numbered', 'todo', 'divider'].includes(type)) {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if (!node) return;
          if ($isElementNode(node)) node.selectStart();
        });
        const commands: Record<string, any> = {
          bullet: INSERT_UNORDERED_LIST_COMMAND,
          numbered: INSERT_ORDERED_LIST_COMMAND,
          todo: INSERT_CHECK_LIST_COMMAND,
          divider: INSERT_HORIZONTAL_RULE_COMMAND,
        };
        editor.dispatchCommand(commands[type], void 0);
        return;
      }

      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (!node || !$isElementNode(node)) return;
        node.selectStart();
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        const creators: Record<string, () => import('lexical').ElementNode> = {
          paragraph: () => $createParagraphNode(),
          h1: () => $createHeadingNode('h1'),
          h2: () => $createHeadingNode('h2'),
          h3: () => $createHeadingNode('h3'),
          quote: () => $createQuoteNode(),
          code: () => $createCodeNode(),
        };
        const create = creators[type];
        if (create) $setBlocksType(selection, create);
      });
    },
    [editor, handle],
  );

  const handleDelete = useCallback(() => {
    deleteSelectedBlocks(handle.nodeKey);
    setHandle((state) => ({ ...state, visible: false, nodeKey: null }));
  }, [deleteSelectedBlocks, handle.nodeKey]);

  const handleDuplicate = useCallback(() => {
    const selectedKeys = getSelectedKeys();
    const keys = selectedKeys.length > 0 ? selectedKeys : handle.nodeKey ? [handle.nodeKey] : [];
    if (!keys.length) return;

    editor.update(() => {
      const root = $getRoot();
      const children = root.getChildren();
      const keySet = new Set(keys);
      const nodesToDuplicate = children.filter((child) => keySet.has(child.getKey()));
      if (!nodesToDuplicate.length) return;

      let insertAfter = nodesToDuplicate.at(-1)!;
      for (const node of nodesToDuplicate) {
        const clone = $cloneNode(node);
        insertAfter.insertAfter(clone);
        insertAfter = clone;
      }
    });
  }, [editor, getSelectedKeys, handle.nodeKey]);

  const handleMoveUp = useCallback(() => {
    const selectedKeys = getSelectedKeys();
    const keys = selectedKeys.length > 0 ? selectedKeys : handle.nodeKey ? [handle.nodeKey] : [];
    if (!keys.length) return;

    editor.update(() => {
      const root = $getRoot();
      const children = root.getChildren();
      const keySet = new Set(keys);
      const selectedNodes = children.filter((child) => keySet.has(child.getKey()));
      if (!selectedNodes.length) return;

      const firstSelected = selectedNodes[0];
      const previousSibling = firstSelected.getPreviousSibling();
      if (!previousSibling || keySet.has(previousSibling.getKey())) return;

      const lastSelected = selectedNodes.at(-1)!;
      previousSibling.remove();
      lastSelected.insertAfter(previousSibling);
    });
  }, [editor, getSelectedKeys, handle.nodeKey]);

  const handleMoveDown = useCallback(() => {
    const selectedKeys = getSelectedKeys();
    const keys = selectedKeys.length > 0 ? selectedKeys : handle.nodeKey ? [handle.nodeKey] : [];
    if (!keys.length) return;

    editor.update(() => {
      const root = $getRoot();
      const children = root.getChildren();
      const keySet = new Set(keys);
      const selectedNodes = children.filter((child) => keySet.has(child.getKey()));
      if (!selectedNodes.length) return;

      const lastSelected = selectedNodes.at(-1)!;
      const nextSibling = lastSelected.getNextSibling();
      if (!nextSibling || keySet.has(nextSibling.getKey())) return;

      const firstSelected = selectedNodes[0];
      nextSibling.remove();
      firstSelected.insertBefore(nextSibling);
    });
  }, [editor, getSelectedKeys, handle.nodeKey]);

  const [gripMenuOpen, setGripMenuOpen] = useState(false);
  const dragStartedRef = useRef(false);

  const clearDragVisualState = useCallback(() => {
    const preview = dragPreviewRef.current;
    if (preview) {
      preview.remove();
      dragPreviewRef.current = null;
    }

    const draggingBlock = draggingBlockRef.current;
    if (draggingBlock) {
      draggingBlock.classList.remove(css.draggingBlock);
      draggingBlockRef.current = null;
    }

    const draggingKeys = draggingBlockKeysRef.current;
    if (draggingKeys) {
      for (const key of draggingKeys) {
        editor.getElementByKey(key)?.classList.remove(css.draggingBlock);
      }
      draggingBlockKeysRef.current = null;
    }
  }, [editor]);

  const onGripDragStart = useCallback(
    (event: React.DragEvent) => {
      dragStartedRef.current = true;
      if (!event.dataTransfer || !handle.nodeKey) return;

      const selectedKeys = getSelectedKeys();
      const dragKeys =
        selectedKeys.length > 0 && selectedKeys.includes(handle.nodeKey)
          ? selectedKeys
          : [handle.nodeKey];

      event.dataTransfer.setData(DRAG_DATA_KEY, JSON.stringify(dragKeys));
      event.dataTransfer.effectAllowed = 'move';

      const block = activeBlockRef.current;
      if (!block) return;

      clearDragVisualState();

      const rect = block.getBoundingClientRect();
      const preview = block.cloneNode(true) as HTMLElement;
      preview.classList.add(css.dragPreview);
      preview.style.width = `${rect.width}px`;
      preview.style.position = 'relative';

      if (dragKeys.length > 1) {
        const badge = document.createElement('div');
        badge.className = css.dragCountBadge;
        badge.textContent = String(dragKeys.length);
        preview.appendChild(badge);
      }

      if (portalClassName) {
        const wrapper = document.createElement('div');
        wrapper.className = portalClassName;
        wrapper.setAttribute('data-theme', theme);
        wrapper.style.cssText = 'position:fixed;top:-10000px;left:-10000px;pointer-events:none';
        wrapper.appendChild(preview);
        document.body.append(wrapper);
        dragPreviewRef.current = wrapper;
      } else {
        document.body.append(preview);
        dragPreviewRef.current = preview;
      }

      if (dragKeys.length > 1) {
        for (const key of dragKeys) {
          editor.getElementByKey(key)?.classList.add(css.draggingBlock);
        }
        draggingBlockKeysRef.current = dragKeys;
      } else {
        draggingBlockRef.current = block;
        block.classList.add(css.draggingBlock);
      }

      const offsetX = Math.max(12, Math.min(rect.width - 12, event.clientX - rect.left));
      const offsetY = Math.max(8, Math.min(rect.height - 8, event.clientY - rect.top));
      event.dataTransfer.setDragImage(preview, offsetX, offsetY);
    },
    [clearDragVisualState, editor, getSelectedKeys, handle.nodeKey, portalClassName, theme],
  );

  const onGripOpenChange = useCallback(
    (open: boolean) => {
      setGripMenuOpen((previous) => {
        if (previous === open) return previous;
        onMenuOpenChange(open);
        return open;
      });
    },
    [onMenuOpenChange],
  );

  const onGripMouseDownCapture = useCallback((event: ReactMouseEvent) => {
    dragStartedRef.current = false;
    if (event.button === 0) event.stopPropagation();
  }, []);

  const onGripClick = useCallback(
    (event: ReactMouseEvent) => {
      if (event.detail === 0) return;
      event.preventDefault();
      event.stopPropagation();
      if (dragStartedRef.current) {
        dragStartedRef.current = false;
        return;
      }
      if (!handle.nodeKey) return;
      const { nodeKey } = handle;
      const { shiftKey } = event;
      editor.focus(() => selectBlock(nodeKey, shiftKey));
    },
    [editor, handle.nodeKey, selectBlock],
  );

  const onGripContextMenu = useCallback(
    (event: ReactMouseEvent) => {
      event.preventDefault();
      if (handle.nodeKey) {
        const currentKeys = getSelectedKeys();
        if (!currentKeys.includes(handle.nodeKey)) {
          selectBlock(handle.nodeKey, false);
        }
      }
      onGripOpenChange(true);
    },
    [getSelectedKeys, handle.nodeKey, onGripOpenChange, selectBlock],
  );

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    const unregDragOver = editor.registerCommand(
      DRAGOVER_COMMAND,
      (event: DragEvent) => {
        if (!event.dataTransfer?.types.includes(DRAG_DATA_KEY)) return false;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';

        const block = getDropTargetBlock(editor, rootElement, event);
        if (!block) {
          setDropLine((state) => (state.visible ? { ...state, visible: false } : state));
          return true;
        }

        const rect = block.getBoundingClientRect();
        const rootRect = rootElement.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const y = event.clientY < midY ? rect.top : rect.bottom;
        setDropLine({
          visible: true,
          top: y + window.scrollY,
          left: rootRect.left + window.scrollX,
          width: rootRect.width,
        });
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );

    const unregDrop = editor.registerCommand(
      DROP_COMMAND,
      (event: DragEvent) => {
        const raw = event.dataTransfer?.getData(DRAG_DATA_KEY);
        if (!raw) return false;
        event.preventDefault();
        setDropLine((state) => ({ ...state, visible: false }));
        clearDragVisualState();

        let draggedKeys: string[];
        try {
          const parsed = JSON.parse(raw);
          draggedKeys =
            Array.isArray(parsed) && parsed.every((key: unknown) => typeof key === 'string')
              ? parsed
              : [raw];
        } catch {
          draggedKeys = [raw];
        }
        if (!draggedKeys.length) return false;

        const block = getDropTargetBlock(editor, rootElement, event);
        if (!block) return false;

        editor.update(() => {
          const targetNode = $getNearestNodeFromDOMNode(block);
          if (!targetNode) return;
          if (draggedKeys.includes(targetNode.getKey())) return;

          const rect = block.getBoundingClientRect();
          const insertBefore = event.clientY < rect.top + rect.height / 2;

          const root = $getRoot();
          const children = root.getChildren();
          const keySet = new Set(draggedKeys);
          const draggedNodes = children.filter((child) => keySet.has(child.getKey()));

          for (const node of draggedNodes) {
            node.remove();
          }

          const freshTarget = $getNodeByKey(targetNode.getKey());
          if (!freshTarget) return;

          if (insertBefore) {
            for (let i = draggedNodes.length - 1; i >= 0; i--) {
              freshTarget.insertBefore(draggedNodes[i]);
            }
          } else {
            let cursor = freshTarget;
            for (const node of draggedNodes) {
              cursor.insertAfter(node);
              cursor = node;
            }
          }
        });
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );

    const unregDragStart = editor.registerCommand(
      DRAGSTART_COMMAND,
      (event: DragEvent) => {
        if (!event.dataTransfer?.types.includes(DRAG_DATA_KEY)) return false;
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );

    const clearDropLine = () => {
      setDropLine((state) => (state.visible ? { ...state, visible: false } : state));
    };
    const clearDragState = () => {
      clearDropLine();
      clearDragVisualState();
    };
    const onDragLeave = (event: DragEvent) => {
      if (event.relatedTarget === null || !rootElement.contains(event.relatedTarget as Node)) {
        clearDropLine();
      }
    };
    window.addEventListener('dragend', clearDragState);
    window.addEventListener('drop', clearDragState);
    rootElement.addEventListener('dragleave', onDragLeave);

    return () => {
      unregDragOver();
      unregDrop();
      unregDragStart();
      window.removeEventListener('dragend', clearDragState);
      window.removeEventListener('drop', clearDragState);
      rootElement.removeEventListener('dragleave', onDragLeave);
      clearDragState();
    };
  }, [clearDragVisualState, editor]);

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    const outerContainer = rootElement.closest('.rich-editor') as HTMLElement | null;
    if (!outerContainer) return;

    let isDragging = false;
    let lastKey: string | null = null;

    const getBlockKeyAtY = (clientY: number): string | null => {
      const block = getNearestBlockByY(rootElement, clientY);
      if (!block) return null;
      let nodeKey: string | null = null;
      editor.read(() => {
        nodeKey = $getNearestNodeFromDOMNode(block)?.getKey() ?? null;
      });
      return nodeKey;
    };

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement;
      if (rootElement.contains(target)) return;
      // Gutter selection must not hijack clicks on interactive chrome inside
      // `.rich-editor` (header toolbar, popovers) or above/below the content
      // area — those used to NodeSelect the nearest block, so a toolbar
      // insert replaced that block instead of inserting at the caret.
      if (target.closest('button, input, textarea, select, [role="toolbar"], [role="menu"]')) {
        return;
      }
      const rootRect = rootElement.getBoundingClientRect();
      if (event.clientY < rootRect.top || event.clientY > rootRect.bottom) return;

      const nodeKey = getBlockKeyAtY(event.clientY);
      if (!nodeKey) return;

      event.preventDefault();
      editor.focus(() => selectBlock(nodeKey, event.shiftKey));
      isDragging = true;
      lastKey = nodeKey;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;
      const nodeKey = getBlockKeyAtY(event.clientY);
      if (!nodeKey || nodeKey === lastKey) return;
      selectBlock(nodeKey, true);
      lastKey = nodeKey;
    };

    const onMouseUp = () => {
      isDragging = false;
      lastKey = null;
    };

    outerContainer.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      outerContainer.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [editor, selectBlock]);

  const themeWrapperProps = portalClassName
    ? {
        'className': portalClassName,
        'data-theme': theme,
        'style': { display: 'contents' as const },
      }
    : {};

  return (
    <div {...themeWrapperProps}>
      <div
        className={`${css.handleContainer} ${handle.visible ? css.handleContainerVisible : ''}`}
        style={{ top: handle.top, left: handle.left }}
        onMouseEnter={onHandleEnter}
        onMouseLeave={onHandleLeave}
      >
        <button aria-label="Add block" className={css.handleBtn} onClick={handleAddBlock}>
          <Plus size={14} />
        </button>

        <DropdownMenu open={gripMenuOpen} onOpenChange={onGripOpenChange}>
          <DropdownMenuTrigger
            draggable
            aria-label="Block actions"
            className={css.handleBtn}
            onClick={onGripClick}
            onContextMenu={onGripContextMenu}
            onDragStart={onGripDragStart as any}
            onMouseDownCapture={onGripMouseDownCapture}
          >
            <GripVertical size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="bottom" sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>TURN INTO</DropdownMenuLabel>
              {TURN_INTO_ITEMS.map((item) => (
                <DropdownMenuItem key={item.key} onClick={() => handleTurnInto(item.key)}>
                  <item.icon />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>ACTIONS</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMoveUp}>
                <ArrowUp />
                Move Up
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMoveDown}>
                <ArrowDown />
                Move Down
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className={css.menuItemDestructive} onClick={handleDelete}>
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {dropLine.visible && (
        <div
          className={css.dropIndicator}
          style={{
            top: dropLine.top,
            left: dropLine.left,
            width: dropLine.width,
          }}
        />
      )}
    </div>
  );
}

export function BlockHandlePlugin(): ReactElement {
  const [editor] = useLexicalComposerContext();
  return createPortal(<BlockHandleInner editor={editor} />, document.body);
}
