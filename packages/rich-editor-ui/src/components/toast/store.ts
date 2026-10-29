import type { ReactNode } from 'react';

export type ToastTone = 'neutral' | 'success' | 'error' | 'loading';

export interface ToastOptions {
  action?: { label: string; onClick: () => void };
  /** Milliseconds before auto-dismiss. A loading toast without one stays until updated. */
  duration?: number;
  title: ReactNode;
  tone?: ToastTone;
}

export interface ToastItem extends ToastOptions {
  id: string;
}

const DEFAULT_DURATION = 2400;

let toasts: ToastItem[] = [];
let idCounter = 0;
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
}

function schedule(item: ToastItem) {
  const existing = timers.get(item.id);
  if (existing) clearTimeout(existing);
  timers.delete(item.id);
  if (item.tone === 'loading' && item.duration === undefined) return;
  timers.set(
    item.id,
    setTimeout(() => dismissToast(item.id), item.duration ?? DEFAULT_DURATION),
  );
}

export function subscribeToasts(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getToasts(): ToastItem[] {
  return toasts;
}

export function toast(options: ToastOptions): string {
  const item: ToastItem = { ...options, id: `toast-${++idCounter}` };
  toasts = [...toasts, item];
  schedule(item);
  emit();
  return item.id;
}

export function updateToast(id: string, patch: Partial<ToastOptions>) {
  let updated: ToastItem | undefined;
  toasts = toasts.map((item) => {
    if (item.id !== id) return item;
    updated = { ...item, ...patch };
    return updated;
  });
  if (!updated) return;
  schedule(updated);
  emit();
}

export function dismissToast(id: string) {
  const timer = timers.get(id);
  if (timer) clearTimeout(timer);
  timers.delete(id);
  if (!toasts.some((item) => item.id === id)) return;
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}
