import type { ImageDisplaySize, ImageLayout } from '@haklex/rich-editor/nodes';
import { $createImageNode, $isImageNode } from '@haklex/rich-editor/nodes';
import { type ImageUploadFn, useImageUpload } from '@haklex/rich-editor/plugins';
import { computeImageMeta } from '@haklex/rich-editor/renderers';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useStore } from 'jotai';
import { $getNearestNodeFromDOMNode } from 'lexical';
import { useCallback } from 'react';

import {
  altTextAtom,
  editAltTextAtom,
  editCaptionAtom,
  editSrcAtom,
  metaOpenAtom,
  replaceErrorAtom,
  replaceLoadingAtom,
  replaceMetaAtom,
  replaceModeAtom,
  replaceOpenAtom,
  replacePreviewAtom,
  replaceUrlAtom,
  srcAtom,
  wrapperRefAtom,
} from './atoms';

function isSafeImageSrc(src: string): boolean {
  return !/^(?:javascript\s*:|vbscript\s*:|data\s*:(?!image\/))/i.test(src);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

function loadImageByUrl(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve({
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
      });
    };
    image.onerror = () => reject(new Error('Image load failed'));
    image.src = src;
  });
}

export function useImageActions() {
  const store = useStore();
  const [editor] = useLexicalComposerContext();
  const uploadImage = useImageUpload();

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
    store.set(replaceModeAtom, 'upload');
    store.set(replaceUrlAtom, '');
    store.set(replacePreviewAtom, null);
    store.set(replaceMetaAtom, null);
    store.set(replaceLoadingAtom, false);
    store.set(replaceErrorAtom, null);
  }, [store]);

  const commitMeta = useCallback(() => {
    const editSrc = store.get(editSrcAtom).trim();
    if (!editSrc || !isSafeImageSrc(editSrc)) return;
    withImageNode((node) => {
      node.setSrc(editSrc);
      node.setAltText(store.get(editAltTextAtom).trim());
      node.setCaption(store.get(editCaptionAtom).trim() || undefined);
    });
    store.set(metaOpenAtom, false);
  }, [store, withImageNode]);

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

  const handleReplaceFile = useCallback(
    async (file: File | null) => {
      if (!file || !file.type.startsWith('image/')) return;
      store.set(replaceLoadingAtom, true);
      store.set(replaceErrorAtom, null);
      try {
        const fallbackUploader: ImageUploadFn = async (nextFile) => ({
          src: await readAsDataUrl(nextFile),
          altText: nextFile.name,
        });
        const uploader = uploadImage ?? fallbackUploader;
        const [result, meta] = await Promise.all([uploader(file), computeImageMeta(file)]);
        withImageNode((node) => {
          node.setSrc(result.src);
          node.setAltText(result.altText ?? file.name);
          node.setDimensions(result.width ?? meta.width, result.height ?? meta.height);
          node.setThumbhash(result.thumbhash ?? meta.thumbhash);
        });
        closeReplacePanel();
      } catch {
        store.set(replaceErrorAtom, 'Failed to replace image');
      } finally {
        store.set(replaceLoadingAtom, false);
      }
    },
    [closeReplacePanel, store, uploadImage, withImageNode],
  );

  const handlePreviewUrl = useCallback(async () => {
    const url = store.get(replaceUrlAtom).trim();
    if (!url || !isSafeImageSrc(url)) {
      store.set(replaceErrorAtom, 'Invalid image URL');
      return;
    }
    store.set(replaceLoadingAtom, true);
    store.set(replaceErrorAtom, null);
    try {
      const meta = await loadImageByUrl(url);
      store.set(replacePreviewAtom, url);
      store.set(replaceMetaAtom, meta);
    } catch {
      store.set(replacePreviewAtom, null);
      store.set(replaceMetaAtom, null);
      store.set(replaceErrorAtom, 'Image URL could not be loaded');
    } finally {
      store.set(replaceLoadingAtom, false);
    }
  }, [store]);

  const handleReplaceByUrl = useCallback(() => {
    const preview = store.get(replacePreviewAtom);
    if (!preview || !isSafeImageSrc(preview)) return;
    const meta = store.get(replaceMetaAtom);
    withImageNode((node) => {
      node.setSrc(preview);
      node.setDimensions(meta?.width, meta?.height);
      node.setThumbhash(undefined);
    });
    closeReplacePanel();
  }, [closeReplacePanel, store, withImageNode]);

  const handleReplaceOpenChange = useCallback(
    (nextOpen: boolean) => {
      store.set(replaceOpenAtom, nextOpen);
      if (!nextOpen) closeReplacePanel();
    },
    [closeReplacePanel, store],
  );

  return {
    commitMeta,
    closeReplacePanel,
    handleReplaceFile,
    handlePreviewUrl,
    handleReplaceByUrl,
    handleReplaceOpenChange,
    handleOpen,
    handleDuplicate,
    handleDownload,
    handleDelete,
    handleSetDisplaySize,
    handleSetLayout,
  };
}
