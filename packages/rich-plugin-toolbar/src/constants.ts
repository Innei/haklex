import { getCommandMeta, TURN_INTO_COMMAND_IDS } from '@haklex/rich-editor/command-registry';
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

export type BlockType =
  'paragraph' | 'h1' | 'h2' | 'h3' | 'bullet' | 'number' | 'check' | 'quote' | 'code' | 'other';

export const TURN_INTO_BLOCK_TYPES = TURN_INTO_COMMAND_IDS as readonly Exclude<
  BlockType,
  'other'
>[];

export const BLOCK_TYPE_LABELS = Object.fromEntries([
  ...TURN_INTO_BLOCK_TYPES.map((type) => [type, getCommandMeta(type)!.title]),
  ['other', 'Other'],
]) as Record<BlockType, string>;
