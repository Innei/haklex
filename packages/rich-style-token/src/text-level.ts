import { vars } from './vars.css';

/**
 * Neutral text emphasis as a single scale: level 1 is the faintest, level 4 the
 * strongest. Components color text by level instead of reaching for
 * `textSecondary` / `textTertiary` by hand, so a nested element can derive its
 * own tone from its owner's level.
 *
 * Only neutrals have an authored ladder. A colored label (accent, caution, a
 * consumer's own hue) has no such scale — and it should not need one: derive
 * its quieter step from the color itself with {@link toneDown}.
 */
export const textLevel = {
  1: vars.color.textQuaternary,
  2: vars.color.textTertiary,
  3: vars.color.textSecondary,
  4: vars.color.text,
} as const;

export type TextLevel = keyof typeof textLevel;

/**
 * The color an icon takes when it sits next to a label at `level`: one step
 * quieter, clamped at 1. Icons never carry the label's own level.
 */
export function iconTone(level: TextLevel): string {
  return textLevel[Math.max(level - 1, 1) as TextLevel];
}

/**
 * One quieter step for a label color that has no ladder: `accent`, `alertTone`,
 * or anything a consumer passes at runtime.
 *
 * Implemented as an alpha step of the *same* color rather than a second token,
 * so it holds for every hue, in both schemes, on any surface — and it keeps
 * tracking the label if that color is overridden. `color-mix` interpolates in
 * premultiplied sRGB, so mixing with `transparent` yields the exact color at
 * the given alpha instead of a washed-out blend.
 *
 * Solid fills (an inverted label on an accent ground) keep the icon at the
 * label's own color: a translucent glyph would let the fill through and read
 * as a third color rather than a quieter step.
 */
export function toneDown(color: string, strength = 86): string {
  return `color-mix(in srgb, ${color} ${strength}%, transparent)`;
}
