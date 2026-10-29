// @vitest-environment happy-dom
import { $createLinkNode, $isLinkNode, LinkNode } from '@lexical/link';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import type { LexicalEditor, TextNode } from 'lexical';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import type { ReactNode } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { FloatingLinkEditorPlugin } from '../src';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

const toastMock = vi.hoisted(() => vi.fn());
const positionerProps = vi.hoisted(() => ({ current: null as Record<string, unknown> | null }));

vi.mock('@haklex/rich-editor-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@haklex/rich-editor-ui')>();
  return {
    ...actual,
    toast: toastMock,
    PopoverPositioner: (props: Parameters<typeof actual.PopoverPositioner>[0]) => {
      positionerProps.current = props as Record<string, unknown>;
      return <actual.PopoverPositioner {...props} />;
    },
  };
});

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

const URL = 'https://github.com/facebook/lexical/releases';

let container: HTMLDivElement | null = null;
let root: Root | null = null;
let editorRef: LexicalEditor | null = null;

function CaptureEditor() {
  const [editor] = useLexicalComposerContext();
  editorRef = editor;
  return null;
}

async function mount(extra?: ReactNode, url = URL) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root!.render(
      <LexicalComposer
        initialConfig={{
          namespace: 'link-editor-test',
          nodes: [LinkNode],
          onError: (error) => {
            throw error;
          },
          editorState: () => {
            const paragraph = $createParagraphNode();
            const link = $createLinkNode(url);
            link.append($createTextNode('release notes'));
            paragraph.append($createTextNode('See '), link);
            $getRoot().append(paragraph);
          },
        }}
      >
        <RichTextPlugin
          ErrorBoundary={LexicalErrorBoundary}
          contentEditable={<ContentEditable />}
        />
        <FloatingLinkEditorPlugin renderExtraActions={extra ? () => extra : undefined} />
        <CaptureEditor />
      </LexicalComposer>,
    );
  });
  await act(async () => {
    editorRef!.update(() => {
      const link = $getRoot().getFirstChildOrThrow<LinkNode>().getChildAtIndex<LinkNode>(1)!;
      link.getFirstChildOrThrow<TextNode>().select(2, 2);
    });
  });
}

function readLink() {
  return editorRef!.getEditorState().read(() => {
    const link = $getRoot()
      .getFirstChildOrThrow<LinkNode>()
      .getChildren()
      .find((n) => $isLinkNode(n)) as LinkNode | undefined;
    return link ? { url: link.getURL(), text: link.getTextContent() } : null;
  });
}

function byLabel(label: string) {
  return document.body.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
}

function fieldInput(label: string) {
  const el = [...document.body.querySelectorAll('label')].find((l) => l.textContent === label);
  if (!el) return null;
  return document.getElementById(el.htmlFor) as HTMLInputElement | null;
}

function type(input: HTMLInputElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function key(target: HTMLElement, k: string) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
  editorRef = null;
  positionerProps.current = null;
  toastMock.mockReset();
  document.body.innerHTML = '';
});

describe('FloatingLinkEditorPlugin', () => {
  it('shows the link text, url and the action row in view state', async () => {
    await mount();
    const popup = document.body.querySelector('.rich-link-edit-panel');
    expect(popup).not.toBeNull();
    expect(popup!.textContent).toContain('release notes');
    expect(popup!.textContent).toContain('github.com/facebook/lexical/releases');
    for (const label of ['Open link', 'Copy link', 'Edit link', 'Remove link']) {
      expect(byLabel(label)).not.toBeNull();
    }
  });

  it('flips above the link when there is no room below', async () => {
    await mount();
    expect(positionerProps.current?.side).toBe('bottom');
    expect(positionerProps.current?.collisionAvoidance).toMatchObject({ side: 'flip' });
  });

  it('places host actions in the action row', async () => {
    await mount(<span data-testid="host-action">Card</span>);
    const host = document.body.querySelector('[data-testid="host-action"]');
    expect(host).not.toBeNull();
    expect(host!.closest('.rich-link-edit-actions')).not.toBeNull();
  });

  it('copies the url and confirms with a toast', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    await mount();
    await act(async () => byLabel('Copy link')!.click());
    expect(writeText).toHaveBeenCalledWith(URL);
    expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'Link copied' }));
  });

  it('edit mode shows labeled Text and URL fields', async () => {
    await mount();
    await act(async () => byLabel('Edit link')!.click());
    expect(fieldInput('Text')?.value).toBe('release notes');
    expect(fieldInput('URL')?.value).toBe(URL);
    const buttons = [...document.body.querySelectorAll('button')].map((b) => b.textContent);
    expect(buttons).toContain('Cancel');
    expect(buttons.some((t) => t?.startsWith('Save'))).toBe(true);
  });

  it('Save updates both the link text and the url', async () => {
    await mount();
    await act(async () => byLabel('Edit link')!.click());
    await act(async () => {
      type(fieldInput('Text')!, 'changelog');
      type(fieldInput('URL')!, 'https://lexical.dev');
    });
    const save = [...document.body.querySelectorAll('button')].find((b) =>
      b.textContent?.startsWith('Save'),
    )!;
    await act(async () => save.click());
    expect(readLink()).toEqual({ url: 'https://lexical.dev', text: 'changelog' });
    expect(fieldInput('URL')).toBeNull();
  });

  it('Enter in a field saves', async () => {
    await mount();
    await act(async () => byLabel('Edit link')!.click());
    await act(async () => type(fieldInput('URL')!, 'https://lexical.dev'));
    await act(async () => key(fieldInput('URL')!, 'Enter'));
    expect(readLink()?.url).toBe('https://lexical.dev');
  });

  it('Esc reverts and returns to view', async () => {
    await mount();
    await act(async () => byLabel('Edit link')!.click());
    await act(async () => type(fieldInput('Text')!, 'changed'));
    await act(async () => key(fieldInput('Text')!, 'Escape'));
    expect(readLink()).toEqual({ url: URL, text: 'release notes' });
    expect(fieldInput('Text')).toBeNull();
    expect(document.activeElement).toBe(byLabel('Edit link'));
  });

  it('saves when focus leaves the popover', async () => {
    await mount();
    await act(async () => byLabel('Edit link')!.click());
    const url = fieldInput('URL')!;
    await act(async () => type(url, 'https://lexical.dev'));
    const outside = document.createElement('button');
    document.body.append(outside);
    await act(async () => {
      url.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: outside }));
    });
    expect(readLink()?.url).toBe('https://lexical.dev');
  });

  it('Cancel reverts and returns to view', async () => {
    await mount();
    await act(async () => byLabel('Edit link')!.click());
    await act(async () => type(fieldInput('URL')!, 'https://nope.dev'));
    const cancel = [...document.body.querySelectorAll('button')].find(
      (b) => b.textContent === 'Cancel',
    )!;
    await act(async () => cancel.click());
    expect(readLink()?.url).toBe(URL);
    expect(byLabel('Edit link')).not.toBeNull();
  });
});
