import { presets } from '../fixtures';
import { nodeTypes } from '../fixtures/node-types';
import { chartKinds } from './charts';
import type { ComponentKind } from './components';
import { componentLists } from './components';
import { extensions } from './extensions';

export interface NavLeaf {
  label: string;
  path: string;
}

export interface NavTreeGroup {
  items: NavLeaf[];
  label?: string;
}

export interface NavSection {
  count?: number;
  id: string;
  label: string;
  path: string;
  tree?: NavTreeGroup[];
}

export interface NavGroup {
  label: string;
  sections: NavSection[];
}

export interface SearchEntry {
  keywords: string;
  label: string;
  path: string;
  section: string;
}

const categoryLabels = { inline: 'Inline', block: 'Block', container: 'Container' } as const;

const nodesTree: NavTreeGroup[] = [
  { items: [{ label: 'Overview', path: '/nodes' }] },
  ...(['inline', 'block', 'container'] as const).map((category) => ({
    label: categoryLabels[category],
    items: nodeTypes
      .filter((t) => t.category === category)
      .map((t) => ({ label: t.label, path: `/nodes/${t.type}` })),
  })),
];

function componentTree(kind: ComponentKind): NavTreeGroup[] {
  const { categories, items } = componentLists[kind];
  return [
    { items: [{ label: 'Overview', path: `/${kind}` }] },
    ...categories.map((c) => ({
      label: c.label,
      items: items
        .filter((item) => item.category === c.key)
        .map((item) => ({ label: item.label, path: `/${kind}/${item.id}` })),
    })),
  ];
}

export const navGroups: NavGroup[] = [
  {
    label: 'Playground',
    sections: [
      { id: 'editor', label: 'Editor', path: '/editor' },
      {
        id: 'presets',
        label: 'Presets',
        path: '/presets',
        count: presets.length,
        tree: [
          {
            items: presets.map((p) => ({ label: p.label, path: `/presets?preset=${p.key}` })),
          },
        ],
      },
      { id: 'comments', label: 'Comments', path: '/comments' },
    ],
  },
  {
    label: 'Reference',
    sections: [
      { id: 'nodes', label: 'Nodes', path: '/nodes', count: nodeTypes.length, tree: nodesTree },
      {
        id: 'extensions',
        label: 'Extensions',
        path: '/extensions',
        count: extensions.length,
        tree: [
          {
            items: [
              { label: 'Overview', path: '/extensions' },
              ...extensions.map((e) => ({ label: e.name, path: `/extensions/${e.id}` })),
            ],
          },
        ],
      },
      {
        id: 'charts',
        label: 'Charts',
        path: '/charts',
        tree: [
          {
            items: [
              { label: 'Overview', path: '/charts' },
              ...chartKinds.map((k) => ({ label: k.label, path: `/charts/${k.key}` })),
            ],
          },
        ],
      },
    ],
  },
  {
    label: 'Components',
    sections: [
      { id: 'tokens', label: 'Design tokens', path: '/tokens' },
      {
        id: 'ui',
        label: 'UI',
        path: '/ui',
        count: componentLists.ui.items.length,
        tree: componentTree('ui'),
      },
      {
        id: 'chrome',
        label: 'Editor chrome',
        path: '/chrome',
        count: componentLists.chrome.items.length,
        tree: componentTree('chrome'),
      },
    ],
  },
  {
    label: 'Labs',
    sections: [
      { id: 'ai', label: 'AI Agent', path: '/ai' },
      { id: 'hostile', label: 'Hostile host', path: '/hostile' },
    ],
  },
];

const allSections = navGroups.flatMap((g) => g.sections);

export function activeSection(pathname: string) {
  return allSections.find((s) => pathname === s.path || pathname.startsWith(`${s.path}/`));
}

export function currentLeafPath(pathname: string, search: string) {
  if (pathname !== '/presets') return pathname;
  const key = new URLSearchParams(search).get('preset') ?? presets[0].key;
  return `/presets?preset=${key}`;
}

function leavesOf(section: NavSection) {
  return (section.tree ?? []).flatMap((g) => g.items);
}

export function pagerFor(pathname: string): { next?: NavLeaf; prev?: NavLeaf } {
  const section = activeSection(pathname);
  if (!section) return {};
  const leaves = leavesOf(section);
  const index = leaves.findIndex((l) => l.path === pathname);
  if (index === -1) return {};
  return { prev: leaves[index - 1], next: leaves[index + 1] };
}

const searchEntries: SearchEntry[] = [
  ...allSections.map((s) => ({ label: s.label, path: s.path, section: 'Pages', keywords: '' })),
  ...nodeTypes.map((t) => ({
    label: t.label,
    path: `/nodes/${t.type}`,
    section: 'Nodes',
    keywords: `${t.type} ${t.category}`,
  })),
  ...extensions.map((e) => ({
    label: e.name,
    path: `/extensions/${e.id}`,
    section: 'Extensions',
    keywords: e.packageName,
  })),
  ...chartKinds.map((k) => ({
    label: `${k.label} charts`,
    path: `/charts/${k.key}`,
    section: 'Charts',
    keywords: k.key,
  })),
  ...(['ui', 'chrome'] as const).flatMap((kind) =>
    componentLists[kind].items.map((item) => ({
      label: item.label,
      path: `/${kind}/${item.id}`,
      section: componentLists[kind].title,
      keywords: `${item.id} ${item.packageName}`,
    })),
  ),
  ...presets.map((p) => ({
    label: p.label,
    path: `/presets?preset=${p.key}`,
    section: 'Presets',
    keywords: p.key,
  })),
];

function rank(entry: SearchEntry, q: string) {
  const label = entry.label.toLowerCase();
  if (label.startsWith(q)) return 0;
  if (label.includes(q)) return 1;
  if (entry.keywords.toLowerCase().includes(q)) return 2;
  return -1;
}

export function searchCatalog(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return searchEntries.filter((e) => e.section === 'Pages');
  return searchEntries
    .map((entry, index) => ({ entry, index, score: rank(entry, q) }))
    .filter((r) => r.score >= 0)
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map((r) => r.entry);
}
