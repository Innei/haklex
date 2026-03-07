import {
  ActionBar,
  ActionButton,
  getActionButtonClassName,
  Popover,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
} from '@haklex/rich-editor-ui';
import type { LinkNode } from '@lexical/link';
import { $isAutoLinkNode, $isLinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { LexicalNode } from 'lexical';
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { ExternalLink, Link, Unlink } from 'lucide-react';
import type { KeyboardEvent, ReactElement, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import * as styles from './styles.css';

function $findLinkNode(node: LexicalNode): LinkNode | null {
  let current: LexicalNode | null = node;
  while (current) {
    if ($isLinkNode(current)) return current;
    current = current.getParent();
  }
  return null;
}

interface LinkEditorState {
  linkDom: HTMLElement | null;
  linkKey: string;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const panelFocusedRef = useRef(false);

  const [visible, setVisible] = useState(false);
  const [linkState, setLinkState] = useState<LinkEditorState>({
    url: '',
    linkKey: '',
    linkDom: null,
  });
  const [inputUrl, setInputUrl] = useState('');

  const updateLink = useCallback(() => {
    if (panelFocusedRef.current) return;

    const selection = $getSelection();
    if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
      setVisible(false);
      return;
    }

    const anchorNode = selection.anchor.getNode();
    const linkNode = $findLinkNode(anchorNode);
    if (!linkNode) {
      setVisible(false);
      return;
    }
    if ($isAutoLinkNode(linkNode) && linkNode.getIsUnlinked()) {
      setVisible(false);
      return;
    }

    const url = linkNode.getURL();
    const key = linkNode.getKey();
    const dom = editor.getElementByKey(key);

    setLinkState({ url, linkKey: key, linkDom: dom });
    setInputUrl(url);
    setVisible(true);
  }, [editor]);

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

  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;

    const CSS_CLASSES = [styles.cmdHover, styles.semanticClassNames.cmdHover];

    const updateCursor = (mod: boolean) => {
      for (const cssClass of CSS_CLASSES) {
        root.classList.toggle(cssClass, mod);
      }
    };

    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Meta' || e.key === 'Control') updateCursor(true);
    };
    const onKeyUp = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Meta' || e.key === 'Control') updateCursor(false);
    };
    const onBlur = () => updateCursor(false);

    const onClick = (e: MouseEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (href) {
        e.preventDefault();
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    };

    root.addEventListener('keydown', onKeyDown);
    root.addEventListener('keyup', onKeyUp);
    root.addEventListener('blur', onBlur);
    root.addEventListener('click', onClick);
    return () => {
      root.removeEventListener('keydown', onKeyDown);
      root.removeEventListener('keyup', onKeyUp);
      root.removeEventListener('blur', onBlur);
      root.removeEventListener('click', onClick);
      for (const cssClass of CSS_CLASSES) {
        root.classList.remove(cssClass);
      }
    };
  }, [editor]);

  const commitUrl = useCallback(() => {
    const trimmed = inputUrl.trim();
    if (!trimmed) return;
    editor.update(() => {
      const node = $getNodeByKey(linkState.linkKey);
      if ($isLinkNode(node) && node.getURL() !== trimmed) {
        node.setURL(trimmed);
      }
    });
  }, [editor, inputUrl, linkState.linkKey]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitUrl();
        editor.focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setInputUrl(linkState.url);
        editor.focus();
      }
    },
    [commitUrl, editor, linkState.url],
  );

  const handleOpen = useCallback(() => {
    window.open(linkState.url, '_blank', 'noopener');
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
    setVisible(false);
  }, [editor, linkState.linkKey]);

  const handlePanelFocusIn = useCallback(() => {
    panelFocusedRef.current = true;
  }, []);

  const handlePanelFocusOut = useCallback(
    (e: React.FocusEvent) => {
      const panel = e.currentTarget;
      if (!panel.contains(e.relatedTarget as Node)) {
        panelFocusedRef.current = false;
        commitUrl();
        editor.focus();
      }
    },
    [commitUrl, editor],
  );

  if (!editor.isEditable()) return null;

  return (
    <Popover open={visible}>
      <PopoverPortal>
        <PopoverPositioner align="center" anchor={linkState.linkDom} side="bottom" sideOffset={8}>
          <PopoverPopup
            className={`${styles.panel} ${styles.semanticClassNames.panel}`}
            onBlur={handlePanelFocusOut}
            onFocus={handlePanelFocusIn}
          >
            <div className={`${styles.urlRow} ${styles.semanticClassNames.urlRow}`}>
              <Link
                className={`${styles.linkIcon} ${styles.semanticClassNames.linkIcon}`}
                size={16}
              />
              <input
                className={`${styles.input} ${styles.semanticClassNames.input}`}
                placeholder="https://..."
                ref={inputRef}
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <ActionBar>
              <ActionButton onClick={handleOpen}>
                <ExternalLink size={14} />
                Open
              </ActionButton>
              {renderExtraActions?.({
                url: linkState.url,
                linkKey: linkState.linkKey,
                actionButtonClassName: getActionButtonClassName(),
              })}
              <ActionButton danger onClick={handleUnlink}>
                <Unlink size={14} />
                Unlink
              </ActionButton>
            </ActionBar>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  );
}
