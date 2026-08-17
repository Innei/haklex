import type { ImageRendererProps } from '@haklex/rich-editor/renderers';
import { createStore, Provider } from 'jotai';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import {
  accentAtom,
  altTextAtom,
  captionAtom,
  displayWidthAtom,
  editAltTextAtom,
  editCaptionAtom,
  editSrcAtom,
  fileInputRefAtom,
  fixedHeightAtom,
  fixedWidthAtom,
  heightAtom,
  layoutAtom,
  loadStateAtom,
  replaceOpenAtom,
  srcAtom,
  thumbhashAtom,
  widthAtom,
  wrapperRefAtom,
} from './atoms';

export function ImageEditProvider({
  props,
  children,
}: {
  props: ImageRendererProps;
  children: ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [store] = useState(() => {
    const s = createStore();
    s.set(srcAtom, props.src);
    s.set(altTextAtom, props.altText);
    s.set(widthAtom, props.width);
    s.set(heightAtom, props.height);
    s.set(captionAtom, props.caption);
    s.set(thumbhashAtom, props.thumbhash);
    s.set(accentAtom, props.accent);
    s.set(displayWidthAtom, props.displayWidth);
    s.set(fixedWidthAtom, props.fixedWidth);
    s.set(fixedHeightAtom, props.fixedHeight);
    s.set(layoutAtom, props.layout);
    s.set(editSrcAtom, props.src);
    s.set(editAltTextAtom, props.altText);
    s.set(editCaptionAtom, props.caption || '');
    s.set(wrapperRefAtom, wrapperRef);
    s.set(fileInputRefAtom, fileInputRef);
    s.set(loadStateAtom, props.src ? 'loading' : 'error');
    s.set(replaceOpenAtom, !props.src);
    return s;
  });

  useEffect(() => {
    store.set(srcAtom, props.src);
    store.set(altTextAtom, props.altText);
    store.set(widthAtom, props.width);
    store.set(heightAtom, props.height);
    store.set(captionAtom, props.caption);
    store.set(thumbhashAtom, props.thumbhash);
    store.set(accentAtom, props.accent);
    store.set(displayWidthAtom, props.displayWidth);
    store.set(fixedWidthAtom, props.fixedWidth);
    store.set(fixedHeightAtom, props.fixedHeight);
    store.set(layoutAtom, props.layout);
  }, [
    store,
    props.src,
    props.altText,
    props.width,
    props.height,
    props.caption,
    props.thumbhash,
    props.accent,
    props.displayWidth,
    props.fixedWidth,
    props.fixedHeight,
    props.layout,
  ]);

  useEffect(() => {
    store.set(editSrcAtom, props.src);
    store.set(editAltTextAtom, props.altText);
    store.set(editCaptionAtom, props.caption || '');
  }, [store, props.src, props.altText, props.caption]);

  useEffect(() => {
    store.set(loadStateAtom, props.src ? 'loading' : 'error');
    if (!props.src) store.set(replaceOpenAtom, true);
  }, [store, props.src]);

  return <Provider store={store}>{children}</Provider>;
}
