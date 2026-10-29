// @vitest-environment happy-dom
import { $createRubyNode, RubyNode } from '@haklex/rich-editor/nodes';
import { $createLinkNode, AutoLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import type { LexicalEditor, TextFormatType } from 'lexical';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isTextNode,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_TEXT_COMMAND,
  KEY_DOWN_COMMAND,
  KEY_TAB_COMMAND,
} from 'lexical';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { FloatingToolbarPlugin } from '../src';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

vi.mock('@haklex/rich-editor', () => ({
  useTextSelectionSnapshot: () => ({ text: 'Hello' }),
  getDOMRectFromTextSelection: () => new DOMRect(200, 300, 80, 20),
}));

vi.mock('@haklex/rich-editor/commands', () => ({
  $selectionTouchesSpoiler: () => false,
  $toggleSpoilerSelection: () => {},
}));

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let container: HTMLDivElement | null = null;
let root: Root | null = null;
let editor: LexicalEditor | null = null;

afterEach(() => {
  if (root) act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
  editor = null;
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

function Capture() {
  const [current] = useLexicalComposerContext();
  editor = current;
  return null;
}

async function mount({
  withRuby = false,
  withLink = false,
}: { withRuby?: boolean; withLink?: boolean } = {}) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(
      <LexicalComposer
        initialConfig={{
          namespace: 'FloatingToolbarTest',
          nodes: [RubyNode, LinkNode, AutoLinkNode],
          onError: (error) => {
            throw error;
          },
          editorState: () => {
            const paragraph = $createParagraphNode();
            if (withLink) {
              const link = $createLinkNode('https://example.com');
              link.append($createTextNode('Hello'));
              paragraph.append(link, $createTextNode(' world'));
            } else {
              paragraph.append($createTextNode('Hello world'));
            }
            if (withRuby) {
              const ruby = $createRubyNode('kan ji');
              ruby.append($createTextNode('漢字'));
              paragraph.append(ruby);
            }
            $getRoot().append(paragraph);
          },
        }}
      >
        <ContentEditable aria-label="Editor" />
        <FloatingToolbarPlugin />
        <Capture />
      </LexicalComposer>,
    );
  });
  return editor!;
}

async function selectHello(target: LexicalEditor) {
  await act(async () => {
    target.update(
      () => {
        const text = $getRoot().getFirstDescendant();
        if ($isTextNode(text)) text.select(0, 5);
      },
      { discrete: true },
    );
  });
}

function toolbar() {
  return document.body.querySelector<HTMLElement>('[role="toolbar"]');
}

