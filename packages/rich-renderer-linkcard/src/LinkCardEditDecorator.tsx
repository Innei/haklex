import { $isLinkCardNode, type LinkCardNodePayload } from '@haklex/rich-editor/nodes';
import {
  ActionBar,
  ActionButton,
  Popover,
  PopoverPanel,
  PopoverTrigger,
} from '@haklex/rich-editor-ui';
import { $createLinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createParagraphNode, $createTextNode, $getNodeByKey } from 'lexical';
import { ExternalLink, Link, RemoveFormatting, Unlink } from 'lucide-react';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import * as styles from './styles.css';

interface LinkCardEditDecoratorProps {
  children: ReactElement;
  nodeKey: string;
  payload: LinkCardNodePayload;
}

export function LinkCardEditDecorator({ nodeKey, payload, children }: LinkCardEditDecoratorProps) {
  const [editor] = useLexicalComposerContext();
  const editable = editor.isEditable();

  const [open, setOpen] = useState(() => !payload.url);

  const [url, setUrl] = useState(payload.url);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrl(payload.url);
  }, [payload.url]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [open]);

  const commitUrl = useCallback(() => {
    const trimmed = url.trim();
    if (!trimmed) return;
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isLinkCardNode(node) && node.getUrl() !== trimmed) {
        node.setUrl(trimmed);
      }
    });
  }, [editor, nodeKey, url]);

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
      const { title } = payload;
      const linkNode = $createLinkNode(nodeUrl);
      linkNode.append($createTextNode(title || nodeUrl));
      const paragraph = $createParagraphNode();
      paragraph.append(linkNode);
      node.replace(paragraph);
      paragraph.selectEnd();
    });
    setOpen(false);
  }, [editor, nodeKey, payload]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitUrl();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setUrl(payload.url);
      }
    },
    [commitUrl, payload.url],
  );

  const handleOpen = useCallback(() => {
    window.open(payload.url, '_blank', 'noopener,noreferrer');
  }, [payload.url]);

  if (!editable) {
    return children;
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setUrl(payload.url);
        }
      }}
    >
      <PopoverTrigger
        openOnHover
        closeDelay={300}
        delay={200}
        nativeButton={false}
        render={
          <span className={`${styles.editWrapper} ${styles.semanticClassNames.editWrapper}`} />
        }
      >
        {children}
      </PopoverTrigger>
      <PopoverPanel
        className={`${styles.editPanel} ${styles.semanticClassNames.editPanel}`}
        side="bottom"
        sideOffset={8}
      >
        <div className={`${styles.editUrlRow} ${styles.semanticClassNames.editUrlRow}`}>
          <Link
            className={`${styles.editLinkIcon} ${styles.semanticClassNames.editLinkIcon}`}
            size={16}
          />

          <input
            className={`${styles.editInput} ${styles.semanticClassNames.editInput}`}
            placeholder="https://..."
            ref={inputRef}
            type="url"
            value={url}
            onBlur={commitUrl}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <ActionBar>
          <ActionButton onClick={handleOpen}>
            <ExternalLink size={14} />
            Open
          </ActionButton>
          <ActionButton onClick={handleConvertToLink}>
            <RemoveFormatting size={14} />
            To Link
          </ActionButton>
          <ActionButton danger onClick={handleDelete}>
            <Unlink size={14} />
            Remove
          </ActionButton>
        </ActionBar>
      </PopoverPanel>
    </Popover>
  );
}
