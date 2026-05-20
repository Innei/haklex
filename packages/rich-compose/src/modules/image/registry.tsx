import { createContext, type ReactNode, type RefObject, use, useEffect, useRef } from 'react';

import type { RichImageInfo } from './types';

interface ImageEntry {
  el: HTMLElement;
  info: RichImageInfo;
}

export interface ImageRegistry {
  register: (entry: ImageEntry) => () => void;
  resolve: (target: HTMLElement) => { images: RichImageInfo[]; index: number };
}

const ImageRegistryContext = createContext<ImageRegistry | null>(null);

function createRegistry(): ImageRegistry {
  const entries = new Set<ImageEntry>();
  return {
    register(entry) {
      entries.add(entry);
      return () => {
        entries.delete(entry);
      };
    },
    resolve(target) {
      const ordered = [...entries].sort((a, b) => {
        const relation = a.el.compareDocumentPosition(b.el);
        if (relation & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (relation & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });
      const images = ordered.map((entry) => entry.info);
      const index = ordered.findIndex((entry) => entry.el === target || entry.el.contains(target));
      return { images, index: index === -1 ? 0 : index };
    },
  };
}

export function ImageRegistryProvider({ children }: { children: ReactNode }) {
  const registryRef = useRef<ImageRegistry | null>(null);
  if (!registryRef.current) {
    registryRef.current = createRegistry();
  }
  return <ImageRegistryContext value={registryRef.current}>{children}</ImageRegistryContext>;
}

export function useImageRegistry(): ImageRegistry | null {
  return use(ImageRegistryContext);
}

export function useRegisterImage(ref: RefObject<HTMLElement | null>, info: RichImageInfo): void {
  const registry = use(ImageRegistryContext);
  const { src, alt, width, height, caption, thumbhash } = info;
  useEffect(() => {
    const el = ref.current;
    if (!registry || !el) return;
    return registry.register({ el, info: { src, alt, width, height, caption, thumbhash } });
  }, [registry, ref, src, alt, width, height, caption, thumbhash]);
}
