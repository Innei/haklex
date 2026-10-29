import { useRendererMode } from '@haklex/rich-editor/static';
import {
  ActionBar,
  ActionButton,
  Field,
  Popover,
  PopoverPanel,
  PopoverTrigger,
  SegmentedControl,
  TextInput,
} from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNearestNodeFromDOMNode, REDO_COMMAND, UNDO_COMMAND } from 'lexical';
import { AtSign, ExternalLink, Trash2 } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import { getEditorHistoryShortcut } from './history-shortcuts';
import type { MentionRendererProps } from './MentionRenderer';
import {
  MentionRenderer,
  platformKeys,
  platformMetaMap,
  useExtraPlatforms,
} from './MentionRenderer';
import * as styles from './styles.css';

const LEADING_AT_RE = /^@+/;

interface MentionDraft {
  displayName: string;
  handle: string;
  platform: string;
}

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
  const extraPlatforms = useExtraPlatforms();
  const id = useId();

  const current = useMemo<MentionDraft>(
    () => ({ platform, handle, displayName: displayName || '' }),
    [platform, handle, displayName],
  );
  const [open, setOpen] = useState(false);
  const [draft, setDraftState] = useState<MentionDraft>(current);
  const draftRef = useRef(draft);
  const snapshotRef = useRef<MentionDraft>(current);

  const setDraft = useCallback((next: MentionDraft) => {
    draftRef.current = next;
    setDraftState(next);
  }, []);

  useEffect(() => {
    const prev = draftRef.current;
    const inSync =
      prev.platform === current.platform &&
      prev.handle.trim() === current.handle &&
      prev.displayName.trim() === current.displayName;
    if (!inSync) setDraft(current);
  }, [current, setDraft]);

  const platformItems = useMemo(() => {
    const keys = [...platformKeys, ...Object.keys(extraPlatforms)];
    if (!keys.includes(draft.platform)) keys.push(draft.platform);
    return [...new Set(keys)].map((key) => ({
      value: key,
      label: platformMetaMap[key]?.label ?? extraPlatforms[key]?.label ?? key,
    }));
  }, [draft.platform, extraPlatforms]);

  const writeNode = useCallback(
    (next: MentionDraft) => {
      const trimmedHandle = next.handle.trim();
      if (!trimmedHandle || !wrapperRef.current) return;
      const dom = wrapperRef.current;
      editor.update(() => {
        const node = $getNearestNodeFromDOMNode(dom);
        if (!node) return;
        const writable = node.getWritable() as unknown as Record<string, unknown>;
        writable.__platform = next.platform;
        writable.__handle = trimmedHandle;
        writable.__displayName = next.displayName.trim() || undefined;
      });
    },
    [editor],
  );

  const applyDraft = useCallback(
    (patch: Partial<MentionDraft>) => {
      const next = { ...draftRef.current, ...patch };
      setDraft(next);
      writeNode(next);
    },
    [setDraft, writeNode],
  );

  const revert = useCallback(() => {
    const snapshot = snapshotRef.current;
    setDraft(snapshot);
    writeNode(snapshot);
    setOpen(false);
  }, [setDraft, writeNode]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean, details?: { reason?: string }) => {
      if (nextOpen) {
        snapshotRef.current = current;
        setDraft(current);
        setOpen(true);
        return;
      }
      if (details?.reason === 'escape-key') {
        revert();
        return;
      }
      setOpen(false);
    },
    [current, revert, setDraft],
  );

  const handleDelete = useCallback(() => {
    if (!wrapperRef.current) return;
    const dom = wrapperRef.current;
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(dom);
      if (node) node.remove();
    });
    setOpen(false);
  }, [editor]);

  const handleOpen = useCallback(() => {
    const normalizedHandle = draft.handle.trim().replace(LEADING_AT_RE, '');
    const meta = platformMetaMap[draft.platform] ?? extraPlatforms[draft.platform];
    if (meta && normalizedHandle) {
      window.open(meta.getUrl(normalizedHandle), '_blank', 'noopener,noreferrer');
    }
  }, [draft.handle, draft.platform, extraPlatforms]);

  const handleInputKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setOpen(false);
    }
  }, []);

  const handlePanelKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        revert();
        return;
      }
      const shortcut = getEditorHistoryShortcut(e, {
        isDirty:
          draft.handle.trim() !== current.handle ||
          draft.displayName.trim() !== current.displayName,
      });
      if (!shortcut) return;

      e.preventDefault();
      e.stopPropagation();
      editor.dispatchCommand(shortcut === 'undo' ? UNDO_COMMAND : REDO_COMMAND, undefined);
    },
    [current, draft, editor, revert],
  );

  if (!editable) {
    return <MentionRenderer displayName={displayName} handle={handle} platform={platform} />;
  }

  const handleId = `${id}-handle`;
  const nameId = `${id}-name`;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
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
        size="sm"
        onKeyDown={handlePanelKeyDown}
      >
        <SegmentedControl
          fullWidth
          items={platformItems}
          value={draft.platform}
          onChange={(next) => applyDraft({ platform: next })}
        />
        <Field id={handleId} label="Handle">
          <div className={styles.handleControl}>
            <AtSign aria-hidden className={styles.handleIcon} />
            <TextInput
              className={styles.handleInput}
              id={handleId}
              placeholder="username"
              value={draft.handle}
              onChange={(e) => applyDraft({ handle: e.target.value })}
              onKeyDown={handleInputKeyDown}
            />
          </div>
        </Field>
        <Field hint="Optional" id={nameId} label="Display name">
          <TextInput
            id={nameId}
            value={draft.displayName}
            onChange={(e) => applyDraft({ displayName: e.target.value })}
            onKeyDown={handleInputKeyDown}
          />
        </Field>
        <ActionBar>
          <ActionButton disabled={!draft.handle.trim()} onClick={handleOpen}>
            <ExternalLink />
            Open
          </ActionButton>
          <ActionButton danger onClick={handleDelete}>
            <Trash2 />
            Remove
          </ActionButton>
        </ActionBar>
      </PopoverPanel>
    </Popover>
  );
}
