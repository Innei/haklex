import { describe, expect, it } from 'vitest';

import { detectPlatform, keyDisplay, parseShortcut } from '../src/components/kbd/keys';

describe('parseShortcut', () => {
  it('splits plus-separated shortcuts and maps Ctrl and Cmd to mod', () => {
    expect(parseShortcut('Ctrl+B')).toEqual(['mod', 'b']);
    expect(parseShortcut('Cmd+Shift+Z')).toEqual(['mod', 'shift', 'z']);
    expect(parseShortcut('Meta+Alt+1')).toEqual(['mod', 'alt', '1']);
  });

  it('reads macOS glyph strings without separators', () => {
    expect(parseShortcut('⌘⇧Z')).toEqual(['mod', 'shift', 'z']);
    expect(parseShortcut('⌥⌘K')).toEqual(['alt', 'mod', 'k']);
  });

  it('normalizes named keys', () => {
    expect(parseShortcut('Shift+Enter')).toEqual(['shift', 'enter']);
    expect(parseShortcut('Esc')).toEqual(['escape']);
    expect(parseShortcut('Mod+Backspace')).toEqual(['mod', 'backspace']);
    expect(parseShortcut('Alt+ArrowUp')).toEqual(['alt', 'up']);
  });

  it('returns nothing for an empty string', () => {
    expect(parseShortcut('')).toEqual([]);
  });
});

describe('keyDisplay', () => {
  it('uses glyphs for modifiers on macOS', () => {
    expect(keyDisplay('mod', 'mac')).toEqual({ label: '⌘', name: 'Command' });
    expect(keyDisplay('shift', 'mac')).toEqual({ label: '⇧', name: 'Shift' });
    expect(keyDisplay('alt', 'mac')).toEqual({ label: '⌥', name: 'Option' });
  });

  it('uses words for modifiers elsewhere', () => {
    expect(keyDisplay('mod', 'other')).toEqual({ label: 'Ctrl', name: 'Control' });
    expect(keyDisplay('alt', 'other')).toEqual({ label: 'Alt', name: 'Alt' });
  });

  it('draws icon keys instead of ASCII symbols', () => {
    expect(keyDisplay('backspace', 'mac')).toEqual({ icon: 'backspace', name: 'Backspace' });
    expect(keyDisplay('enter', 'other')).toEqual({ icon: 'enter', name: 'Enter' });
    expect(keyDisplay('up', 'mac')).toEqual({ icon: 'up', name: 'Up' });
  });

  it('uppercases single characters and names the rest', () => {
    expect(keyDisplay('k', 'mac')).toEqual({ label: 'K', name: 'K' });
    expect(keyDisplay('escape', 'mac')).toEqual({ label: 'Esc', name: 'Escape' });
  });
});

describe('detectPlatform', () => {
  it('reads macOS and iOS from the platform string', () => {
    expect(detectPlatform({ platform: 'MacIntel', userAgent: '' })).toBe('mac');
    expect(detectPlatform({ platform: 'iPhone', userAgent: '' })).toBe('mac');
  });

  it('treats everything else, including no navigator, as other', () => {
    expect(detectPlatform({ platform: 'Win32', userAgent: 'Windows NT' })).toBe('other');
    expect(detectPlatform(undefined)).toBe('other');
  });
});
