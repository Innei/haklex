import { useRendererMode } from '@haklex/rich-editor';
import {
  ActionBar,
  ActionButton,
  Popover,
  PopoverPanel,
  PopoverTrigger,
} from '@haklex/rich-editor-ui';
import { vars } from '@haklex/rich-style-token';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNearestNodeFromDOMNode } from 'lexical';
import { AtSign, ExternalLink, Trash2, User } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { MentionRendererProps } from './MentionRenderer';
import { MentionRenderer, platformKeys, platformMetaMap } from './MentionRenderer';
import * as styles from './styles.css';

const LEADING_AT_RE = /^@+/;

export function MentionEditRenderer(props: MentionRendererProps) {
  const mode = useRendererMode();

  if (mode !== 'editor') {
    return <MentionRenderer {...props} />;
  }

  return <MentionEditRendererInner {...props} />;
}

function MentionEditRendererInner({ platform, handle, displayName }: MentionRendererProps) {
  const [editor] = useLexicalComposerContext();
  const editable = editor.isEditable();
  const wrapperRef = useRef<HTMLSpanElement>(null);

  const [open, setOpen] = useState(false);
  const [editPlatform, setEditPlatform] = useState(platform);
  const [editHandle, setEditHandle] = useState(handle);
  const [editDisplayName, setEditDisplayName] = useState(displayName || '');

  useEffect(() => {
    setEditPlatform(platform);
    setEditHandle(handle);
    setEditDisplayName(displayName || '');
  }, [platform, handle, displayName]);

  const commitChanges = useCallback(() => {
    const trimmedHandle = editHandle.trim();
    if (!trimmedHandle) return;
    if (!wrapperRef.current) return;

    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(wrapperRef.current!);
      if (!node) return;
      const writable = node.getWritable() as unknown as Record<string, unknown>;
      writable.__platform = editPlatform;
      writable.__handle = trimmedHandle;
      writable.__displayName = editDisplayName.trim() || undefined;
    });
    setOpen(false);
  }, [editor, editPlatform, editHandle, editDisplayName]);

  const handleDelete = useCallback(() => {
    if (!wrapperRef.current) return;

    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(wrapperRef.current!);
      if (node) node.remove();
    });
    setOpen(false);
  }, [editor]);

  const handleOpen = useCallback(() => {
    const normalizedHandle = handle.replace(LEADING_AT_RE, '');
    const meta = platformMetaMap[platform];
    if (meta) {
      window.open(meta.getUrl(normalizedHandle), '_blank', 'noopener,noreferrer');
    }
  }, [platform, handle]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitChanges();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setEditPlatform(platform);
        setEditHandle(handle);
        setEditDisplayName(displayName || '');
        setOpen(false);
      }
    },
    [commitChanges, platform, handle, displayName],
  );

  if (!editable) {
    return <MentionRenderer displayName={displayName} handle={handle} platform={platform} />;
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setEditPlatform(platform);
          setEditHandle(handle);
          setEditDisplayName(displayName || '');
        }
      }}
    >
      <PopoverTrigger
        nativeButton={false}
        render={
          <span
            className={`${styles.editTrigger} ${styles.semanticClassNames.editTrigger}`}
            ref={wrapperRef}
          />
        }
      >
        <MentionRenderer displayName={displayName} handle={handle} platform={platform} />
      </PopoverTrigger>
      <PopoverPanel
        className={`${styles.editPanel} ${styles.semanticClassNames.editPanel}`}
        side="bottom"
        sideOffset={8}
      >
        <div className={`${styles.editField} ${styles.semanticClassNames.editField}`}>
          <span
            aria-hidden
            className={`${styles.editFieldIcon} ${styles.semanticClassNames.editFieldIcon}`}
            style={{ fontSize: vars.typography.fontSizeMd }}
          >
            {platformMetaMap[editPlatform]?.icon ?? <AtSign size={14} />}
          </span>
          <select
            className={`${styles.editSelect} ${styles.semanticClassNames.editSelect}`}
            value={editPlatform}
            onChange={(e) => setEditPlatform(e.target.value)}
          >
            {platformKeys.map((key) => (
              <option key={key} value={key}>
                {platformMetaMap[key]!.label}
              </option>
            ))}
          </select>
        </div>
        <div className={`${styles.editField} ${styles.semanticClassNames.editField}`}>
          <AtSign
            className={`${styles.editFieldIcon} ${styles.semanticClassNames.editFieldIcon}`}
            size={14}
          />
          <input
            className={`${styles.editInput} ${styles.semanticClassNames.editInput}`}
            placeholder="handle"
            type="text"
            value={editHandle}
            onChange={(e) => setEditHandle(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className={`${styles.editField} ${styles.semanticClassNames.editField}`}>
          <User
            className={`${styles.editFieldIcon} ${styles.semanticClassNames.editFieldIcon}`}
            size={14}
          />
          <input
            className={`${styles.editInput} ${styles.semanticClassNames.editInput}`}
            placeholder="Display name (optional)"
            type="text"
            value={editDisplayName}
            onBlur={commitChanges}
            onChange={(e) => setEditDisplayName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <ActionBar>
          <ActionButton onClick={handleOpen}>
            <ExternalLink size={14} />
            Open
          </ActionButton>
          <ActionButton danger onClick={handleDelete}>
            <Trash2 size={14} />
            Remove
          </ActionButton>
        </ActionBar>
      </PopoverPanel>
    </Popover>
  );
}
