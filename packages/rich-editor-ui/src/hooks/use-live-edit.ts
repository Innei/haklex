import { useCallback, useEffect, useRef } from 'react';

export type LiveApply<T> = (patch: Partial<T>, merge: boolean) => void;

export function useLiveEdit<T>(values: T, open: boolean, onApply: LiveApply<T>) {
  const latestRef = useRef(values);
  latestRef.current = values;
  const snapshotRef = useRef<T | null>(open ? values : null);
  const changedRef = useRef(false);

  useEffect(() => {
    snapshotRef.current = open ? latestRef.current : null;
    changedRef.current = false;
  }, [open]);

  const apply = useCallback(
    (patch: Partial<T>) => {
      onApply(patch, changedRef.current);
      changedRef.current = true;
    },
    [onApply],
  );

  const revert = useCallback(() => {
    const snapshot = snapshotRef.current;
    if (snapshot && changedRef.current) onApply(snapshot, true);
    changedRef.current = false;
  }, [onApply]);

  return { apply, revert };
}
