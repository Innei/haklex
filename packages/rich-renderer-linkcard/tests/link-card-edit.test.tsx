// @vitest-environment happy-dom
import { $isLinkCardNode } from '@haklex/rich-editor/nodes';
import { $createLinkNode, $isLinkNode, LinkNode } from '@lexical/link';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { ElementNode, LexicalEditor } from 'lexical';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import type { ReactNode } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { ConvertToLinkCardAction } from '../src/ConvertToLinkCardAction';
import { LinkCardEditDecorator } from '../src/LinkCardEditDecorator';
import { $createLinkCardEditNode, LinkCardEditNode } from '../src/LinkCardEditNode';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

const URL = 'https://github.com/facebook/lexical';

let container: HTMLDivElement | null = null;
let root: Root | null = null;
let editorRef: LexicalEditor | null = null;

function CaptureEditor() {
  const [editor] = useLexicalComposerContext();
  editorRef = editor;
  return null;
}

async function mountWith(
  setup: () => void,
  render: (editor: LexicalEditor) => ReactNode,
): Promise<void> {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root!.render(
      <LexicalComposer
        initialConfig={{
          namespace: 'link-card-edit-test',
          nodes: [LinkNode, LinkCardEditNode],
          onError: (error) => {
            throw error;
          },
          editorState: setup,
        }}
      >
        <CaptureEditor />
      </LexicalComposer>,
    );
  });
  await act(async () => {
    root!.render(
      <LexicalComposer
        initialConfig={{
          namespace: 'link-card-edit-test',
          nodes: [LinkNode, LinkCardEditNode],
          onError: (error) => {
            throw error;
          },
          editorState: setup,
        }}
      >
        <CaptureEditor />
        {render(editorRef!)}
      </LexicalComposer>,
    );
  });
}

let cardKey = '';

async function mountCard(url = URL, title = 'facebook/lexical') {
  await mountWith(
    () => {
      const card = $createLinkCardEditNode({ url, title });
      $getRoot().append(card);
      cardKey = card.getKey();
    },
    () => (
      <LinkCardEditDecorator nodeKey={cardKey} payload={{ url, title }}>
        <div data-testid="card">card</div>
      </LinkCardEditDecorator>
    ),
  );
}

function panel() {
  return document.body.querySelector('.rich-link-card-edit-panel');
}

function tab(label: string) {
  return [...document.body.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(
    (b) => b.textContent === label,
  );
}

function byLabel(label: string) {
  return document.body.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
}

function fieldInput(label: string) {
  const el = [...document.body.querySelectorAll('label')].find((l) => l.textContent === label);
  return el ? (document.getElementById(el.htmlFor) as HTMLInputElement | null) : null;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
  editorRef = null;
  document.body.innerHTML = '';
});

describe('LinkCardEditDecorator', () => {
  it('does not open on hover', async () => {
    await mountCard();
    const trigger = document.body.querySelector('[data-testid="card"]')!.parentElement!;
    await act(async () => {
      for (const type of ['pointerenter', 'mouseenter', 'mouseover', 'pointermove', 'mousemove']) {
        trigger.dispatchEvent(new MouseEvent(type, { bubbles: true }));
      }
      await wait(500);
    });
    expect(panel()).toBeNull();
  });

  it('opens on click with the Card segment selected', async () => {
    await mountCard();
    const trigger = document.body.querySelector('[data-testid="card"]')!.parentElement!;
    await act(async () => trigger.click());
    expect(panel()).not.toBeNull();
    expect(panel()!.textContent).toContain('facebook/lexical');
    expect(tab('Card')?.getAttribute('aria-selected')).toBe('true');
    expect(tab('Link')?.getAttribute('aria-selected')).toBe('false');
    for (const label of ['Open link', 'Copy link', 'Edit link']) {
      expect(byLabel(label)).not.toBeNull();
    }
    const remove = byLabel('Remove card')!;
    expect(remove.querySelector('svg')?.getAttribute('class')).toMatch(/lucide-trash/);
  });

  it('switching to Link turns the card back into a link', async () => {
    await mountCard();
    const trigger = document.body.querySelector('[data-testid="card"]')!.parentElement!;
    await act(async () => trigger.click());
    await act(async () => tab('Link')!.click());
    const link = editorRef!.getEditorState().read(() => {
      const first = $getRoot().getFirstChild<ElementNode>();
      const child = first?.getFirstChild();
      return $isLinkNode(child) ? { url: child.getURL(), text: child.getTextContent() } : null;
    });
    expect(link).toEqual({ url: URL, text: 'facebook/lexical' });
  });

  it('edits the card URL in place', async () => {
    await mountCard();
    const trigger = document.body.querySelector('[data-testid="card"]')!.parentElement!;
    await act(async () => trigger.click());
    await act(async () => byLabel('Edit link')!.click());
    const input = fieldInput('URL')!;
    expect(input.value).toBe(URL);
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
        input,
        'https://lexical.dev',
      );
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    const url = editorRef!.getEditorState().read(() => {
      const node = $getRoot().getFirstChild();
      return $isLinkCardNode(node) ? node.getUrl() : null;
    });
    expect(url).toBe('https://lexical.dev');
    expect(fieldInput('URL')).toBeNull();
  });

  it('auto-opens on the URL field when the card has no URL', async () => {
    await mountCard('', '');
    await act(async () => {
      await wait(32);
    });
    const input = fieldInput('URL');
    expect(input).not.toBeNull();
    expect(document.activeElement).toBe(input);
  });
});

describe('ConvertToLinkCardAction', () => {
  let linkKey = '';

  async function mountAction(url: string) {
    await mountWith(
      () => {
        const paragraph = $createParagraphNode();
        const link = $createLinkNode(url);
        link.append($createTextNode('lexical'));
        paragraph.append(link);
        $getRoot().append(paragraph);
        linkKey = link.getKey();
      },
      () => <ConvertToLinkCardAction linkKey={linkKey} url={url} />,
    );
  }

  it('offers a Link | Card switch with Link selected', async () => {
    await mountAction(URL);
    expect(tab('Link')?.getAttribute('aria-selected')).toBe('true');
    expect(tab('Card')?.getAttribute('aria-selected')).toBe('false');
  });

  it('converts the link into a card when Card is chosen', async () => {
    await mountAction(URL);
    await act(async () => tab('Card')!.click());
    const card = editorRef!.getEditorState().read(() => {
      const node = $getRoot().getFirstChild();
      return $isLinkCardNode(node) ? node.getUrl() : null;
    });
    expect(card).toBe(URL);
  });

  it('renders nothing for a url no card plugin understands', async () => {
    await mountAction('https://example.invalid/page');
    expect(tab('Card')).toBeUndefined();
  });
});
