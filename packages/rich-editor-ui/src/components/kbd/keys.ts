export type KbdPlatform = 'mac' | 'other';
export type KbdIcon = 'enter' | 'backspace' | 'delete' | 'up' | 'down' | 'left' | 'right';

export interface KeyDisplay {
  icon?: KbdIcon;
  label?: string;
  name: string;
}

const aliases: Record<string, string> = {
  'ctrl': 'mod',
  'control': 'mod',
  'cmd': 'mod',
  'command': 'mod',
  'meta': 'mod',
  'mod': 'mod',
  'option': 'alt',
  'opt': 'alt',
  'alt': 'alt',
  'shift': 'shift',
  'return': 'enter',
  'enter': 'enter',
  'esc': 'escape',
  'escape': 'escape',
  'backspace': 'backspace',
  'del': 'delete',
  'delete': 'delete',
  'arrowup': 'up',
  'up': 'up',
  'arrowdown': 'down',
  'down': 'down',
  'arrowleft': 'left',
  'left': 'left',
  'arrowright': 'right',
  'right': 'right',
  '⌘': 'mod',
  '⌃': 'mod',
  '⇧': 'shift',
  '⌥': 'alt',
  '↵': 'enter',
  '⏎': 'enter',
  '⌫': 'backspace',
  '⌦': 'delete',
  '↑': 'up',
  '↓': 'down',
  '←': 'left',
  '→': 'right',
};

const glyphs = /[←↑→↓↵⇧⌃⌘⌥⌦⌫⏎]/g;

function normalize(token: string) {
  const lower = token.trim().toLowerCase();
  return aliases[lower] ?? lower;
}

export function parseShortcut(shortcut: string): string[] {
  const parts = shortcut.includes('+')
    ? shortcut.split('+')
    : shortcut.replaceAll(glyphs, (g) => `+${g}+`).split('+');
  return parts.filter((p) => p.trim() !== '').map(normalize);
}

const macModifiers: Record<string, KeyDisplay> = {
  mod: { label: '⌘', name: 'Command' },
  shift: { label: '⇧', name: 'Shift' },
  alt: { label: '⌥', name: 'Option' },
};

const otherModifiers: Record<string, KeyDisplay> = {
  mod: { label: 'Ctrl', name: 'Control' },
  shift: { label: 'Shift', name: 'Shift' },
  alt: { label: 'Alt', name: 'Alt' },
};

const iconKeys: Record<KbdIcon, string> = {
  enter: 'Enter',
  backspace: 'Backspace',
  delete: 'Delete',
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
};

const namedKeys: Record<string, KeyDisplay> = {
  escape: { label: 'Esc', name: 'Escape' },
  tab: { label: 'Tab', name: 'Tab' },
  space: { label: 'Space', name: 'Space' },
};

export function keyDisplay(key: string, platform: KbdPlatform): KeyDisplay {
  const modifiers = platform === 'mac' ? macModifiers : otherModifiers;
  if (modifiers[key]) return modifiers[key];
  if (key in iconKeys) return { icon: key as KbdIcon, name: iconKeys[key as KbdIcon] };
  if (namedKeys[key]) return namedKeys[key];
  const label = key.length === 1 ? key.toUpperCase() : key[0].toUpperCase() + key.slice(1);
  return { label, name: label };
}

export function detectPlatform(
  nav: { platform?: string; userAgent?: string } | undefined,
): KbdPlatform {
  if (!nav) return 'other';
  const source = `${nav.platform ?? ''} ${nav.userAgent ?? ''}`;
  return /mac|iphone|ipad|ipod/i.test(source) ? 'mac' : 'other';
}
