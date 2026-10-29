import type { LucideIcon } from 'lucide-react';
import {
  AppWindow,
  AtSign,
  Boxes,
  ChartColumnBig,
  ChevronRight,
  Code,
  FileCode,
  FileText,
  Flag,
  Footprints,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Images,
  Info,
  LayoutGrid,
  Lightbulb,
  Link,
  List,
  ListChecks,
  ListOrdered,
  MessageSquare,
  MessageSquareCode,
  Minus,
  Paperclip,
  PenTool,
  Sigma,
  Table,
  Tag,
  TextQuote,
  TriangleAlert,
  Type,
  Video,
  Vote,
  Workflow,
} from 'lucide-react';
import { createElement } from 'react';

import type { CommandItemConfig } from '../types/slash-menu';

export type CommandGroupId = 'basic' | 'lists' | 'media' | 'rich' | 'layout' | 'embed' | 'inline';

export interface CommandGroup {
  id: CommandGroupId;
  label: string;
}

export interface CommandMeta {
  aliases?: readonly string[];
  description?: string;
  group: CommandGroupId;
  icon: LucideIcon;
  id: string;
  title: string;
}

export const COMMAND_GROUPS: readonly CommandGroup[] = [
  { id: 'basic', label: 'Basic blocks' },
  { id: 'lists', label: 'Lists' },
  { id: 'media', label: 'Media' },
  { id: 'rich', label: 'Rich blocks' },
  { id: 'layout', label: 'Layout' },
  { id: 'embed', label: 'Embed' },
  { id: 'inline', label: 'Inline' },
];

export const COMMAND_REGISTRY: readonly CommandMeta[] = [
  {
    id: 'paragraph',
    title: 'Text',
    icon: Type,
    group: 'basic',
    description: 'Plain text block',
  },
  {
    id: 'h1',
    title: 'Heading 1',
    icon: Heading1,
    group: 'basic',
    description: 'Large section heading',
  },
  {
    id: 'h2',
    title: 'Heading 2',
    icon: Heading2,
    group: 'basic',
    description: 'Medium section heading',
  },
  {
    id: 'h3',
    title: 'Heading 3',
    icon: Heading3,
    group: 'basic',
    description: 'Small section heading',
  },
  { id: 'quote', title: 'Quote', icon: TextQuote, group: 'basic', description: 'Capture a quote' },
  { id: 'callout', title: 'Callout', icon: Info, group: 'basic' },
  { id: 'tip', title: 'Tip', icon: Lightbulb, group: 'basic' },
  { id: 'warning', title: 'Warning', icon: TriangleAlert, group: 'basic' },
  { id: 'divider', title: 'Divider', icon: Minus, group: 'basic', description: 'Visual separator' },
  {
    id: 'bullet',
    title: 'Bulleted list',
    icon: List,
    group: 'lists',
    aliases: ['bullet list'],
    description: 'Unordered list',
  },
  {
    id: 'number',
    title: 'Numbered list',
    icon: ListOrdered,
    group: 'lists',
    aliases: ['numbered'],
    description: 'Ordered list with numbers',
  },
  {
    id: 'check',
    title: 'To-do list',
    icon: ListChecks,
    group: 'lists',
    aliases: ['to-do', 'todo', 'checklist'],
    description: 'Track tasks with checkboxes',
  },
  { id: 'image', title: 'Image', icon: Image, group: 'media' },
  { id: 'video', title: 'Video', icon: Video, group: 'media' },
  { id: 'file', title: 'File', icon: Paperclip, group: 'media' },
  { id: 'gallery', title: 'Gallery', icon: Images, group: 'media' },
  { id: 'whiteboard', title: 'Whiteboard', icon: PenTool, group: 'media' },
  {
    id: 'code',
    title: 'Code block',
    icon: Code,
    group: 'rich',
    description: 'Syntax-highlighted code',
  },
  { id: 'math', title: 'Math block', icon: Sigma, group: 'rich', aliases: ['math equation'] },
  { id: 'mermaid', title: 'Mermaid diagram', icon: Workflow, group: 'rich' },
  { id: 'code-snippet', title: 'Code snippet', icon: FileCode, group: 'rich' },
  { id: 'chart', title: 'Chart', icon: ChartColumnBig, group: 'rich' },
  { id: 'poll', title: 'Poll', icon: Vote, group: 'rich' },
  { id: 'chat', title: 'Chat', icon: MessageSquare, group: 'rich' },
  { id: 'dynamic', title: 'Dynamic component', icon: Boxes, group: 'rich' },
  { id: 'nested-doc', title: 'Nested document', icon: FileText, group: 'rich' },
  { id: 'banner', title: 'Banner', icon: Flag, group: 'rich' },
  { id: 'details', title: 'Details', icon: ChevronRight, group: 'rich' },
  { id: 'table', title: 'Table', icon: Table, group: 'layout', description: 'Add a table' },
  { id: 'grid', title: 'Grid', icon: LayoutGrid, group: 'layout' },
  { id: 'steps', title: 'Steps', icon: Footprints, group: 'layout' },
  { id: 'embed', title: 'Embed', icon: AppWindow, group: 'embed' },
  { id: 'link-card', title: 'Link card', icon: Link, group: 'embed' },
  { id: 'mention', title: 'Mention', icon: AtSign, group: 'inline' },
  { id: 'tag', title: 'Tag', icon: Tag, group: 'inline' },
  { id: 'comment', title: 'HTML comment', icon: MessageSquareCode, group: 'inline' },
];

