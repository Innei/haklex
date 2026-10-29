import { chromeWidth } from '@haklex/rich-style-token/styles';
import type { CSSProperties, FC, ReactNode } from 'react';

export type DialogWidth = number | keyof typeof chromeWidth;

export interface DialogStackItemProps {
  className?: string;
  clickOutsideToDismiss?: boolean;
  /** Asked before a user-initiated close (Esc, backdrop, close button, sheet drag); resolve false to keep the dialog open. Programmatic `dismiss` skips it. */
  confirmDismiss?: () => boolean | Promise<boolean>;
  content: FC<{ dismiss: () => void; requestDismiss: () => Promise<void> }>;
  description?: ReactNode;
  /** Fired once when the dialog transitions open -> closed (Esc, backdrop, or programmatic dismiss). */
  onClose?: () => void;
  portalClassName?: string;
  sheet?: boolean | 'auto';
  showCloseButton?: boolean;
  theme?: 'light' | 'dark';
  title?: ReactNode;
  width?: DialogWidth;
}

export interface DialogStackItem extends DialogStackItemProps {
  id: string;
  open: boolean;
}

let stack: DialogStackItem[] = [];
let idCounter = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getSnapshot(): DialogStackItem[] {
  return stack;
}

export function presentDialog(props: DialogStackItemProps): () => void {
  const id = `dialog-${++idCounter}`;
  stack = [...stack, { ...props, id, open: true }];
  emit();
  return () => dismissDialog(id);
}

export function removeDialog(id: string) {
  stack = stack.filter((item) => item.id !== id);
  emit();
}

export function dismissDialog(id: string) {
  const target = stack.find((item) => item.id === id);
  if (!target || !target.open) return;
  stack = stack.map((item) => (item.id === id ? { ...item, open: false } : item));
  emit();
  target.onClose?.();
}

export async function requestDismissDialog(id: string) {
  const target = stack.find((item) => item.id === id);
  if (!target || !target.open) return;
  if (target.confirmDismiss && !(await target.confirmDismiss())) return;
  dismissDialog(id);
}

export function dialogWidthStyle(width: DialogWidth | undefined): CSSProperties {
  if (width === undefined) return {};
  const value = typeof width === 'number' ? `${width}px` : chromeWidth[width];
  return { '--rc-dialog-width': value } as CSSProperties;
}

export function dismissTopDialog() {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i].open) {
      dismissDialog(stack[i].id);
      return;
    }
  }
}

export function dismissAllDialogs() {
  const closing = stack.filter((item) => item.open);
  stack = stack.map((item) => ({ ...item, open: false }));
  emit();
  for (const item of closing) item.onClose?.();
}
