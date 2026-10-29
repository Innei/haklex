// @vitest-environment happy-dom
import type { FileNode } from '@haklex/rich-editor/nodes';
import { $createFileNode, $isFileNode, FileNode as FileNodeClass } from '@haklex/rich-editor/nodes';
import type { LexicalEditor } from 'lexical';
import { $getRoot, $isParagraphNode, createEditor } from 'lexical';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

let editor: LexicalEditor;

vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: () => [editor],
}));

vi.mock('@haklex/rich-editor/plugins', () => ({
  useFileUpload: () => null,
  useFileUploadEntry: () => undefined,
}));

vi.mock('@haklex/rich-editor/static', () => ({
  useRendererMode: () => 'editor',
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let container: HTMLDivElement | null = null;
let root: Root | null = null;
let nodeKey = '';

beforeEach(() => {
  editor = createEditor({
    nodes: [FileNodeClass],
    onError: (error) => {
      throw error;
    },
  });
  editor.update(
    () => {
      const node = $createFileNode({
        src: 'https://cdn.example.com/report.pdf',
        name: 'report.pdf',
        size: 2048,
        ext: 'pdf',
        display: 'block',
      });
      $getRoot().append(node);
      nodeKey = node.getKey();
    },
    { discrete: true },
  );
});

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
});

async function mount() {
  const { FileEditRenderer } = await import('../src/FileEditRenderer');
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () =>
    root!.render(
      <FileEditRenderer
        display="block"
        ext="pdf"
        name="report.pdf"
        nodeKey={nodeKey}
        size={2048}
        src="https://cdn.example.com/report.pdf"
      />,
    ),
  );
  const trigger = container.firstElementChild as HTMLElement;
  await act(async () => trigger.click());
}

function control(label: string) {
  const el = [...document.body.querySelectorAll('label')].find((l) => l.textContent === label);
  if (!el) throw new Error(`label "${label}" not found`);
  return document.getElementById(el.htmlFor) as HTMLInputElement;
}

function readFile(): { display: string; name: string; parentIsParagraph: boolean } | null {
  return editor.getEditorState().read(() => {
    const first = $getRoot().getFirstChild();
    const node = ($isParagraphNode(first) ? first.getFirstChild() : first) as FileNode | null;
    if (!$isFileNode(node)) return null;
    return {
      display: node.getDisplay(),
      name: node.getPayload().name,
      parentIsParagraph: $isParagraphNode(first),
    };
  });
}

describe('File inspector', () => {
  it('renders the inspector template with labeled fields', async () => {
    await mount();
    expect(control('Name').value).toBe('report.pdf');
    expect(document.body.textContent).toContain('Display as');
    expect(document.body.textContent).toContain('Changes apply as you type');
    expect(document.body.querySelector('[aria-label="More actions"]')).not.toBeNull();
  });

  it('switches Display as between block and inline', async () => {
    await mount();
    const inline = [...document.body.querySelectorAll<HTMLElement>('[role="tab"]')].find(
      (tab) => tab.textContent === 'Inline',
    )!;
    expect(inline).toBeDefined();
    await act(async () => inline.click());
    expect(readFile()).toMatchObject({ display: 'inline', parentIsParagraph: true });
  });

  it('applies the name live and reverts it on Escape', async () => {
    await mount();
    const name = control('Name');
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
        name,
        'q3-report.pdf',
      );
      name.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(readFile()?.name).toBe('q3-report.pdf');
    await act(async () => {
      name.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      );
    });
    expect(readFile()?.name).toBe('report.pdf');
  });
});
