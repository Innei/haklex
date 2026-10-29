import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import type { BaseSelection, LexicalEditor } from 'lexical';
import { $getSelection, $isRangeSelection, $setSelection } from 'lexical';
import { useCallback, useRef, useState } from 'react';

import type { RubyDraft } from './actions';
import {
  $removeLinks,
  $setRubyReading,
  $unwrapRuby,
  $wrapSelectionInRuby,
  looksLikeUrl,
  normalizeUrl,
  readClipboardUrl,
} from './actions';
import { $getSelectedLinkUrl, $selectionHasLink, getSelectedRubyNodes } from './selection-state';

export type FocusOrigin = 'editor' | 'toolbar';

export type ToolbarMode =
  | { kind: 'format' }
  | { kind: 'link'; dirty: boolean; draft: string; existing: boolean; origin: FocusOrigin }
  | { kind: 'ruby'; draft: RubyDraft; origin: FocusOrigin };

const FORMAT: ToolbarMode = { kind: 'format' };

export function useInlineModes(editor: LexicalEditor, onClose: (focus: string | null) => void) {
  const [mode, setModeState] = useState<ToolbarMode>(FORMAT);
  const modeRef = useRef(mode);
  const savedSelectionRef = useRef<BaseSelection | null>(null);

  const setMode = useCallback((next: ToolbarMode | ((prev: ToolbarMode) => ToolbarMode)) => {
    const resolved = typeof next === 'function' ? next(modeRef.current) : next;
    modeRef.current = resolved;
    setModeState(resolved);
  }, []);

  const close = useCallback(
    (restoreFocus: boolean) => {
      const current = modeRef.current;
      setMode(FORMAT);
      if (!restoreFocus || current.kind === 'format') {
        onClose(null);
        return;
      }
      if (current.origin === 'editor') onClose('editor');
      else onClose(current.kind === 'link' ? 'Link' : 'Ruby');
    },
    [onClose, setMode],
  );

  const openLink = useCallback(
    (origin: FocusOrigin) => {
      const info = editor.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || selection.isCollapsed()) return null;
        const hasLink = $selectionHasLink(selection);
        const existing = hasLink ? $getSelectedLinkUrl(selection) : '';
        const text = selection.getTextContent().trim();
        return {
          hasLink,
          initial: existing || (looksLikeUrl(text) ? text : ''),
          selection: selection.clone(),
        };
      });
      if (!info) return;

      savedSelectionRef.current = info.selection;
      setMode({ kind: 'link', draft: info.initial, dirty: false, existing: info.hasLink, origin });
      if (info.initial) return;
      void readClipboardUrl().then((url) => {
        if (!url) return;
        setMode((prev) =>
          prev.kind === 'link' && !prev.dirty && !prev.draft ? { ...prev, draft: url } : prev,
        );
      });
    },
    [editor, setMode],
  );

  const setLinkDraft = useCallback(
    (draft: string) => {
      setMode((prev) => (prev.kind === 'link' ? { ...prev, draft, dirty: true } : prev));
    },
    [setMode],
  );

  const saveLink = useCallback(
    (restoreFocus = true) => {
      const current = modeRef.current;
      if (current.kind !== 'link') return;
      const url = normalizeUrl(current.draft);
      if (url) {
        editor.update(() => {
          const saved = savedSelectionRef.current;
          const selection = $getSelection();
          if (saved && (!$isRangeSelection(selection) || selection.isCollapsed())) {
            $setSelection(saved.clone());
          }
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        });
      }
      savedSelectionRef.current = null;
      close(restoreFocus);
    },
    [close, editor],
  );

  const removeLink = useCallback(() => {
    if (modeRef.current.kind !== 'link') return;
    editor.update(() => {
      const saved = savedSelectionRef.current;
      const selection = $getSelection();
      if (saved && (!$isRangeSelection(selection) || selection.isCollapsed())) {
        $setSelection(saved.clone());
      }
      const target = $getSelection();
      if ($isRangeSelection(target)) $removeLinks(editor, target);
    });
    savedSelectionRef.current = null;
    close(true);
  }, [close, editor]);

  const openRuby = useCallback(
    (origin: FocusOrigin) => {
      const existing = editor.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return undefined;
        const ruby = getSelectedRubyNodes(selection.getNodes())[0];
        return ruby ? { nodeKey: ruby.getKey(), reading: ruby.getReading(), isNew: false } : null;
      });
      if (existing === undefined) return;
      if (existing) {
        setMode({ kind: 'ruby', draft: existing, origin });
        return;
      }
      let draft: RubyDraft | null = null;
      editor.update(
        () => {
          draft = $wrapSelectionInRuby();
        },
        { discrete: true },
      );
      if (draft) setMode({ kind: 'ruby', draft, origin });
    },
    [editor, setMode],
  );

  const editRuby = useCallback(
    (nodeKey: string, reading: string) => {
      setMode({ kind: 'ruby', draft: { nodeKey, reading, isNew: false }, origin: 'editor' });
    },
    [setMode],
  );

  const setRubyDraft = useCallback(
    (reading: string) => {
      setMode((prev) =>
        prev.kind === 'ruby' ? { ...prev, draft: { ...prev.draft, reading } } : prev,
      );
    },
    [setMode],
  );

  const saveRuby = useCallback(
    (restoreFocus = true) => {
      const current = modeRef.current;
      if (current.kind !== 'ruby') return;
      const reading = current.draft.reading.trim();
      editor.update(() => {
        if (reading) $setRubyReading(current.draft.nodeKey, reading);
        else $unwrapRuby(current.draft.nodeKey);
      });
      close(restoreFocus);
    },
    [close, editor],
  );

  const cancelRuby = useCallback(() => {
    const current = modeRef.current;
    if (current.kind !== 'ruby') return;
    if (current.draft.isNew) editor.update(() => $unwrapRuby(current.draft.nodeKey));
    close(true);
  }, [close, editor]);

  const removeRuby = useCallback(() => {
    const current = modeRef.current;
    if (current.kind !== 'ruby') return;
    editor.update(() => $unwrapRuby(current.draft.nodeKey));
    close(true);
  }, [close, editor]);

  const commitOnOutsideClick = useCallback(() => {
    const current = modeRef.current;
    if (current.kind === 'link') {
      if (current.dirty && current.draft.trim()) saveLink(false);
      else close(false);
    } else if (current.kind === 'ruby') {
      saveRuby(false);
    }
  }, [close, saveLink, saveRuby]);

  return {
    mode,
    modeRef,
    cancel: close,
    cancelRuby,
    commitOnOutsideClick,
    editRuby,
    openLink,
    openRuby,
    removeLink,
    removeRuby,
    saveLink,
    saveRuby,
    setLinkDraft,
    setRubyDraft,
  };
}
