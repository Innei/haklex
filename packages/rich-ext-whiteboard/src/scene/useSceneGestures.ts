import type { Dispatch, PointerEvent as ReactPointerEvent, RefObject, SetStateAction } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { Transform } from './transform';
import { MAX_SCALE, MIN_SCALE } from './transform';

interface GestureOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  mode: 'inline' | 'fullscreen';
  setTransform: Dispatch<SetStateAction<Transform>>;
  transformRef: RefObject<Transform>;
  userInteractedRef: RefObject<boolean>;
  wheelPan: boolean;
  zoomAt: (factor: number, anchorX: number, anchorY: number) => void;
}

export function useSceneGestures({
  containerRef,
  mode,
  setTransform,
  transformRef,
  userInteractedRef,
  wheelPan,
  zoomAt,
}: GestureOptions) {
  const [panning, setPanning] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        if (!wheelPan) return;
        e.preventDefault();
        userInteractedRef.current = true;
        const dx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
        const dy = e.shiftKey && !e.deltaX ? 0 : e.deltaY;
        setTransform((t) => ({ s: t.s, tx: t.tx - dx, ty: t.ty - dy }));
        return;
      }
      e.preventDefault();
      const rect = node.getBoundingClientRect();
      zoomAt(e.deltaY > 0 ? 0.9 : 1.1, e.clientX - rect.left, e.clientY - rect.top);
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [containerRef, setTransform, userInteractedRef, wheelPan, zoomAt]);

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

  return {
    panning,
    onPointerCancel: releasePointer,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: releasePointer,
  };
}
