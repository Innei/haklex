import type { CSSProperties } from 'react';

export interface FontFamilyDef {
  label: string;
  /** Suggested style for the dropdown menu entry. */
  style?: CSSProperties;
  value: string;
}

export const FONT_FAMILIES: FontFamilyDef[] = [
  { label: '默认', value: '' },
  {
    label: '宋体',
    value: '"Noto Serif CJK SC", "Source Han Serif SC", SimSun, serif',
  },
  {
    label: '黑体',
    value: '"Noto Sans CJK SC", "Source Han Sans SC", SimHei, sans-serif',
  },
  { label: '楷体', value: 'KaiTi, STKaiti, serif' },
  { label: 'Sans', value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Mono', value: 'ui-monospace, "SF Mono", "Fira Code", monospace' },
];

export function getFontLabel(fontFamily: string): string {
  if (!fontFamily) return '默认';
  const match = FONT_FAMILIES.find((f) => f.value === fontFamily);
  if (match) return match.label;
  for (const def of FONT_FAMILIES) {
    if (def.value && fontFamily.startsWith(def.value.split(',')[0]!)) {
      return def.label;
    }
  }
  return '默认';
}

export type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'bullet' | 'number' | 'check' | 'other';

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  paragraph: 'Text',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  bullet: 'Bulleted List',
  number: 'Numbered List',
  check: 'To-do List',
  other: 'Other',
};
