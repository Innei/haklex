import type { Dispatch, Ref, RefObject, SetStateAction } from 'react';
import { useEffect, useImperativeHandle, useRef } from 'react';

import { getCommonBounds } from '../model/bounds';
import type { Bounds } from '../model/geometry';
import type { FitOptions } from '../model/viewport-fit';
import { viewportFor } from '../model/viewport-fit';
import type { SceneBounds } from './Scene';
import type { Transform } from './transform';
import { fromViewport, MAX_SCALE, MIN_SCALE, toViewport } from './transform';
import type { ExcalidrawElement } from './types';

export interface SceneViewport {
  height: number;
  scrollX: number;
  scrollY: number;
  width: number;
  zoom: number;
}

export interface SceneFocusOptions extends FitOptions {
  animate?: boolean;
  duration?: number;
}

export interface InteractiveSceneHandle {
  focus: (target: readonly string[] | Bounds | null, options?: SceneFocusOptions) => boolean;
  getViewport: () => SceneViewport;
}

const FOCUS_DURATION = 280;

const isBounds = (target: readonly string[] | Bounds | null): target is Bounds =>
  !!target && target.length === 4 && target.every((value) => typeof value === 'number');

interface FocusDeps {
  bounds: SceneBounds;
  elements: readonly ExcalidrawElement[];
  setTransform: Dispatch<SetStateAction<Transform>>;
  sizeRef: RefObject<{ h: number; w: number }>;
  transformRef: RefObject<Transform>;
  userInteractedRef: RefObject<boolean>;
}

export function useSceneFocus(
  ref: Ref<InteractiveSceneHandle> | undefined,
  { bounds, elements, setTransform, sizeRef, transformRef, userInteractedRef }: FocusDeps,
): void {
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  useImperativeHandle(
    ref,
    () => ({
      getViewport: () => ({
        ...toViewport(transformRef.current),
        width: sizeRef.current.w,
        height: sizeRef.current.h,
      }),
      focus: (target, options = {}) => {
        const { w, h } = sizeRef.current;
        let box: Bounds | null = null;
        if (isBounds(target)) box = target;
        else if (target) {
          const wanted = new Set(target);
          const picked = elements.filter((el) => wanted.has(el.id));
          if (picked.length > 0) box = getCommonBounds(picked);
        } else if (elements.length > 0) {
          box = [bounds.minX, bounds.minY, bounds.minX + bounds.width, bounds.minY + bounds.height];
        }
        if (!box || !w || !h) return false;
        const next = fromViewport(
          viewportFor(
            box,
            { width: w, height: h },
            {
              ...options,
              minZoom: MIN_SCALE,
              maxZoom: Math.min(options.maxZoom ?? MAX_SCALE, MAX_SCALE),
            },
          ),
        );
        userInteractedRef.current = true;
        if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
        if (!options.animate || typeof requestAnimationFrame !== 'function') {
          setTransform(next);
          return true;
        }
        const from = transformRef.current;
        const started = performance.now();
        const duration = options.duration ?? FOCUS_DURATION;
        const step = (now: number) => {
          const t = Math.min(1, (now - started) / duration);
          const eased = 1 - (1 - t) ** 3;
          const mix = (a: number, b: number) => a + (b - a) * eased;
          setTransform({
            s: mix(from.s, next.s),
            tx: mix(from.tx, next.tx),
            ty: mix(from.ty, next.ty),
          });
          frameRef.current = t < 1 ? requestAnimationFrame(step) : undefined;
        };
        frameRef.current = requestAnimationFrame(step);
        return true;
      },
    }),
    [bounds, elements, setTransform, sizeRef, transformRef, userInteractedRef],
  );
}