function button(name: string) {
  return document.body.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`);
}

async function click(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    el!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    el!.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
    el!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

async function key(el: Element | null, keyName: string, init: KeyboardEventInit = {}) {
  expect(el).not.toBeNull();
  await act(async () => {
    el!.dispatchEvent(
      new KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true, ...init }),
    );
  });
}

async function type(input: HTMLInputElement, value: string) {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe('FloatingToolbarPlugin', () => {
  it('groups the formatting buttons and gives each an accessible name', async () => {
    const target = await mount();
    await selectHello(target);

    const bar = toolbar();
    expect(bar?.getAttribute('aria-label')).toBe('Text formatting');
    const names = Array.from(bar!.querySelectorAll('button')).map((b) =>
      b.getAttribute('aria-label'),
    );
    expect(names).toEqual([
      'Bold',
      'Italic',
      'Underline',
      'Strikethrough',
      'Inline code',
      'Highlight',
      'Spoiler',
      'Link',
      'Ruby',
      'Text color',
      'More formatting',
    ]);
    expect(bar!.querySelectorAll('[data-toolbar-indicator]')).toHaveLength(0);
  });

  it('shows a tooltip with label and shortcut for every button', async () => {
    const target = await mount();
    await selectHello(target);

    const expected: Record<string, string | null> = {
      'Bold': 'Mod+B',
      'Italic': 'Mod+I',
      'Underline': 'Mod+U',
      'Link': 'Mod+K',
      'Strikethrough': null,
      'Inline code': null,
      'Highlight': null,
      'Spoiler': null,
      'Ruby': null,
      'Text color': null,
      'More formatting': null,
    };
    for (const [name, shortcut] of Object.entries(expected)) {
      const el = button(name);
      expect(el?.dataset.tooltip, name).toBe(name);
      expect(el?.dataset.shortcut ?? null, name).toBe(shortcut);
    }

    await act(async () => {
      button('Bold')!.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
      button('Bold')!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      button('Bold')!.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 700));
    });
    const tip = document.body.querySelector('[data-slot="toolbar-tooltip"]');
    expect(tip?.textContent).toContain('Bold');
    expect(tip?.querySelector('kbd')).not.toBeNull();
  });

  it('formats on click so Enter and Space activate buttons', async () => {
    const target = await mount();
    const formats: TextFormatType[] = [];
    target.registerCommand(
      FORMAT_TEXT_COMMAND,
      (payload) => {
        formats.push(payload);
        return true;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
    await selectHello(target);

    await act(async () => {
      button('Bold')!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(formats).toEqual([]);
    await act(async () => {
      button('Bold')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(formats).toEqual(['bold']);
  });

  it('moves focus between buttons with the arrow keys', async () => {
    const target = await mount();
    await selectHello(target);

    act(() => button('Bold')!.focus());
    await key(button('Bold'), 'ArrowRight');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Italic');
    await key(button('Italic'), 'ArrowLeft');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Bold');
    await key(button('Bold'), 'End');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('More formatting');
  });

  it('turns into a URL field when Link is clicked and saves on Enter', async () => {
    const target = await mount();
    const links: unknown[] = [];
    target.registerCommand(
      TOGGLE_LINK_COMMAND,
      (payload) => {
        links.push(payload);
        return true;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
    await selectHello(target);

    await click(button('Link'));
    await flush();
    expect(links).toEqual([]);
    const input = document.body.querySelector<HTMLInputElement>('input[aria-label="URL"]');
    expect(input).not.toBeNull();
    expect(button('Bold')).toBeNull();
    expect(button('Save')).not.toBeNull();
    expect(button('Back to formatting')).not.toBeNull();

    await type(input!, 'https://lexical.dev');
    await key(input, 'Enter');
    expect(links).toEqual(['https://lexical.dev']);
    expect(document.body.querySelector('input[aria-label="URL"]')).toBeNull();
  });

  it('opens an existing link for editing instead of unlinking it', async () => {
    const target = await mount({ withLink: true });
    const links: unknown[] = [];
    target.registerCommand(
      TOGGLE_LINK_COMMAND,
      (payload) => {
        links.push(payload);
        return true;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
    await selectHello(target);
    expect(button('Link')?.getAttribute('aria-pressed')).toBe('true');

    await click(button('Link'));
    await flush();
    expect(links).toEqual([]);
    expect(document.body.querySelector<HTMLInputElement>('input[aria-label="URL"]')?.value).toBe(
      'https://example.com',
    );
    expect(button('Save')).not.toBeNull();

    await click(button('Remove link'));
    expect(links).toEqual([null]);
    expect(document.body.querySelector('input[aria-label="URL"]')).toBeNull();
  });

  it('offers no Remove link when the selection has no link', async () => {
    const target = await mount();
    await selectHello(target);
    await click(button('Link'));
    expect(document.body.querySelector('input[aria-label="URL"]')).not.toBeNull();
    expect(button('Remove link')).toBeNull();
  });

  it('returns to the formatting buttons on Escape without linking', async () => {
    const target = await mount();
    const links: unknown[] = [];
    target.registerCommand(
      TOGGLE_LINK_COMMAND,
      (payload) => {
        links.push(payload);
        return true;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
    await selectHello(target);
    await click(button('Link'));
    const input = document.body.querySelector<HTMLInputElement>('input[aria-label="URL"]');
    await type(input!, 'https://lexical.dev');
    await key(input, 'Escape');
    expect(links).toEqual([]);
    expect(button('Bold')).not.toBeNull();
  });

  it('moves focus into the toolbar with Alt+F10', async () => {
    const target = await mount();
    await selectHello(target);
    await act(async () => {
      target.dispatchCommand(
        KEY_DOWN_COMMAND,
        new KeyboardEvent('keydown', { key: 'F10', altKey: true, cancelable: true }),
      );
    });
    await flush();
    expect(toolbar()?.contains(document.activeElement)).toBe(true);
  });

  it('leaves Tab to the editor so a selected paragraph still indents', async () => {
    const target = await mount();
    await selectHello(target);
    const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    let handled = false;
    await act(async () => {
      handled = target.dispatchCommand(KEY_TAB_COMMAND, event);
    });
    expect(handled).toBe(false);
    expect(event.defaultPrevented).toBe(false);
  });

  it('opens the URL field with Mod+K while text is selected', async () => {
    const target = await mount();
    await selectHello(target);
    await act(async () => {
      target.dispatchCommand(
        KEY_DOWN_COMMAND,
        new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, cancelable: true }),
      );
    });
    expect(document.body.querySelector('input[aria-label="URL"]')).not.toBeNull();
  });

  it('prefills the URL from the clipboard only when reading needs no prompt', async () => {
    const readText = vi.fn(async () => 'https://github.com/facebook/lexical');
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { readText },
      permissions: { query: vi.fn(async () => ({ state: 'granted' })) },
    });
    const target = await mount();
    await selectHello(target);
    await click(button('Link'));
    await flush();
    expect(document.body.querySelector<HTMLInputElement>('input[aria-label="URL"]')?.value).toBe(
      'https://github.com/facebook/lexical',
    );
  });

  it('leaves the URL empty when reading the clipboard would prompt', async () => {
    const readText = vi.fn(async () => 'https://github.com/facebook/lexical');
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { readText },
      permissions: { query: vi.fn(async () => ({ state: 'prompt' })) },
    });
    const target = await mount();
    await selectHello(target);
    await click(button('Link'));
    await flush();
    expect(readText).not.toHaveBeenCalled();
    expect(document.body.querySelector<HTMLInputElement>('input[aria-label="URL"]')?.value).toBe(
      '',
    );
  });

  it('edits a ruby reading inline with English copy', async () => {
    const target = await mount();
    await selectHello(target);
    await click(button('Ruby'));

    const input = document.body.querySelector<HTMLInputElement>('input[aria-label="Reading"]');
    expect(input?.placeholder).toBe('Reading');
    expect(button('Remove ruby')).not.toBeNull();
    expect(document.body.textContent).not.toMatch(/读音|保存|取消/);

    await type(input!, 'hello');
    await key(input, 'Enter');
    const reading = target.getEditorState().read(() => {
      const ruby = $getRoot()
        .getAllTextNodes()
        .map((node) => node.getParent())
        .find((node): node is RubyNode => node instanceof RubyNode);
      return ruby?.getReading();
    });
    expect(reading).toBe('hello');
    expect(document.body.querySelector('input[aria-label="Reading"]')).toBeNull();
  });

  it('opens the ruby editor when an existing ruby is clicked', async () => {
    const target = await mount({ withRuby: true });
    const rubyDom = target.getRootElement()!.querySelector<HTMLElement>('[data-ruby]');
    expect(rubyDom).not.toBeNull();
    await click(rubyDom!.firstElementChild ?? rubyDom);
    const input = document.body.querySelector<HTMLInputElement>('input[aria-label="Reading"]');
    expect(input?.value).toBe('kan ji');
  });

  it('keeps superscript, subscript and clear formatting in the overflow menu', async () => {
    const target = await mount();
    await selectHello(target);
    await click(button('More formatting'));
    await flush();
    const items = Array.from(document.body.querySelectorAll('[role^="menuitem"]')).map((el) =>
      el.textContent?.trim(),
    );
    expect(items).toEqual(['Superscript', 'Subscript', 'Clear formatting']);
  });
});