export const TURN_INTO_COMMAND_IDS: readonly string[] = [
  'paragraph',
  'h1',
  'h2',
  'h3',
  'bullet',
  'number',
  'check',
  'quote',
  'code',
];

const LEGACY_SECTIONS: Record<string, CommandGroupId> = {
  'basic blocks': 'basic',
  'basic': 'basic',
  'lists': 'lists',
  'list': 'lists',
  'media': 'media',
  'advanced': 'rich',
  'rich blocks': 'rich',
  'layout': 'layout',
  'embed': 'embed',
  'inline': 'inline',
};

const lookupKey = (value: string) => value.trim().toLowerCase();

const metaByKey = new Map<string, CommandMeta>();
for (const meta of COMMAND_REGISTRY) {
  for (const key of [meta.id, meta.title, ...(meta.aliases ?? [])]) {
    metaByKey.set(lookupKey(key), meta);
  }
}

const groupById = new Map(COMMAND_GROUPS.map((group) => [group.id, group]));

export function getCommandMeta(idOrTitle: string): CommandMeta | undefined {
  return metaByKey.get(lookupKey(idOrTitle));
}

export function getCommandGroupLabel(section: string | undefined): string {
  if (!section) return COMMAND_GROUPS[0].label;
  const key = lookupKey(section);
  const groupId = LEGACY_SECTIONS[key] ?? (groupById.has(key as CommandGroupId) ? key : null);
  if (groupId) return groupById.get(groupId as CommandGroupId)!.label;
  if (section === section.toUpperCase()) return section.charAt(0) + section.slice(1).toLowerCase();
  return section;
}

function groupRank(label: string): number {
  const index = COMMAND_GROUPS.findIndex((group) => group.label === label);
  return index === -1 ? COMMAND_GROUPS.length : index;
}

export function normalizeCommandItems<T extends CommandItemConfig>(
  items: readonly T[],
  options: { iconSize?: number } = {},
): T[] {
  const iconSize = options.iconSize ?? 20;
  const seen = new Set<string>();
  const ranked: { item: T; order: number; rank: number; position: number }[] = [];

  items.forEach((item, position) => {
    const meta = getCommandMeta(item.title);
    const title = meta?.title ?? item.title;
    if (seen.has(title)) return;
    seen.add(title);
    const section = meta ? groupById.get(meta.group)!.label : getCommandGroupLabel(item.section);
    ranked.push({
      item: {
        ...item,
        title,
        section,
        description: item.description ?? meta?.description,
        icon: meta ? createElement(meta.icon, { size: iconSize }) : item.icon,
      },
      rank: groupRank(section),
      order: meta ? COMMAND_REGISTRY.indexOf(meta) : COMMAND_REGISTRY.length,
      position,
    });
  });

  return ranked
    .sort((a, b) => a.rank - b.rank || a.order - b.order || a.position - b.position)
    .map((entry) => entry.item);
}
