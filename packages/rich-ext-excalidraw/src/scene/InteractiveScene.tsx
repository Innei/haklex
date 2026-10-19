import { Maximize2, ScanSearch, ZoomIn, ZoomOut } from 'lucide-react';
import type { FC, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { computeSceneBounds, DARK_SCENE_FILTER, SceneContent } from './Scene';
import * as css from './styles.css';
import type { ExcalidrawScene, StaticTheme } from './types';

interface Transform {
  s: number;
  tx: number;
  ty: number;
}

export interface InteractiveSceneProps {
  /** `inline` leaves one-finger touch drags to the page; `fullscreen` owns every gesture. */
  mode?: 'inline' | 'fullscreen';
  onExpand?: (target: HTMLElement) => void;
  scene: ExcalidrawScene;
  theme?: StaticTheme;
}

const MIN_SCALE = 0.05;
const MAX_SCALE = 16;
const FIT_PADDING = 32;
const ZOOM_STEP = 1.2;

export const InteractiveScene: FC<InteractiveSceneProps> = ({
  mode = 'inline',
  onExpand,
  scene,
  theme = 'light',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [transform, setTransform] = useState<Transform>({ s: 1, tx: 0, ty: 0 });
  const [panning, setPanning] = useState(false);
  const transformRef = useRef(transform);
  const userInteractedRef = useRef(false);

  const elements = useMemo(() => scene.elements.filter((el) => !el.isDeleted), [scene]);
  const bounds = useMemo(() => computeSceneBounds(elements), [elements]);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setSize({ w: rect.width, h: rect.height });
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const computeFit = useCallback((): Transform => {
    if (!size.w || !size.h) return { s: 1, tx: 0, ty: 0 };
    const sceneW = bounds.width || 1;
    const sceneH = bounds.height || 1;
    const s = Math.max(
      MIN_SCALE,
      Math.min(
        MAX_SCALE,
        Math.min((size.w - FIT_PADDING * 2) / sceneW, (size.h - FIT_PADDING * 2) / sceneH),
      ),
    );
    return {
      s,
      tx: size.w / 2 - (bounds.minX + sceneW / 2) * s,
      ty: size.h / 2 - (bounds.minY + sceneH / 2) * s,
    };
  }, [size, bounds]);

  const fitToContent = useCallback(() => {
    setTransform(computeFit());
    userInteractedRef.current = false;
  }, [computeFit]);

  useLayoutEffect(() => {
    if (userInteractedRef.current) return;
    if (!size.w || !size.h) return;
    setTransform(computeFit());
  }, [size, computeFit]);

  useEffect(() => {
    userInteractedRef.current = false;
  }, [scene]);

  const zoomAt = useCallback((factor: number, anchorX: number, anchorY: number) => {
    const t = transformRef.current;
    const newS = Math.max(MIN_SCALE, Math.min(MAX_SCALE, t.s * factor));
    const k = newS / t.s;
    if (k === 1) return;
    userInteractedRef.current = true;
    setTransform({
      s: newS,
      tx: anchorX - (anchorX - t.tx) * k,
      ty: anchorY - (anchorY - t.ty) * k,
    });
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect = node.getBoundingClientRect();
      zoomAt(e.deltaY > 0 ? 0.9 : 1.1, e.clientX - rect.left, e.clientY - rect.top);
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const panRef = useRef<{ origTx: number; origTy: number; startX: number; startY: number } | null>(
    null,
  );
  const pinchRef = useRef<{
    distance: number;
    midX: number;
    midY: number;
    origScale: number;
    origTx: number;
    origTy: number;
  } | null>(null);

  const ownsPointer = (e: ReactPointerEvent<HTMLDivElement>) =>
    !(mode === 'inline' && e.pointerType === 'touch');

  const startPinch = () => {
    const pts = [...pointersRef.current.values()];
    const node = containerRef.current;
    if (pts.length < 2 || !node) return;
    const rect = node.getBoundingClientRect();
    pinchRef.current = {
      distance: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1,
      origScale: transformRef.current.s,
      origTx: transformRef.current.tx,
      origTy: transformRef.current.ty,
      midX: (pts[0].x + pts[1].x) / 2 - rect.left,
      midY: (pts[0].y + pts[1].y) / 2 - rect.top,
    };
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!ownsPointer(e)) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 1) {
      panRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origTx: transformRef.current.tx,
        origTy: transformRef.current.ty,
      };
      setPanning(true);
    } else if (pointersRef.current.size === 2) {
      panRef.current = null;
      startPinch();
    }
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const pinch = pinchRef.current;
    if (pinch && pointersRef.current.size === 2) {
      userInteractedRef.current = true;
      const pts = [...pointersRef.current.values()];
      const ratio = (Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1) / pinch.distance;
      const newS = Math.max(MIN_SCALE, Math.min(MAX_SCALE, pinch.origScale * ratio));
      const k = newS / pinch.origScale;
      setTransform({
        s: newS,
        tx: pinch.midX - (pinch.midX - pinch.origTx) * k,
        ty: pinch.midY - (pinch.midY - pinch.origTy) * k,
      });
      return;
    }

    const pan = panRef.current;
    if (pan && pointersRef.current.size === 1) {
      userInteractedRef.current = true;
      setTransform((t) => ({
        s: t.s,
        tx: pan.origTx + e.clientX - pan.startX,
        ty: pan.origTy + e.clientY - pan.startY,
      }));
    }
  };

  const releasePointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.delete(e.pointerId)) return;
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (pointersRef.current.size === 0) {
      panRef.current = null;
      setPanning(false);
    }
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleDoubleClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    fitToContent();
  };

  const centerZoom = (factor: number) => zoomAt(factor, size.w / 2, size.h / 2);
  const isDark = theme === 'dark';
  const label = `Whiteboard, ${elements.length} elements`;

  return (
    <div
      className={css.sceneRoot}
      data-color-scheme={theme}
      data-mode={mode}
      data-panning={panning}
      ref={containerRef}
      onDoubleClick={handleDoubleClick}
      onPointerCancel={releasePointer}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={releasePointer}
    >
      <svg
        aria-label={label}
        className={css.sceneSvg}
        preserveAspectRatio="xMinYMin meet"
        role="img"
        style={isDark ? { filter: DARK_SCENE_FILTER } : undefined}
        viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform={`translate(${transform.tx} ${transform.ty}) scale(${transform.s})`}>
          <SceneContent dark={isDark} files={scene.files} scene={scene} />
        </g>
      </svg>

      <div className={css.toolbar}>
        <button
          aria-label="Zoom out"
          className={css.toolButton}
          title="Zoom out (⌘/Ctrl + scroll)"
          type="button"
          onClick={() => centerZoom(1 / ZOOM_STEP)}
        >
          <ZoomOut />
        </button>
        <span className={css.zoomLabel}>{Math.round(transform.s * 100)}%</span>
        <button
          aria-label="Zoom in"
          className={css.toolButton}
          title="Zoom in (⌘/Ctrl + scroll)"
          type="button"
          onClick={() => centerZoom(ZOOM_STEP)}
        >
          <ZoomIn />
        </button>
        <span aria-hidden className={css.toolSeparator} />
        <button
          aria-label="Fit to content"
          className={css.toolButton}
          title="Fit to content (double-click)"
          type="button"
          onClick={fitToContent}
        >
          <ScanSearch />
        </button>
        {onExpand && (
          <>
            <span aria-hidden className={css.toolSeparator} />
            <button
              aria-label="Fullscreen"
              className={css.toolButton}
              title="Fullscreen"
              type="button"
              onClick={(e) => onExpand(e.currentTarget)}
            >
              <Maximize2 />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
