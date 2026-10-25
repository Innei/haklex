import { describe, expect, it } from 'vitest';

import { nodeSamples, presets } from '../fixtures';
import { nodeTypes } from '../fixtures/node-types';
import { activeSection, currentLeafPath, navGroups, pagerFor, searchCatalog } from './catalog';

function section(id: string) {
  const found = navGroups.flatMap((g) => g.sections).find((s) => s.id === id);
  if (!found) throw new Error(`missing section ${id}`);
  return found;
}

function leafPaths(id: string) {
  return (section(id).tree ?? []).flatMap((g) => g.items.map((i) => i.path));
}

describe('nodeTypes', () => {
  it('groups the samples into 23 types: 6 inline, 12 block, 5 container', () => {
    expect(nodeTypes).toHaveLength(23);
    const count = (c: string) => nodeTypes.filter((t) => t.category === c).length;
    expect([count('inline'), count('block'), count('container')]).toEqual([6, 12, 5]);
  });

  it('assigns every node sample to exactly one type', () => {
    const assigned = nodeTypes.flatMap((t) => t.sampleKeys);
    expect([...assigned].sort()).toEqual(nodeSamples.map((s) => s.key).sort());
  });
});

describe('navGroups', () => {
  it('orders sections as Playground, Reference, Components, Labs', () => {
    expect(navGroups.map((g) => [g.label, g.sections.map((s) => s.label)])).toEqual([
      ['Playground', ['Editor', 'Presets', 'Comments']],
      ['Reference', ['Nodes', 'Extensions', 'Charts']],
      ['Components', ['Design tokens', 'UI', 'Editor chrome']],
      ['Labs', ['AI Agent', 'Hostile host']],
    ]);
  });

  it('builds the nodes tree: overview, then one leaf per type grouped by category', () => {
    const tree = section('nodes').tree!;
    expect(tree.map((g) => g.label)).toEqual([undefined, 'Inline', 'Block', 'Container']);
    expect(tree[0].items).toEqual([{ label: 'Overview', path: '/nodes' }]);
    expect(leafPaths('nodes')).toContain('/nodes/alert-quote');
    expect(leafPaths('nodes')).toHaveLength(24);
    expect(section('nodes').count).toBe(23);
  });

  it('builds extension and chart trees with an overview first', () => {
    expect(leafPaths('extensions')[0]).toBe('/extensions');
    expect(leafPaths('extensions')).toHaveLength(11);
    expect(leafPaths('extensions')).toContain('/extensions/excalidraw');
    expect(leafPaths('charts')).toEqual([
      '/charts',
      '/charts/bar',
      '/charts/line',
      '/charts/area',
      '/charts/pie',
      '/charts/state',
    ]);
  });

  it('builds the UI tree: overview, then components grouped by category', () => {
    const tree = section('ui').tree!;
    expect(tree.map((g) => g.label)).toEqual([undefined, 'Overlays', 'Controls', 'Display']);
    expect(tree[0].items).toEqual([{ label: 'Overview', path: '/ui' }]);
    expect(leafPaths('ui')).toHaveLength(20);
    expect(leafPaths('ui')).toContain('/ui/dropdown-menu');
    expect(section('ui').count).toBe(19);
  });

  it('builds the editor chrome tree grouped as bars, menus, in place', () => {
    const tree = section('chrome').tree!;
    expect(tree.map((g) => g.label)).toEqual([undefined, 'Bars', 'Menus', 'In place']);
    expect(leafPaths('chrome')).toHaveLength(9);
    expect(leafPaths('chrome')).toContain('/chrome/slash-menu');
    expect(section('chrome').count).toBe(8);
  });

  it('gives design tokens a single page with no tree', () => {
    expect(section('tokens').path).toBe('/tokens');
    expect(section('tokens').tree).toBeUndefined();
  });

  it('lists every preset under Presets as a query-string leaf', () => {
    expect(leafPaths('presets')).toEqual(presets.map((p) => `/presets?preset=${p.key}`));
    expect(section('presets').count).toBe(presets.length);
  });
});

describe('activeSection', () => {
  it('matches a section by path prefix', () => {
    expect(activeSection('/nodes/alert-quote')?.id).toBe('nodes');
    expect(activeSection('/presets')?.id).toBe('presets');
    expect(activeSection('/nodesx')).toBeUndefined();
  });
});

describe('currentLeafPath', () => {
  it('returns the pathname for path-based leaves', () => {
    expect(currentLeafPath('/nodes/alert-quote', '')).toBe('/nodes/alert-quote');
  });

  it('keeps only the preset query and ignores other params', () => {
    expect(currentLeafPath('/presets', '?mode=edit&preset=note-diary')).toBe(
      '/presets?preset=note-diary',
    );
  });

  it('falls back to the first preset when none is selected', () => {
    expect(currentLeafPath('/presets', '')).toBe(`/presets?preset=${presets[0].key}`);
  });
});

describe('pagerFor', () => {
  it('steps through leaves across category groups', () => {
    const { prev, next } = pagerFor('/nodes/alert-quote');
    expect(prev?.path).toBe('/nodes/chat');
    expect(next?.path).toBe('/nodes/banner');
  });

  it('has no previous page on the overview', () => {
    const { prev, next } = pagerFor('/nodes');
    expect(prev).toBeUndefined();
    expect(next?.path).toBe('/nodes/spoiler');
  });
});

describe('searchCatalog', () => {
  it('returns top-level sections for an empty query', () => {
    expect(searchCatalog('').map((e) => e.path)).toEqual([
      '/editor',
      '/presets',
      '/comments',
      '/nodes',
      '/extensions',
      '/charts',
      '/tokens',
      '/ui',
      '/chrome',
      '/ai',
      '/hostile',
    ]);
  });

  it('matches case-insensitively and ranks label prefix matches first', () => {
    const results = searchCatalog('MERMAID');
    expect(
      results
        .map((e) => e.path)
        .slice(0, 2)
        .sort(),
    ).toEqual(['/extensions/mermaid', '/nodes/mermaid']);
  });

  it('matches node types by their serialized type name', () => {
    expect(searchCatalog('alert-quote')[0].path).toBe('/nodes/alert-quote');
  });

  it('finds UI components, chrome parts and the tokens page', () => {
    expect(searchCatalog('dropdown')[0].path).toBe('/ui/dropdown-menu');
    expect(searchCatalog('slash')[0].path).toBe('/chrome/slash-menu');
    expect(searchCatalog('design tok')[0].path).toBe('/tokens');
  });

  it('matches UI components by their export directory', () => {
    expect(searchCatalog('auto-resize')[0].path).toBe('/ui/auto-resize-textarea');
  });

  it('returns nothing for a query that matches no entry', () => {
    expect(searchCatalog('zzzz-no-match')).toEqual([]);
  });
});
