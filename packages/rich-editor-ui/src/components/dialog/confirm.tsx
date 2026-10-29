import type { ReactNode } from 'react';

import { ActionButton } from '../action-button';
import { presentDialog } from './store';
import * as css from './styles.css';

type ConfirmDiscardOptions = {
  cancelLabel?: string;
  confirmLabel?: string;
  description?: ReactNode;
  title?: ReactNode;
};

export function confirmDiscardChanges({
  cancelLabel = 'Keep editing',
  confirmLabel = 'Discard',
  description = 'Your edits haven’t been saved.',
  title = 'Discard changes?',
}: ConfirmDiscardOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (value: boolean) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    presentDialog({
      title,
      description,
      showCloseButton: false,
      width: 360,
      onClose: () => settle(false),
      content: ({ dismiss }) => (
        <div className={css.footer}>
          <ActionButton
            size="md"
            variant="outline"
            onClick={() => {
              settle(false);
              dismiss();
            }}
          >
            {cancelLabel}
          </ActionButton>
          <ActionButton
            autoFocus
            danger
            size="md"
            variant="solid"
            onClick={() => {
              settle(true);
              dismiss();
            }}
          >
            {confirmLabel}
          </ActionButton>
        </div>
      ),
    });
  });
}

export type { ConfirmDiscardOptions };
