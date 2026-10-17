// @vitest-environment happy-dom
import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';

import { MermaidRenderer } from '../src/MermaidRenderer';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

it('hydrates SVG images without changing their source or dimensions, then updates their theme', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const sources = [
    'graph TD\n A[开始] --> B[End]',
    'pie title Stack\n "Swift" : 60\n "TS" : 40',
    'gantt\n dateFormat YYYY-MM-DD\n section Work\n Build :2026-10-01, 7d',
    'classDiagram\n class Node {\n +clone() Node\n }',
  ];
  const view = (dark: boolean) => (
    <div>
      {sources.map((content) => (
        <MermaidRenderer colorScheme={dark ? 'dark' : 'light'} content={content} key={content} />
      ))}
    </div>
  );
  const container = document.createElement('div');
  document.body.append(container);
  container.innerHTML = renderToString(view(false));
  const before = [...container.querySelectorAll('img')].map((img) => img.outerHTML);
  expect(before).toHaveLength(sources.length);
  vi.stubGlobal(
    'OffscreenCanvas',
    class {
      getContext() {
        return { font: '', measureText: () => ({ width: 1000 }) };
      }
    },
  );
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  let root: ReturnType<typeof hydrateRoot>;
  await act(async () => {
    root = hydrateRoot(container, view(false));
  });
  expect(errors).not.toHaveBeenCalled();
  expect([...container.querySelectorAll('img')].map((img) => img.outerHTML)).toEqual(before);
  await act(async () => {
    root.render(view(true));
  });
  expect(container.querySelector('img')?.outerHTML).not.toEqual(before[0]);
  await act(async () => {
    root.unmount();
  });
});
