// @vitest-environment happy-dom
import type { LexicalEditor } from 'lexical';
import { $getNodeByKey, $getRoot, createEditor } from 'lexical';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DynamicNode } from '../src/DynamicNode';
import { $createDynamicNode, DynamicNode as DynamicNodeClass } from '../src/DynamicNode';

let editor: LexicalEditor;

vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: () => [editor],
}));

vi.mock('../src/DynamicHostRenderer', () => ({
  DynamicHostRenderer: () => <div data-host />,
}));

vi.mock('@haklex/rich-editor/static', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@haklex/rich-editor/static')>()),
  useRendererMode: () => 'editor',
  useEditorBlock: () => null,
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

const URL = 'https://cdn.example.com/widget.mjs';

beforeEach(() => {
  editor = createEditor({
    nodes: [DynamicNodeClass],
    onError: (error) => {
      throw error;
    },
  });
  editor.update(
    () => {
      const node = $createDynamicNode({ url: URL, props: { level: 1 }, initialHeight: 240 });
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
  const { DynamicEditRenderer } = await import('../src/DynamicEditRenderer');
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () =>
    root!.render(
      <DynamicEditRenderer
        componentProps={{ level: 1 }}
        initialHeight={240}
        nodeKey={nodeKey}
        url={URL}
      />,
    ),
  );
  const trigger = container.querySelector<HTMLElement>(
    '[aria-label="Dynamic component settings"]',
  )!;
  await act(async () => trigger.click());
}

function control(label: string) {
  const el = [...document.body.querySelectorAll('label')].find((l) => l.textContent === label);
  if (!el) throw new Error(`label "${label}" not found`);
  return document.getElementById(el.htmlFor) as HTMLInputElement | HTMLTextAreaElement;
}

async function typeInto(el: HTMLInputElement | HTMLTextAreaElement, text: string) {
  await act(async () => {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement;
    Object.getOwnPropertyDescriptor(proto.prototype, 'value')!.set!.call(el, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function readNode() {
  return editor.getEditorState().read(() => {
    const node = $getNodeByKey(nodeKey) as DynamicNode;
    return { url: node.getUrl(), props: node.getProps(), height: node.getInitialHeight() };
  });
}

describe('Dynamic inspector', () => {
  it('labels the module URL, height and props fields', async () => {
    await mount();
    expect(control('Module URL').value).toBe(URL);
    expect(control('Initial height').value).toBe('240');
    expect(control('Props').value).toContain('"level": 1');
    expect(document.body.textContent).toContain('Changes apply as you type');
  });

  it('applies valid props live and reports invalid JSON through the field error', async () => {
    await mount();
    await typeInto(control('Props'), '{"level": 2}');
    expect(readNode().props).toEqual({ level: 2 });
    await typeInto(control('Props'), '{"level": ');
    expect(document.body.querySelector('[role="alert"]')?.textContent).toBe('Invalid JSON');
    expect(control('Props').getAttribute('aria-invalid')).toBe('true');
    expect(readNode().props).toEqual({ level: 2 });
  });

  it('reverts every change on Escape', async () => {
    await mount();
    await typeInto(control('Initial height'), '400');
    await typeInto(control('Props'), '{"level": 3}');
    expect(readNode()).toMatchObject({ height: 400, props: { level: 3 } });
    await act(async () => {
      control('Props').dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      );
    });
    expect(readNode()).toEqual({ url: URL, props: { level: 1 }, height: 240 });
  });
});
