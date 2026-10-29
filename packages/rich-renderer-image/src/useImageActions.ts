import type { ImageDisplaySize, ImageLayout } from '@haklex/rich-editor/nodes';
import { $createImageNode, $isImageNode } from '@haklex/rich-editor/nodes';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useStore } from 'jotai';
import { $getNearestNodeFromDOMNode } from 'lexical';
import { useCallback } from 'react';

import { altTextAtom, metaOpenAtom, replaceOpenAtom, srcAtom, wrapperRefAtom } from './atoms';

export function useImageActions() {
  const store = useStore();
  const [editor] = useLexicalComposerContext();

  const withImageNode = useCallback(
    (updater: (node: ReturnType<typeof $createImageNode>) => void) => {
      const wrapperRef = store.get(wrapperRefAtom);
      if (!wrapperRef.current) return;
      editor.update(
        () => {
          const node = $getNearestNodeFromDOMNode(wrapperRef.current!);
          if ($isImageNode(node)) updater(node);
        },
        // Toolbar actions target the image in view; don't let Lexical scroll
        // the (possibly offscreen) caret back into view on commit.
        { tag: 'skip-scroll-into-view' },
      );
    },
    [editor, store],
  );

  const closeReplacePanel = useCallback(() => {
    store.set(replaceOpenAtom, false);
  }, [store]);

  const handleDelete = useCallback(() => {
    const wrapperRef = store.get(wrapperRefAtom);
    if (!wrapperRef.current) return;
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(wrapperRef.current!);
      if (node) node.remove();
    });
    store.set(metaOpenAtom, false);
    closeReplacePanel();
  }, [closeReplacePanel, editor, store]);

  const handleOpen = useCallback(() => {
    const src = store.get(srcAtom);
    if (src) window.open(src, '_blank', 'noopener,noreferrer');
  }, [store]);

  const handleDownload = useCallback(() => {
    const src = store.get(srcAtom);
    if (!src) return;
    const link = document.createElement('a');
    link.href = src;
    link.download = store.get(altTextAtom) || 'image';
    link.click();
  }, [store]);

  const handleDuplicate = useCallback(() => {
    withImageNode((node) => {
      const copy = $createImageNode({
        src: node.getSrc(),
        altText: node.getAltText(),
        width: node.getWidth(),
        height: node.getHeight(),
        caption: node.getCaption(),
        thumbhash: node.getThumbhash(),
        accent: node.getAccent(),
        displayWidth: node.getDisplayWidth(),
        fixedWidth: node.getFixedWidth(),
        fixedHeight: node.getFixedHeight(),
        layout: node.getLayout(),
      });
      node.insertAfter(copy);
    });
  }, [withImageNode]);

  const handleSetDisplaySize = useCallback(
    (size: ImageDisplaySize) => {
      withImageNode((node) => {
        node.applyDisplaySize(size);
      });
    },
    [withImageNode],
  );

  const handleSetLayout = useCallback(
    (layout?: ImageLayout) => {
      withImageNode((node) => {
        node.setLayout(layout);
      });
    },
    [withImageNode],
  );

  const handleReplaceOpenChange = useCallback(
    (nextOpen: boolean) => {
      store.set(replaceOpenAtom, nextOpen);
      if (!nextOpen) closeReplacePanel();
    },
    [closeReplacePanel, store],
  );

  return {
    closeReplacePanel,
    handleReplaceOpenChange,
    handleOpen,
    handleDuplicate,
    handleDownload,
    handleDelete,
    handleSetDisplaySize,
    handleSetLayout,
  };
}
