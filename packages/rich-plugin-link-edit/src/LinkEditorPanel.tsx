import { ActionButton, Field, Kbd, PopoverBody, TextInput } from '@haklex/rich-editor-ui';
import { Copy, ExternalLink, Globe, Pencil, Unlink } from 'lucide-react';
import type { KeyboardEvent, ReactElement, ReactNode, RefObject } from 'react';
import { useId } from 'react';

import { displayUrl, isEmptyLink } from './link-display';
import { LinkIconButton } from './LinkIconButton';
import * as styles from './styles.css';

export type LinkEditorMode = 'view' | 'edit';

export interface LinkDraft {
  text: string;
  url: string;
}

interface LinkEditorPanelProps {
  draft: LinkDraft;
  extraActions?: ReactNode;
  mode: LinkEditorMode;
  onCancel: () => void;
  onCopy: () => void;
  onDraftChange: (draft: LinkDraft) => void;
  onEdit: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onOpen: () => void;
  onSave: () => void;
  onUnlink: () => void;
  text: string;
  url: string;
  urlInputRef: RefObject<HTMLInputElement | null>;
}

export function LinkEditorPanel(props: LinkEditorPanelProps): ReactElement {
  return props.mode === 'edit' ? <LinkEditorForm {...props} /> : <LinkEditorView {...props} />;
}

function LinkEditorView({
  extraActions,
  text,
  url,
  onCopy,
  onEdit,
  onOpen,
  onUnlink,
}: LinkEditorPanelProps): ReactElement {
  const empty = isEmptyLink(url);
  const shownUrl = displayUrl(url);

  return (
    <>
      <div className={`${styles.preview} ${styles.semanticClassNames.preview}`}>
        <span aria-hidden className={styles.tile}>
          <Globe />
        </span>
        <div className={styles.meta}>
          <div className={`${styles.title}${empty ? ` ${styles.muted}` : ''}`}>
            {empty ? 'No link yet' : text.trim() || shownUrl}
          </div>
          {!empty && (
            <div className={styles.url} title={url}>
              {shownUrl}
            </div>
          )}
        </div>
      </div>
      <div className={`${styles.actions} ${styles.semanticClassNames.actions}`}>
        {extraActions}
        <span className={styles.spacer} />
        <LinkIconButton disabled={empty} label="Open link" onClick={onOpen}>
          <ExternalLink />
        </LinkIconButton>
        <LinkIconButton disabled={empty} label="Copy link" onClick={onCopy}>
          <Copy />
        </LinkIconButton>
        <LinkIconButton action="edit" label="Edit link" onClick={onEdit}>
          <Pencil />
        </LinkIconButton>
        <LinkIconButton danger label="Remove link" onClick={onUnlink}>
          <Unlink />
        </LinkIconButton>
      </div>
    </>
  );
}

function LinkEditorForm({
  draft,
  urlInputRef,
  onCancel,
  onDraftChange,
  onKeyDown,
  onSave,
}: LinkEditorPanelProps): ReactElement {
  const id = useId();
  const textId = `${id}-text`;
  const urlId = `${id}-url`;

  return (
    <>
      <PopoverBody>
        <Field id={textId} label="Text">
          <TextInput
            id={textId}
            placeholder="Link text"
            value={draft.text}
            onChange={(e) => onDraftChange({ ...draft, text: e.target.value })}
            onKeyDown={onKeyDown}
          />
        </Field>
        <Field id={urlId} label="URL">
          <TextInput
            id={urlId}
            placeholder="Paste or type a link"
            ref={urlInputRef}
            type="url"
            value={draft.url}
            onChange={(e) => onDraftChange({ ...draft, url: e.target.value })}
            onKeyDown={onKeyDown}
          />
        </Field>
      </PopoverBody>
      <div className={styles.formFooter}>
        <ActionButton size="md" variant="outline" onClick={onCancel}>
          Cancel
        </ActionButton>
        <ActionButton disabled={isEmptyLink(draft.url)} size="md" variant="solid" onClick={onSave}>
          Save
          <Kbd className={styles.saveKey} keys="enter" size="sm" tone="inverted" />
        </ActionButton>
      </div>
    </>
  );
}
