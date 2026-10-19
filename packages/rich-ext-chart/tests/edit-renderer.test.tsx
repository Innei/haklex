// @vitest-environment happy-dom
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { ChartEditNode } from '../src/ChartEditNode';

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
