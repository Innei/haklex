import { chromeData } from './component-data/chrome';
import { uiData } from './component-data/ui';

export type UiCategory = 'overlays' | 'controls' | 'display';
export type ChromeCategory = 'bars' | 'menus' | 'in-place';
export type ComponentKind = 'ui' | 'chrome';

export interface AnatomyRow {
  part: string;
  spec: string;
  token: string;
}

export interface PartRow {
  name: string;
  props: string;
}

export interface ComponentMeta<C extends string = string> {
  anatomy: AnatomyRow[];
  category: C;
  description: string;
  id: string;
  label: string;
  packageName: string;
  parts: PartRow[];
}

export const uiCategories: { key: UiCategory; label: string }[] = [
  { key: 'overlays', label: 'Overlays' },
  { key: 'controls', label: 'Controls' },
  { key: 'display', label: 'Display' },
];

export const chromeCategories: { key: ChromeCategory; label: string }[] = [
  { key: 'bars', label: 'Bars' },
  { key: 'menus', label: 'Menus' },
  { key: 'in-place', label: 'In place' },
];

export const uiComponents: ComponentMeta<UiCategory>[] = uiData;
export const chromeComponents: ComponentMeta<ChromeCategory>[] = chromeData;

export const componentLists = {
  ui: { items: uiComponents, categories: uiCategories, title: 'UI' },
  chrome: { items: chromeComponents, categories: chromeCategories, title: 'Editor chrome' },
} as const;

export function reviewKey(kind: ComponentKind, id: string) {
  return `${kind}/${id}`;
}

export function categoryLabel(kind: ComponentKind, key: string) {
  const categories: { key: string; label: string }[] = componentLists[kind].categories;
  return categories.find((c) => c.key === key)?.label ?? key;
}
