import { $isLinkCardNode, type LinkCardNodePayload } from '@haklex/rich-editor/nodes';
import { Popover, PopoverPanel, PopoverTrigger, toast } from '@haklex/rich-editor-ui';
import { $createLinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import type { KeyboardEvent, ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import * as styles from './edit.css';
import { getEditorHistoryShortcut } from './history-shortcuts';
import type { LinkCardEditMode } from './LinkCardEditPanel';
import { LinkCardForm, LinkCardView } from './LinkCardEditPanel';

interface LinkCardEditDecoratorProps {
  children: ReactElement;
  nodeKey: string;
  payload: LinkCardNodePayload;
}

export function LinkCardEditDecorator({ nodeKey, payload, children }: LinkCardEditDecoratorProps) {
  const [editor] = useLexicalComposerContext();
  const editable = editor.isEditable();

  const [open, setOpen] = useState(() => !payload.url);
  const [mode, setModeState] = useState<LinkCardEditMode>(() => (payload.url ? 'view' : 'edit'));
  const modeRef = useRef(mode);
  const [draft, setDraftState] = useState(payload.url);
  const draftRef = useRef(draft);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef(false);

  const setMode = useCallback((next: LinkCardEditMode) => {
    modeRef.current = next;
    setModeState(next);
  }, []);

  const setDraft = useCallback((next: string) => {
    draftRef.current = next;
    setDraftState(next);
  }, []);

  useEffect(() => {
    setDraft(payload.url);
  }, [payload.url, setDraft]);

  useEffect(() => {
    if (!open || mode !== 'edit') return;
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, mode]);

  useEffect(() => {
    if (mode !== 'view' || !restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    popupRef.current?.querySelector<HTMLElement>('[data-link-action="edit"]')?.focus();
  }, [mode]);

  const commitDraft = useCallback(() => {
    const trimmed = draftRef.current.trim();
    if (!trimmed) return false;
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isLinkCardNode(node) && node.getUrl() !== trimmed) {
        node.setUrl(trimmed);
      }
    });
    return true;
  }, [editor, nodeKey]);

  const close = useCallback(() => {
    setOpen(false);
    setMode(payload.url ? 'view' : 'edit');
  }, [payload.url, setMode]);

  const revert = useCallback(() => {
    setDraft(payload.url);
    if (!payload.url) {
      close();
      return;
    }
    restoreFocusRef.current = true;
    setMode('view');
  }, [close, payload.url, setDraft, setMode]);

  const handleSave = useCallback(() => {
    if (!commitDraft()) return;
    setOpen(false);
    setMode('view');
  }, [commitDraft, setMode]);

  const handleDelete = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) node.remove();
    });
    setOpen(false);
  }, [editor, nodeKey]);

  const handleConvertToLink = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (!$isLinkCardNode(node)) return;
      const nodeUrl = node.getUrl();
      const linkNode = $createLinkNode(nodeUrl);
      linkNode.append($createTextNode(payload.title || nodeUrl));
      const paragraph = $createParagraphNode();
      paragraph.append(linkNode);
      node.replace(paragraph);
      paragraph.selectEnd();
    });
    setOpen(false);
  }, [editor, nodeKey, payload.title]);

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        revert();
      }
    },
    [handleSave, revert],
  );

  const handlePanelKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const shortcut = getEditorHistoryShortcut(e, {
        isDirty: mode === 'edit' && draft !== payload.url,
      });
      if (!shortcut) return;

      e.preventDefault();
      e.stopPropagation();
      editor.dispatchCommand(shortcut === 'undo' ? UNDO_COMMAND : REDO_COMMAND, undefined);
    },
    [draft, editor, mode, payload.url],
  );

  const handleOpen = useCallback(() => {
    window.open(payload.url, '_blank', 'noopener,noreferrer');
  }, [payload.url]);

  const handleCopy = useCallback(() => {
    void navigator.clipboard?.writeText(payload.url).then(() => {
      toast({ title: 'Link copied', tone: 'success' });
    });
  }, [payload.url]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean, details?: { reason?: string }) => {
      if (nextOpen) {
        setOpen(true);
        return;
      }
      if (modeRef.current === 'edit') {
        if (details?.reason === 'escape-key') {
          revert();
          return;
        }
        commitDraft();
      }
      close();
    },
    [close, commitDraft, revert],
  );

  if (!editable) {
    return children;
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        nativeButton={false}
        render={
          <span className={`${styles.editWrapper} ${styles.semanticClassNames.editWrapper}`} />
        }
      >
        {children}
      </PopoverTrigger>
      <PopoverPanel
        flush
        className={`${styles.editPanel} ${styles.semanticClassNames.editPanel}`}
        initialFocus={mode === 'edit' ? inputRef : undefined}
        ref={popupRef}
        side="bottom"
        size="md"
        onKeyDown={handlePanelKeyDown}
      >
        {mode === 'edit' ? (
          <LinkCardForm
            inputRef={inputRef}
            url={draft}
            onCancel={revert}
            onChange={setDraft}
            onKeyDown={handleInputKeyDown}
            onSave={handleSave}
          />
        ) : (
          <LinkCardView
            favicon={payload.favicon}
            title={payload.title}
            url={payload.url}
            onCopy={handleCopy}
            onOpen={handleOpen}
            onRemove={handleDelete}
            onEdit={() => {
              setDraft(payload.url);
              setMode('edit');
            }}
            onKindChange={(kind) => {
              if (kind === 'link') handleConvertToLink();
            }}
          />
        )}
      </PopoverPanel>
    </Popover>
  );
}
