import { isValidElement } from 'react';
import { describe, expect, it } from 'vitest';

import {
  COMMAND_GROUPS,
  getCommandGroupLabel,
  getCommandMeta,
  normalizeCommandItems,
} from '../src/commands/registry';
import type { CommandItemConfig } from '../src/types/slash-menu';

const noop = () => {};

function item(title: string, section?: string): CommandItemConfig {
  return { title, section, onSelect: noop };
}

describe('command registry', () => {
  it('lists group labels in a fixed order', () => {
    expect(COMMAND_GROUPS.map((group) => group.label)).toEqual([
      'Basic blocks',
      'Lists',
      'Media',
      'Rich blocks',
      'Layout',
      'Embed',
      'Inline',
    ]);
  });

  it('resolves legacy titles to sentence-case canonical names', () => {
    expect(getCommandMeta('Code Block')?.title).toBe('Code block');
    expect(getCommandMeta('Math Equation')?.title).toBe('Math block');
    expect(getCommandMeta('Bulleted List')?.title).toBe('Bulleted list');
    expect(getCommandMeta('To-do List')?.title).toBe('To-do list');
    expect(getCommandMeta('Checklist')?.title).toBe('To-do list');
    expect(getCommandMeta('Link Card')?.title).toBe('Link card');
    expect(getCommandMeta('HTML Comment')?.title).toBe('HTML comment');
    expect(getCommandMeta('paragraph')?.title).toBe('Text');
  });

  it('gives every block type its own icon', () => {
    expect(getCommandMeta('Embed')?.icon).not.toBe(getCommandMeta('Code block')?.icon);
    expect(getCommandMeta('Steps')?.icon).not.toBe(getCommandMeta('Numbered list')?.icon);
  });

  it('maps legacy uppercase sections to group labels', () => {
    expect(getCommandGroupLabel('BASIC BLOCKS')).toBe('Basic blocks');
    expect(getCommandGroupLabel('ADVANCED')).toBe('Rich blocks');
    expect(getCommandGroupLabel('MEDIA')).toBe('Media');
    expect(getCommandGroupLabel('CUSTOM STUFF')).toBe('Custom stuff');
    expect(getCommandGroupLabel(undefined)).toBe('Basic blocks');
  });

  it('normalizes titles, icons and groups, dedupes and orders by group', () => {
    const items = normalizeCommandItems([
      item('Embed', 'EMBED'),
      item('Link Card', 'MEDIA'),
      item('Code Block', 'MEDIA'),
      item('Link Card', 'MEDIA'),
      item('Image', 'MEDIA'),
      item('Custom', 'ADVANCED'),
    ]);

    expect(items.map((entry) => [entry.title, entry.section])).toEqual([
      ['Image', 'Media'],
      ['Code block', 'Rich blocks'],
      ['Custom', 'Rich blocks'],
      ['Embed', 'Embed'],
      ['Link card', 'Embed'],
    ]);
    expect(isValidElement(items[0].icon)).toBe(true);
  });
});
