import type { ColorTarget } from './recent';

export interface ColorPreset {
  name: string;
  value: string;
}

export const DEFAULT_COLOR = 'inherit';

const HUES: [name: string, base: string][] = [
  ['Gray', '#737373'],
  ['Red', '#ef4444'],
  ['Orange', '#f97316'],
  ['Amber', '#f59e0b'],
  ['Green', '#22c55e'],
  ['Teal', '#14b8a6'],
  ['Blue', '#3b82f6'],
  ['Indigo', '#6366f1'],
  ['Purple', '#a855f7'],
  ['Pink', '#ec4899'],
];

// Stored verbatim in the document's inline style, so each value must stay
// byte-identical across releases. Mixing toward the theme's text color darkens
// the hue on light themes and lifts it on dark ones; the fallback covers
// contexts rendered outside a haklex theme root.
const textValue = (base: string) => `color-mix(in oklab, ${base} 75%, var(--rc-text, #171717))`;
const backgroundValue = (base: string) => `color-mix(in oklab, ${base} 18%, transparent)`;

export const TEXT_PRESETS: ColorPreset[] = HUES.map(([name, base]) => ({
  name,
  value: textValue(base),
}));

export const BACKGROUND_PRESETS: ColorPreset[] = HUES.map(([name, base]) => ({
  name,
  value: backgroundValue(base),
}));

export const PRESETS: Record<ColorTarget, ColorPreset[]> = {
  text: TEXT_PRESETS,
  background: BACKGROUND_PRESETS,
};

export function isDefaultColor(value: string | undefined | null): boolean {
  return !value || value === DEFAULT_COLOR || value === 'transparent';
}

export function presetName(target: ColorTarget, value: string): string {
  return PRESETS[target].find((p) => p.value === value)?.name ?? value;
}
