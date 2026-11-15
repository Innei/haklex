import type { FC, MouseEvent as ReactMouseEvent, Ref } from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { computeSceneBounds, DARK_SCENE_FILTER, SceneContent } from './Scene';
import { SceneControls } from './SceneControls';
import * as css from './styles.css';
import type { Transform } from './transform';
import { fromViewport, MAX_SCALE, MIN_SCALE, toViewport } from './transform';
import type { ExcalidrawScene, StaticTheme } from './types';
import type { InteractiveSceneHandle, SceneViewport } from './useSceneFocus';
import { useSceneFocus } from './useSceneFocus';
import { useSceneGestures } from './useSceneGestures';

export type { InteractiveSceneHandle, SceneFocusOptions, SceneViewport } from './useSceneFocus';

export interface InteractiveSceneProps {
  controls?: boolean;
  handFontOverride?: string;
  initialViewport?: { scrollX: number; scrollY: number; zoom: number };
  /** `inline` leaves one-finger touch drags to the page; `fullscreen` owns every gesture. */
  mode?: 'inline' | 'fullscreen';
  onExpand?: (target: HTMLElement) => void;
  onViewportChange?: (viewport: SceneViewport) => void;
  preserveView?: boolean;
  ref?: Ref<InteractiveSceneHandle>;
  scene: ExcalidrawScene;
  theme?: StaticTheme;
  wheelPan?: boolean;
}

const FIT_PADDING = 32;
const ZOOM_STEP = 1.2;

export const InteractiveScene: FC<InteractiveSceneProps> = ({
  controls = true,
  handFontOverride,
  initialViewport,
  mode = 'inline',
  onExpand,
  onViewportChange,
  preserveView = false,
  ref,
  scene,
  theme = 'light',
  wheelPan = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [transform, setTransform] = useState<Transform>(() =>
    initialViewport ? fromViewport(initialViewport) : { s: 1, tx: 0, ty: 0 },
  );
  const transformRef = useRef(transform);
  const sizeRef = useRef(size);
  const pinnedRef = useRef(!!initialViewport);
  const userInteractedRef = useRef(!!initialViewport);
  const viewportListenerRef = useRef(onViewportChange);
  viewportListenerRef.current = onViewportChange;

  const elements = useMemo(() => scene.elements.filter((el) => !el.isDeleted), [scene]);
  const bounds = useMemo(() => computeSceneBounds(elements), [elements]);

  useEffect(() => {
    transformRef.current = transform;
    sizeRef.current = size;
    if (!size.w || !size.h) return;
    viewportListenerRef.current?.({ ...toViewport(transform), width: size.w, height: size.h });
  }, [transform, size]);

  useSceneFocus(ref, { bounds, elements, setTransform, sizeRef, transformRef, userInteractedRef });

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
    if (preserveView) userInteractedRef.current = true;
  }, [size, computeFit, preserveView]);

  useEffect(() => {
    if (pinnedRef.current || preserveView) return;
    userInteractedRef.current = false;
  }, [scene, preserveView]);

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

  const gestures = useSceneGestures({
    containerRef,
    mode,
    setTransform,
    transformRef,
    userInteractedRef,
    wheelPan,
    zoomAt,
  });

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
      data-panning={gestures.panning}
      ref={containerRef}
      onDoubleClick={handleDoubleClick}
      onPointerCancel={gestures.onPointerCancel}
      onPointerDown={gestures.onPointerDown}
      onPointerMove={gestures.onPointerMove}
      onPointerUp={gestures.onPointerUp}
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
          <SceneContent
            dark={isDark}
            files={scene.files}
            handFontOverride={handFontOverride}
            scene={scene}
          />
        </g>
      </svg>

      {controls && (
        <SceneControls
          scale={transform.s}
          onExpand={onExpand}
          onFit={fitToContent}
          onZoomIn={() => centerZoom(ZOOM_STEP)}
          onZoomOut={() => centerZoom(1 / ZOOM_STEP)}
        />
      )}
    </div>
  );
};
