import {
  ActionButton,
  Field,
  Kbd,
  PopoverBody,
  TextInput,
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from '@haklex/rich-editor-ui';
import { Copy, ExternalLink, Globe, Pencil, Trash2 } from 'lucide-react';
import type { KeyboardEvent, ReactElement, ReactNode, RefObject } from 'react';
import { useId } from 'react';

import * as styles from './edit.css';
import type { LinkKind } from './LinkKindSwitch';
import { LinkKindSwitch } from './LinkKindSwitch';

export type LinkCardEditMode = 'view' | 'edit';

interface IconActionProps {
  action?: string;
  children: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}

function IconAction({ action, children, danger, disabled, label, onClick }: IconActionProps) {
  return (
    <TooltipRoot>
      <TooltipTrigger
        render={
          <ActionButton
            icon
            aria-label={label}
            danger={danger}
            data-link-action={action}
            disabled={disabled}
            size="md"
            onClick={onClick}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </TooltipRoot>
  );
}

function displayUrl(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '');
}

interface LinkCardViewProps {
  favicon?: string;
  onCopy: () => void;
  onEdit: () => void;
  onKindChange: (kind: LinkKind) => void;
  onOpen: () => void;
  onRemove: () => void;
  title?: string;
  url: string;
}

export function LinkCardView({
  favicon,
  title,
  url,
  onCopy,
  onEdit,
  onKindChange,
  onOpen,
  onRemove,
}: LinkCardViewProps): ReactElement {
  const empty = !url.trim();
  const shownUrl = displayUrl(url);

  return (
    <>
      <div className={`${styles.preview} ${styles.semanticClassNames.editPreview}`}>
        <span aria-hidden className={styles.tile}>
          {favicon ? <img alt="" src={favicon} /> : <Globe />}
        </span>
        <div className={styles.meta}>
          <div className={`${styles.title}${empty ? ` ${styles.muted}` : ''}`}>
            {empty ? 'No link yet' : title?.trim() || shownUrl}
          </div>
          {!empty && (
            <div className={styles.url} title={url}>
              {shownUrl}
            </div>
          )}
        </div>
      </div>
      <div className={`${styles.actions} ${styles.semanticClassNames.editActions}`}>
        {!empty && <LinkKindSwitch value="card" onChange={onKindChange} />}
        <span className={styles.spacer} />
        <IconAction disabled={empty} label="Open link" onClick={onOpen}>
          <ExternalLink />
        </IconAction>
        <IconAction disabled={empty} label="Copy link" onClick={onCopy}>
          <Copy />
        </IconAction>
        <IconAction action="edit" label="Edit link" onClick={onEdit}>
          <Pencil />
        </IconAction>
        <IconAction danger label="Remove card" onClick={onRemove}>
          <Trash2 />
        </IconAction>
      </div>
    </>
  );
}

interface LinkCardFormProps {
  inputRef: RefObject<HTMLInputElement | null>;
  onCancel: () => void;
  onChange: (url: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onSave: () => void;
  url: string;
}

export function LinkCardForm({
  inputRef,
  url,
  onCancel,
  onChange,
  onKeyDown,
  onSave,
}: LinkCardFormProps): ReactElement {
  const id = `${useId()}-url`;

  return (
    <>
      <PopoverBody>
        <Field id={id} label="URL">
          <TextInput
            id={id}
            placeholder="Paste or type a link"
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </Field>
      </PopoverBody>
      <div className={styles.formFooter}>
        <ActionButton size="md" variant="outline" onClick={onCancel}>
          Cancel
        </ActionButton>
        <ActionButton disabled={!url.trim()} size="md" variant="solid" onClick={onSave}>
          Save
          <Kbd className={styles.saveKey} keys="enter" size="sm" tone="inverted" />
        </ActionButton>
      </div>
    </>
  );
}
