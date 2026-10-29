import { X } from 'lucide-react';
import type { KeyboardEvent, ReactNode } from 'react';

import { ActionButton } from '../action-button';
import { Kbd } from '../kbd';
import * as css from './styles.css';

type ModalShellProps = {
  children?: ReactNode;
  className?: string;
  /** ⌘S and ⌘↵ anywhere inside the shell call this, except keys an inner editor already handled (`defaultPrevented`). */
  onSave?: () => void;
};

export function ModalShell({ children, className, onSave }: ModalShellProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onSave || event.defaultPrevented || !(event.metaKey || event.ctrlKey)) return;
    if (event.key === 's' || event.key === 'Enter') {
      event.preventDefault();
      onSave();
    }
  };

  return (
    <div className={`${css.shell}${className ? ` ${className}` : ''}`} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
}

type ModalShellHeaderProps = {
  actions?: ReactNode;
  center?: ReactNode;
  closeLabel?: string;
  icon?: ReactNode;
  onClose?: () => void;
  title: ReactNode;
};

export function ModalShellHeader({
  actions,
  center,
  closeLabel = 'Close',
  icon,
  onClose,
  title,
}: ModalShellHeaderProps) {
  return (
    <div className={css.header}>
      <div className={css.headerLead}>
        {icon && <span className={css.headerIcon}>{icon}</span>}
        <span className={css.headerTitle}>{title}</span>
      </div>
      <div className={css.headerCenter}>{center}</div>
      <div className={css.headerActions}>
        {actions}
        {onClose && (
          <>
            {actions && <span className={css.divider} />}
            <ActionButton
              icon
              aria-label={closeLabel}
              size="md"
              title={closeLabel}
              onClick={onClose}
            >
              <X />
            </ActionButton>
          </>
        )}
      </div>
    </div>
  );
}

type ModalShellBodyProps = {
  children?: ReactNode;
  className?: string;
};

export function ModalShellBody({ children, className }: ModalShellBodyProps) {
  return <div className={`${css.body}${className ? ` ${className}` : ''}`}>{children}</div>;
}

type ModalShellFooterProps = {
  cancelLabel?: string;
  children?: ReactNode;
  dirty?: boolean;
  onCancel?: () => void;
  onSave?: () => void;
  saveDisabled?: boolean;
  saveLabel?: string;
  status?: ReactNode;
};

export function ModalShellFooter({
  cancelLabel = 'Cancel',
  children,
  dirty,
  onCancel,
  onSave,
  saveDisabled,
  saveLabel = 'Save',
  status,
}: ModalShellFooterProps) {
  return (
    <div className={css.footer}>
      <div className={css.footerStatus}>
        {dirty && <span aria-hidden className={css.dirtyDot} />}
        {status}
      </div>
      {children}
      {onCancel && (
        <ActionButton size="md" variant="outline" onClick={onCancel}>
          {cancelLabel}
        </ActionButton>
      )}
      {onSave && (
        <ActionButton disabled={saveDisabled} size="md" variant="solid" onClick={onSave}>
          {saveLabel}
          <Kbd keys={['mod', 's']} size="sm" tone="inverted" />
        </ActionButton>
      )}
    </div>
  );
}

export type { ModalShellBodyProps, ModalShellFooterProps, ModalShellHeaderProps, ModalShellProps };
