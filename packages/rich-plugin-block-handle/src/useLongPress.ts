import type { PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';

export const LONG_PRESS_DELAY = 450;
const MOVE_TOLERANCE = 8;

export function useLongPress(onLongPress: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const callbackRef = useRef(onLongPress);

  useEffect(() => {
    callbackRef.current = onLongPress;
  }, [onLongPress]);

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    originRef.current = null;
  }, []);

  useEffect(() => cancel, [cancel]);

  return useMemo(
    () => ({
      onPointerDown: (event: ReactPointerEvent) => {
        cancel();
        if (event.pointerType !== 'touch') return;
        originRef.current = { x: event.clientX, y: event.clientY };
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          originRef.current = null;
          callbackRef.current();
        }, LONG_PRESS_DELAY);
      },
      onPointerMove: (event: ReactPointerEvent) => {
        const origin = originRef.current;
        if (!origin) return;
        if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > MOVE_TOLERANCE) {
          cancel();
        }
      },
      onPointerUp: cancel,
      onPointerCancel: cancel,
    }),
    [cancel],
  );
}
