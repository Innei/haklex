import { ActionButton, Kbd } from '@haklex/rich-editor-ui';
import { Check, Copy, ExternalLink, Link, Pencil, Unlink } from 'lucide-react';
import type { KeyboardEvent, ReactElement, ReactNode, RefObject } from 'react';

import { isEmptyLink, middleTruncate } from './link-display';
import { LinkIconButton } from './LinkIconButton';
import * as styles from './styles.css';

const URL_DISPLAY_CHARS = 28;

export type LinkEditorMode = 'view' | 'edit';

interface LinkEditorPanelProps {
  copied: boolean;
  extraActions?: ReactNode;
  inputRef: RefObject<HTMLInputElement | null>;
  inputUrl: string;
  mode: LinkEditorMode;
  onCopy: () => void;
  onEdit: () => void;
  onInputChange: (value: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onOpen: () => void;
  onSave: () => void;
  onUnlink: () => void;
  url: string;
}

export function LinkEditorPanel({
  copied,
  extraActions,
  inputRef,
  inputUrl,
  mode,
  url,
  onCopy,
  onEdit,
  onInputChange,
  onKeyDown,
  onOpen,
  onSave,
  onUnlink,
}: LinkEditorPanelProps): ReactElement {
  if (mode === 'edit') {
    return (
      <div className={styles.editRow}>
        <input
          aria-label="Link URL"
          className={`${styles.input} ${styles.semanticClassNames.input}`}
          placeholder="Paste or type a link"
          ref={inputRef}
          type="url"
          value={inputUrl}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <ActionButton disabled={isEmptyLink(inputUrl)} size="md" variant="solid" onClick={onSave}>
          Save
          <Kbd className={styles.saveKey} keys="enter" size="sm" tone="inverted" />
        </ActionButton>
      </div>
    );
  }

  const empty = isEmptyLink(url);

  return (
    <div className={`${styles.urlRow} ${styles.semanticClassNames.urlRow}`}>
      <Link className={`${styles.linkIcon} ${styles.semanticClassNames.linkIcon}`} size={16} />
      <span className={`${styles.url}${empty ? ` ${styles.urlEmpty}` : ''}`} title={url}>
        {empty ? 'No link yet' : middleTruncate(url, URL_DISPLAY_CHARS)}
      </span>
      <div className={styles.actions}>
        <span className={styles.extraActions}>{extraActions}</span>
        <LinkIconButton label="Open link" onClick={onOpen}>
          <ExternalLink />
        </LinkIconButton>
        <LinkIconButton label="Edit link" onClick={onEdit}>
          <Pencil />
        </LinkIconButton>
        <LinkIconButton label={copied ? 'Copied' : 'Copy link'} onClick={onCopy}>
          {copied ? <Check /> : <Copy />}
        </LinkIconButton>
        <LinkIconButton danger label="Remove link" onClick={onUnlink}>
          <Unlink />
        </LinkIconButton>
      </div>
    </div>
  );
}
