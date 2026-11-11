import type { FC, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import type { Point } from '../model/geometry';
import { DARK_SCENE_FILTER, SceneContent } from '../scene/Scene';
import type { ExcalidrawElement, ExcalidrawScene } from '../scene/types';
import { copySelection, cutSelection, pasteFromClipboard } from './clipboard-actions';
import * as css from './editor.css';
import { createGestureTracker } from './gestures';
import type { WhiteboardStore } from './store';
import { useStore } from './store';
import type { ToolHandlers } from './tools';
import { getToolHandler } from './tools';
import type { PointerInfo, ToolContext, ToolHandler } from './tools/types';
import { screenToScene, zoomAt } from './viewport';

const DOT_SPACING = 16;

export const CHROME_ATTR = 'data-whiteboard-chrome';

function isChromeTarget(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest(`[${CHROME_ATTR}]`);
}

interface PointerLike {
  altKey?: boolean;
  clientX: number;
  clientY: number;
  ctrlKey?: boolean;
  metaKey?: boolean;
  pointerId?: number;
  pointerType?: string;
  pressure?: number;
  shiftKey?: boolean;
}
const WHEEL_ZOOM_FACTOR = 0.01;

export interface WhiteboardCanvasProps {
  children?: ReactNode;
  context: ToolContext;
  handlers: ToolHandlers;
  store: WhiteboardStore;
  theme: 'light' | 'dark';
}

export const WhiteboardCanvas: FC<WhiteboardCanvasProps> = ({
  children,
  context,
  handlers,
  store,
  theme,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const activeRef = useRef<ToolHandler | null>(null);
  const spaceRef = useRef(false);
  const lastPointerRef = useRef<Point | null>(null);
  const gesturesRef = useRef(createGestureTracker());
  const elements = useStore(store, (s) => s.elements);
  const files = useStore(store, (s) => s.files);
  const viewport = useStore(store, (s) => s.viewport);
  const editingTextId = useStore(store, (s) => s.editingTextId);
  const erasingIds = useStore(store, (s) => s.erasingIds);
  const tool = useStore(store, (s) => s.tool);
  const gridSize = useStore(store, (s) => s.gridSize);
  const toolRef = useRef(tool);

  useEffect(() => {
    const previous = toolRef.current;
    toolRef.current = tool;
    if (previous === tool) return;
    const handler = getToolHandler(handlers, previous);
    handler.cancel?.(context);
    if (activeRef.current === handler) activeRef.current = null;
  }, [context, handlers, tool]);

  const scene = useMemo<ExcalidrawScene>(
    () => ({ type: 'excalidraw', appState: {}, elements: elements as ExcalidrawElement[], files }),
    [elements, files],
  );
  const hiddenIds = useMemo(
    () => (editingTextId ? new Set([editingTextId]) : undefined),
    [editingTextId],
  );
  const elementProps = useCallback(
    (el: ExcalidrawElement) => {
      if (erasingIds.has(el.id)) return { opacity: 0.25 };
      if (el.type === 'image' && el.status === 'pending') return { opacity: 0.5 };
      return undefined;
    },
    [erasingIds],
  );

  const toPointer = useCallback(
    (e: PointerLike): PointerInfo => {
      const rect = ref.current!.getBoundingClientRect();
      const screen: Point = [e.clientX - rect.left, e.clientY - rect.top];
      return {
        screen,
        scene: screenToScene(screen, store.getState().viewport),
        shiftKey: !!e.shiftKey,
        altKey: !!e.altKey,
        ctrlKey: !!(e.ctrlKey || e.metaKey),
        pressure: e.pressure ?? 0.5,
        pointerType: e.pointerType ?? 'mouse',
        pointerId: e.pointerId ?? 1,
      };
    },
    [store],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button === 2 || isChromeTarget(e.target)) return;
    ref.current?.focus({ preventScroll: true });
    e.currentTarget.setPointerCapture?.(e.pointerId);
    if (e.pointerType === 'touch') {
      const start = gesturesRef.current.down(
        e.pointerId,
        toPointer(e).screen,
        store.getState().viewport,
      );
      if (start === 'pinch') {
        activeRef.current?.cancel?.(context);
        activeRef.current = null;
      }
      if (start !== 'single') return;
    }
    const panning = e.button === 1 || spaceRef.current;
    const handler = panning ? handlers.hand : getToolHandler(handlers, store.getState().tool);
    activeRef.current = handler;
    handler.onPointerDown(context, toPointer(e));
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') {
      const gestures = gesturesRef.current;
      const viewport = gestures.move(e.pointerId, toPointer(e).screen);
      if (viewport) store.setState({ viewport });
      if (gestures.isActive()) return;
    }
    const handler = activeRef.current ?? getToolHandler(handlers, store.getState().tool);
    const info = toPointer(e);
    lastPointerRef.current = info.scene;
    handler.onPointerMove(context, info);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') {
      const gestures = gesturesRef.current;
      const wasActive = gestures.isActive();
      gestures.up(e.pointerId);
      if (wasActive) return;
    }
    const handler = activeRef.current;
    activeRef.current = null;
    handler?.onPointerUp(context, toPointer(e));
  };

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const onWheel = (e: WheelEvent) => {
      if (isChromeTarget(e.target)) return;
      e.preventDefault();
      const vp = store.getState().viewport;
      const rect = node.getBoundingClientRect();
      const screen: Point = [e.clientX - rect.left, e.clientY - rect.top];
      if (e.ctrlKey || e.metaKey) {
        store.setState({
          viewport: zoomAt(vp, screen, vp.zoom * Math.exp(-e.deltaY * WHEEL_ZOOM_FACTOR)),
        });
        return;
      }
      const dx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
      const dy = e.shiftKey && !e.deltaX ? 0 : e.deltaY;
      store.setState({
        viewport: { ...vp, scrollX: vp.scrollX - dx / vp.zoom, scrollY: vp.scrollY - dy / vp.zoom },
      });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' && !(e.target instanceof HTMLTextAreaElement))
        spaceRef.current = e.type === 'keydown';
    };
    const measure = () => {
      const rect = node.getBoundingClientRect();
      store.setState({ canvasSize: { width: rect.width, height: rect.height } });
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(node);
    const pasteTarget = (): Point => {
      if (lastPointerRef.current) return lastPointerRef.current;
      const { viewport, canvasSize } = store.getState();
      return screenToScene([canvasSize.width / 2, canvasSize.height / 2], viewport);
    };
    const onCopy = (e: ClipboardEvent) => {
      if (
        !e.clipboardData ||
        store.getState().editingTextId ||
        store.getState().selectedIds.size === 0
      )
        return;
      e.preventDefault();
      e.clipboardData.setData(
        'text/plain',
        e.type === 'cut' ? cutSelection(store) : copySelection(store),
      );
    };
    const onPaste = (e: ClipboardEvent) => {
      if (!e.clipboardData || store.getState().editingTextId) return;
      const files = [...(e.clipboardData.files ?? [])].filter((f) => f.type.startsWith('image/'));
      if (files.length > 0 && context.onFiles) {
        e.preventDefault();
        context.onFiles(files, pasteTarget());
        return;
      }
      if (pasteFromClipboard(store, e.clipboardData.getData('text/plain'), pasteTarget())) {
        e.preventDefault();
      }
    };
    node.addEventListener('copy', onCopy);
    node.addEventListener('cut', onCopy);
    node.addEventListener('paste', onPaste);
    node.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      observer?.disconnect();
      node.removeEventListener('copy', onCopy);
      node.removeEventListener('cut', onCopy);
      node.removeEventListener('paste', onPaste);
      node.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, [context, store]);

  const dot = (gridSize ?? DOT_SPACING) * viewport.zoom;
  const isDark = theme === 'dark';

  return (
    <div
      data-whiteboard-canvas
      className={css.canvas}
      ref={ref}
      tabIndex={0}
      style={{
        backgroundSize: `${dot}px ${dot}px`,
        backgroundPosition: `${viewport.scrollX * viewport.zoom}px ${viewport.scrollY * viewport.zoom}px`,
      }}
      onPointerCancel={onPointerUp}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={(e) => {
        if (isChromeTarget(e.target)) return;
        const handler = getToolHandler(handlers, store.getState().tool);
        handler.onDoubleClick?.(context, toPointer(e));
      }}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('Files')) e.preventDefault();
      }}
      onDrop={(e) => {
        const dropped = [...(e.dataTransfer.files ?? [])].filter((f) =>
          f.type.startsWith('image/'),
        );
        if (dropped.length === 0 || !context.onFiles) return;
        e.preventDefault();
        context.onFiles(dropped, toPointer(e).scene);
      }}
    >
      <svg className={css.layer} style={isDark ? { filter: DARK_SCENE_FILTER } : undefined}>
        <g transform={`scale(${viewport.zoom}) translate(${viewport.scrollX} ${viewport.scrollY})`}>
          <SceneContent
            dark={isDark}
            elementProps={elementProps}
            files={files}
            hiddenIds={hiddenIds}
            scene={scene}
          />
        </g>
      </svg>
      {children}
    </div>
  );
};
