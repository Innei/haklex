import type { ImageNode } from '@haklex/rich-editor/nodes';
import { $isImageNode } from '@haklex/rich-editor/nodes';
import {
  defaultImageUpload,
  getImageEditor,
  presentImageDialog,
  resolvePreprocessTargets,
  uploadImageFile,
  useImagePreprocess,
  useImageUpload,
} from '@haklex/rich-editor/plugins';
import { computeImageMeta } from '@haklex/rich-editor/renderers';
import { toast, updateToast } from '@haklex/rich-editor-ui';
import { usePortalTheme } from '@haklex/rich-style-token';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useStore } from 'jotai';
import { $getNearestNodeFromDOMNode } from 'lexical';
import { useCallback, useEffect, useRef } from 'react';

import { wrapperRefAtom } from './atoms';
import { useImageActions } from './useImageActions';

const ERROR_TOAST_DURATION = 6000;

export function useReplaceImageDialog(): () => Promise<void> {
  const [editor] = useLexicalComposerContext();
  const store = useStore();
  const uploadImage = useImageUpload();
  const preprocess = useImagePreprocess();
  const portalTheme = usePortalTheme();
  const openRef = useRef(false);

  return useCallback(async () => {
    if (openRef.current) return;
    openRef.current = true;
    const wrapper = store.get(wrapperRefAtom).current;
    const withNode = (updater: (node: ImageNode) => void) => {
      if (!wrapper) return;
      editor.update(
        () => {
          const node = $getNearestNodeFromDOMNode(wrapper);
          if ($isImageNode(node)) updater(node);
        },
        { tag: 'skip-scroll-into-view' },
      );
    };

    try {
      const imageEditor = getImageEditor(preprocess);
      const entries = await presentImageDialog({
        editor: imageEditor,
        mode: 'replace',
        portalClassName: portalTheme.className,
        theme: portalTheme.theme,
      });
      const entry = entries?.[0];
      if (!entry) return;

      if (entry.kind === 'url') {
        withNode((node) => {
          node.setSrc(entry.src);
          node.setDimensions(entry.width, entry.height);
          node.setThumbhash(undefined);
        });
        return;
      }

      const [file] = imageEditor
        ? [entry.file]
        : await resolvePreprocessTargets([entry.file], 'replace', preprocess?.ref.current ?? null);
      if (!file) return;

      const upload = async () => {
        const id = toast({ title: 'Uploading image…', tone: 'loading' });
        try {
          const uploader = uploadImage ?? defaultImageUpload;
          const [result, meta] = await Promise.all([
            uploadImageFile(uploader, file),
            computeImageMeta(file),
          ]);
          withNode((node) => {
            node.setSrc(result.src);
            node.setAltText(result.altText ?? file.name);
            node.setDimensions(result.width ?? meta.width, result.height ?? meta.height);
            node.setThumbhash(result.thumbhash ?? meta.thumbhash);
          });
          updateToast(id, { title: 'Image replaced', tone: 'success' });
        } catch (err: unknown) {
          console.error('[ImageReplace]', err);
          updateToast(id, {
            action: { label: 'Retry', onClick: () => void upload() },
            duration: ERROR_TOAST_DURATION,
            title: 'Image replace failed',
            tone: 'error',
          });
        }
      };
      await upload();
    } finally {
      openRef.current = false;
    }
  }, [editor, portalTheme, preprocess, store, uploadImage]);
}

export function ReplacePanel() {
  const openReplaceDialog = useReplaceImageDialog();
  const { handleReplaceOpenChange } = useImageActions();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    handleReplaceOpenChange(false);
    void openReplaceDialog();
  }, [handleReplaceOpenChange, openReplaceDialog]);

  return null;
}
