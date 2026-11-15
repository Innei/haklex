import type { FontFamilyId } from './types';

export const HAND_FONT_STACK =
  '"LXGW WenKai Screen", "LXGW WenKai", "Excalifont", "Virgil", "Comic Sans MS", "Segoe Print", "Bradley Hand", cursive';

export const SANS_FONT_STACK =
  'Helvetica, "PingFang SC", "Microsoft YaHei", "Segoe UI Emoji", "Segoe UI Symbol", system-ui, sans-serif';

export const MONO_FONT_STACK =
  '"Cascadia Code", "Cascadia", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';

export const WHITEBOARD_FONT_STACK = {
  hand: HAND_FONT_STACK,
  sans: SANS_FONT_STACK,
  mono: MONO_FONT_STACK,
} as const;

const stackOverrides = new Map<number, string>();

export function setFontFamilyStack(id: number, stack: string | null): void {
  if (stack) stackOverrides.set(id, stack);
  else stackOverrides.delete(id);
}

const NOT_HANDWRITTEN = new Set([2, 3, 6, 8, 9]);

export function isHandFontFamily(id: FontFamilyId | number | undefined): boolean {
  return !NOT_HANDWRITTEN.has(id as number);
}

export function fontFamilyToCss(id: FontFamilyId | number | undefined): string {
  const override = id === undefined ? undefined : stackOverrides.get(id);
  if (override) return override;
  switch (id) {
    case 2:
    case 6:
    case 9: {
      return SANS_FONT_STACK;
    }
    case 3:
    case 8: {
      return MONO_FONT_STACK;
    }
    default: {
      return HAND_FONT_STACK;
    }
  }
}
