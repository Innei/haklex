import type { ReactNode, RefObject } from 'react';
import { createContext, use, useMemo, useRef } from 'react';

export type ImagePreprocessSource = 'drop' | 'paste' | 'dialog' | 'replace' | 'gallery';
export type ImagePreprocessFn = (
  files: File[],
  meta: { source: ImagePreprocessSource },
) => Promise<File[] | null>;

export interface ImagePreprocessContextValue {
  ref: RefObject<ImagePreprocessFn | null>;
  register: (fn: ImagePreprocessFn | null) => () => void;
}

const ImagePreprocessContext = createContext<ImagePreprocessContextValue | null>(null);

export function ImagePreprocessProvider({ children }: { children: ReactNode }) {
  const ref = useRef<ImagePreprocessFn | null>(null);
  const value = useMemo<ImagePreprocessContextValue>(
    () => ({
      ref,
      register: (fn) => {
        ref.current = fn;
        return () => {
          if (ref.current === fn) ref.current = null;
        };
      },
    }),
    [],
  );

  return (
    <ImagePreprocessContext.Provider value={value}>{children}</ImagePreprocessContext.Provider>
  );
}

export function useImagePreprocess(): ImagePreprocessContextValue | null {
  return use(ImagePreprocessContext);
}
