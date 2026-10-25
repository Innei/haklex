import { articleLayout, darkColors, lightArticleColors } from '@haklex/rich-style-token';

export type ColorKey = keyof typeof lightArticleColors;
export type FrameTheme = 'light' | 'dark';

export interface ColorRow {
  dark: string;
  key: ColorKey;
  light: string;
  use: string;
}

export interface ColorGroup {
  rows: ColorRow[];
  title: string;
}

const kebab = (key: string) => key.replaceAll(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

export function cssVarName(key: string) {
  return `--rc-${kebab(key)}`;
}

const row = (key: ColorKey, use: string): ColorRow => ({
  key,
  use,
  light: lightArticleColors[key],
  dark: darkColors[key],
});

export const colorGroups: ColorGroup[] = [
  {
    title: 'Text',
    rows: [
      row('text', 'Body, headings'),
      row('textSecondary', 'Quotes, nav labels'),
      row('textTertiary', 'Meta, captions, group labels'),
      row('textQuaternary', 'Icons and placeholders only'),
    ],
  },
  {
    title: 'Surface',
    rows: [
      row('bg', 'Canvas, popovers'),
      row('bgSecondary', 'Code blocks, table heads'),
      row('bgTertiary', 'Inline code, quote ground'),
    ],
  },
  {
    title: 'Fill (translucent)',
    rows: [
      row('fill', 'Selected, active'),
      row('fillSecondary', 'Hover'),
      row('fillTertiary', 'Subtle hover'),
      row('fillQuaternary', 'Faintest wash'),
    ],
  },
  {
    title: 'Line',
    rows: [
      row('border', 'Structure lines, frames'),
      row('borderSubtle', 'Rows, code headers'),
      row('ring', 'Popover outline'),
    ],
  },
  {
    title: 'Accent',
    rows: [
      row('accent', 'Focus ring, caret'),
      row('accentLight', 'Selection, focus halo'),
      row('link', 'Links in prose'),
    ],
  },
  {
    title: 'Semantic',
    rows: [
      row('alertInfo', 'Note; info status'),
      row('alertTip', 'Tip; success status'),
      row('alertImportant', 'Important'),
      row('alertWarning', 'Warning'),
      row('alertCaution', 'Caution; error status'),
    ],
  },
];

const palettes = { light: lightArticleColors, dark: darkColors };

export function hostVarsFor(theme: FrameTheme): Record<string, string> {
  return Object.fromEntries(
    Object.entries(palettes[theme]).map(([key, value]) => [
      cssVarName(key).replace(/^--rc-/, '--rc-host-'),
      value,
    ]),
  );
}

export function frameVarsFor(theme: FrameTheme): Record<string, string> {
  const host = hostVarsFor(theme);
  if (theme === 'dark') return host;
  const shadows = Object.entries(articleLayout.boxShadow).map(([key, value]) => [
    `--rc-shadow-${kebab(key)}`,
    value,
  ]);
  return { ...host, ...Object.fromEntries(shadows) };
}

export function concentricRadius(layout: typeof articleLayout) {
  const outer = Number.parseFloat(layout.borderRadius.lg);
  const padding = Number.parseFloat(layout.spacing.xs);
  return { outer, padding, inner: outer - padding };
}
