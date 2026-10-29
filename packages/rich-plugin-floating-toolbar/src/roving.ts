import type { KeyboardEvent } from 'react';

function items(toolbar: HTMLElement) {
  return Array.from(toolbar.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
}

export function syncRovingTabIndex(toolbar: HTMLElement, focused: Element | null) {
  const buttons = items(toolbar);
  if (!buttons.includes(focused as HTMLButtonElement)) return;
  for (const button of buttons) {
    button.tabIndex = button === focused ? 0 : -1;
  }
}

export function focusFirstItem(toolbar: HTMLElement | null) {
  if (!toolbar) return false;
  const first = items(toolbar)[0];
  first?.focus();
  return Boolean(first);
}

export function moveToolbarFocus(e: KeyboardEvent<HTMLElement>): boolean {
  const buttons = items(e.currentTarget);
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
  if (index === -1) return false;

  const last = buttons.length - 1;
  const next =
    e.key === 'ArrowRight'
      ? index === last
        ? 0
        : index + 1
      : e.key === 'ArrowLeft'
        ? index === 0
          ? last
          : index - 1
        : e.key === 'Home'
          ? 0
          : e.key === 'End'
            ? last
            : -1;
  if (next === -1) return false;
  e.preventDefault();
  buttons[next]?.focus();
  return true;
}
