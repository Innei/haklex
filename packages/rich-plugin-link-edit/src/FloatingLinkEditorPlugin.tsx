import {
  getActionButtonClassName,
  Popover,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  toast,
} from '@haklex/rich-editor-ui';
import type { LinkNode } from '@lexical/link';
import { $isAutoLinkNode, $isLinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { LexicalNode } from 'lexical';
import {
  $createTextNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import type { FocusEvent, KeyboardEvent, ReactElement, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { isEmptyLink } from './link-display';
import type { LinkDraft, LinkEditorMode } from './LinkEditorPanel';
import { LinkEditorPanel } from './LinkEditorPanel';
import * as styles from './styles.css';
import { useModClickLinks } from './useModClickLinks';

function $findLinkNode(node: LexicalNode): LinkNode | null {
  let current: LexicalNode | null = node;
  while (current) {
    if ($isLinkNode(current)) return current;
    current = current.getParent();
  }
  return null;
}

function $replaceLinkText(link: LinkNode, text: string) {
  if (link.getTextContent() === text) return;
  const first = link.getFirstDescendant();
  const next = $createTextNode(text);
  if ($isTextNode(first)) {
    next.setFormat(first.getFormat());
    next.setStyle(first.getStyle());
  }
  const previous = link.getChildren();
  link.append(next);
  for (const child of previous) child.remove();
}

interface LinkEditorState {
  linkDom: HTMLElement | null;
  linkKey: string;
  text: string;
  url: string;
}

export interface FloatingLinkEditorPluginProps {
  renderExtraActions?: (props: {
    url: string;
    linkKey: string;
    actionButtonClassName: string;
  }) => ReactNode;
}

export function FloatingLinkEditorPlugin({
  renderExtraActions,
}: FloatingLinkEditorPluginProps = {}): ReactElement | null {
  const [editor] = useLexicalComposerContext();
  const urlInputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef(false);
  const panelFocusedRef = useRef(false);

  const [visible, setVisible] = useState(false);
  const [linkState, setLinkState] = useState<LinkEditorState>({
    url: '',
    text: '',
    linkKey: '',
    linkDom: null,
  });
  const [draft, setDraftState] = useState<LinkDraft>({ text: '', url: '' });
  const draftRef = useRef(draft);
  const [mode, setModeState] = useState<LinkEditorMode>('view');
  const modeRef = useRef<LinkEditorMode>('view');
  const shownKeyRef = useRef('');

  const setDraft = useCallback((next: LinkDraft) => {
    draftRef.current = next;
    setDraftState(next);
  }, []);

  const setMode = useCallback((next: LinkEditorMode) => {
    modeRef.current = next;
    setModeState(next);
  }, []);

  const updateLink = useCallback(() => {
    if (panelFocusedRef.current) return;

    const selection = $getSelection();
    if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
      setVisible(false);
      return;
    }

    const anchorNode = selection.anchor.getNode();
    const linkNode = $findLinkNode(anchorNode);
    if (!linkNode || ($isAutoLinkNode(linkNode) && linkNode.getIsUnlinked())) {
      shownKeyRef.current = '';
      setVisible(false);
      return;
    }

    const url = linkNode.getURL();
    const text = linkNode.getTextContent();
    const key = linkNode.getKey();
    const dom = editor.getElementByKey(key);

    if (shownKeyRef.current !== key) {
      shownKeyRef.current = key;
      setMode(isEmptyLink(url) ? 'edit' : 'view');
    }
    setLinkState({ url, text, linkKey: key, linkDom: dom });
    if (modeRef.current === 'view' || !panelFocusedRef.current) setDraft({ text, url });
    setVisible(true);
  }, [editor, setDraft, setMode]);

  useEffect(() => {
    const unregisterCommand = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateLink();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
    const unregisterUpdate = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateLink();
      });
    });
    return () => {
      unregisterCommand();
      unregisterUpdate();
    };
  }, [editor, updateLink]);

  useModClickLinks(editor);

  useEffect(() => {
    if (visible && mode === 'edit') urlInputRef.current?.focus();
  }, [visible, mode, linkState.linkKey]);

  useEffect(() => {
    if (mode !== 'view' || !restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    popupRef.current?.querySelector<HTMLElement>('[data-link-action="edit"]')?.focus();
  }, [mode]);

  const commitDraft = useCallback(() => {
    const { text, url } = draftRef.current;
    const trimmedUrl = url.trim();
    if (isEmptyLink(trimmedUrl)) return false;
    const trimmedText = text.trim();
    editor.update(() => {
      const node = $getNodeByKey(linkState.linkKey);
      if (!$isLinkNode(node)) return;
      if (node.getURL() !== trimmedUrl) node.setURL(trimmedUrl);
      if (trimmedText) $replaceLinkText(node, text);
    });
    return true;
  }, [editor, linkState.linkKey]);

  const returnToEditor = useCallback(() => {
    panelFocusedRef.current = false;
    setMode('view');
    editor.focus();
  }, [editor, setMode]);

  const handleSave = useCallback(() => {
    if (commitDraft()) returnToEditor();
  }, [commitDraft, returnToEditor]);

  const handleCancel = useCallback(() => {
    setDraft({ text: linkState.text, url: linkState.url });
    if (isEmptyLink(linkState.url)) {
      returnToEditor();
      return;
    }
    restoreFocusRef.current = true;
    setMode('view');
  }, [linkState.text, linkState.url, returnToEditor, setDraft, setMode]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleCancel();
      }
    },
    [handleCancel, handleSave],
  );

  const handleEdit = useCallback(() => {
    setDraft({ text: linkState.text, url: linkState.url });
    setMode('edit');
  }, [linkState.text, linkState.url, setDraft, setMode]);

  const handleOpen = useCallback(() => {
    window.open(linkState.url, '_blank', 'noopener');
  }, [linkState.url]);

  const handleCopy = useCallback(() => {
    void navigator.clipboard?.writeText(linkState.url).then(() => {
      toast({ title: 'Link copied', tone: 'success' });
    });
  }, [linkState.url]);

  const handleUnlink = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(linkState.linkKey);

      if ($isLinkNode(node)) {
        if ($isAutoLinkNode(node)) {
          node.setIsUnlinked(true);
          node.markDirty();
          return;
        }

        const children = node.getChildren();
        for (const child of children) {
          node.insertBefore(child);
        }
        node.remove();
      }
    });
    panelFocusedRef.current = false;
    setVisible(false);
  }, [editor, linkState.linkKey]);

  const handlePanelFocusIn = useCallback(() => {
    panelFocusedRef.current = true;
  }, []);

  const handlePanelFocusOut = useCallback(
    (e: FocusEvent) => {
      const panel = e.currentTarget;
      if (panel.contains(e.relatedTarget as Node | null)) return;
      panelFocusedRef.current = false;
      if (modeRef.current === 'edit' && commitDraft()) setMode('view');
    },
    [commitDraft, setMode],
  );

  if (!editor.isEditable()) return null;

  return (
    <Popover open={visible}>
      <PopoverPortal>
        <PopoverPositioner
          align="center"
          anchor={linkState.linkDom}
          collisionAvoidance={{ side: 'flip', align: 'shift' }}
          collisionPadding={8}
          side="bottom"
          sideOffset={8}
        >
          <PopoverPopup
            flush
            className={`${styles.panel} ${styles.semanticClassNames.panel}`}
            ref={popupRef}
            size="md"
            onBlur={handlePanelFocusOut}
            onFocus={handlePanelFocusIn}
          >
            <LinkEditorPanel
              draft={draft}
              mode={mode}
              text={linkState.text}
              url={linkState.url}
              urlInputRef={urlInputRef}
              extraActions={renderExtraActions?.({
                url: linkState.url,
                linkKey: linkState.linkKey,
                actionButtonClassName: getActionButtonClassName({ size: 'md' }),
              })}
              onCancel={handleCancel}
              onCopy={handleCopy}
              onDraftChange={setDraft}
              onEdit={handleEdit}
              onKeyDown={handleKeyDown}
              onOpen={handleOpen}
              onSave={handleSave}
              onUnlink={handleUnlink}
            />
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  );
}
