// @vitest-environment happy-dom
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import type { LexicalEditor } from 'lexical';
import { $getRoot } from 'lexical';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { ChartEditNode } from '../src/ChartEditNode';
import type { ChartNode } from '../src/ChartNode';
import { popup } from '../src/config/config.css';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

const SPEC = JSON.stringify({
  version: 1,
  type: 'bar',
  title: 'Commits',
  x: 'k',
  series: [{ key: 'v', label: 'Value' }],
  data: [
    { k: 'a', v: 1 },
    { k: 'b', v: 2 },
  ],
});

function editorState(spec: string) {
  return JSON.stringify({
    root: {
      type: 'root',
      version: 1,
      direction: null,
      format: '',
      indent: 0,
      children: [{ type: 'chart', version: 1, spec }],
    },
  });
}

let container: HTMLDivElement | null = null;
let root: Root | null = null;
let editorRef: LexicalEditor | null = null;

function CaptureEditor() {
  const [editor] = useLexicalComposerContext();
  editorRef = editor;
  return null;
}

function nodeSpec() {
  return editorRef!
    .getEditorState()
    .read(() => ($getRoot().getFirstChild() as ChartNode).getSpec());
}

async function mount(spec: string, editable = true) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root!.render(
      <LexicalComposer
        initialConfig={{
          namespace: 'chart-edit-test',
          editable,
          nodes: [ChartEditNode],
          editorState: editorState(spec),
          onError: (error) => {
            throw error;
          },
        }}
      >
        <RichTextPlugin
          ErrorBoundary={LexicalErrorBoundary}
          contentEditable={<ContentEditable />}
        />
        <CaptureEditor />
      </LexicalComposer>,
    );
  });
  return container;
}

function buttonByText(el: HTMLElement, label: string) {
  return [...el.querySelectorAll('button')].find((b) => b.textContent === label);
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
});

describe('ChartEditRenderer', () => {
  it('renders the chart and shows the toolbar once selected', async () => {
    const el = await mount(SPEC);
    expect(el.querySelector('svg')).not.toBeNull();
    expect(buttonByText(el, 'Raw data')).toBeUndefined();

    await act(async () => {
      el.querySelector('figure')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(buttonByText(el, 'Raw data')).toBeDefined();

    await act(async () => buttonByText(el, 'View data')!.click());
    expect(el.querySelector('table')).not.toBeNull();
    expect(buttonByText(el, 'View chart')).toBeDefined();

    await act(async () => buttonByText(el, 'Raw data')!.click());
    const pre = document.body.querySelector('pre');
    expect(pre?.textContent).toBe(JSON.stringify(JSON.parse(SPEC), null, 2));
    expect(buttonByText(document.body, 'Copy')).toBeDefined();
  });

  it('edits the spec through the Edit chart panel', async () => {
    const el = await mount(SPEC);
    await act(async () => {
      el.querySelector('figure')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await act(async () => buttonByText(el, 'Edit chart')!.click());

    const titleLabel = [...document.body.querySelectorAll('label')].find(
      (l) => l.textContent === 'Title',
    )!;
    const title = document.getElementById(titleLabel.htmlFor) as HTMLInputElement;
    expect(title.value).toBe('Commits');
    expect(title.closest(`.${popup}`)).not.toBeNull();
    await act(async () => {
      title.focus();
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
        title,
        'Pushes',
      );
      title.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => title.blur());

    expect(JSON.parse(nodeSpec()).title).toBe('Pushes');
    expect(el.textContent).toContain('Pushes');
    expect(buttonByText(el, 'Edit chart')).toBeDefined();
  });

  it('shows the error card for invalid JSON and hides the data toggle', async () => {
    const el = await mount('{"type": "bar"');
    expect(el.textContent).toContain('Chart data has 1 problem');
    await act(async () => {
      el.querySelector('[role="alert"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(buttonByText(el, 'Raw data')).toBeDefined();
    expect(buttonByText(el, 'View data')).toBeUndefined();
  });

  it('renders without edit chrome when the editor is read-only', async () => {
    const el = await mount(SPEC, false);
    expect(el.querySelector('svg')).not.toBeNull();
    await act(async () => {
      el.querySelector('figure')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(buttonByText(el, 'Raw data')).toBeUndefined();
  });
});
