import { describe, expect, it } from 'vitest';

import demoPackage from '../../package.json';
import { chromeCategories, chromeComponents, uiCategories, uiComponents } from './components';

const uiDirs = Object.keys(
  import.meta.glob('../../../packages/rich-editor-ui/src/components/*/index.{ts,tsx}'),
).map((path) => path.split('/').at(-2));

const countIn = <T extends { category: string }>(items: T[], category: string) =>
  items.filter((i) => i.category === category).length;

describe('uiComponents', () => {
  it('lists 20 components: 6 overlays, 6 controls, 8 display', () => {
    expect(uiComponents).toHaveLength(20);
    expect(uiCategories.map((c) => countIn(uiComponents, c.key))).toEqual([6, 6, 8]);
  });

  it('maps every id to a component directory in rich-editor-ui', () => {
    expect(uiDirs.length).toBeGreaterThan(20);
    for (const c of uiComponents) expect(uiDirs, c.id).toContain(c.id);
  });

  it('leaves out the logic-only directories', () => {
    const ids = uiComponents.map((c) => c.id);
    expect(ids).not.toContain('viewport-gate');
    expect(ids).not.toContain('quote-attribution');
  });
});

describe('chromeComponents', () => {
  it('lists 8 parts: 2 bars, 2 menus, 4 in place', () => {
    expect(chromeComponents).toHaveLength(8);
    expect(chromeCategories.map((c) => countIn(chromeComponents, c.key))).toEqual([2, 2, 4]);
  });

  it('names packages the demo depends on', () => {
    for (const c of chromeComponents) {
      expect(demoPackage.dependencies, c.id).toHaveProperty(`@haklex/${c.packageName}`);
    }
  });
});

describe('component entries', () => {
  it('have unique ids, anatomy rows and parts', () => {
    for (const list of [uiComponents, chromeComponents]) {
      const ids = list.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const c of list) {
        expect(c.anatomy.length, c.id).toBeGreaterThan(0);
        expect(c.parts.length, c.id).toBeGreaterThan(0);
        expect(c.description, c.id).not.toBe('');
      }
    }
  });
});
