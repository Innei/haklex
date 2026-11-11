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

export function fontFamilyToCss(id: FontFamilyId | number | undefined): string {
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
