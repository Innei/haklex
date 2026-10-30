// @vitest-environment happy-dom
import { $createMentionNode, $isMentionNode, MentionNode } from '@haklex/rich-editor/nodes';
import { RendererConfigProvider } from '@haklex/rich-editor/static';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import type { ElementNode, LexicalEditor } from 'lexical';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { MentionEditRenderer } from '../src/MentionEditRenderer';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let container: HTMLDivElement | null = null;
let root: Root | null = null;
let editorRef: LexicalEditor | null = null;

function CaptureEditor() {
  const [editor] = useLexicalComposerContext();
  editorRef = editor;
  return null;
}

const config = { Mention: MentionEditRenderer };

async function mount() {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root!.render(
      <RendererConfigProvider config={config} mode="editor" variant="note">
        <LexicalComposer
          initialConfig={{
            namespace: 'mention-edit-test',
            nodes: [MentionNode],
            onError: (error) => {
              throw error;
            },
            editorState: () => {
              const paragraph = $createParagraphNode();
              paragraph.append(
                $createTextNode('Hi '),
                $createMentionNode('GH', 'innei'),
                $createTextNode(' there'),
              );
              $getRoot().append(paragraph);
            },
          }}
        >
          <RichTextPlugin
            ErrorBoundary={LexicalErrorBoundary}
            contentEditable={<ContentEditable />}
          />
          <CaptureEditor />
        </LexicalComposer>
      </RendererConfigProvider>,
    );
  });
  const trigger = container.querySelector<HTMLElement>('.rich-mention-edit-trigger')!;
  await act(async () => trigger.click());
}

function readMention() {
  return editorRef!.getEditorState().read(() => {
    const node = ($getRoot().getFirstChildOrThrow() as ElementNode)
      .getChildren()
      .find((n) => $isMentionNode(n));
    return $isMentionNode(node)
      ? { platform: node.getPlatform(), handle: node.getHandle(), name: node.getDisplayName() }
      : null;
  });
}

function tab(label: string) {
  return [...document.body.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(
    (b) => b.textContent === label,
  );
}

function fieldInput(label: string) {
  const el = [...document.body.querySelectorAll('label')].find((l) => l.textContent === label);
  return el ? (document.getElementById(el.htmlFor) as HTMLInputElement | null) : null;
}

function type(input: HTMLInputElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function panel() {
  return document.body.querySelector('.rich-mention-edit-panel');
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
  editorRef = null;
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('MentionEditRenderer', () => {
  it('edits with a platform segmented control and labeled fields', async () => {
    await mount();
    expect(panel()).not.toBeNull();
    expect(panel()!.querySelector('select')).toBeNull();
    expect(['GitHub', 'X', 'Telegram', 'Zhihu'].map((l) => tab(l)?.textContent)).toEqual([
      'GitHub',
      'X',
      'Telegram',
      'Zhihu',
    ]);
    expect(tab('GitHub')!.getAttribute('aria-selected')).toBe('true');
    expect(fieldInput('Handle')?.value).toBe('innei');
    expect(fieldInput('Display name')?.value).toBe('');
    expect(panel()!.textContent).toContain('Optional');
  });

  it('applies changes live', async () => {
    await mount();
    await act(async () => type(fieldInput('Handle')!, 'shiro'));
    expect(readMention()).toMatchObject({ platform: 'GH', handle: 'shiro' });
    await act(async () => tab('Telegram')!.click());
    expect(readMention()).toMatchObject({ platform: 'TG', handle: 'shiro' });
    await act(async () => type(fieldInput('Display name')!, 'Shiro'));
    expect(readMention()).toMatchObject({ name: 'Shiro' });
    expect(panel()).not.toBeNull();
  });

  it('Esc reverts every change since the popover opened', async () => {
    await mount();
    await act(async () => type(fieldInput('Handle')!, 'shiro'));
    await act(async () => tab('X')!.click());
    await act(async () => {
      fieldInput('Handle')!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      );
    });
    expect(readMention()).toEqual({ platform: 'GH', handle: 'innei', name: undefined });
  });

  it('opens the profile for the draft handle', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    await mount();
    await act(async () => type(fieldInput('Handle')!, ''));
    await act(async () => type(fieldInput('Handle')!, 'octocat'));
    const openButton = [...panel()!.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Open'),
    )!;
    await act(async () => openButton.click());
    expect(open).toHaveBeenCalledWith(
      'https://github.com/octocat',
      '_blank',
      'noopener,noreferrer',
    );
  });
});
